import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { Eye, Shield } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfileViewers = () => {
    const [viewers, setViewers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await userService.getProfileViewers();
                setViewers(Array.isArray(data) ? data : []);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getPhoto = (viewer) => {
        const photos = viewer.user?.photos;
        if (!photos?.length) return null;
        return photos[0]?.startsWith('http') ? photos[0] : `${BASE_URL}${photos[0]}`;
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-xl">
                    <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Who Viewed My Profile</h1>
                    <p className="text-sm text-gray-500">Last 50 visitors (most recent first)</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : viewers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                    <Eye className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No profile views yet</p>
                    <p className="text-gray-400 text-sm mt-1">When someone views your profile, they'll appear here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {viewers.map((v, i) => {
                        const photo = getPhoto(v);
                        const u = v.user;
                        return (
                            <Link
                                key={i}
                                to={`/profiles/${u?._id}`}
                                className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-soft transition-all"
                            >
                                {photo ? (
                                    <img src={photo} alt={u?.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary-700 font-bold">{(u?.name || 'U')[0]}</span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-semibold text-gray-800 text-sm">{u?.fullName || u?.name}</p>
                                        {u?.verificationBadge && <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                                    </div>
                                    {u?.profession && <p className="text-xs text-gray-400">{u.profession}</p>}
                                </div>
                                <div className="text-xs text-gray-400 flex-shrink-0">
                                    {new Date(v.viewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProfileViewers;
