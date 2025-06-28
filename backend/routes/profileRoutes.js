const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');


// Private Routes (Profile)
// All profile routes below require authentication

/**
 * @route   GET /api/profile/me
 * @desc    Retrieve the profile of the currently logged-in user
 * @access  Private
 */
router.get('/me', protect, profileController.getMe);

/**
 * @route   PUT /api/profile/update
 * @desc    Update basic profile details (name, phone, department, year, profileImage)
 * @access  Private
 */
router.put(
    '/update',
    protect,
    [
        check('name', 'Name cannot be empty').optional().notEmpty(),
        check('phone', 'Phone number must be 10 digits').optional().isLength({ min: 10, max: 10 }).isNumeric(),
        check('department', 'Department cannot be empty').optional().notEmpty(),
        check('year', 'Year must be one of: 1st Year, 2nd Year, 3rd Year, 4th Year')
            .optional().isIn(['1st Year', '2nd Year', '3rd Year', '4th Year']),
        check('profileImage', 'Profile image must be a valid URL').optional().isURL()
    ],
    profileController.updateProfile
);

/**
 * @route   PUT /api/profile/update-password
 * @desc    Change user's current password to a new one
 * @access  Private
 */
router.put(
    '/update-password',
    protect,
    [
        check('currentPassword', 'Current password is required').notEmpty(),
        check('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 })
    ],
    profileController.updatePassword
);

module.exports = router;
