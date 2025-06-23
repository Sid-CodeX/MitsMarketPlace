// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        // Consider an enum if you have predefined categories, e.g.,
        // enum: ['Electronics', 'Books', 'Furniture', 'Apparel', 'Other']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'] // Ensure price is non-negative
    },
    image: {
        type: String,
        // Optional: If you want to validate if it's a URL when provided
        // validate: {
        //     validator: function(v) {
        //         return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        //     },
        //     message: props => `${props.value} is not a valid URL for image!`
        // },
        required: false // As per your original, it's optional
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'Seller ID is required']
    },
    status: {
        type: String,
        enum: ['Available', 'Sold', 'Pending', 'Archived'], 
        default: 'Available'
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);