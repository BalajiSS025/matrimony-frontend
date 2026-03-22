import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Flag, CheckCircle, XCircle, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const REASON_COLORS = {
  'Fake profile':             'bg-red-50 text-red-700 border-red-200',
  'Inappropriate content':    'bg-orange-50 text-orange-700 border-orange-200',
  'Harassment':               'bg-red-50 text-red-700 border-red-200',
  'Spam':                     'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Misleading information':   'bg-orange-50 text-orange-700 border-orange-200',
  'Offensive behavior':       'bg-red-50 text-red-700 border-red-200',
};

const AdminModeration = () => {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?status=${statusFilter}&limit=50`);
      setReports(res.data?.reports || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const handleAction = async (id, action) => {
    setActionLoading(p => ({ ...p, [id]: action }));
    try {
      const statusMap = { dismiss: 'dismissed', action_taken: 'action_taken', review: 'reviewed' };
      await api.patch(`/reports/${id}`, { status: statusMap[action] || action });
      toast.success(`Report ${action === 'dismiss' ? 'dismissed' : 'actioned'}`);
      setReports(p => p.filter(r => r._id !== id));
    } catch { toast.error('Failed to update report'); }
    finally { setActionLoading(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const getPhoto = (u) => {
    if (u?.photos?.length) { const p = u.photos[0]; return p.startsWith('http') ? p : `${BASE_URL}${p}`; }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&size=96`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Content Moderation</h1>
            <p className="text-sm text-gray-500">Review reported profiles and flagged content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-400">
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="action_taken">Action Taken</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <button onClick={fetchReports} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No {statusFilter} reports</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Reported User</th>
                  <th className="px-5 py-3.5 font-semibold">Reported By</th>
                  <th className="px-5 py-3.5 font-semibold">Reason</th>
                  <th className="px-5 py-3.5 font-semibold">Details</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <img src={getPhoto(r.reported)} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100"
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&size=64`; }} />
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{r.reported?.name || 'Unknown'}</p>
                          <p className="text-gray-400 text-[10px]">Reports: {r.reported?.reportCount || 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <img src={getPhoto(r.reporter)} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100"
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&size=64`; }} />
                        <p className="text-xs text-gray-600">{r.reporter?.name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${REASON_COLORS[r.reason] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-gray-500 truncate">{r.details || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/profiles/${r.reported?._id}`} target="_blank"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {statusFilter === 'pending' && (
                          <>
                            <button onClick={() => handleAction(r._id, 'action_taken')} disabled={!!actionLoading[r._id]}
                              className="px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200 disabled:opacity-50">
                              {actionLoading[r._id] === 'action_taken' ? '…' : 'Take Action'}
                            </button>
                            <button onClick={() => handleAction(r._id, 'dismiss')} disabled={!!actionLoading[r._id]}
                              className="px-2.5 py-1.5 text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-50">
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
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

export default AdminModeration;
