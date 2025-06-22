/*import React from 'react';

import { useTheme } from './ThemeContext';
import './Login.css';

const Login = () => {
    const { darkMode, setDarkMode } = useTheme();

    return (
        <div className={`page-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="toggle-container">
                <label className="switch">
                    <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    <span className="slider"></span>
                </label>
            </div>
            <div className="overlay"></div>
            <div className="login-container">
                <h2>Login</h2>
                <form>
                    <div className="login-field">
                        <label>Email:</label>
                        <input type="email" required />
                    </div>
                    <div className="login-field">
                        <label>Password:</label>
                        <input type="password" required />
                    </div>
                    <button type="submit">Login</button>
                    <p>Don't have an account? <a href="/signup">Sign Up</a></p>
                </form>
            </div>
        </div>
    );
};

export default Login;
*/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for routing
import { useTheme } from './ThemeContext';
import './Login.css';

const Login = () => {
    const { darkMode, setDarkMode } = useTheme();
    const navigate = useNavigate(); // Initialize navigation
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simple form validation or API call to verify login details
        if (email && password) {
            // Assuming login is successful, navigate to the buy/sell page
            navigate('/marketplace');
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
            <div className="login-container">
                <h2>Login</h2>
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
