const User = require('../models/User'); // Your updated User model
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // For handling async errors
const { validationResult } = require('express-validator'); // To process validation results
const { blacklistToken } = require('../middleware/authMiddleware'); // Import the blacklist function

/**
 * Helper function to generate a JWT token.
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {string} - Generated JWT token
 */
const generateToken = (id, role) => {
    // JWT_SECRET and JWT_EXPIRE should be in your .env file
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1h', // Default to 1 hour if not set
    });
};

/**
 * @desc    Register a new user.
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = asyncHandler(async (req, res, next) => {
    // Check for validation errors from express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return 400 with validation errors if any exist
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, role, department, year, name, phone } = req.body;

    // Password hashing is handled automatically by the User model's pre('save') hook.
    // We pass the raw password here, and Mongoose will hash it before saving.
    const newUser = new User({
        email,
        password, // Raw password
        role: role.toLowerCase(), // Ensure role is lowercase as per enum
        department,
        year: role.toLowerCase() === 'student' ? year : undefined, // Conditionally set year
        name,
        phone
    });

    try {
        await newUser.save(); // This triggers the pre('save') hook for password hashing

        const token = generateToken(newUser._id, newUser.role);

        // Send a success response. Do NOT include the raw password or hashed password in the response.
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
                phone: newUser.phone
            }
        });
    } catch (error) {
        // Handle Mongoose specific errors
        if (error.code === 11000) { // Duplicate key error (e.g., email already exists)
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }
        if (error.name === 'ValidationError') { // Mongoose validation errors (e.g., missing required field, enum mismatch)
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        // For any other unexpected errors, pass to the global error handler
        next(error);
    }
});

/**
 * @desc    Login a user.
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Basic check for presence of email and password
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email and explicitly select the password field (due to select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // If user not found, return invalid credentials
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare provided password with the hashed password using the model's method
    const isMatch = await user.comparePassword(password);

    // If passwords don't match, return invalid credentials
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token upon successful login
    const token = generateToken(user._id, user.role);

    // Send success response with token and user details (excluding password)
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
            phone: user.phone
        }
    });
});

/**
 * @desc    Logout user by blacklisting their token.
 * @route   POST /api/auth/logout
 * @access  Private (requires 'protect' middleware to ensure token is present)
 */
exports.logoutUser = asyncHandler(async (req, res, next) => {
    // Get token from Authorization header (already present due to 'protect' middleware)
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        blacklistToken(token); // Add token to the blacklist
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

/**
 * @desc    Get current logged-in user's profile.
 * @route   GET /api/auth/me
 * @access  Private (requires 'protect' middleware)
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    // req.user is populated by the 'protect' middleware with { id, role }
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Update current logged-in user's profile details.
 * @route   PUT /api/auth/updateProfile
 * @access  Private (requires 'protect' middleware)
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const { name, phone, department, year } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update only the fields that are provided in the request body
    user.name = name !== undefined ? name : user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.department = department !== undefined ? department : user.department;

    // Only update 'year' if the user's role is 'student'
    if (user.role === 'student' && year !== undefined) {
        user.year = year;
    }

    await user.save(); // Mongoose validation will run here

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
});

/**
 * @desc    Update current logged-in user's password.
 * @route   PUT /api/auth/updatePassword
 * @access  Private (requires 'protect' middleware)
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    // Fetch user and explicitly select the password field for comparison
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the provided current password matches the stored hashed password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Set the new password; the User model's pre('save') hook will hash it
    user.password = newPassword;
    await user.save();

    // Optionally, blacklist the user's current token to force them to log in again with the new password.
    // This enhances security by invalidating old sessions after a password change.
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        blacklistToken(token);
    }

    res.status(200).json({ success: true, message: 'Password updated successfully. Please log in again.' });
});

/**
 * @desc    Add a product to the user's cart.
 * @route   POST /api/auth/cart/add
 * @access  Private (requires 'protect' middleware)
 */
exports.addProductToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body; // Default quantity to 1

    // Fetch the user
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert quantity to a number (it might come as a string from req.body)
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    // Check if the product already exists in the cart
    const cartItemIndex = user.addToCart.findIndex(
        (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
        // Product already in cart, update its quantity
        user.addToCart[cartItemIndex].quantity += numQuantity;
    } else {
        // Product not in cart, add it as a new item
        user.addToCart.push({ product: productId, quantity: numQuantity });
    }

    await user.save(); // Save the updated user document

    res.status(200).json({ success: true, message: 'Product added/updated in cart', cart: user.addToCart });
});

/**
 * @desc    Update the quantity of a specific item in the user's cart.
 * @route   PUT /api/auth/cart/update/:productId
 * @access  Private (requires 'protect' middleware)
 */
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the item in the cart
    const cartItemIndex = user.addToCart.findIndex(
        (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    // Update the quantity
    user.addToCart[cartItemIndex].quantity = numQuantity;
    await user.save(); // Save the updated user document

    res.status(200).json({ success: true, message: 'Cart item quantity updated', cart: user.addToCart });
});

/**
 * @desc    Remove a product from the user's cart.
 * @route   DELETE /api/auth/cart/remove/:productId
 * @access  Private (requires 'protect' middleware)
 */
exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Filter out the product to be removed
    user.addToCart = user.addToCart.filter(
        (item) => item.product.toString() !== productId
    );

    await user.save(); // Save the updated user document

    res.status(200).json({ success: true, message: 'Product removed from cart', cart: user.addToCart });
});

/**
 * @desc    Get all items in the user's cart.
 * @route   GET /api/auth/cart
 * @access  Private (requires 'protect' middleware)
 */
exports.getCartItems = asyncHandler(async (req, res, next) => {
    // Populate the 'product' field within the 'addToCart' array to get full product details
    const user = await User.findById(req.user.id).populate('addToCart.product');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, cart: user.addToCart });
});

/**
 * @desc    Get all products a user is selling.
 * @route   GET /api/auth/selling
 * @access  Private (requires 'protect' middleware)
 */
exports.getSellingItems = asyncHandler(async (req, res, next) => {
    // Populate the 'selling' array to get full product details
    const user = await User.findById(req.user.id).populate('selling');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, selling: user.selling });
});
