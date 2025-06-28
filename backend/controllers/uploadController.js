const asyncHandler = require('express-async-handler');

/**
 * Handle image uploads processed by Multer middleware.
 * Returns the relative path of the uploaded image.
 */
exports.uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'No file uploaded or file type is not allowed.' 
        });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imagePath
    });
});
