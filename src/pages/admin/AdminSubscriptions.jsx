import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, CreditCard, RefreshCw, TrendingUp, Users, IndianRupee, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  { name: 'Silver', duration: '1 Month',  price: 499,  features: ['Unlimited Interests', 'Chat Access', 'Kundali Matching'], color: 'bg-gray-100 border-gray-300' },
  { name: 'Gold',   duration: '3 Months', price: 1199, features: ['All Silver features', 'View Contact Details', 'Priority Listing'], color: 'bg-yellow-50 border-yellow-300' },
  { name: 'Platinum', duration: '6 Months', price: 1999, features: ['All Gold features', 'Verification Badge', 'Featured Profile'], color: 'bg-purple-50 border-purple-300' },
];

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [stats, setStats]                 = useState({ total: 0, paid: 0, revenue: 0 });

  const fetchSubs = async () => {
    setLoading(true);
    try {
      // Placeholder — when Razorpay is integrated these come from the subscriptions endpoint
      const res = await api.get('/users/admin/all?limit=100');
      const users = res.data?.users || [];
      const premiumUsers = users.filter(u => u.isPremium);
      setSubscriptions(premiumUsers.map(u => ({
        _id: u._id,
        user: { name: u.name || u.fullName, email: u.email },
        plan: u.premiumPlan || 'silver',
        status: 'paid',
        amount: u.premiumPlan === 'platinum' ? 1999 : u.premiumPlan === 'gold' ? 1199 : 499,
        endDate: u.premiumExpiry,
      })));
      setStats({
        total: premiumUsers.length,
        paid: premiumUsers.length,
        revenue: premiumUsers.reduce((s, u) => s + (u.premiumPlan === 'platinum' ? 1999 : u.premiumPlan === 'gold' ? 1199 : 499), 0),
      });
    } catch { toast.error('Failed to load subscriptions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubs(); }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Subscriptions</h1>
            <p className="text-sm text-gray-500">Plans, transactions and revenue</p>
          </div>
        </div>
        <button onClick={fetchSubs} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,        label: 'Premium Users', value: stats.total },
          { icon: CheckCircle,  label: 'Active Subs',   value: stats.paid },
          { icon: IndianRupee,  label: 'Total Revenue',  value: `₹${stats.revenue.toLocaleString('en-IN')}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Plan Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.name} className={`border-2 rounded-2xl p-5 ${plan.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                <span className="text-lg font-bold text-primary-700">₹{plan.price}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{plan.duration}</p>
              <ul className="space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">Active Subscriptions</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : subscriptions.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No active subscriptions yet.</p>
            <p className="text-xs text-gray-400 mt-1">Razorpay integration needed to enable paid plans.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800 text-xs">{s.user.name}</p>
                      <p className="text-gray-400 text-[10px]">{s.user.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold capitalize px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-100">{s.plan}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-gray-700">₹{s.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200">Active</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;
