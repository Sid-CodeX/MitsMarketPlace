const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

/**
 * Retrieve the currently authenticated user's profile.
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

/**
 * Update basic profile details of the logged-in user.
 * Supports partial updates; validates input using express-validator.
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, department, year, profileImage } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update only fields that are provided in the request body
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;
        if (user.role === 'student' && year !== undefined) user.year = year;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists with another account.' });
        }
        next(error);
    }
});

/**
 * Allows users to securely update their password after verifying the current password.
 * Automatically logs the user out by blacklisting the current JWT.
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    // Invalidate current token after password change
    const { blacklistToken } = require('../middleware/authMiddleware');
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        blacklistToken(token);
    }

    res.status(200).json({ success: true, message: 'Password updated successfully. Please log in again.' });
});
