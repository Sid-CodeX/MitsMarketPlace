const express = require('express');
const Product = require('../models/Product'); // Adjust the path as necessary
const router = express.Router();

// POST route to create a new product
router.post('/', async (req, res) => {
    const { name, category, price, description, contactNumber, seller } = req.body;

    // Input validation
    if (!name || !category || !price || !description || !contactNumber || !seller) {
        return res.status(400).json({ message: 'All fields except image are required' });
    }

    try {
        // Use null or a default value for image if not provided
        const newProduct = new Product({
            name,
            category,
            price,
            image: req.body.image || null, // Set image to null if not provided
            description,
            contactNumber,
            seller,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Product creation failed' });
    }
});


module.exports = router;
