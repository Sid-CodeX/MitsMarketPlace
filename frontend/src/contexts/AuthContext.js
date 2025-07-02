// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate(); // Using useNavigate from react-router-dom for redirection

    // Check for token and user ID in localStorage on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId'); // Assuming you store userId on login

        if (token && storedUserId) {
            // Here you might want to add a call to your backend
            // to validate the token's expiry or authenticity.
            // For now, we'll assume a token's presence means authenticated.
            setIsAuthenticated(true);
            setUserId(storedUserId);
        }
    }, []);

    // Login function
    const login = useCallback((id) => {
        setIsAuthenticated(true);
        setUserId(id);
        localStorage.setItem('userId', id); // Store userId in local storage
        // Token should already be set in localStorage by AuthPage after successful login API call
    }, []);

    // Logout function
    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUserId(null);
        localStorage.removeItem('token');    // Remove token from local storage
        localStorage.removeItem('userId');   // Remove userId from local storage
        navigate('/login'); // Redirect to login page after logout
    }, [navigate]);

    // Value object to be provided by the context
    const value = {
        isAuthenticated,
        userId,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};