const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Add product to cart or update quantity
exports.addProductToCart = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    const index = user.addToCart.findIndex(item => item.product.toString() === productId);

    if (index > -1) {
        user.addToCart[index].quantity += numQuantity;
    } else {
        user.addToCart.push({ product: productId, quantity: numQuantity });
    }

    await user.save();
    res.status(200).json({ success: true, message: 'Product added to cart', cart: user.addToCart });
});

// Update quantity of a specific item in cart
exports.updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const index = user.addToCart.findIndex(item => item.product.toString() === productId);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    user.addToCart[index].quantity = numQuantity;
    await user.save();

    res.status(200).json({ success: true, message: 'Cart item updated', cart: user.addToCart });
});

// Remove or decrement product from cart
exports.removeProductFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const index = user.addToCart.findIndex(item => item.product.toString() === productId);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    user.addToCart[index].quantity -= 1;
    if (user.addToCart[index].quantity <= 0) {
        user.addToCart.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ success: true, message: 'Product updated in cart', cart: user.addToCart });
});

// Get all items in cart
exports.getCartItems = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('addToCart.product');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, cart: user.addToCart });
});

// Clear all items from cart
exports.clearCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.addToCart = [];
    await user.save();

    res.status(200).json({ success: true, message: 'Cart cleared', cart: [] });
});
