import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interestService } from '../services/interestService';
import toast from 'react-hot-toast';
import { HeartHandshake, MessageCircle } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Fetch both sent and received
      const [receivedRes, sentRes] = await Promise.all([
        interestService.getReceivedInterests(),
        interestService.getSentInterests()
      ]);

      const received = receivedRes?.data || receivedRes || [];
      const sent = sentRes?.data || sentRes || [];

      // Filter only accepted ones and extract the corresponding user profile
      const acceptedReceived = received
        .filter(req => req.status === 'accepted')
        .map(req => req.sender)
        .filter(Boolean); // Ensure sender exists

      const acceptedSent = sent
        .filter(req => req.status === 'accepted')
        .map(req => req.receiver)
        .filter(Boolean); // Ensure receiver exists

      // Combine and remove duplicates just in case
      const combined = [...acceptedReceived, ...acceptedSent];
      const uniqueMatches = Array.from(new Map(combined.map(item => [item._id, item])).values());

      setMatches(uniqueMatches);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfile = (profileId) => {
    setMatches(prev => prev.filter(p => p._id !== profileId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center flex flex-col items-center">
          <HeartHandshake className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500 mb-3" />
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">Your Mutual Matches</h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-md">Profiles where interests have been accepted from either side.</p>
        </div>

        <div>
          <div className="mb-5 flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Connections</h2>
            <span className="text-gray-500 text-xs sm:text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
              {matches.length} mutually accepted
            </span>
          </div>

          {/* Chat shortcut banner */}
          {matches.length > 0 && (
            <div className="mb-5 bg-primary-50 border border-primary-100 rounded-2xl px-5 py-4 flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-primary-800 font-medium">You can now chat with your mutual matches!</p>
                <p className="text-xs text-primary-500">Open any profile or go to Messages to start chatting.</p>
              </div>
              <Link to="/chat" className="flex-shrink-0 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                Open Chat
              </Link>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-row sm:flex-col gap-4 h-auto sm:h-[300px]">
                  <div className="bg-gray-200 rounded-xl w-20 h-20 sm:w-full sm:h-40 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-100 shadow-soft max-w-2xl mx-auto">
              <HeartHandshake className="w-14 h-14 sm:w-16 sm:h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No Matches Yet</h3>
              <p className="text-gray-500 mb-6 px-6 sm:px-8 text-sm sm:text-base">
                Looks like you don't have any accepted interests right now. Go out there and explore more profiles!
              </p>
              <a href="/profiles" className="inline-block px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm">
                Browse Profiles
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {matches.map(match => (
                <div key={match._id} className="relative">
                  <ProfileCard
                    profile={match}
                    onRemove={handleRemoveProfile}
                    interaction={{ type: 'sent', status: 'accepted' }}
                  />
                  <Link
                    to={`/chat/${match._id}`}
                    className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;
