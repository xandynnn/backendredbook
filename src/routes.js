const routes = require('express').Router();
const User = require('./app/models/User');

routes.post('/users', async (req, res) => {
	const { name, password, username, lastname, email } = req.body;
	const user = await User.create({ name, password, username, lastname, email });
	return res.json(user);
});
routes.get('/users', async (req, res) => {
	const users = await User.find({},{ name: 1, username: 1, lastname: 1, email: 1 });
	return res.json(users);
});

routes.get('/users/:username', async (req, res) => {
	const user = await User.findOne({username:req.params.username});
	let retorno = {
		id: user._id,
		name: user.name,
		lastname: user.lastname,
		username: user.username,
		email: user.email
	}
	return res.json(retorno);
});

routes.delete('/users/:id', async (req, res) => {
	const user = await User.findById(req.params.id);
	await user.remove();
	return res.send();
});

//
//	Auth
//
// routes.post('/auth', async (req, res ) =>{
// 	const { username, password } = req.body;
// 	await User.findOne({ username: username }, function(err, user){
// 		if ( !user ) {
// 			return res.send({
// 				status: false,
// 				msg: "Usuário " + username + " não foi encontrado em nossa base de dados."
// 			});
// 		}else{
// 			let auth;
// 			if ( user.password === password ){
// 				auth = { status: true, username: user.username, name: user.name	}
// 			}else{ 
// 				auth = { status: false, msg: "A senha não está correta." };
// 			}
// 			return res.send(auth);
// 		}
// 	});
// });

module.exports = routes;