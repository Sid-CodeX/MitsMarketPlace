const express = require('express');
const authenticateToken = require('../middleware/auth'); // Adjust path if necessary
const router = express.Router();

// Example of a protected route
router.get('/protected-route', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
