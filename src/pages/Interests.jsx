import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { interestService } from '../services/interestService';
import { Heart, MapPin, Check, X, ArrowLeft, Send, Inbox, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Tab pill ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const TabPill = ({ active, onClick, icon: IconComponent, label, count }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${active
            ? 'bg-primary-600 text-white shadow-soft'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
    >
        <IconComponent className="w-4 h-4" />
        {label}
        {count > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700'
                }`}>
                {count}
            </span>
        )}
    </button>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        accepted: 'bg-green-100 text-green-700 border border-green-200',
        rejected: 'bg-red-100 text-red-700 border border-red-200',
        pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    };
    const labels = { accepted: 'Accepted', rejected: 'Rejected', pending: 'Pending' };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = () => (
    <div className="animate-pulse flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 w-full space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="h-9 bg-gray-200 rounded-xl flex-1 sm:w-24" />
            <div className="h-9 w-9 bg-gray-200 rounded-xl" />
            <div className="h-9 w-9 bg-gray-200 rounded-xl" />
        </div>
    </div>
);

// ── Main Interests Component ──────────────────────────────────────────────────
const Interests = () => {
    const location = useLocation();
    const type = location.pathname.includes('sent') ? 'sent' : 'received';
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    const fetchInterests = useCallback(async () => {
        setLoading(true);
        try {
            const data = type === 'sent'
                ? await interestService.getSentInterests()
                : await interestService.getReceivedInterests();
            // Handle various response shapes: data.data, data itself
            const list = data?.data || data?.interests || (Array.isArray(data) ? data : []);
            setInterests(list);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error(`Failed to load ${type} interests.`);
            }
            setInterests([]);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchInterests();
    }, [fetchInterests]);

    const handleAction = async (id, action) => {
        setActionLoading((prev) => ({ ...prev, [id]: action }));
        try {
            if (action === 'accept') {
                await interestService.acceptInterest(id);
                toast.success('Interest accepted! 🎉');
            } else {
                await interestService.rejectInterest(id);
                toast.success('Interest declined.');
            }
            // Optimistically remove from list
            setInterests((prev) => prev.filter((req) => req._id !== id));
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else if (error.response?.status === 404) {
                toast.error('Interest not found. It may have already been actioned.');
                setInterests((prev) => prev.filter((req) => req._id !== id));
            } else {
                toast.error(error.response?.data?.message || `Failed to ${action} interest.`);
            }
        } finally {
            setActionLoading((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back link */}
                <Link
                    to="/dashboard"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-1">
                        My Interests
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage the interests you've sent and received
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <Link to="/interests/received">
                        <TabPill
                            active={type === 'received'}
                            onClick={() => { }}
                            icon={Inbox}
                            label="Received"
                            count={type === 'received' ? interests.length : 0}
                        />
                    </Link>
                    <Link to="/interests/sent">
                        <TabPill
                            active={type === 'sent'}
                            onClick={() => { }}
                            icon={Send}
                            label="Sent"
                            count={type === 'sent' ? interests.length : 0}
                        />
                    </Link>
                    <button
                        onClick={fetchInterests}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white border border-gray-200 transition-all ml-auto"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-4 sm:p-6 space-y-4">
                            {[1, 2, 3].map((i) => <Skeleton key={i} />)}
                        </div>
                    ) : interests.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-10 h-10 text-primary-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                No {type} interests
                            </h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                {type === 'sent'
                                    ? "You haven't sent any interests yet. Browse profiles to connect!"
                                    : "You haven't received any interests yet. Complete your profile to attract more matches."}
                            </p>
                            {type === 'sent' && (
                                <Link
                                    to="/profiles"
                                    className="inline-block mt-6 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm"
                                >
                                    Browse Profiles
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {interests.map((req) => {
                                const person = type === 'sent' ? req.receiver : req.sender;
                                if (!person) return null;
                                const isActioning = actionLoading[req._id];

                                return (
                                    <div
                                        key={req._id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors"
                                    >
                                        {/* Avatar + Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <img
                                                src={
                                                    person.photos?.length > 0
                                                        ? (person.photos[0].startsWith('http') ? person.photos[0] : `${BASE_URL}${person.photos[0]}`)
                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'U')}&background=f1cdcd&color=8f2c2c&size=128&bold=true`
                                                }
                                                alt={person.name}
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 border-2 border-primary-100"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'U')}&background=f1cdcd&color=8f2c2c&size=128&bold=true`;
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <h3 className="text-base font-bold text-gray-900 truncate">
                                                    {person.name || 'Unknown User'}
                                                </h3>
                                                {person.location && (
                                                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">{person.location}</span>
                                                    </div>
                                                )}
                                                {req.createdAt && (
                                                    <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        {new Date(req.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0 pl-[4.5rem] sm:pl-0">
                                            <Link
                                                to={`/profiles/${person._id}`}
                                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-xs whitespace-nowrap"
                                            >
                                                View Profile
                                            </Link>

                                            {/* Status badge for non-pending */}
                                            {req.status && req.status !== 'pending' && (
                                                <StatusBadge status={req.status} />
                                            )}

                                            {/* Accept / Reject for pending received */}
                                            {type === 'received' && req.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(req._id, 'accept')}
                                                        disabled={!!isActioning}
                                                        title="Accept"
                                                        className="w-9 h-9 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isActioning === 'accept' ? (
                                                            <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Check className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req._id, 'reject')}
                                                        disabled={!!isActioning}
                                                        title="Reject"
                                                        className="w-9 h-9 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isActioning === 'reject' ? (
                                                            <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <X className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </>
                                            )}

                                            {/* Pending badge for sent */}
                                            {type === 'sent' && req.status === 'pending' && (
                                                <StatusBadge status="pending" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Interests;
