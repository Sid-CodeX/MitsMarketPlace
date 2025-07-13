import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

// Import components
import Buy from '../components/Buy'; // Assuming Buy is in components folder
import Sell from '../components/Sell';
import Cart from '../components/Cart';
import Status from '../components/Status';
import Profile from '../components/Profile';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('buy');
    const [sellingProducts, setSellingProducts] = useState([]); // Products listed for sale by the user
    const [profileData, setProfileData] = useState({
        name: '', email: '', phone: '', role: '', department: '', year: '', profileImage: ''
    });
    const [buyableProducts, setBuyableProducts] = useState([]); // State for products available for buying


    // Function to fetch products currently listed for sale by the user
    const fetchSellingProducts = useCallback(async () => {
        if (!isAuthenticated) {
            setSellingProducts([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/products/my-products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Ensure you're accessing the 'data' property from the backend response
            if (response.data && Array.isArray(response.data.data)) { // Check for .data.data
                const updatedData = response.data.data.map(product => ({
                    ...product,
                    status: product.status === 'Available' ? 'Pending' : product.status // Apply display logic here
                }));
                setSellingProducts(updatedData);
            } else {
                console.error("Selling products response.data is not an array:", response.data);
                setSellingProducts([]); // Fallback to empty array
            }
        } catch (error) {
            console.error('Error fetching selling products:', error);
        }
    }, [isAuthenticated]);

    // Function to fetch user profile data
    const fetchProfileData = useCallback(async () => {
        if (!isAuthenticated) {
            setProfileData({ name: '', email: '', phone: '', role: '', department: '', year: '', profileImage: '' });
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/profile/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProfileData(response.data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }, [isAuthenticated]);

    // Function to fetch products available for buying
    const fetchBuyableProducts = useCallback(async () => {
        if (!isAuthenticated) {
            setBuyableProducts([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/products`, {
                    headers: { Authorization: `Bearer ${token}` } // Include token if this endpoint is protected
            });
            // ************ CRITICAL CHANGE HERE ************
            // The backend returns { success: true, count: ..., data: productsArray }
            // You need to set the state to response.data.data (the actual array)
            if (response.data && Array.isArray(response.data.data)) {
                setBuyableProducts(response.data.data); // Set state to the array inside 'data'
            } else {
                console.error("Buyable products response.data is not an array:", response.data);
                setBuyableProducts([]); // Fallback to empty array
            }
        } catch (error) {
            console.error('Error fetching buyable products:', error);
        }
    }, [isAuthenticated]);

    // Fetch initial data when component mounts or authentication status changes
    useEffect(() => {
        fetchSellingProducts();
        fetchProfileData();
        fetchBuyableProducts(); // Fetch buyable products on mount
    }, [fetchSellingProducts, fetchProfileData, fetchBuyableProducts]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAddToCart = async (product) => { // Changed productId to full product object
        if (!isAuthenticated) {
            alert('Please log in to add items to the cart.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/cart/add`,
                { productId: product._id, quantity: 1 }, // Pass productId and quantity
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            alert(`"${product.name}" added to cart!`); // More descriptive message
        } catch (error) {
            console.error('Error adding item to cart:', error);
            alert(error.response?.data?.message || 'Failed to add item to cart.');
        }
    };

    const handleSellSuccess = () => {
        fetchSellingProducts();
        fetchBuyableProducts();
    };

    const handleCartPurchaseSuccess = () => {
        fetchSellingProducts();
        fetchBuyableProducts();
    };

    const handleProductRemoved = () => {
        fetchSellingProducts();
        fetchBuyableProducts();
    };

    return (
        <div className="dashboard-container">
            <div className="logo-container">
                <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" className="logo" />
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="navbar">
                <button className={activeSection === 'buy' ? 'active' : ''} onClick={() => setActiveSection('buy')}>Buy</button>
                <button className={activeSection === 'sell' ? 'active' : ''} onClick={() => setActiveSection('sell')}>Sell</button>
                <button className={activeSection === 'cart' ? 'active' : ''} onClick={() => setActiveSection('cart')}>Cart</button>
                <button className={activeSection === 'status' ? 'active' : ''} onClick={() => setActiveSection('status')}>Status</button>
                <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>Profile</button>
            </div>

            <div className="page-design">
                {activeSection === 'buy' && (
                    <Buy products={buyableProducts} addToCart={handleAddToCart} /> 
                )}
                {activeSection === 'sell' && (
                    <Sell
                        onSellSuccess={handleSellSuccess}
                    />
                )}
                {activeSection === 'cart' && (
                    <Cart onPurchaseSuccess={handleCartPurchaseSuccess} />
                )}
                {activeSection === 'status' && (
                    <Status
                        sellingProducts={sellingProducts}
                        onProductRemoved={handleProductRemoved}
                    />
                )}
                {activeSection === 'profile' && (
                    <Profile
                        profileData={profileData}
                        onProfileUpdate={fetchProfileData}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;