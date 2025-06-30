// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // <--- IMPORT THE UPLOAD MIDDLEWARE

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);


// Private Routes
router.get('/my-products', protect, productController.getSellingItems);

/**
 * @route   POST /api/products
 * @desc    Create a new product listing with image upload
 * @access  Private (Faculty/Admin only)
 */
router.post(
    '/',
    protect,
    authorize('faculty', 'admin'),
    upload.single('image'), // <--- ADD THIS LINE: 'image' is the field name from your frontend form
    [
        // Validation for other fields
        check('name', 'Product name is required').notEmpty(),
        check('category', 'Invalid category')
            .isIn(['Books', 'Electronics', 'Clothing', 'Services', 'Other']),
        check('price', 'Price must be a positive number').isFloat({ gt: 0 }),
        // 'image' validation is now handled by Multer's fileFilter and the custom check below.
        // REMOVE: check('image', 'Image must be a valid URL').isURL(), 
        check('description', 'Description cannot be empty').optional().notEmpty(),
        check('contactNumber', 'Contact number is required').notEmpty(), // Ensure this matches your frontend
    ],
    // Custom validation check to ensure an image file was provided
    (req, res, next) => {
        if (!req.file) { // If Multer didn't process a file, it means no file was uploaded or it failed checks
            return res.status(400).json({ success: false, errors: [{ msg: 'Product image is required.' }] });
        }
        next(); // Proceed to controller if an image file is present
    },
    productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product listing
 * @access  Private (Owner or Admin)
 */
// NOTE: If you intend to allow image updates via file upload on PUT,
// you would need to add `upload.single('image')` here as well and
// modify the productController.updateProduct to handle `req.file`.
// For now, this route still expects 'image' to be a URL if provided in req.body.
router.put(
    '/:id',
    protect,
    [
        check('name', 'Name cannot be empty').optional().notEmpty(),
        check('category', 'Invalid category')
            .optional().isIn(['Books', 'Electronics', 'Clothing', 'Services', 'Other']),
        check('price', 'Price must be a positive number').optional().isFloat({ gt: 0 }),
        check('image', 'Image must be a valid URL').optional().isURL(), // Keeps expecting URL for existing image field
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