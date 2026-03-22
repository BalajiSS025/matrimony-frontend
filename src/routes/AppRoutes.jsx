import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PublicRoute from './PublicRoute';

// Public Pages
import Landing from '../pages/Landing';
import Register from '../pages/Register';
import VerifyOTP from '../pages/VerifyOTP';
import Login from '../pages/Login';
import PendingApproval from '../pages/PendingApproval';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import ProfileUpdate from '../pages/ProfileUpdate';
import Matches from '../pages/Matches';
import Profiles from '../pages/Profiles';
import ProfileView from '../pages/ProfileView';
import Interests from '../pages/Interests';
import BlockedUsers from '../pages/BlockedUsers';
import Settings from '../pages/Settings';
import Chat from '../pages/Chat';
import ProfileViewers from '../pages/ProfileViewers';
import Shortlisted from '../pages/Shortlisted';

// Admin Layout + Pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminReviewProfiles from '../pages/admin/AdminReviewProfiles';
import AdminModeration from '../pages/admin/AdminModeration';
import AdminMatchmaking from '../pages/admin/AdminMatchmaking';
import AdminSubscriptions from '../pages/admin/AdminSubscriptions';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminSettings from '../pages/admin/AdminSettings';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />

            <Route element={<PublicRoute />}>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Route>

            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* ── User Routes (for approved non-admin users only) ───────────────── */}
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
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:userId" element={<Chat />} />
                <Route path="/profile-viewers" element={<ProfileViewers />} />
            </Route>

            {/* ── Admin Routes (for admin users only) ─────────────────────────── */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard"        element={<AdminDashboard />} />
                    <Route path="users"            element={<AdminUsers />} />
                    <Route path="review-profiles"  element={<AdminReviewProfiles />} />
                    <Route path="moderation"       element={<AdminModeration />} />
                    <Route path="matchmaking"      element={<AdminMatchmaking />} />
                    <Route path="subscriptions"    element={<AdminSubscriptions />} />
                    <Route path="analytics"        element={<AdminAnalytics />} />
                    <Route path="notifications"    element={<AdminNotifications />} />
                    <Route path="settings"         element={<AdminSettings />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
