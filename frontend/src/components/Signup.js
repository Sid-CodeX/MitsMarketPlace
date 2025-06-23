import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import axios from 'axios';
import './Signup.css';
import logo from './logo.png'; // Import image correctly

const Signup = () => {
    const { darkMode, setDarkMode } = useTheme();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [year, setYear] = useState('');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    // Signup.js
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name && phone && role && department && email && password) {
            try {
                const response = await axios.post('http://localhost:5000/api/auth/signup', {
                    name,
                    phone,
                    role,
                    year,
                    department,
                    email,
                    password
                });
                console.log('Signup successful:', response.data);
            } catch (error) {
                setErrorMessage('Error during signup: ' + error.response.data.message);
                console.error('Signup error:', error);
            }
        } else {
            alert('Please fill in all fields');
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

            <div className="signup-container">
                <h2>Sign Up</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="signup-field">
                        <label>Name:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="signup-field">
                        <label>Phone Number:</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="signup-field">
                        <label>Role:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="">Select Role</option>
                            <option value="Student">Student</option>
                            <option value="Faculty">Faculty</option>
                        </select>
                    </div>
                    {role === 'Student' && (
                        <div className="signup-field">
                            <label>Year:</label>
                            <select value={year} onChange={(e) => setYear(e.target.value)} required>
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>
                    )}
                    <div className="signup-field">
                        <label>Department:</label>
                        <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
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
                    <div className="signup-field">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="signup-field">
                        <label>Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit">Sign Up</button>
                    <p>Already have an account? <a href="/login">Login</a></p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
