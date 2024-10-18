const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Add path for serving static files
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}' with body:`, req.body);
    next();
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products'); // Import product routes
const cartRoutes = require('./routes/cart'); // Import cart routes
const uploadRoutes = require('./routes/upload'); // Import upload routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Use product routes
app.use('/api/cart', cartRoutes); // Use cart routes
app.use('/api/upload', uploadRoutes); // Use upload routes

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
