// src/components/AuthPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Import the specific CSS for AuthPage component
import '../styles/AuthPage.css'; // <--- This import path is correct

// Define the API base URL from the environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AuthPage = () => {
    const { darkMode, setDarkMode } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // To check current path for initial form display

    // Determine initial form (login or signup) based on URL path
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');

    // Common states for both forms
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // States specific to Signup
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [year, setYear] = useState('');
    const [department, setDepartment] = useState('');

    // Effect to update body class for dark mode and synchronize isLogin with URL
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update isLogin state if URL changes (e.g., user types /signup directly)
        setIsLogin(location.pathname === '/login');
        // Clear form fields and errors when switching between login/signup
        resetForm();
    }, [darkMode, location.pathname]);

    // Function to clear all form fields and error messages
    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setRole('');
        setYear('');
        setDepartment('');
        setErrorMessage('');
        setLoading(false);
    };

    // Handle form submission (for both login and signup)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous errors
        setLoading(true);

        try {
            if (isLogin) {
                // --- Login Logic ---
                if (!email || !password) {
                    setErrorMessage('Please enter both email and password.');
                    setLoading(false);
                    return;
                }
                const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                    email,
                    password
                });
                const { token, user } = response.data;
                if (user && user._id) {
                    localStorage.setItem('token', token);
                    login(user._id);
                    // navigate('/dashboard'); // Changed from /dashboard to /marketplace as per App.js
                    navigate('/marketplace');
                } else {
                    setErrorMessage('Failed to retrieve user ID.');
                    console.error('User ID (_id) not found in response.');
                }
            } else {
                // --- Signup Logic ---
                if (!name || !phone || !role || !department || !email || !password || (role === 'Student' && !year)) {
                    setErrorMessage('Please fill in all required fields.');
                    setLoading(false);
                    return;
                }
                const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
                    name,
                    phone,
                    role,
                    year: role === 'Student' ? year : undefined, // Only send year if role is Student
                    department,
                    email,
                    password
                });
                console.log('Signup successful:', response.data);
                setErrorMessage('Signup successful! You can now log in.');
                setIsLogin(true); // Switch to login form after successful signup
                resetForm(); // Clear signup fields
            }
        } catch (error) {
            console.error('Authentication error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to switch between login and signup forms
    const handleSwitchForm = (isLoginMode) => {
        setIsLogin(isLoginMode);
        resetForm(); // Clear fields and errors when switching forms
        navigate(isLoginMode ? '/login' : '/signup'); // Update URL
    };

    return (
        <div className="auth-page-container">
            {/* Dark Mode Toggle */}
            <div className="toggle-container">
                <label className="switch" htmlFor="theme-toggle">
                    <input
                        type="checkbox"
                        id="theme-toggle"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                    <span className="slider"></span>
                </label>
                <span className="toggle-label">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>

            {/* Page Overlay */}
            <div className="page-overlay"></div>

            {/* Header with Logo */}
            <div className="header">
                {/* Reference logo from the public folder */}
                <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" className="logo" />
            </div>

            {/* Authentication Form Card */}
            <div className="auth-form-card">
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && ( // Render signup specific fields only if not in login mode
                        <>
                            <div className="form-field">
                                <label htmlFor="name">Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="input-field"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="phone">Phone Number:</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    className="input-field"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    autoComplete="tel"
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="role">Role:</label>
                                <select
                                    id="role"
                                    className="input-field"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            </div>
                            {role === 'Student' && (
                                <div className="form-field">
                                    <label htmlFor="year">Year:</label>
                                    <select
                                        id="year"
                                        className="input-field"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-field">
                                <label htmlFor="department">Department:</label>
                                <select
                                    id="department"
                                    className="input-field"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="CSE">CSE</option>
                                    <option value="CSE-AI">CSE-AI</option>
                                    <option value="CSE-CY">CSE-CY</option>
                                    <option value="AI-DS">AI-DS</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="ME">ME</option>
                                    <option value="CE">CE</option>
                                    <option value="MCA">MCA</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-field">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={loading}
                    >
                        {loading ? (isLogin ? 'Logging in...' : 'Signing Up...') : (isLogin ? 'Login' : 'Sign Up')}
                    </button>

                    <p className="auth-switch-text">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            type="button"
                            className="text-link-button"
                            onClick={() => handleSwitchForm(!isLogin)}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;