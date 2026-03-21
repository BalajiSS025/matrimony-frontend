import React, { useState, useEffect } from 'react';
import { calculateAge } from '../../utils/dateUtils';
import { getProfilePhoto } from '../../utils/profileDefaults';
import toast from 'react-hot-toast';

const AdminReviewProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rejectModal, setRejectModal] = useState({ isOpen: false, profileId: null, comment: '' });

    // Assuming we fetch from some admin endpoint, mock or real
    // For now, let's fetch all users and filter unverified
    useEffect(() => {
        const fetchPending = async () => {
            setLoading(true);
            try {
                // In a real app we would call an admin endpoint like GET /admin/users/pending
                const mockProfiles = []; // Populate with real if available
                setProfiles(mockProfiles);
            } catch {
                toast.error("Failed to load profiles");
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        try {
            // await api.patch(`/admin/users/${id}/approve`);
            setProfiles(prev => prev.filter(p => p._id !== id));
            toast.success("Profile approved!");
        } catch {
            toast.error("Failed to approve");
        }
    };

    const handleReject = async () => {
        try {
            // await api.patch(`/admin/users/${rejectModal.profileId}/reject`, { comment: rejectModal.comment });
            setProfiles(prev => prev.filter(p => p._id !== rejectModal.profileId));
            toast.success("Profile rejected!");
            setRejectModal({ isOpen: false, profileId: null, comment: '' });
        } catch {
            toast.error("Failed to reject");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Review Profiles</h1>

                <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm tracking-wide uppercase">
                                    <th className="px-6 py-4 font-semibold border-b border-gray-100">Profile</th>
                                    <th className="px-6 py-4 font-semibold border-b border-gray-100">Age & Location</th>
                                    <th className="px-6 py-4 font-semibold border-b border-gray-100">Completion %</th>
                                    <th className="px-6 py-4 font-semibold border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                ) : profiles.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">No pending profiles found.</td></tr>
                                ) : (
                                    profiles.map(p => {
                                        const age = p.age || calculateAge(p.dob) || 'N/A';
                                        return (
                                            <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getProfilePhoto(p)}
                                                            alt="profile"
                                                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-gray-800">{p.name || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500">ID: {p._id?.slice(-6).toUpperCase()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-700">{age} Yrs</div>
                                                    <div className="text-xs text-gray-500">{p.location || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: p.profileCompletion || '50%' }}></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{p.profileCompletion || '50%'} Complete</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(p._id)}
                                                            className="px-4 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal({ isOpen: true, profileId: p._id, comment: '' })}
                                                            className="px-4 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Profile</h2>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Comment</label>
                        <textarea
                            value={rejectModal.comment}
                            onChange={(e) => setRejectModal(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            rows="4"
                            placeholder="Reason for rejection..."
                        />
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => setRejectModal({ isOpen: false, profileId: null, comment: '' })}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectModal.comment.trim()}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviewProfiles;
