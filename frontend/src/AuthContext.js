import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [sellerId, setSellerId] = useState(null);

    const login = (id) => {
        setSellerId(id); // Set sellerId on login
    };

    const logout = () => {
        setSellerId(null);
        localStorage.removeItem('token'); // Clear token if needed
    };

    console.log("Current sellerId:", sellerId);

    return (
        <AuthContext.Provider value={{ sellerId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
