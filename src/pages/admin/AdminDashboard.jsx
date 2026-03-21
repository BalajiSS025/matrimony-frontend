import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/admin/review-profiles" className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-bold mb-2">Review Profiles</h2>
                        <p className="text-gray-500">Approve or reject newly registered profiles.</p>
                    </Link>
                    <Link to="/admin/users" className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-bold mb-2">Manage Users</h2>
                        <p className="text-gray-500">View and manage all users in the system.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
