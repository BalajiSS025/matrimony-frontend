import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { token, user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Redirect admin users to admin dashboard (they should not access user pages)
    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Redirect unapproved users to pending approval page
    if (user && !user.isApproved) {
        return <Navigate to="/pending-approval" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
