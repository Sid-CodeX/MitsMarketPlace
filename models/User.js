const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty'], required: true }, // Ensure enum values are in lowercase
    department: { type: String, required: true },
    year: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        required: function() {
            return this.role === 'student'; // Year is only required if the role is 'student'
        }
    }
});

// Hash the password before saving the user
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', UserSchema);
