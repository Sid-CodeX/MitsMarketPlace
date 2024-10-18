const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // URL for image
    description: { type: String, required: true },
    contactNumber: { type: String, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Available' } // Status (Available, Sold)
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
