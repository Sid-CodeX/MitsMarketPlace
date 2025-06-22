// routes/profile.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.userId = decoded.id; // Add user ID to request for later use
        next();
    });
};

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
    },
});

const upload = multer({ storage: storage });

// GET route to fetch user profile
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user); // Send the user object as response
    } catch (error) {
        console.error('Error fetching profile:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching profile: ' + error.message });
    }
});

// PUT route to update user profile
router.put('/', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const { name, email, phone, role, department, year } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update user fields only if new values are provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (department) user.department = department;
        if (role === 'Student' && year) user.year = year;

        // Handle profile image upload
        if (req.file) {
            // Implement your image upload logic here
            const uploadedImageUrl = await uploadImage(req.file); // Assuming uploadImage is defined
            user.profileImage = uploadedImageUrl;
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
