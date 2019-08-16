const express = require('express');
const User = require('./../models/User');
const router = express.Router();
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('./../../modules/mailer');

const authMiddleware = require('./../middlewares/auth');

function generateToken( params = {}){
    return jwt.sign(params, process.env.SECRET_AUTH,{ //authConfig.secret
        expiresIn: 86400
    });
}

router.post('/register', async (req, res) =>{
    try{

        const { email } = req.body;

        if ( await User.findOne({email}) )
            return res.status(400).send({ error: 'User already exists' });

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ user, token: generateToken({ id: user.id }) });

    } catch (err){
        return res.status(400).send({error: 'Registration failed'})
    }
});

router.post('/authenticate', async (req,res) =>{
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select('+password');

    if ( !user )
        return res.status(400).send({ error: 'User not found' });

    if ( sha1(password) !== user.password )
        return res.status(400).send({ error: 'Invalid password' });

    // if ( !await sha1.compare( password, user.password ) )
    //     return res.status(400).send({error: 'Invalid password '})

    user.password = undefined;

    res.send({ user, token: generateToken({ id: user.id }) });

});

router.post('/forgot-password', async (req, res) =>{
    const { email } = req.body;
    try{

        const user = await User.findOne({ email });

        if ( !user )
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate( user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        },{
            'useFindAndModify': false
        });

        console.log(token);

        mailer.sendMail({
            to: email,
            from: 'redbook@redbook.com.br',
            template: 'auth/forgot-password',
            context: { token }
        }, (err) => {
            if (err)
                res.status(400).send({error: 'Cannot send forgot password, try again'});

            return res.send();
        });

    }catch(err){
        console.log(err)
        res.status(400).send({error: 'Erro on forgot password, try again'});
    }
});

router.post('/reset-password', async (req,res) => {
    const { email, token, password } = req.body;
    try{

        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if(!user)
            res.status(400).send({error: 'User not found'});

        if ( token !== user.passwordResetToken )
            res.status(400).send({error: 'Token invalid'});

        const now = new Date();
        if( now > user.passwordResetExpires )
            return res.status(400).send({ error: 'Token expired, generate a new one'});

        user.password = password;

        await user.save();

        res.send();


    } catch(err){
        res.status(400).send({error: 'Cannot reset password, try again'});
    }
});

router.get('/users/:id', async (req, res) =>{

    try{
        const user = await User.findById(req.params.id);
        return res.send({ user });

    } catch (err){
        return res.status(400).send({error: 'Get user failed'})
    }
});

router.use(authMiddleware);

router.get('/users', async (req, res) =>{
    try{

        const users = await User.find();
        return res.send({ users });

    } catch (err){
        return res.status(400).send({error: 'Get users failed'})
    }
});

module.exports = app => app.use('/auth', router);
