const asyncHandler = require('express-async-handler'); // For simplifying async error handling

/**
 * @desc    Handles image file uploads.
 * This function expects Multer middleware to have processed the file.
 * @route   POST /api/upload/image
 * @access  Public (or Private if you add 'protect' middleware to the route)
 * @param   {Object} req.file - The uploaded file object provided by Multer.
 */
exports.uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        // Multer's fileFilter or limits might have already rejected it.
        // If no file, it means an error occurred during multer processing or no file was sent.
        // The global error handler will catch Multer errors if configured.
        return res.status(400).json({ success: false, message: 'No file uploaded or file type is not allowed.' });
    }

    // Construct the accessible URL for the uploaded image
    const imagePath = `/uploads/${req.file.filename}`;

    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imagePath, // Return the URL that the frontend can use
    });
});
