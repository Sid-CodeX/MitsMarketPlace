const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config(); // Load environment variables

// POST route for user signup
router.post('/signup', async (req, res) => {
    const { email, password, role, department, year, name, phone } = req.body; // Include name and phone

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({
            email,
            password,  // Password will be hashed by Mongoose pre-save hook
            role: role.toLowerCase(),
            department,
            year,
            name,  // New field for name
            phone   // New field for phone
        });
        await newUser.save();

        // Generate JWT token
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
        const user = await User.findOne({ email: email.toLowerCase() }); // Ensure email is in lowercase

        console.log('Login attempt:', { email, password }); // Log email and password attempt
        console.log('User found:', user); // Log found user

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Log password comparison result

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with user data including _id and token
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
        console.error('Login error:', error); // Log any errors
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
