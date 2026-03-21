import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { UserCircle, Search, ShieldAlert, Award, Heart, MailCheck, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    interestsReceived: 0,
    interestsSent: 0,
    pendingRequests: 0,
    profileCompletion: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getDashboardStats();
      if (data) setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = stats.profileCompletion || 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 h-64 bg-gray-200 rounded-3xl" />
          <div className="col-span-1 h-64 bg-gray-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Here is what's happening with your profile today.</p>
      </div>

      {/* Stats Grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
        <Link to="/interests/received" className="bg-white rounded-2xl p-4 sm:p-5 shadow-soft border border-rose-100 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow gap-2">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-rose-600 mb-1">Interests Received</p>
            <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.interestsReceived}</h4>
          </div>
          <div className="bg-rose-50 p-2.5 sm:p-3.5 rounded-full w-fit">
            <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-rose-500" />
          </div>
        </Link>

        <Link to="/interests/sent" className="bg-white rounded-2xl p-4 sm:p-5 shadow-soft border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow gap-2">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-1">Interests Sent</p>
            <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.interestsSent}</h4>
          </div>
          <div className="bg-blue-50 p-2.5 sm:p-3.5 rounded-full w-fit">
            <MailCheck className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
          </div>
        </Link>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-soft border border-orange-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-orange-600 mb-1">Pending</p>
            <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.pendingRequests}</h4>
          </div>
          <div className="bg-orange-50 p-2.5 sm:p-3.5 rounded-full w-fit">
            <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-orange-500" />
          </div>
        </div>

        <Link to="/profile" className="bg-white rounded-2xl p-4 sm:p-5 shadow-soft border border-green-100 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow gap-2">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-green-600 mb-1">Profile</p>
            <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{completionPercentage}%</h4>
          </div>
          <div className="bg-green-50 p-2.5 sm:p-3.5 rounded-full w-fit">
            <Award className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" />
          </div>
        </Link>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
        {/* Profile Completion Card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-3xl shadow-soft p-6 sm:p-8 border border-gray-100 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Award className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
              <UserCircle className="w-6 h-6 mr-2 text-primary-600 flex-shrink-0" />
              Complete Your Profile
            </h3>

            <div className="w-full bg-gray-100 rounded-full h-3 sm:h-4 mb-3">
              <div
                className="bg-primary-500 h-3 sm:h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-500 mb-5 sm:mb-8">
              <span>{completionPercentage}% Completed</span>
              <span>100%</span>
            </div>

            {completionPercentage < 100 ? (
              <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 flex items-start mb-5 sm:mb-6">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-secondary-900 text-sm sm:text-base">Add missing details</h4>
                  <p className="text-xs sm:text-sm text-secondary-800 mt-1">Profiles with complete family and education details get 3x more interest.</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-medium border border-green-100 text-sm">
                Your profile is fully complete! Amazing! 🎉
              </div>
            )}

            <Link
              to="/profile"
              className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-5 sm:px-6 rounded-xl transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Update Profile Details
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1">
          <div className="bg-primary-600 rounded-3xl p-6 sm:p-8 text-white shadow-premium flex flex-col justify-between h-full min-h-[200px]">
            <div>
              <div className="bg-primary-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Find Your Match</h3>
              <p className="text-primary-100 text-sm mb-6">We have found new profiles matching your preferences.</p>
            </div>
            <Link
              to="/matches"
              className="bg-white text-primary-700 font-bold py-3 px-6 rounded-xl text-center hover:bg-primary-50 transition-colors shadow-sm text-sm sm:text-base"
            >
              View Matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
