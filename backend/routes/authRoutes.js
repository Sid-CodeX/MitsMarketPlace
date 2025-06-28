const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');


// Public Routes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    [
        check('name', 'Name is required').notEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('phone', 'Phone must be 10 digits').isLength({ min: 10, max: 10 }).isNumeric(),
        check('role', 'Role must be either "student" or "faculty"').isIn(['student', 'faculty']),
        check('department', 'Department is required').notEmpty(),
        check('year')
            .if(check('role').equals('student'))
            .notEmpty().withMessage('Year is required for students')
            .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year']).withMessage('Invalid year'),
    ],
    authController.registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/login', authController.loginUser);


// Private Routes

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by blacklisting token
 * @access  Private
 */
router.post('/logout', protect, authController.logoutUser);

module.exports = router;
