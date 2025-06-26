const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// In-memory token blacklist (development only).
// NOTE: Use a persistent store like Redis or database for production environments.
const tokenBlacklist = new Set();

/**
 * @desc    Protect middleware - Verifies the JWT and attaches the user payload to the request.
 *           Ensures only authorized requests can access protected routes.
 * @param   {object} req - The Express request object
 * @param   {object} res - The Express response object
 * @param   {function} next - The next middleware handler
 */
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Extract the token from the "Authorization" header (Bearer scheme).
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Alternatively, if using httpOnly cookies:
    // else if (req.cookies && req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // No token found -> Not authorized
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    // Check if the token has been blacklisted (user logged out).
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ success: false, message: 'Invalid or logged out token.' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user payload (e.g., id, role) to the request object
        req.user = decoded;

        // Proceed to the next middleware/controller
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ success: false, message: 'Invalid token.' });
        }
        // Generic error
        return res.status(500).json({ success: false, message: 'Server error while verifying token.' });
    }
});

/**
 * @desc    Role-based authorization middleware.
 *           Ensures that the user has one of the required roles to access a route.
 * @param   {...string} roles - Allowed role(s) (e.g., 'admin', 'user').
 * @returns {function} Middleware that validates user role.
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Validate that the user is logged in and has a role
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this resource.`
            });
        }
        next();
    };
};

/**
 * @desc    Blacklist a JWT token (user logout).
 *           In development, it's added to an in-memory Set.
 *           In production, implement a persistent store (e.g., Redis).
 * @param   {string} token - JWT token to be blacklisted.
 */
exports.blacklistToken = (token) => {
    if (token) {
        tokenBlacklist.add(token);
    }
};
