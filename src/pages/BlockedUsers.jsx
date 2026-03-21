import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { ArrowLeft, ShieldBan, UserCheck, RefreshCw, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Loading skeleton ──────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <div className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const BlockedUsers = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unblocking, setUnblocking] = useState({});

    const fetchBlocked = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userService.getBlockedUsers();
            // Handle various shapes: { data: [] }, { blockedUsers: [] }, []
            const list = data?.data?.blockedUsers
                || data?.data
                || data?.blockedUsers
                || (Array.isArray(data) ? data : []);
            setBlockedUsers(list);
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error('Failed to load blocked users.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBlocked(); }, [fetchBlocked]);

    const handleUnblock = async (userId, userName) => {
        setUnblocking(prev => ({ ...prev, [userId]: true }));
        try {
            await userService.unblockUser(userId);
            setBlockedUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
            toast.success(`${userName || 'User'} unblocked successfully.`);
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to unblock user.');
            }
        } finally {
            setUnblocking(prev => { const n = { ...prev }; delete n[userId]; return n; });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back */}
                <Link
                    to="/dashboard"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                            <ShieldBan className="w-5 h-5 text-red-600" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Blocked Users</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-12">Users you have blocked. They cannot see your profile or send you interests.</p>
                </div>

                {/* Content card */}
                <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">
                            {loading ? 'Loading…' : `${blockedUsers.length} blocked user${blockedUsers.length !== 1 ? 's' : ''}`}
                        </span>
                        <button
                            onClick={fetchBlocked}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="p-4 sm:p-5 space-y-3">
                            {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
                        </div>
                    ) : blockedUsers.length === 0 ? (
                        <div className="py-20 text-center px-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCheck className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">No Blocked Users</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm">
                                You haven't blocked anyone yet. Block users from their profile page.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {blockedUsers.map(user => {
                                const uid = user._id || user.id;
                                const avatarSrc = user.photos?.[0]
                                    || user.photo
                                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=fecaca&color=991b1b&size=128&bold=true`;

                                return (
                                    <div
                                        key={uid}
                                        className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <img
                                            src={avatarSrc}
                                            alt={user.name || 'User'}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0 border-2 border-red-100 grayscale opacity-70"
                                            onError={e => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=fecaca&color=991b1b&size=128&bold=true`;
                                            }}
                                        />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-700 text-sm sm:text-base truncate">
                                                {user.name || 'Unknown User'}
                                            </h3>
                                            <span className="text-xs text-gray-500 block">
                                                ID: {user.customId || uid.toString().slice(-6).toUpperCase()}
                                            </span>
                                            {user.location && (
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{user.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-block text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                    Blocked
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : 'Recently'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Link
                                                to={`/profiles/${uid}`}
                                                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleUnblock(uid, user.name)}
                                                disabled={unblocking[uid]}
                                                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {unblocking[uid] ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                )}
                                                {unblocking[uid] ? 'Unblocking…' : 'Unblock'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info note */}
                <p className="mt-4 text-xs text-center text-gray-400">
                    Unblocking allows them to view your profile and send interests again.
                </p>
            </div>
        </div>
    );
};

export default BlockedUsers;
