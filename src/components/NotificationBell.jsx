import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Heart, Check, Eye, HeartHandshake, X } from 'lucide-react';
import { notificationService } from '../services/notificationService';

// ── Notification icon by type ─────────────────────────────────────────────────
const typeIcon = (type) => {
    const cls = 'w-4 h-4 flex-shrink-0';
    switch (type) {
        case 'interest_received': return <Heart className={`${cls} text-rose-500`} />;
        case 'interest_accepted': return <HeartHandshake className={`${cls} text-green-500`} />;
        case 'new_match': return <HeartHandshake className={`${cls} text-primary-600`} />;
        case 'profile_viewed': return <Eye className={`${cls} text-blue-500`} />;
        default: return <Bell className={`${cls} text-gray-500`} />;
    }
};

// ── Relative time helper ──────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef(null);

    const unread = notifications.filter(n => !n.read).length;

    // Fetch on mount + every 60 s
    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications();
            const list = data?.data || data?.notifications || (Array.isArray(data) ? data : []);
            setNotifs(list);
        } catch { /* silently fail if backend not ready */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetch();
        const interval = setInterval(fetch, 60000);
        return () => clearInterval(interval);
    }, [fetch]);

    // Outside click closes dropdown
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleRead = async (notif) => {
        if (notif.read) return;
        try {
            await notificationService.markAsRead(notif._id);
            setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        } catch { /* ignore */ }
    };

    const handleReadAll = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* ignore */ }
    };

    // eslint-disable-next-line no-unused-vars
    const EmptyState = ({ icon: IconComponent, message, subMessage }) => (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <IconComponent className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            {subMessage && <p className="text-xs text-gray-400 mt-1">{subMessage}</p>}
        </div>
    );

    return (
        <div ref={dropRef} className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen(v => !v)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full leading-none">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-premium border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm">
                            Notifications
                            {unread > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                                    {unread} new
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button
                                    onClick={handleReadAll}
                                    className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" /> All read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {loading && notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <EmptyState
                                icon={Bell}
                                message="No notifications yet"
                                subMessage="Interests and matches will appear here"
                            />
                        ) : (
                            notifications.map(notif => (
                                <button
                                    key={notif._id}
                                    onClick={() => handleRead(notif)}
                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-primary-50/40' : ''}`}
                                >
                                    {/* Type icon bubble */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!notif.read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                        {typeIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {notif.message || notif.title || 'New notification'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.createdAt)}</p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                            <button
                                onClick={fetch}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Refresh notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
