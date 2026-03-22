import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users, Clock, CheckCircle, TrendingUp,
  Eye, Flag, CreditCard, Bell, Sliders,
  BarChart2, Settings, RefreshCw, AlertTriangle,
  ChevronRight, UserCheck, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getPhoto = (u) => {
  if (u?.photos?.length) {
    const p = u.photos[0];
    return p.startsWith('http') ? p : `${BASE_URL}${p}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=f1cdcd&color=8f2c2c&size=96&bold=true`;
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, to, loading }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100' },
  };
  const c = colors[color] || colors.blue;
  const inner = (
    <div className={`bg-white rounded-2xl border ${c.border} shadow-soft p-5 flex items-center gap-4 transition-shadow hover:shadow-md`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        )}
        <p className="text-xs font-semibold text-gray-500">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

// ── Module card ───────────────────────────────────────────────────────────────
const ModuleCard = ({ icon: Icon, label, desc, to, color, badge }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    pink:   { bg: 'bg-pink-50',   text: 'text-pink-600',   border: 'border-pink-100' },
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    gray:   { bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200' },
  };
  const c = colors[color] || colors.gray;
  return (
    <Link to={to} className={`bg-white rounded-2xl border ${c.border} shadow-soft p-5 flex items-center gap-4 hover:shadow-md transition-shadow group`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-800 text-sm">{label}</p>
          {badge != null && badge > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">{badge}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition-colors" />
    </Link>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]               = useState(null);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [recentUsers, setRecentUsers]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal]   = useState({ open: false, id: null, comment: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get('/users/admin/pending'),
        api.get('/users/admin/all?limit=5'),
      ]);
      const pending = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const allData = allRes.data;
      const allUsers = allData?.users || [];
      const total    = allData?.total  || 0;

      setPendingProfiles(pending);
      setRecentUsers(allUsers);

      const today = new Date().toDateString();
      setStats({
        totalUsers:     total,
        pendingApproval: pending.length,
        approvedToday:  allUsers.filter(u => u.isApproved && new Date(u.updatedAt).toDateString() === today).length,
        activeUsers:    allUsers.filter(u => u.isActive).length,
      });
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'approving' }));
    try {
      await api.patch(`/users/admin/approve/${id}`);
      toast.success('Profile approved & verification badge granted!');
      setPendingProfiles(p => p.filter(x => x._id !== id));
      setStats(p => p ? { ...p, pendingApproval: p.pendingApproval - 1 } : p);
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const handleReject = async () => {
    const { id, comment } = rejectModal;
    if (!comment.trim()) { toast.error('Provide a rejection reason'); return; }
    setActionLoading(p => ({ ...p, [id]: 'rejecting' }));
    try {
      await api.patch(`/users/admin/reject/${id}`, { comment });
      toast.success('Profile rejected.');
      setPendingProfiles(p => p.filter(x => x._id !== id));
      setRejectModal({ open: false, id: null, comment: '' });
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 rounded-2xl px-6 py-5 text-white shadow-premium flex items-center justify-between">
        <div>
          <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-1">Admin Console</p>
          <h1 className="text-xl sm:text-2xl font-serif font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-primary-200 text-sm mt-1 hidden sm:block">Full control over Sourashtra Matrimony platform.</p>
        </div>
        <button onClick={fetchData} title="Refresh" className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Users}        label="Total Users"      value={stats?.totalUsers}     color="blue"   to="/admin/users"   loading={loading} />
        <StatCard icon={Clock}        label="Pending Approval" value={stats?.pendingApproval} color="orange"                    loading={loading} />
        <StatCard icon={CheckCircle}  label="Approved Today"   value={stats?.approvedToday}  color="green"                     loading={loading} />
        <StatCard icon={TrendingUp}   label="Active Users"     value={stats?.activeUsers}     color="purple"                    loading={loading} />
      </div>

      {/* All 8 modules grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">All Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ModuleCard icon={Users}       label="User Management"    desc="View, approve, suspend accounts"    to="/admin/users"            color="blue"   badge={stats?.pendingApproval} />
          <ModuleCard icon={UserCheck}   label="Review Profiles"    desc="Approve / reject new registrations" to="/admin/review-profiles"  color="orange" badge={stats?.pendingApproval} />
          <ModuleCard icon={Flag}        label="Content Moderation" desc="Reported profiles, offensive content" to="/admin/moderation"     color="red" />
          <ModuleCard icon={Sliders}     label="Matchmaking Config" desc="Algorithm & filter settings"        to="/admin/matchmaking"      color="teal" />
          <ModuleCard icon={CreditCard}  label="Subscriptions"      desc="Plans, transactions, refunds"       to="/admin/subscriptions"    color="purple" />
          <ModuleCard icon={BarChart2}   label="Analytics"          desc="Growth, success rate, revenue"      to="/admin/analytics"        color="green" />
          <ModuleCard icon={Bell}        label="Notifications"      desc="Push notifications & campaigns"     to="/admin/notifications"    color="yellow" />
          <ModuleCard icon={Settings}    label="System Settings"    desc="Roles, permissions, audit log"      to="/admin/settings"         color="gray" />
        </div>
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Pending approvals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h2 className="font-bold text-gray-900 text-sm">Pending Approvals</h2>
              {pendingProfiles.length > 0 && (
                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{pendingProfiles.length}</span>
              )}
            </div>
            <Link to="/admin/review-profiles" className="text-xs text-primary-600 font-semibold hover:text-primary-800">View all →</Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : pendingProfiles.length === 0 ? (
            <div className="py-10 text-center px-4">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">All caught up!</p>
              <p className="text-xs text-gray-400 mt-0.5">No profiles pending approval.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingProfiles.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                  <img src={getPhoto(p)} alt={p.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name||'U')}&size=80`; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.fullName || p.name}</p>
                    <p className="text-xs text-gray-400">{p.gender} · {p.hometown || 'N/A'}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => handleApprove(p._id)} disabled={!!actionLoading[p._id]}
                      className="px-2.5 py-1.5 text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50">
                      {actionLoading[p._id] === 'approving' ? '…' : 'Approve'}
                    </button>
                    <button onClick={() => setRejectModal({ open: true, id: p._id, comment: '' })} disabled={!!actionLoading[p._id]}
                      className="px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent registrations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h2 className="font-bold text-gray-900 text-sm">Recent Registrations</h2>
            </div>
            <Link to="/admin/users" className="text-xs text-primary-600 font-semibold hover:text-primary-800">View all →</Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : recentUsers.length === 0 ? (
            <div className="py-10 text-center"><p className="text-sm text-gray-400">No users yet.</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                  <img src={getPhoto(u)} alt={u.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name||'U')}&size=80`; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.fullName || u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {u.isApproved
                      ? <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200">Approved</span>
                      : <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-200">Pending</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Reject Profile</h2>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea value={rejectModal.comment}
              onChange={e => setRejectModal(p => ({ ...p, comment: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
              rows={4} placeholder="Provide a clear reason so the user can resubmit…" />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setRejectModal({ open: false, id: null, comment: '' })}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button onClick={handleReject} disabled={!rejectModal.comment.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
