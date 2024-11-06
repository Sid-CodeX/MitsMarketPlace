const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure 'uploads' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename with timestamp
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const isValidType = allowedTypes.test(file.mimetype);
        if (isValidType) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
        }
    },
});

// POST route to create a new product
router.post('/', upload.single('image'), async (req, res) => {
    const { name, category, price, description, contactNumber, seller } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Image file path

    if (!name || !category || !price || !description || !contactNumber || !seller) {
        return res.status(400).json({ message: 'All fields except image are required' });
    }

    try {
        const newProduct = new Product({
            name,
            category,
            price,
            image,
            description,
            contactNumber,
            seller,
            status: 'Available',
        });

        await newProduct.save();
        res.status(201).json(newProduct); // Send the newly created product as response
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Product creation failed' });
    }
});

// GET route to fetch available products excluding the seller's items
router.get('/', async (req, res) => {
    const { sellerId } = req.query;

    try {
        const products = await Product.find({
            status: 'Available',
            seller: { $ne: sellerId }, // Exclude products from the logged-in seller
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

// GET route to fetch products listed by the seller
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

// DELETE route to remove a product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

module.exports = router;
