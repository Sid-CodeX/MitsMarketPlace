// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// POST request to create a new product
router.post('/', async (req, res) => {
    const { name, category, price, image, description, contactNumber, seller } = req.body;

    // Ensure all fields are present
    if (!name || !category || !price || !image || !description || !contactNumber || !seller) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new product
        const newProduct = new Product({
            name,
            category,
            price,
            image,
            description,
            contactNumber,
            seller, // Use the actual seller ID
        });

        // Save the product to the database
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Error adding product', error });
    }
});

// GET request to fetch all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'email'); // Populate seller's email if needed
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// Update product status (e.g., when sold)
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ message: 'Failed to update product status' });
    }
});

module.exports = router;
