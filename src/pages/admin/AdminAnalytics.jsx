import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, BarChart2, Users, TrendingUp, Heart, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const StatBlock = ({ label, value, sub, color }) => {
  const colors = { blue: 'text-blue-600 bg-blue-50', green: 'text-green-600 bg-green-50', pink: 'text-pink-600 bg-pink-50', purple: 'text-purple-600 bg-purple-50' };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className={`w-10 h-10 rounded-xl ${c} flex items-center justify-center mb-3`}>
        <BarChart2 className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [usersRes, pendingRes] = await Promise.all([
        api.get('/users/admin/all?limit=1000'),
        api.get('/users/admin/pending'),
      ]);
      const users   = usersRes.data?.users  || [];
      const total   = usersRes.data?.total  || 0;
      const pending = pendingRes.data?.length || 0;

      const today      = new Date();
      const lastWeek   = new Date(today - 7 * 86400000);
      const lastMonth  = new Date(today - 30 * 86400000);

      const newThisWeek  = users.filter(u => new Date(u.createdAt) >= lastWeek).length;
      const newThisMonth = users.filter(u => new Date(u.createdAt) >= lastMonth).length;
      const approved     = users.filter(u => u.isApproved).length;
      const maleCount    = users.filter(u => u.gender === 'Male').length;
      const femaleCount  = users.filter(u => u.gender === 'Female').length;
      const premium      = users.filter(u => u.isPremium).length;
      const verified     = users.filter(u => u.verificationBadge).length;

      setData({ total, pending, newThisWeek, newThisMonth, approved, maleCount, femaleCount, premium, verified });
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const Bar = ({ label, value, max, color }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="w-28 text-gray-600 text-xs truncate flex-shrink-0">{label}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="w-8 text-right text-xs font-semibold text-gray-700">{value}</span>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-sm text-gray-500">User growth, engagement and revenue</p>
          </div>
        </div>
        <button onClick={fetchAnalytics} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />) : (
          <>
            <StatBlock label="Total Users"     value={data?.total}        sub="All time" color="blue" />
            <StatBlock label="New This Week"   value={data?.newThisWeek}  sub="Last 7 days" color="green" />
            <StatBlock label="New This Month"  value={data?.newThisMonth} sub="Last 30 days" color="purple" />
            <StatBlock label="Approved"        value={data?.approved}     sub={`${data?.pending} pending`} color="pink" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-primary-600" /> User Breakdown</h2>
          {loading ? <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)}</div> : (
            <div className="space-y-3">
              <Bar label="Male"       value={data?.maleCount}   max={data?.total} color="bg-blue-400" />
              <Bar label="Female"     value={data?.femaleCount} max={data?.total} color="bg-pink-400" />
              <Bar label="Approved"   value={data?.approved}    max={data?.total} color="bg-green-400" />
              <Bar label="Pending"    value={data?.pending}     max={data?.total} color="bg-orange-400" />
              <Bar label="Premium"    value={data?.premium}     max={data?.total} color="bg-purple-400" />
              <Bar label="Verified"   value={data?.verified}    max={data?.total} color="bg-teal-400" />
            </div>
          )}
        </div>

        {/* Match success rate placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Heart className="w-4 h-4 text-pink-500" /> Match Success Rate</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-24 h-24 rounded-full border-8 border-primary-100 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-primary-600">—</span>
            </div>
            <p className="text-sm text-gray-600 font-semibold">Coming Soon</p>
            <p className="text-xs text-gray-400 mt-1">Match success tracking will be available once users start marking successful matches.</p>
          </div>
        </div>
      </div>

      {/* Revenue placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-green-600" /> Revenue (MRR)</h2>
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-300">₹0</p>
            <p className="text-sm text-gray-400 mt-2">Activate Razorpay to track revenue</p>
            <Link to="/admin/subscriptions" className="inline-block mt-3 text-xs text-primary-600 font-semibold hover:text-primary-800">
              Set up Subscriptions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
