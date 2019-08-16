const express = require('express');
const router = express.Router();
const authMiddleware = require('./../middlewares/auth');

const Comment = require('./../models/Comment');
const Pearl = require('./../models/Pearl');

router.get('/', async (req,res) => {
    
    try {
        const comments = await Comment.find();
        return res.send({ comments });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading all comments' });
    }
    
});

router.get('/:pearlId', async (req,res) => {
   
    try {
        const comments = await Comment.find({ pearl: req.params.pearlId }).populate(['user']);
        return res.send({ comments });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading comments' });
    }

});

router.use(authMiddleware);

router.post('/', async (req,res) => {

    try {
        const { pearl: pearlId  } = req.body;
        const comment = await Comment.create({ ...req.body, user: req.userId });
        const pearl = await Pearl.findByIdAndUpdate(pearlId, {} , { new: true });
        pearl.comments.push(comment._id)
        await pearl.save();
        return res.send({ comment });
        
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error creating new comment' });
    }

});

router.delete('/:commentId', async (req,res) => {
    
    try {
        await Comment.findByIdAndRemove(req.params.commentId);

        // antes de dar o return deve remover o comentario na collation pearls

        return res.send();
    } catch (err) {
        return res.status(400).send({ error: 'Error deleting comment' });
    }

});

module.exports = app => app.use('/comments', router );