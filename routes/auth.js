const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config(); 

const blacklist = new Set(); // In-memory token blacklist (use Redis for production)

// POST route for user signup
router.post('/signup', async (req, res) => {
    const { email, password, role, department, year, name, phone } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            role: role.toLowerCase(),
            department,
            year,
            name,
            phone
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User created', token, user: { _id: newUser._id, email: newUser.email } });
    } catch (error) {
        res.status(400).json({ message: 'Error creating user: ' + error.message });
    }
});

// POST route for user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                department: user.department,
                year: user.year,
                name: user.name,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// POST route for logout
router.post('/logout', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(400).json({ message: 'Token missing' });
    }

    // Add token to the blacklist
    blacklist.add(token);

    res.status(200).json({ message: 'Logged out successfully' });
});

// Middleware to verify token and check blacklist
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (blacklist.has(token)) {
        return res.status(401).json({ message: 'Token is invalid' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Unauthorized' });
    }
};

module.exports = router;
