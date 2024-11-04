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

// GET route to fetch available products excluding those sold by the logged-in user
router.get('/', async (req, res) => {
    const { sellerId } = req.query; // Get the sellerId from query parameters

    try {
        const products = await Product.find({ 
            status: 'Available', 
            seller: { $ne: sellerId } // Exclude products sold by the logged-in user
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// PUT route to mark a product as sold
router.put('/:id/sell', async (req, res) => {
    const { id } = req.params;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { status: 'Sold' },
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ message: 'Failed to update product status' });
    }
});

module.exports = router;
