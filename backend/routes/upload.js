const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory where files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp as file name
    }
});

const upload = multer({ storage: storage,  limits: { fileSize: 5 * 1024 * 1024 } });

// POST request for image upload
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`; // Construct image URL
    res.status(200).json({ url: imageUrl });
});

module.exports = router;
