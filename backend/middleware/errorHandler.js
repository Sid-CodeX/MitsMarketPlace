/**
 * Global error handling middleware.
 * Captures errors and returns a standardized JSON response.
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let error = {
        statusCode: err.statusCode || 500,
        message: err.message || 'Server Error',
    };

    // Mongoose invalid ObjectId error
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        error = {
            statusCode: 404,
            message: `Resource not found with id ${err.value}`
        };
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = {
            statusCode: 400,
            message: `Duplicate value for '${field}': '${err.keyValue[field]}'`
        };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = {
            statusCode: 400,
            message: messages.join(', ')
        };
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
    });
};

module.exports = errorHandler;
