const express = require('express');
const router = express.Router();
const multer = require('multer'); // Multer needs to be configured here for this specific route
const path = require('path');
const uploadController = require('../controllers/uploadController'); // Link to your new controller

// --- Multer Configuration for this specific route (if not global in server.js) ---
// Note: We are moving the Multer setup from server.js to here.
// This makes the upload route self-contained.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads'); // Go up one level to 'backend', then into 'uploads'
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValidType = allowedTypes.test(file.mimetype);
        const isValidExtension = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (isValidType && isValidExtension) {
            cb(null, true);
        } else {
            // Pass an error to Multer, which express-async-handler/errorHandler can catch
            cb(new Error('Only JPEG, JPG, PNG, and GIF images are allowed'), false);
        }
    },
});

// --- Upload Route ---

/**
 * @route   POST /api/upload/image
 * @desc    Uploads a single image file.
 * @access  Public (can be made Private by adding 'protect' middleware)
 */
router.post('/image', upload.single('image'), uploadController.uploadImage);

module.exports = router;
