import React from 'react';
import { useTheme } from './ThemeContext';
import './Signup.css';

const Signup = () => {
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
            <div className="signup-container">
                <h2>Sign Up</h2>
                <form>
                    <div className="signup-field">
                        <label>Email:</label>
                        <input type="email" required />
                    </div>
                    <div className="signup-field">
                        <label>Password:</label>
                        <input type="password" required />
                    </div>
                    <button type="submit">Sign Up</button>
                    <p>Already have an account? <a href="/login">Login</a></p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
