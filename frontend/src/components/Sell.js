import React, { useState, useEffect } from 'react';
import './Sell.css';
import { useAuth } from '../AuthContext';

const Sell = ({ sellingProducts, setSellingProducts }) => {
    const { sellerId } = useAuth();

    const [sellData, setSellData] = useState({
        productName: '',
        category: '',
        price: '',
        image: null,
        description: '',
        contactNumber: ''
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
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
        }
    };
    // Sell.js
    const handleSellSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
    
        const formData = new FormData();
        formData.append('name', sellData.productName);
        formData.append('category', sellData.category);
        formData.append('price', parseFloat(sellData.price) || 0);
        formData.append('description', sellData.description);
        formData.append('contactNumber', sellData.contactNumber);
        formData.append('seller', sellerId);
        if (sellData.image) {
            formData.append('image', sellData.image);
        }
    
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Product creation failed');
            }
    
            const newProduct = await response.json();
            
            // Prepend 'http://localhost:5000' to the image URL if present
            const imageUrl = newProduct.image
                ? `http://localhost:5000${newProduct.image}` // Add base URL here
                : null;
    
            // Update the selling products list with the correct image URL
            setSellingProducts((prevProducts) => [
                ...prevProducts,
                { ...newProduct, image: imageUrl, status: 'Available' },
            ]);
    
            setSuccess('Product added successfully!');
            setSellData({
                productName: '',
                category: '',
                price: '',
                image: null,
                description: '',
                contactNumber: '',
            });
            setPreviewImage(null);
        } catch (error) {
            setError(error.message || 'An error occurred while adding the product.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="sell-section">
            <h2>Sell Section</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form onSubmit={handleSellSubmit}>
                <input
                    type="text"
                    name="productName"
                    value={sellData.productName}
                    onChange={handleSellChange}
                    placeholder="Product Name"
                    required
                />
                <select
                    name="category"
                    value={sellData.category}
                    onChange={handleSellChange}
                    required
                >
                    <option value="">Select a category</option>
                    <option value="Books">Books</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Other">Other</option>
                </select>
                <input
                    type="number"
                    name="price"
                    value={sellData.price}
                    onChange={handleSellChange}
                    placeholder="Price"
                    required
                />
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                {previewImage && <img src={previewImage} alt="Product Preview" />}
                <textarea
                    name="description"
                    value={sellData.description}
                    onChange={handleSellChange}
                    placeholder="Product Description"
                    required
                ></textarea>
                <input
                    type="text"
                    name="contactNumber"
                    value={sellData.contactNumber}
                    onChange={handleSellChange}
                    placeholder="Contact Number"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Sell'}
                </button>
            </form>
        </div>
    );
};

export default Sell;