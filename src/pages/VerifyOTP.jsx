import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState('');

  const email = location.state?.email || '';

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const response = await resendOtp(email);
    setResending(false);
    if (response.success) {
      toast.success("OTP has been resent to your email.");
    } else {
      toast.error(response.message);
    }
  };

  useEffect(() => {
    if (!email) {
      toast.error("Invalid access. Please register first.");
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    const response = await verifyOtp(email, otp);
    setLoading(false);

    if (response.success) {
      toast.success("Email verified successfully! You can now login.");
      navigate('/login');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px-300px)] py-20 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-secondary-50 opacity-40 z-0"></div>

      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-premium p-8 relative z-10 border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-secondary-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Verify Email</h2>
          <p className="mt-2 text-sm text-gray-500">We've sent a code to your email address</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Email Address (Readonly)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                readOnly
                value={email}
                className="block w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Security Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors outline-none text-gray-800 text-center tracking-widest font-mono text-lg"
                placeholder="000000"
                maxLength="6"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary-500 hover:bg-secondary-600 text-gray-900 font-bold py-3.5 px-4 rounded-xl shadow-soft hover:shadow-premium transform hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Verifying...</span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              type="button"
              className="font-semibold text-secondary-600 hover:text-secondary-800 transition-colors underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
