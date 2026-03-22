import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Shield, LogOut } from 'lucide-react';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-8 sm:p-10 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center border-2 border-primary-200">
                <Clock className="w-10 h-10 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-3">
            Profile Under Review
          </h1>

          {/* Message */}
          <p className="text-gray-600 text-base mb-8">
            Your profile is pending admin approval. We're reviewing your details to ensure quality and safety on our platform.
          </p>

          {/* User Info */}
          {user && (
            <div className="bg-primary-50 rounded-2xl p-5 mb-8 border border-primary-100">
              <p className="text-sm text-gray-600 mb-2">Account Email</p>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 mb-8 border border-primary-100">
            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Admin reviews your profile</li>
                  <li>✓ You receive approval notification</li>
                  <li>✓ Profile becomes visible to others</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Expected timeline */}
          <div className="bg-secondary-50 rounded-xl p-4 mb-8 border border-secondary-100">
            <p className="text-sm text-secondary-700">
              <strong>Expected approval time:</strong> 24-48 hours
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>

          {/* Help text */}
          <p className="text-xs text-gray-500 mt-6">
            Questions? Contact support at support@matrimony.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
