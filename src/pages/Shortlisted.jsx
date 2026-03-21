import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import { likeService } from '../services/likeService';
import toast from 'react-hot-toast';

const Shortlisted = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await likeService.getLikedUsers();
                const list = response?.data || response?.likes || (Array.isArray(response) ? response : []);
                // If the backend returns populated profile objects or just IDs, we might need to handle differently.
                // Assuming it returns an array of populated user objects:
                // Actually if it's returning populated, we use item or item.likedUser
                const parsedList = list.map(item => item.likedUser || item);
                setProfiles(parsedList);
            } catch {
                toast.error('Failed to load shortlisted profiles');
            } finally {
                setLoading(false);
            }
        };
        fetchLikes();
    }, []);

    const handleUnlike = (id) => {
        setProfiles(prev => prev.filter(p => p._id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <Link
                    to="/dashboard"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Dashboard
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Shortlist
                    </h1>
                    <p className="text-sm text-gray-500">Profiles you have liked and saved for later.</p>
                </div>

                {loading ? (
                    <div className="text-gray-500 flex justify-center py-20">Loading your shortlisted profiles...</div>
                ) : profiles.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center justify-center py-24 text-center">
                        <Heart className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Profiles Shortlisted</h3>
                        <p className="text-gray-500 max-w-sm mb-6">You haven't added any profiles to your shortlist yet.</p>
                        <Link to="/profiles" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
                            Browse Profiles
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
                        {profiles.map(profile => (
                            <ProfileCard
                                key={profile._id}
                                profile={profile}
                                isLiked={true} // all in this list are liked
                                onLikeToggle={(id, isLikedNow) => {
                                    if (!isLikedNow) handleUnlike(id);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shortlisted;
