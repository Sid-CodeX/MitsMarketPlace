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
        const newProduct = new Product({
            name,
            category,
            price,
            image: req.body.image || null,
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
    const { sellerId } = req.query;

    try {
        const products = await Product.find({ 
            status: 'Available', 
            seller: { $ne: sellerId } 
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
            { new: true }
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

// GET route to fetch products listed by the logged-in user
router.get('/my-products', async (req, res) => {
    const { sellerId } = req.query;

    if (!sellerId) {
        return res.status(400).json({ message: 'Seller ID is required' });
    }

    try {
        const products = await Product.find({ seller: sellerId });
        res.json(products);
    } catch (error) {
        console.error('Error fetching user products:', error);
        res.status(500).json({ message: 'Failed to fetch user products' });
    }
});

// DELETE route to remove a product from the selling list
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

module.exports = router;
