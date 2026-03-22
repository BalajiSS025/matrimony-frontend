import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Search, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, CheckCircle, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateAge } from '../../utils/dateUtils';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getPhoto = (u) => {
  if (u?.photos?.length) {
    const p = u.photos[0];
    return p.startsWith('http') ? p : `${BASE_URL}${p}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=e0f2fe&color=075985&size=96&bold=true`;
};

const StatusBadge = ({ isApproved, isActive }) => (
  <div className="flex flex-col gap-1">
    {isApproved ? (
      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200 w-fit">Approved</span>
    ) : (
      <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-200 w-fit">Pending</span>
    )}
    {!isActive && (
      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-200 w-fit">Inactive</span>
    )}
  </div>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, comment: '' });
  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/admin/all?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleApprove = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
    try {
      await api.patch(`/users/admin/approve/${id}`);
      toast.success('Profile approved! Verification badge granted.');
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isApproved: true, verificationBadge: true } : u));
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; }); }
  };

  const handleReject = async () => {
    const { id, comment } = rejectModal;
    if (!comment.trim()) { toast.error('Provide a rejection reason'); return; }
    setActionLoading(prev => ({ ...prev, [id]: 'rejecting' }));
    try {
      await api.patch(`/users/admin/reject/${id}`, { comment });
      toast.success('Profile rejected.');
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isApproved: false } : u));
      setRejectModal({ open: false, id: null, comment: '' });
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; }); }
  };

  const handleToggleActive = async (id, current) => {
    setActionLoading(prev => ({ ...prev, [id]: 'toggling' }));
    try {
      const res = await api.patch(`/users/admin/toggle-active/${id}`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update status'); }
    finally { setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; }); }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">Manage Users</h1>
              <p className="text-sm text-gray-500">{total.toLocaleString()} total users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search by name or email…"
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-primary-400 w-52 sm:w-72" />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">Search</button>
            </form>
            <button onClick={fetchUsers} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">User</th>
                  <th className="px-5 py-3.5 font-semibold hidden sm:table-cell">Details</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[1,2,3,4].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      No users found.
                    </td>
                  </tr>
                ) : users.map(u => {
                  const age = calculateAge(u.dateOfBirth);
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={getPhoto(u)} alt={u.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100"
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name||'U')}&size=80`; }} />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{u.fullName || u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <p className="text-gray-700 text-xs">{u.gender}{age ? ` · ${age} yrs` : ''}</p>
                        <p className="text-gray-400 text-xs">{u.hometown || 'N/A'} · ID: {u._id.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge isApproved={u.isApproved} isActive={u.isActive} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link to={`/profiles/${u._id}`} target="_blank"
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {!u.isApproved && (
                            <button onClick={() => handleApprove(u._id)} disabled={!!actionLoading[u._id]}
                              className="px-2.5 py-1.5 text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {actionLoading[u._id] === 'approving' ? '…' : 'Approve'}
                            </button>
                          )}
                          {!u.isApproved && (
                            <button onClick={() => setRejectModal({ open: true, id: u._id, comment: '' })} disabled={!!actionLoading[u._id]}
                              className="px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
                              Reject
                            </button>
                          )}
                          <button onClick={() => handleToggleActive(u._id, u.isActive)} disabled={!!actionLoading[u._id]}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${u.isActive ? 'text-green-600 hover:bg-red-50 hover:text-red-600' : 'text-red-400 hover:bg-green-50 hover:text-green-600'}`}
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}>
                            {u.isActive ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} users</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reject Profile</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rejection reason <span className="text-red-500">*</span></label>
            <textarea value={rejectModal.comment} onChange={e => setRejectModal(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
              rows={4} placeholder="Reason so the user can resubmit correctly…" />
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

export default AdminUsers;
