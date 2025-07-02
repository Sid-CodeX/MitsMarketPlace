// src/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Theme Context
const ThemeContext = createContext(null);

// Custom hook to use the Theme Context
export const useTheme = () => {
    return useContext(ThemeContext);
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
    // Initialize dark mode from localStorage or default to false
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    // Effect to update body class and save to localStorage when darkMode changes
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    // Value object to be provided by the context
    const value = {
        darkMode,
        setDarkMode,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};