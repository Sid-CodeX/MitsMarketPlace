const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const uploadController = require('../controllers/uploadController');

// Multer Configuration (Route-Scoped)
// Defines how and where image files will be stored on disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads'); // Store in /uploads directory
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = file.originalname.replace(/\s/g, '_');
        cb(null, `${Date.now()}-${sanitizedFilename}`); // Prefix filename with timestamp
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValidType = allowedTypes.test(file.mimetype);
        const isValidExtension = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (isValidType && isValidExtension) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, PNG, and GIF image formats are allowed'));
        }
    }
});

// Image Upload Route
/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image file to the server
 * @access  Public (can be secured by adding 'protect' middleware if needed)
 */
router.post('/image', upload.single('image'), uploadController.uploadImage);

module.exports = router;
