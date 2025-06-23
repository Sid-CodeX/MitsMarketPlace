import React, { useState } from 'react';
import './Cart.css';

const Cart = ({ cartItems = [], clearCart, removeItemFromCart, setSellingProducts }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleBuyClick = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleConfirmPurchase = async () => {
        if (selectedItem) {
            closeModal();
            try {
                const response = await fetch(
                    `http://localhost:5000/api/products/${selectedItem.itemId}/sell`,
                    { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
                );

                if (!response.ok) throw new Error('Failed to confirm purchase.');

                removeItemFromCart(cartItems.findIndex((item) => item.itemId === selectedItem.itemId));

                setSellingProducts((prev) =>
                    prev.map((prod) =>
                        prod.itemId === selectedItem.itemId ? { ...prod, status: 'Sold' } : prod
                    )
                );

                alert(`Successfully purchased ${selectedItem.name} for ₹${selectedItem.price}`);
            } catch (error) {
                console.error('Error confirming purchase:', error);
                alert('Purchase failed. Please try again.');
            }
        }
    };

    return (
        <div className="cart-section">
            <h2>Cart Section</h2>
            {cartItems.length > 0 ? (
                <ul className="cart-list">
                    {cartItems.map((item, index) => (
                        <li key={item.itemId} className="cart-item">
                            <div className="cart-item-details">
                                <span className="cart-item-name">{item.name} - ₹{item.price}</span>
                                <p className="cart-item-description">{item.description}</p>
                            </div>
                            <div className="button-group">
                                <button onClick={() => removeItemFromCart(index)} className="remove-item-btn">
                                    Remove
                                </button>
                                <button onClick={() => handleBuyClick(item)} className="buy-item-btn">
                                    Buy
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your cart is empty.</p>
            )}
            {cartItems.length > 0 && (
                <button onClick={clearCart} className="clear-cart-btn">
                    Clear Cart
                </button>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Purchase</h3>
                        <p>
                            Are you sure you want to buy <strong>{selectedItem?.name}</strong> for ₹{selectedItem?.price}?
                        </p>
                        <div className="button-group">
                            <button onClick={closeModal} className="modal-button">
                                Cancel
                            </button>
                            <button onClick={handleConfirmPurchase} className="modal-button">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
