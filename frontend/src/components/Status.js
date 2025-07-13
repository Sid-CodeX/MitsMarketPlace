import React from 'react'; // No useEffect, useState, useAuth needed if props are passed
import axios from 'axios'; // Use axios for consistency
import '../styles/Status.css';

// Define the API base URL from the environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Status component now receives 'sellingProducts' and 'onProductRemoved' as props
const Status = ({ sellingProducts, onProductRemoved }) => {
    // No need for internal fetch, loading, or error states if sellingProducts is passed from Dashboard

    const handleRemoveProduct = async (productId) => {
        try {
            const token = localStorage.getItem('token'); // Get token for authentication
            const response = await axios.delete(`${API_BASE_URL}/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) { // Axios automatically handles non-2xx as errors by throwing errors for 4xx/5xx
                alert('Product removed successfully!');
                if (onProductRemoved) {
                    onProductRemoved(); // Notify Dashboard to refresh selling products
                }
            }
        } catch (error) {
            console.error('Error removing product:', error);
            alert(error.response?.data?.message || 'Failed to remove product.');
        }
    };

    // If sellingProducts is empty, display a message
    if (!sellingProducts || sellingProducts.length === 0) {
        return (
            <div className="status-section">
                <h2>Your Selling Products</h2>
                <p className="info-message">You currently have no products listed for sale.</p>
            </div>
        );
    }

    return (
        <div className="status-section">
            <h2>Your Selling Products</h2>
            <ul>
                {sellingProducts.map((product) => (
                    <li key={product._id} className="status-item">
                        <div className="product-details">
                            <span className="product-name">{product.name}</span>
                            <span className="product-description">{product.description}</span>
                            <span className="product-price">Price: ₹{product.price}</span>
                        </div>
                        <div className="status-action">
                            {/* Display status as received (Dashboard already applied 'Available' to 'Pending' mapping) */}
                            <span className={`product-status ${product.status.toLowerCase()}`}>
                                {product.status}
                            </span>
                            <button
                                className="remove-button"
                                onClick={() => handleRemoveProduct(product._id)}
                            >
                                {/* Button text based on status, as mapped in Dashboard */}
                                {product.status === 'Pending' ? 'Withdraw' : 'Remove'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Status;