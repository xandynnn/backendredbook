const mongoose = require('./../../database');
const sha1 = require('sha1');

const UserSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
		select: false,
	},
	passwordResetToken:{
		type: String,
		select: false,
	},
	passwordResetExpires:{
		type: Date,
		select: false,
	},
	username: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
	},
	lastname: {
		type: String,
		required: true,
	},
	createdAt:{
		type: Date,
		default: Date.now,
	}
});

UserSchema.pre('save', async function(next){
	const hash = await sha1(this.password);
	this.password = hash;
	next();
})

module.exports = mongoose.model("User", UserSchema);