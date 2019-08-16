const mongoose = require('./../../database');

const CommentSchema = new mongoose.Schema({
    phrase: {
        type: String,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    pearl: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pearl',
        require: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Comment', CommentSchema);
