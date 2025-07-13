// src/components/Sell.js
import React, { useState, useEffect } from 'react';
import '../styles/Sell.css';
import { useAuth } from '../contexts/AuthContext';

const Sell = ({ sellingProducts, setSellingProducts }) => {
    const { userId } = useAuth(); // Correctly get userId from AuthContext

    const [sellData, setSellData] = useState({
        productName: '',
        category: '',
        price: '',
        image: null, // Will store the File object
        description: '',
        contactNumber: '' // Ensure this matches your backend model and validation
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        // Cleanup URL.createObjectURL to prevent memory leaks
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);

    const handleSellChange = (e) => {
        const { name, value } = e.target;
        setSellData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSellData((prevData) => ({ ...prevData, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setSellData((prevData) => ({ ...prevData, image: null }));
            setPreviewImage(null);
        }
    };

    const handleSellSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Client-side validation
        if (!sellData.productName || !sellData.category || !sellData.price || !sellData.description || !sellData.contactNumber) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }
        if (parseFloat(sellData.price) <= 0) {
            setError('Price must be a positive number.');
            setLoading(false);
            return;
        }
        if (!sellData.image) { // Make image upload required on frontend
            setError('Please upload an image for your product.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', sellData.productName);
        formData.append('category', sellData.category);
        formData.append('price', parseFloat(sellData.price));
        formData.append('description', sellData.description);
        formData.append('contactNumber', sellData.contactNumber);

        if (userId) { // Ensure userId is available from AuthContext
            formData.append('seller', userId);
        } else {
            setError('Seller ID not available. Please log in.');
            setLoading(false);
            return;
        }

        if (sellData.image) {
            formData.append('image', sellData.image); // This is the file itself
        }

        try {
            // Use environment variable for API base URL
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token'); // Get token for authorization

            const response = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                body: formData, // FormData automatically sets Content-Type: multipart/form-data
                headers: {
                    'Authorization': `Bearer ${token}` // Add authorization header
                    // Do NOT set 'Content-Type': 'multipart/form-data' here. Fetch does it for FormData.
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || (errorData.errors && errorData.errors[0] && errorData.errors[0].msg) || 'Product creation failed');
            }

            const result = await response.json(); // Backend now returns { success, message, data: newProduct }
            const newProduct = result.data; // Extract the product object from the 'data' field

            // Construct the full image URL using the API_BASE_URL and the path from the backend
            const imageUrl = newProduct.image
                ? `${API_BASE_URL}${newProduct.image}`
                : null;

            // Update the selling products list in the parent component
            setSellingProducts((prevProducts) => [
                { ...newProduct, image: imageUrl, status: newProduct.status || 'Available' }, // Ensure status is present
                ...prevProducts, // Add new product to the beginning of the list
            ]);

            setSuccess('Product added successfully!');
            // Reset form fields
            setSellData({
                productName: '',
                category: '',
                price: '',
                image: null,
                description: '',
                contactNumber: '',
            });
            setPreviewImage(null); // Clear image preview
        } catch (error) {
            console.error('Sell Product Error:', error);
            setError(error.message || 'An error occurred while adding the product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sell-section">
            <h2>Sell Section</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSellSubmit}>
                <input
                    type="text"
                    name="productName"
                    value={sellData.productName}
                    onChange={handleSellChange}
                    placeholder="Product Name"
                    className="input-field"
                    required
                />
                <select
                    name="category"
                    value={sellData.category}
                    onChange={handleSellChange}
                    className="input-field"
                    required
                >
                    <option value="">Select a category</option>
                    <option value="Books">Books</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Services">Services</option> {/* Added Services as per backend route */}
                    <option value="Other">Other</option>
                </select>
                <input
                    type="number"
                    name="price"
                    value={sellData.price}
                    onChange={handleSellChange}
                    placeholder="Price"
                    className="input-field"
                    required
                />
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-file"
                    required // Make image required if it is a must for product listing
                />
                {previewImage && <img src={previewImage} alt="Product Preview" className="product-preview-image" />}
                <textarea
                    name="description"
                    value={sellData.description}
                    onChange={handleSellChange}
                    placeholder="Product Description"
                    className="input-field"
                    required
                ></textarea>
                <input
                    type="text"
                    name="contactNumber"
                    value={sellData.contactNumber}
                    onChange={handleSellChange}
                    placeholder="Contact Number"
                    className="input-field"
                    required
                />
                <button type="submit" disabled={loading} className="button button-primary">
                    {loading ? 'Adding...' : 'Sell'}
                </button>
            </form>
        </div>
    );
};

export default Sell;