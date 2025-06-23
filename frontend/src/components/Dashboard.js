// Frontend: Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Buy from './Buy';
import Sell from './Sell';
import Cart from './Cart';
import Status from './Status';
import Profile from './Profile';
import logo from './logo.png';

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('buy');
    const [cartItems, setCartItems] = useState([]);
    const [sellingProducts, setSellingProducts] = useState([]);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'student',
        department: '',
        year: '',
    });
    const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const navigate = useNavigate();

    const products = [
        // Product details here
    ];
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Clear token and navigate to login page
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const addToCart = (product) => {
        const itemToAdd = {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
        };
        setCartItems((prevItems) => [...prevItems, itemToAdd]);
    };

    const removeItemFromCart = (index) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);
    };

    const clearCart = () => setCartItems([]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleConfirmPurchase = () => {
        if (selectedProduct) {
            console.log(`Purchased: ${selectedProduct.name} for $${selectedProduct.price}`);
            closeModal();
        }
    };

    return (
        <div className="dashboard-container">
            {/* Logo Section */}
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo" />
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Navigation Bar */}
            <div className="navbar">
                <button className={activeSection === 'buy' ? 'active' : ''} onClick={() => setActiveSection('buy')}>Buy</button>
                <button className={activeSection === 'sell' ? 'active' : ''} onClick={() => setActiveSection('sell')}>Sell</button>
                <button className={activeSection === 'cart' ? 'active' : ''} onClick={() => setActiveSection('cart')}>Cart</button>
                <button className={activeSection === 'status' ? 'active' : ''} onClick={() => setActiveSection('status')}>Status</button>
                <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>Profile</button>
            </div>

            {/* Other Sections */}
            <div className="page-design">
                {activeSection === 'buy' && <Buy products={products} addToCart={addToCart} handleBuyClick={handleBuyClick} />}
                {activeSection === 'sell' && <Sell sellingProducts={sellingProducts} setSellingProducts={setSellingProducts} />}
                {activeSection === 'cart' && (
                    <Cart 
                        cartItems={cartItems} 
                        clearCart={clearCart} 
                        removeItemFromCart={removeItemFromCart} 
                        handleBuyClick={handleBuyClick} 
                    />
                )}
                {activeSection === 'status' && <Status sellingProducts={sellingProducts} />}
                {activeSection === 'profile' && (
                    <Profile 
                        profileData={profileData} 
                        setProfileData={setProfileData} 
                        profileImage={profileImage} 
                        setProfileImage={setProfileImage} 
                    />
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Purchase</h3>
                        <p>Are you sure you want to buy <strong>{selectedProduct?.name}</strong> for ${selectedProduct?.price}?</p>
                        <button onClick={closeModal} className="modal-button">Cancel</button>
                        <button onClick={handleConfirmPurchase} className="modal-button">Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;