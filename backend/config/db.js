const mongoose = require('mongoose');

/**
 * @desc    Connects to the MongoDB database using Mongoose.
 * Reads the MongoDB URI from environment variables.
 */
const connectDB = async () => {
    try {
        // Use process.env.MONGODB_URL as confirmed in previous steps
        const conn = await mongoose.connect(process.env.MONGODB_URL);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;