const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Link to your controller
const { protect, authorize } = require('../middleware/authMiddleware'); // Link to your middleware
const { check } = require('express-validator'); // For input validation

// --- Public Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @validation
 * - name: required
 * - email: required, valid email format
 * - password: required, min 6 characters
 * - phone: required, 10 digits numeric
 * - role: required, must be 'student' or 'faculty'
 * - department: required
 * - year: required if role is 'student'
 */
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required and must be at least 6 characters').isLength({ min: 6 }),
        check('phone', 'Phone number is required and must be 10 digits').isLength({ min: 10, max: 10 }).isNumeric(),
        check('role', 'Role is required and must be either "student" or "faculty"').isIn(['student', 'faculty']),
        check('department', 'Department is required').not().isEmpty(),
        // Conditional validation for 'year' only if role is 'student'
        check('year')
            .if(check('role').equals('student'))
            .not().isEmpty().withMessage('Year is required for students')
            .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year']).withMessage('Invalid year provided')
            .optional() // Important: if it's not a student, allow it to be absent
    ],
    authController.registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', authController.loginUser);

// --- Private Routes (require authentication via JWT) ---

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & invalidate token
 * @access  Private (Requires 'protect' middleware to identify and blacklist the token)
 */
router.post('/logout', protect, authController.logoutUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user's profile
 * @access  Private (Requires 'protect' middleware to fetch user details)
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   PUT /api/auth/updateProfile
 * @desc    Update current logged-in user's profile details
 * @access  Private (Requires 'protect' middleware)
 * @validation (Optional fields)
 * - name: optional, cannot be empty if present
 * - phone: optional, must be 10 digits if present
 * - department: optional, cannot be empty if present
 * - year: optional, must be valid year for students if present
 */
router.put(
    '/updateProfile',
    protect,
    [
        check('name', 'Name cannot be empty').optional().not().isEmpty(),
        check('phone', 'Phone number must be 10 digits').optional().isLength({ min: 10, max: 10 }).isNumeric(),
        check('department', 'Department cannot be empty').optional().not().isEmpty(),
        check('year', 'Invalid year provided').optional().isIn(['1st Year', '2nd Year', '3rd Year', '4th Year'])
    ],
    authController.updateProfile
);

/**
 * @route   PUT /api/auth/updatePassword
 * @desc    Update current logged-in user's password
 * @access  Private (Requires 'protect' middleware)
 * @validation
 * - currentPassword: required
 * - newPassword: required, min 6 characters
 */
router.put(
    '/updatePassword',
    protect,
    [
        check('currentPassword', 'Current password is required').not().isEmpty(),
        check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
    ],
    authController.updatePassword
);

// --- Cart Routes (User-specific) ---

/**
 * @route   POST /api/auth/cart/add
 * @desc    Add product to user's cart (or update quantity if already exists)
 * @access  Private (Requires 'protect' middleware)
 * @validation
 * - productId: required, valid Mongo ID
 * - quantity: optional, positive integer
 */
router.post(
    '/cart/add',
    protect,
    [
        check('productId', 'Product ID is required and must be a valid Mongo ID').isMongoId(),
        check('quantity', 'Quantity must be a positive integer').optional().isInt({ min: 1 })
    ],
    authController.addProductToCart
);

/**
 * @route   PUT /api/auth/cart/update/:productId
 * @desc    Update quantity of a specific item in user's cart
 * @access  Private (Requires 'protect' middleware)
 * @validation
 * - productId (in params): required, valid Mongo ID
 * - quantity (in body): required, positive integer
 */
router.put(
    '/cart/update/:productId',
    protect,
    [
        check('productId', 'Product ID in URL must be a valid Mongo ID').isMongoId(),
        check('quantity', 'Quantity is required and must be a positive integer').isInt({ min: 1 })
    ],
    authController.updateCartItemQuantity
);

/**
 * @route   DELETE /api/auth/cart/remove/:productId
 * @desc    Remove a product from the user's cart
 * @access  Private (Requires 'protect' middleware)
 * @validation
 * - productId (in params): required, valid Mongo ID
 */
router.delete(
    '/cart/remove/:productId',
    protect,
    check('productId', 'Product ID in URL must be a valid Mongo ID').isMongoId(),
    authController.removeProductFromCart
);

/**
 * @route   GET /api/auth/cart
 * @desc    Get all items currently in the user's cart (with product details populated)
 * @access  Private (Requires 'protect' middleware)
 */
router.get('/cart', protect, authController.getCartItems);

// --- Selling Items Route (User-specific) ---

/**
 * @route   GET /api/auth/selling
 * @desc    Get all products that the user is currently selling (with product details populated)
 * @access  Private (Requires 'protect' middleware)
 */
router.get('/selling', protect, authController.getSellingItems);


module.exports = router;
