import React, { useState } from 'react';
import './BuySell.css'; // Add your CSS file for styling

const BuySell = () => {
    const [isBuying, setIsBuying] = useState(true); // State to track whether to show Buy or Sell section

    const handleToggle = () => {
        setIsBuying(!isBuying); // Toggle between Buy and Sell sections
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>College Marketplace</h1>
            <button onClick={handleToggle} style={{ marginBottom: '20px' }}>
                {isBuying ? 'Switch to Sell' : 'Switch to Buy'}
            </button>

            {isBuying ? (
                <div>
                    <h2>Available Products for Purchase</h2>
                    <ul>
                        <li>Textbook: $50</li>
                        <li>Laptop: $500</li>
                        <li>Desk: $100</li>
                    </ul>
                </div>
            ) : (
                <div>
                    <h2>Sell Your Products</h2>
                    <form>
                        <div>
                            <label>Product Name:</label>
                            <input type="text" required />
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea required></textarea>
                        </div>
                        <div>
                            <label>Price:</label>
                            <input type="number" required />
                        </div>
                        <button type="submit">Sell Product</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BuySell;
