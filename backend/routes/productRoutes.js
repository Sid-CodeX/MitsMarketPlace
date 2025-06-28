const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes

/**
 * @route   GET /api/products
 * @desc    Retrieve all available products
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);


// Private Routes
// All routes below require authentication via 'protect' middleware

/**
 * @route   GET /api/products/my-products
 * @desc    Get products listed by the currently logged-in user
 * @access  Private
 */
router.get('/my-products', protect, productController.getSellingItems);

/**
 * @route   POST /api/products
 * @desc    Create a new product listing
 * @access  Private (Faculty/Admin only)
 */
router.post(
    '/',
    protect,
    authorize('faculty', 'admin'),
    [
        check('name', 'Product name is required').notEmpty(),
        check('category', 'Invalid category')
            .isIn(['Books', 'Electronics', 'Clothing', 'Services', 'Other']),
        check('price', 'Price must be a positive number').isFloat({ gt: 0 }),
        check('image', 'Image must be a valid URL').isURL(),
        check('description', 'Description cannot be empty').optional().notEmpty(),
    ],
    productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product listing
 * @access  Private (Owner or Admin)
 */
router.put(
    '/:id',
    protect,
    [
        check('name', 'Name cannot be empty').optional().notEmpty(),
        check('category', 'Invalid category')
            .optional().isIn(['Books', 'Electronics', 'Clothing', 'Services', 'Other']),
        check('price', 'Price must be a positive number').optional().isFloat({ gt: 0 }),
        check('image', 'Image must be a valid URL').optional().isURL(),
        check('description', 'Description cannot be empty').optional().notEmpty(),
        check('status', 'Status must be either "Available" or "Sold"').optional().isIn(['Available', 'Sold']),
    ],
    productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product listing
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', protect, productController.deleteProduct);

/**
 * @route   PUT /api/products/:id/sell
 * @desc    Mark a product as sold
 * @access  Private (Owner only)
 */
router.put('/:id/sell', protect, productController.markProductAsSold);

/**
 * @route   POST /api/products/buy-cart
 * @desc    Finalize purchase for all items in user's cart (marks as sold + clears cart)
 * @access  Private
 */
router.post('/buy-cart', protect, productController.buyCartItems);

module.exports = router;
