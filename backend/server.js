const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // For security headers
const compression = require('compression'); // For Gzip compression
const morgan = require('morgan'); // For HTTP request logging

// Load environment variables from .env file.
dotenv.config();

// --- Import Database Connection ---
const connectDB = require('./config/db'); // Your new DB connection file

// --- Import Custom Middleware and Routes ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Your new upload routes

// Global error handler - MUST be imported and used after all routes
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Connect to Database ---
connectDB(); // Call the function to connect to MongoDB

// --- Global Middleware ---

// Enable CORS for all routes (configure specific origins in production)
app.use(cors());

// Add security HTTP headers
app.use(helmet());

// Enable Gzip compression for all responses (optional but recommended for performance)
app.use(compression());

// HTTP request logger ('dev' is a common format for development)
app.use(morgan('dev'));

// Body parsers for incoming request bodies
app.use(express.json()); // For JSON payloads (application/json)
app.use(express.urlencoded({ extended: true })); // For URL-encoded payloads (application/x-www-form-urlencoded)

// Serve static files from the 'uploads' directory
// This makes images uploaded via /api/upload/image accessible via /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---

// Mount your refactored authentication routes
app.use('/api/auth', authRoutes);
// Mount your product routes
app.use('/api/products', productRoutes);
// Mount your cart routes
app.use('/api/cart', cartRoutes);
// Mount your profile routes
app.use('/api/profile', profileRoutes);
// Mount your dedicated upload routes
app.use('/api/upload', uploadRoutes); // New dedicated route for uploads

// --- Global Error Handling Middleware ---
// This must be the last middleware mounted, after all routes
app.use(errorHandler);

// --- Server Start ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections (important for robustness)
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
