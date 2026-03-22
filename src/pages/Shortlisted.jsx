import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import { likeService } from '../services/likeService';
import { interestService } from '../services/interestService';
import toast from 'react-hot-toast';

const Shortlisted = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [interactions, setInteractions] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [likeRes, sentRes, receivedRes] = await Promise.all([
                    likeService.getLikedUsers(),
                    interestService.getSentInterests(),
                    interestService.getReceivedInterests(),
                ]);

                const list = likeRes?.data || likeRes?.likes || (Array.isArray(likeRes) ? likeRes : []);
                const parsedList = list.map(item => item.likedUser || item);
                setProfiles(parsedList);

                // Build interaction map so interest button states are correct
                const sentList = sentRes?.data || sentRes?.interests || (Array.isArray(sentRes) ? sentRes : []);
                const receivedList = receivedRes?.data || receivedRes?.interests || (Array.isArray(receivedRes) ? receivedRes : []);
                const interactionMap = {};
                sentList.forEach(req => {
                    if (req.receiver?._id) {
                        interactionMap[req.receiver._id] = { type: 'sent', status: req.status, id: req._id };
                    }
                });
                receivedList.forEach(req => {
                    if (req.sender?._id) {
                        interactionMap[req.sender._id] = { type: 'received', status: req.status, id: req._id };
                    }
                });
                setInteractions(interactionMap);
            } catch {
                toast.error('Failed to load shortlisted profiles');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-soft flex flex-col sm:flex-row overflow-hidden">
                                <div className="w-full sm:w-44 lg:w-52 h-48 sm:h-auto bg-gray-200 flex-shrink-0" />
                                <div className="flex-1 p-5 flex flex-col gap-3">
                                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3.5 bg-gray-200 rounded w-1/4" />
                                    <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                                    <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
                                        <div className="h-9 bg-gray-200 rounded-xl w-28" />
                                        <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                isLiked={true}
                                interaction={interactions[profile._id]}
                                onInteractionChange={(newInteraction) => {
                                    setInteractions(prev => ({ ...prev, [profile._id]: newInteraction }));
                                }}
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
