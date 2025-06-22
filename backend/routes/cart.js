const express = require('express');

const router = express.Router();
let cart = []; // Simple in-memory cart for demonstration (replace with database in production)

// Get cart items
router.get('/', (req, res) => {
    res.status(200).json({ products: cart });
});

// Add item to cart
router.post('/add', (req, res) => {
    const { productId } = req.body;
    cart.push(productId); // You may want to include more details
    res.status(200).json({ message: 'Product added to cart', cart });
});

// Remove item from cart
router.delete('/remove/:id', (req, res) => {
    const { id } = req.params;
    cart = cart.filter(item => item !== id);
    res.status(200).json({ message: 'Product removed from cart', cart });
});

// Clear cart
router.delete('/clear', (req, res) => {
    cart = [];
    res.status(200).json({ message: 'Cart cleared', cart });
});

module.exports = router;
