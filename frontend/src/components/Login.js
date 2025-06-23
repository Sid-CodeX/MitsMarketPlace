import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import './Login.css';
import logo from './logo.png'; // Import image correctly

const Login = () => {
    const { darkMode, setDarkMode } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    //Login.js
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (email && password) {
            try {
                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    email,
                    password
                });

                const { token, user } = response.data;
                console.log('Login successful:', user);

                if (user && user._id) {
                    localStorage.setItem('token', token);
                    login(user._id);
                    navigate('/marketplace');
                } else {
                    setErrorMessage('Failed to retrieve user ID.');
                    console.error('User ID (_id) not found in response.');
                }
            } catch (error) {
                setErrorMessage('Invalid email or password');
                console.error('Login error:', error);
            }
        } else {
            alert('Please enter valid credentials');
        }
    };

    return (
        <div className={`page-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="toggle-container">
                <label className="switch">
                    <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    <span className="slider"></span>
                </label>
            </div>
            <div className="overlay"></div>

            <div className="header">
                <img src={logo} alt="Logo" className="logo" /> {/* Corrected image reference */}
            </div>

            <div className="login-container">
                <h2>Login</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="login-field">
                        <label>Password:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit">Login</button>
                    <p>Don't have an account? <a href="/signup">Sign Up</a></p>
                </form>
            </div>
        </div>
    );
};

export default Login;
