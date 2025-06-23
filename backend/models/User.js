// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'], // Custom error message
        trim: true // Remove whitespace from both ends of a string
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        // Basic regex for 10-digit phone number (customize as needed)
        match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true, // Store emails in lowercase
        trim: true,
        // Basic regex for email format
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'], // Minimum password length
        select: false // Do not return the password by default in queries
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'], // Added 'admin' role for future proofing
        required: [true, 'Role is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    year: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        required: function() {
            // Only required if the role is 'student'
            return this.role === 'student';
        },
        message: 'Year is required for students' // Custom message for conditional required
    },
    // NEW: Array to store products the user has listed for sale
    selling: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product' // Reference to the Product model
        }
    ],
    // NEW: Array to store items in the user's cart
    addToCart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Reference to the Product model
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            }
        }
    ]
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Hash the password before saving the user
UserSchema.pre('save', async function(next) {
    // Only hash if the password field is new or modified
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
        next();
    } catch (error) {
        next(error); // Pass any error to the next middleware
    }
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);