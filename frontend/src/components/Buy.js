import React, { useEffect, useState } from 'react';
import './Buy.css';
import { useAuth } from '../AuthContext';

const Buy = ({ addToCart, setSellingProducts }) => {
    const { sellerId } = useAuth();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products?sellerId=${sellerId}`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sellerId]);

    const categorizeProducts = (products) => {
        return products.reduce((categories, product) => {
            const { category } = product;
            if (!categories[category]) categories[category] = [];
            categories[category].push(product);
            return categories;
        }, {});
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categorizedProducts = categorizeProducts(filteredProducts);
    const categories = Object.keys(categorizedProducts).sort((a, b) => {
        if (a === 'Books') return -1;
        if (b === 'Books') return 1;
        return a.localeCompare(b);
    });

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleConfirmPurchase = async () => {
        if (selectedProduct) {
            closeModal();
            try {
                await fetch(`http://localhost:5000/api/products/${selectedProduct._id}/sell`, { method: 'PUT' });

                setProducts((prev) =>
                    prev.map((prod) =>
                        prod._id === selectedProduct._id
                            ? { ...prod, status: 'Sold', successMessage: `Successfully purchased ${prod.name} for ₹${prod.price}` }
                            : prod
                    )
                );

                setSellingProducts((prev) =>
                    prev.map((prod) =>
                        prod._id === selectedProduct._id ? { ...prod, status: 'Sold' } : prod
                    )
                );
            } catch (error) {
                console.error('Error confirming purchase:', error);
            }
        }
    };

    if (loading) return <p>Loading products...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="buy-section">
            <h2>Buy Section</h2>
            <p>Select from different categories of products or search for a specific item.</p>

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
                                    <img src={`http://localhost:5000${product.image}`} alt={product.name} className="product-image" />
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-price">Price: ₹{product.price}</p>
                                    <p className="product-description">{product.description}</p>
                                    <p className="product-contact">Contact: {product.contactNumber}</p>
                                    {product.status === 'Sold' ? (
                                        <p className="success-message">{product.successMessage}</p>
                                    ) : (
                                        <div className="button-group">
                                            <button onClick={() => addToCart(product)} className="add-to-cart-button">Add to Cart</button>
                                            <button onClick={() => handleBuyClick(product)} className="buy-button">Buy</button>
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

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Purchase</h3>
                        <p>Are you sure you want to buy <strong>{selectedProduct?.name}</strong> for ₹{selectedProduct?.price}?</p>
                        <div className="button-group">
                            <button onClick={closeModal} className="modal-button">Cancel</button>
                            <button onClick={handleConfirmPurchase} className="modal-button">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Buy;
