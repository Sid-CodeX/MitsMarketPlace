import React, { useState, useCallback } from 'react'; // Removed useEffect as products are now props
import '../styles/Buy.css';
// import { useAuth } from '../contexts/AuthContext'; // No longer directly needed for product fetching in this component

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Changed prop name 'products' to 'buyableProducts' for better clarity,
// as this component specifically handles products available for buying.
// Added onPurchaseSuccess callback to inform parent (Dashboard) to refresh its data.
const Buy = ({ products: buyableProducts, addToCart = () => {}, onPurchaseSuccess = () => {} }) => {
    // We no longer manage 'products' state locally in Buy.js.
    // The 'buyableProducts' prop is the source of truth.
    // const [products, setProducts] = useState([]); // REMOVE THIS LINE
    // const [loading, setLoading] = useState(true); // REMOVE THIS LINE
    // const [error, setError] = useState(null); // REMOVE THIS LINE

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [purchaseError, setPurchaseError] = useState(null); // Dedicated error state for purchase action
    const [purchaseMessage, setPurchaseMessage] = useState(null); // For success/info messages after purchase

    // The fetchProducts useCallback and useEffect below are removed
    // as Dashboard.js is now responsible for fetching and passing the products.
    /*
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message || 'An error occurred while fetching products.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    */

    const categorizeProducts = (prods) => {
        // Ensure prods is an array before reducing
        if (!Array.isArray(prods)) {
            console.warn("categorizeProducts received non-array data:", prods);
            return {}; // Return empty object if not an array to prevent errors
        }
        return prods.reduce((categories, product) => {
            const { category } = product;
            if (!categories[category]) categories[category] = [];
            categories[category].push(product);
            return categories;
        }, {});
    };

    // Filter products received via props
    // Added a check to ensure buyableProducts is an array before filtering
    const filteredProducts = Array.isArray(buyableProducts) ? buyableProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) : []; // If not an array, default to an empty array

    const categorizedProducts = categorizeProducts(filteredProducts);
    const categories = Object.keys(categorizedProducts).sort((a, b) => {
        if (a === 'Books') return -1;
        if (b === 'Books') return 1;
        return a.localeCompare(b);
    });

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
        setPurchaseError(null); // Clear previous error when opening modal
        setPurchaseMessage(null); // Clear previous message
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setPurchaseError(null);
        setPurchaseMessage(null);
    };

    const handleConfirmPurchase = async () => {
        if (!selectedProduct) return;

        setPurchaseError(null); // Clear previous errors
        setPurchaseMessage(null); // Clear previous messages

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setPurchaseError('Authentication token not found. Please log in.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/products/${selectedProduct._id}/sell`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to confirm purchase.');
            }

            const result = await response.json();
            setPurchaseMessage(result.message || `Successfully purchased ${selectedProduct.name} for ₹${selectedProduct.price}. Contact seller at ${selectedProduct.contactNumber}`);

            // Call the callback to inform the parent (Dashboard) to re-fetch product data
            // This will ensure Dashboard's `buyableProducts` and `sellingProducts` are updated.
            onPurchaseSuccess(); // Assuming Dashboard passes a function like fetchBuyableProducts here

            closeModal(); // Close modal after successful purchase
        } catch (err) {
            console.error('Error confirming purchase:', err);
            setPurchaseError(err.message || 'An error occurred during purchase confirmation.');
        }
    };

    // Use buyableProducts to determine loading/empty state.
    // Dashboard should handle its own loading/error state for fetching 'buyableProducts'.
    // Here, we just check if the prop is still null/undefined which would indicate it's loading.
    if (!buyableProducts) return <p>Loading products...</p>;
    if (buyableProducts.length === 0 && !searchTerm) return <p>No products available for sale.</p>;
    // If there's a purchase error, display it at the top or in context
    // if (purchaseError) return <p className="error-message">{purchaseError}</p>; // Display this within the UI, not as a full page render

    return (
        <div className="buy-section">
            <h2>Buy Section</h2>
            <p>Select from different categories of products or search for a specific item.</p>

            {purchaseMessage && <p className="success-message">{purchaseMessage}</p>}
            {purchaseError && <p className="error-message">{purchaseError}</p>}

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search for products by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="category-nav">
                {categories.map((category) => (
                    <a key={category} href={`#${category}`} className="category-link">
                        {category}
                    </a>
                ))}
            </div>

            {categories.length > 0 ? (
                categories.map((category) => (
                    <div key={category} id={category} className="category-section">
                        <h3 className="category-title">{category}</h3>
                        <div className="product-grid">
                            {categorizedProducts[category].map((product) => (
                                <div key={product._id} className="product-card">
                                    <img
                                        src={`${API_BASE_URL}${product.image}`}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-price">Price: ₹{product.price}</p>
                                    <p className="product-description">{product.description}</p>
                                    <p className="product-contact">
                                        {product.status === 'Sold'
                                            ? 'Contact Seller:'
                                            : 'Seller Contact:'}{' '}
                                        {product.contactNumber}
                                    </p>

                                    {/* Display status or action buttons based on product status */}
                                    {product.status === 'Sold' ? (
                                        <p className="status-message sold">
                                            This item has been sold.
                                        </p>
                                    ) : (
                                        <div className="button-group">
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="add-to-cart-button"
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => handleBuyClick(product)}
                                                className="buy-button"
                                            >
                                                Buy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p>No products found matching your search.</p>
            )}

            {showModal && selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Purchase</h3>
                        <p>
                            Are you sure you want to buy{' '}
                            <strong>{selectedProduct.name}</strong> for ₹{selectedProduct.price}?
                        </p>
                        <p>Seller Contact: {selectedProduct.contactNumber}</p>
                        <div className="button-group">
                            <button onClick={closeModal} className="modal-button cancel">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPurchase}
                                className="modal-button confirm"
                            >
                                Confirm
                            </button>
                        </div>
                        {/* Display error inside modal if it happens during confirmation */}
                        {purchaseError && <p className="error-message">{purchaseError}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Buy;