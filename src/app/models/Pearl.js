const mongoose = require('./../../database');

const PearlSchema = new mongoose.Schema({
    phrase: {
        type: String,
        require: true,
    },
    author: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Pearl', PearlSchema);
