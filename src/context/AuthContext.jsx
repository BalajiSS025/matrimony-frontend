import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            verifyToken();
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Token verification failed:", error);
            logout(); // local logout only, token might be expired.
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            const { token: newToken, user: userData } = response.data;
            setToken(newToken);
            setUser(userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please try again.'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/users/register', userData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed.'
            };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await api.post('/users/verify-otp', { email, otp });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Verification failed.'
            };
        }
    }

    const resendOtp = async (email) => {
        try {
            const response = await api.post('/users/resend-otp', { email });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to resend OTP.'
            };
        }
    }

    const logout = async () => {
        try {
            if (token) await api.post('/users/logout');
        } catch (e) {
            console.error(e);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
