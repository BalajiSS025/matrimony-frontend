import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Public Pages
import Landing from '../pages/Landing';
import Register from '../pages/Register';
import VerifyOTP from '../pages/VerifyOTP';
import Login from '../pages/Login';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import ProfileUpdate from '../pages/ProfileUpdate';
import Matches from '../pages/Matches';
import Profiles from '../pages/Profiles';
import ProfileView from '../pages/ProfileView';
import Interests from '../pages/Interests';
import BlockedUsers from '../pages/BlockedUsers';
import Settings from '../pages/Settings';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminReviewProfiles from '../pages/admin/AdminReviewProfiles';
import Shortlisted from '../pages/Shortlisted';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />

            <Route element={<PublicRoute />}>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Route>

            <Route path="/verify-otp" element={<VerifyOTP />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfileUpdate />} />
                <Route path="/profile/edit" element={<ProfileUpdate />} />
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/shortlisted" element={<Shortlisted />} />
                <Route path="/profiles/:id" element={<ProfileView />} />
                <Route path="/interests/sent" element={<Interests />} />
                <Route path="/interests/received" element={<Interests />} />
                <Route path="/settings/blocked-users" element={<BlockedUsers />} />
                <Route path="/settings" element={<Settings />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/review-profiles" element={<AdminReviewProfiles />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
