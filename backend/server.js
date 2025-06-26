const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const helmet = require('helmet'); // For security headers

// Load environment variables from .env file.
// Adjust path if your .env file is in a different location (e.g., config/config.env)
dotenv.config();

// --- Import Custom Middleware and Routes ---
const authRoutes = require('./routes/authRoutes'); // Your refactored authentication routes
// Assuming these exist and you'll refactor them similarly later
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const profileRoutes = require('./routes/profile');
// const uploadRoutes = require('./routes/upload'); // If you decide to move upload logic to its own route file

// Global error handler - MUST be imported and used after all routes
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Global Middleware ---

// Enable CORS for all routes (consider configuring specific origins in production)
app.use(cors());

// Body parsers for incoming request bodies
app.use(express.json()); // For JSON payloads (application/json)
app.use(express.urlencoded({ extended: true })); // For URL-encoded payloads (application/x-www-form-urlencoded)

// Add security HTTP headers
app.use(helmet());

// Custom logging middleware (optional, for debugging requests)
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    if (Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        // Ensure the 'uploads' folder exists. Multer creates it if it doesn't,
        // but it's good practice to ensure permissions if deployed.
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create a unique filename with timestamp to prevent collisions
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        // Regex to allow only specific image types
        const allowedTypes = /jpeg|jpg|png|gif/; // Added gif for more flexibility
        const isValidType = allowedTypes.test(file.mimetype);
        const isValidExtension = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (isValidType && isValidExtension) {
            cb(null, true); // Accept the file
        } else {
            // Reject the file with an error message
            cb(new Error('Only JPEG, JPG, PNG, and GIF images are allowed'), false);
        }
    },
});

// Serve static files from the 'uploads' directory
// Accessible via /uploads/<filename> (e.g., http://localhost:5000/uploads/1678912345-myimage.png)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI, { // Using MONGO_URI as per your server.js snippet
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));


// --- API Routes ---

// Mount your refactored authentication routes
app.use('/api/auth', authRoutes);

// Mount your other existing routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/profile', profileRoutes);
// You might also have protected.js or upload.js as separate routes
// app.use('/api/protected', protectedRoutes);
// app.use('/api/upload', uploadRoutes); // If you make a dedicated uploadRoutes.js


// Dedicated route for image uploads
// This route uses the 'upload' middleware configured above
app.post('/api/upload/image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded or file type is not allowed' });
    }
    // Return the path where the image can be accessed
    const imagePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, imagePath, message: 'Image uploaded successfully' });
});

// --- Global Error Handling Middleware ---
// This must be the last middleware mounted, after all routes
app.use(errorHandler);

// --- Server Start ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections (e.g., failed DB connection after initial start)
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
