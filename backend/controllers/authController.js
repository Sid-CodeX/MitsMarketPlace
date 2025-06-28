const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const { blacklistToken } = require('../middleware/authMiddleware');

// Generate JWT token using user ID and role
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1h',
    });
};

// Register a new user
exports.registerUser = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, role, department, year, name, phone } = req.body;

    const newUser = new User({
        email,
        password,
        role: role.toLowerCase(),
        department,
        year: role.toLowerCase() === 'student' ? year : undefined,
        name,
        phone
    });

    try {
        await newUser.save();

        const token = generateToken(newUser._id, newUser.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                department: newUser.department,
                year: newUser.year,
                phone: newUser.phone,
                profileImage: newUser.profileImage
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        next(error);
    }
});

// Authenticate user and return token
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            year: user.year,
            phone: user.phone,
            profileImage: user.profileImage
        }
    });
});

// Logout user by blacklisting token
exports.logoutUser = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) blacklistToken(token);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});
