const jwt = require('jsonwebtoken');
//const authConfig = require('../../config/auth');

module.exports = ( req, res, next ) => {
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader)
        return res.status(401).send({error:'No token provided'});
    
    //formato do token começa com Bearer e termina com hash
    const parts = authHeader.split(' ');
    
    if( !parts.length === 2 )
        return res.status(401).send({ error: 'Token error' });

    const [ scheme, token ] = parts;

    if ( !/^Bearer$/i.test(scheme) )
        return res.status(401).send({ error: 'Token malformatted' });

    jwt.verify(token, process.env.SECRET_AUTH, (err, decoded )=>{ //authConfig.secret
        
        if (err) 
            return res.status(401).send({ error: 'Token invalid' });

        req.userId = decoded.id;
        return next();

    });

}