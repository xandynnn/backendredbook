const express = require('express');
const router = express.Router();
const authMiddleware = require('./../middlewares/auth');

const Pearl = require('./../models/Pearl');
const Comment = require('./../models/Comment');

router.get('/', async (req,res) => {

    try {
		const pearls = await Pearl.find().populate(['user','comments']);
		return res.send({ pearls });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading pearls' });
    }

});

router.get('/:pearlId', async (req,res) => {

    try {
        const pearl = await Pearl.findById(req.params.pearlId).populate(['user','comments']);
        return res.send({ pearl });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading pearl' });
    }

});

router.use(authMiddleware);

router.post('/', async (req,res) => {

    try {
        const { phrase, author, comments } = req.body;
        const pearl = await Pearl.create({ phrase, author, user: req.userId });

        // aguarda todas as prommisses do map terminarem para poder salvar a pérola

        if ( comments ){
            await Promise.all(comments.map( async comment => {
                const pearlComment = new Comment({ ...comment, pearl: pearl._id });
                await pearlComment.save();
                pearl.comments.push(pearlComment);
            }));
        }

        await pearl.save();

        return res.send({ pearl });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error creating new pearl' });
    }

});

router.put('/:pearlId', async (req,res) => {

    try {
        const { phrase, author, comments } = req.body;
        const pearl = await Pearl.findByIdAndUpdate(req.params.pearlId,{ phrase, author }, { new: true });

        pearl.comments = [];
        await Comment.remove({ pearl: pearl._id });

        // aguarda todas as prommisses do map terminarem para poder salvar a pérola
        await Promise.all(comments.map( async comment => {
            const pearlComment = new Comment({ ...comment, pearl: pearl._id });
            await pearlComment.save();
            pearl.comments.push(pearlComment);
        }));

        await pearl.save();

        return res.send({ pearl });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error update pearl' });
    }

});

router.delete('/:pearlId', async (req,res) => {

    try {
        await Pearl.findByIdAndRemove(req.params.pearlId);
        return res.send();
    } catch (err) {
        return res.status(400).send({ error: 'Error deleting pearl' });
    }

});

module.exports = app => app.use('/pearls', router );
