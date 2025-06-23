import React, { useEffect, useState } from 'react';
import './Status.css';
import { useAuth } from '../AuthContext';

const Status = () => {
    const { sellerId } = useAuth();
    const [sellingProducts, setSellingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Status.js
    useEffect(() => {
        const fetchSellingProducts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products/my-products?sellerId=${sellerId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                const updatedData = data.map(product => ({
                    ...product,
                    status: product.status === 'Available' ? 'Pending' : product.status
                }));
                setSellingProducts(updatedData);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSellingProducts();
    }, [sellerId]);

    const handleRemoveProduct = async (productId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSellingProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
            } else {
                console.error('Failed to remove product');
            }
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    if (loading) return <p className="loading">Loading products...</p>;
    if (error) return <p className="error">{error}</p>;

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
                            <span className={`product-status ${product.status.toLowerCase()}`}>
                                {product.status}
                            </span>
                            <button
                                className="remove-button"
                                onClick={() => handleRemoveProduct(product._id)}
                            >
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
