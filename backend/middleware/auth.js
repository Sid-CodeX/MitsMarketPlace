const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        console.log('Decoded user:', user); // Log decoded user info
        req.user = user; // Save user info in request for use in next middleware
        next();
    });
};

module.exports = authenticateToken;
