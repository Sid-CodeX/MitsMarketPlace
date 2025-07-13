// src/components/Cart.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get the token
import '../styles/Cart.css'; // Ensure your CSS file is updated for quantities

// Define the API base URL from the environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Cart component expects a prop 'onPurchaseSuccess' which Dashboard will use to refresh its products
const Cart = ({ onPurchaseSuccess }) => {
    const { isAuthenticated, userId } = useAuth(); // Get authentication status and userId
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false); // For confirming total cart purchase

    // Function to fetch cart items from the backend
    const fetchCartItems = useCallback(async () => {
        if (!isAuthenticated) {
            setCartItems([]); // Clear cart if not authenticated
            return;
        }
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Backend's getCartItems returns an array of { product: {...}, quantity: N }
            setCartItems(response.data);
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError('Failed to load cart items.');
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch cart items when component mounts or auth status changes
    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]); // Dependency array includes fetchCartItems to avoid stale closures

    // Add item to cart (This function might be called from ProductCard in Dashboard)
    // We'll define it here so Cart can also manage this, or it can be passed from parent
    const handleAddItemToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            alert('Please log in to add items to the cart.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/cart/add`,
                { productId, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            alert('Item added to cart!');
            fetchCartItems(); // Refresh cart after adding
        } catch (err) {
            console.error('Error adding item to cart:', err);
            setError('Failed to add item to cart.');
        } finally {
            setLoading(false);
        }
    };


    // Update quantity of a specific item in the cart
    const handleUpdateItemQuantity = async (productId, newQuantity) => {
        if (!isAuthenticated || newQuantity < 1) return;

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/api/cart/update/${productId}`,
                { quantity: newQuantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            fetchCartItems(); // Refresh cart after updating
        } catch (err) {
            console.error('Error updating item quantity:', err);
            setError('Failed to update item quantity.');
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart (decreases quantity by 1 or removes if quantity becomes 0)
    const handleRemoveItemFromCart = async (productId) => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/cart/remove/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Item removed from cart!');
            fetchCartItems(); // Refresh cart after removal
        } catch (err) {
            console.error('Error removing item from cart:', err);
            setError('Failed to remove item from cart.');
        } finally {
            setLoading(false);
        }
    };

    // Clear all items from the cart
    const handleClearCart = async () => {
        if (!isAuthenticated) return;

        if (!window.confirm('Are you sure you want to clear your entire cart?')) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/cart/clear`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Cart cleared successfully!');
            fetchCartItems(); // Refresh cart (it should now be empty)
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError('Failed to clear cart.');
        } finally {
            setLoading(false);
        }
    };

    // Handle purchase of the entire cart
    const handleBuyAllItems = async () => {
        if (!isAuthenticated) return;

        if (cartItems.length === 0) {
            alert('Your cart is empty. Add items before purchasing.');
            return;
        }

        setShowModal(true); // Show confirmation modal for entire cart
    };

    const confirmPurchase = async () => {
        setShowModal(false);
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/cart/buy`, {}, { // Empty body, as backend uses cart contents
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            alert(response.data.message || 'Purchase successful!');
            fetchCartItems(); // Cart should be empty after purchase
            if (onPurchaseSuccess) {
                onPurchaseSuccess(); // Notify parent (Dashboard) to refresh product list
            }
        } catch (err) {
            console.error('Error purchasing cart:', err);
            setError(err.response?.data?.message || 'Purchase failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };


    return (
        <div className="cart-section">
            <h2>Your Cart</h2>
            {loading && <p>Loading cart...</p>}
            {error && <p className="error-message">{error}</p>}
            {!isAuthenticated && <p>Please log in to view your cart.</p>}

            {isAuthenticated && !loading && cartItems.length === 0 && (
                <p>Your cart is empty.</p>
            )}

            {isAuthenticated && cartItems.length > 0 && (
                <>
                    <ul className="cart-list">
                        {cartItems.map((item) => (
                            <li key={item.product._id} className="cart-item">
                                <div className="cart-item-details">
                                    <span className="cart-item-name">
                                        {item.product.name} - ₹{item.product.price} x {item.quantity}
                                    </span>
                                    <p className="cart-item-description">{item.product.description}</p>
                                </div>
                                <div className="button-group">
                                    <button
                                        onClick={() => handleUpdateItemQuantity(item.product._id, item.quantity - 1)}
                                        disabled={item.quantity === 1}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => handleUpdateItemQuantity(item.product._id, item.quantity + 1)}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => handleRemoveItemFromCart(item.product._id)}
                                        className="remove-item-btn"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-summary">
                        <h3>Total: ₹{calculateTotalPrice()}</h3>
                        <button onClick={handleClearCart} className="clear-cart-btn" disabled={loading}>
                            Clear Cart
                        </button>
                        <button onClick={handleBuyAllItems} className="buy-all-btn" disabled={loading}>
                            Buy All Items
                        </button>
                    </div>
                </>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Purchase</h3>
                        <p>
                            Are you sure you want to buy all items in your cart for a total of{' '}
                            <strong>₹{calculateTotalPrice()}</strong>?
                        </p>
                        <div className="button-group">
                            <button onClick={closeModal} className="modal-button cancel">
                                Cancel
                            </button>
                            <button onClick={confirmPurchase} className="modal-button confirm">
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;