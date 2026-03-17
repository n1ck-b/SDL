import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { setAccessToken, logoutApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } finally {
            setUser(null);
        }
    }, []);

    const loginUser = (authData) => {
        const userData = {
            name: authData.username,
            roles: authData.roles
        };
        localStorage.setItem('token', authData.accessToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setAccessToken(authData.accessToken);
        setUser(userData);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setAccessToken(token);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse user data", e);
                logout();
            }
        }
        setIsLoading(false);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, loginUser, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
