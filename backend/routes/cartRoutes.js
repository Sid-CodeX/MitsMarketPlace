const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const cartController = require('../controllers/cartController');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');


// Private Routes (Cart)
// All routes below require user authentication (via 'protect' middleware)

/**
 * @route   POST /api/cart/add
 * @desc    Add a product to the cart or increase quantity if already present
 * @access  Private
 */
router.post(
    '/add',
    protect,
    [
        check('productId', 'Product ID is required and must be a valid Mongo ID').isMongoId(),
        check('quantity', 'Quantity must be a positive integer').optional().isInt({ min: 1 })
    ],
    cartController.addProductToCart
);

/**
 * @route   PUT /api/cart/update/:productId
 * @desc    Update the quantity of a specific item in the cart
 * @access  Private
 */
router.put(
    '/update/:productId',
    protect,
    [
        check('productId', 'Product ID in URL must be a valid Mongo ID').isMongoId(),
        check('quantity', 'Quantity is required and must be a positive integer').isInt({ min: 1 })
    ],
    cartController.updateCartItemQuantity
);

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Decrease the quantity of a product in the cart by 1, or remove if quantity becomes 0
 * @access  Private
 */
router.delete(
    '/remove/:productId',
    protect,
    check('productId', 'Product ID in URL must be a valid Mongo ID').isMongoId(),
    cartController.removeProductFromCart
);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Remove all items from the cart
 * @access  Private
 */
router.delete('/clear', protect, cartController.clearCart);

/**
 * @route   GET /api/cart
 * @desc    Retrieve all items in the user's cart with full product details
 * @access  Private
 */
router.get('/', protect, cartController.getCartItems);

/**
 * @route   POST /api/cart/buy
 * @desc    Purchase all items in the cart: marks products as 'Sold' and clears the cart
 * @access  Private
 */
router.post('/buy', protect, productController.buyCartItems);

module.exports = router;
