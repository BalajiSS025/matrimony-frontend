import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { calculateAge } from '../../utils/dateUtils';
import {
  ArrowLeft, CheckCircle, XCircle, Eye, RefreshCw,
  UserCheck, Clock, AlertTriangle, Phone, MapPin, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getPhoto = (u) => {
  if (u?.photos?.length) {
    const p = u.photos[0];
    return p.startsWith('http') ? p : `${BASE_URL}${p}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=f1cdcd&color=8f2c2c&size=200&bold=true`;
};

const AdminReviewProfiles = () => {
  const [profiles, setProfiles]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, comment: '' });
  const [detailModal, setDetailModal] = useState({ open: false, profile: null });

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/admin/pending');
      setProfiles(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load pending profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'approving' }));
    try {
      await api.patch(`/users/admin/approve/${id}`);
      toast.success('Profile approved! Verification badge granted.');
      setProfiles(p => p.filter(x => x._id !== id));
      if (detailModal.profile?._id === id) setDetailModal({ open: false, profile: null });
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const handleReject = async () => {
    const { id, comment } = rejectModal;
    if (!comment.trim()) { toast.error('Please provide a rejection reason'); return; }
    setActionLoading(p => ({ ...p, [id]: 'rejecting' }));
    try {
      await api.patch(`/users/admin/reject/${id}`, { comment });
      toast.success('Profile rejected. User will be notified.');
      setProfiles(p => p.filter(x => x._id !== id));
      setRejectModal({ open: false, id: null, comment: '' });
      if (detailModal.profile?._id === id) setDetailModal({ open: false, profile: null });
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  // ── Detail row ───────────────────────────────────────────────────────────────
  const Detail = ({ label, value }) =>
    value ? (
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    ) : null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Review Profiles</h1>
            <p className="text-sm text-gray-500">{profiles.length} pending approval</p>
          </div>
        </div>
        <button onClick={fetchPending} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Profile cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex gap-2 mt-3">
                  <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                  <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft py-20 text-center">
          <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">All caught up!</h3>
          <p className="text-gray-500 text-sm">No profiles pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map(p => {
            const age = calculateAge(p.dateOfBirth);
            const busy = !!actionLoading[p._id];
            return (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden flex flex-col">
                {/* Photo */}
                <div className="relative h-48 bg-gray-100 flex-shrink-0">
                  <img src={getPhoto(p)} alt={p.name}
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name||'U')}&background=f1cdcd&color=8f2c2c&size=400`; }} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
                    <p className="text-white font-bold text-sm truncate">{p.fullName || p.name}</p>
                    <p className="text-white/70 text-xs">{p.gender}{age ? ` · ${age} yrs` : ''}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full border border-orange-200">Pending</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    {p.hometown && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.hometown}</span>}
                    {p.rasi && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{p.rasi}</span>}
                    {p.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phoneNumber}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.religion && <span className="text-[10px] font-semibold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-100">{p.religion}</span>}
                    {p.caste && <span className="text-[10px] font-semibold px-2 py-0.5 bg-secondary-50 text-secondary-700 rounded-full border border-secondary-100">{p.caste}</span>}
                    {p.education && <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{p.education}</span>}
                  </div>

                  {/* Profile completion bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Profile completion</span>
                      <span>{p.profileCompletion || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${p.profileCompletion || 0}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <button onClick={() => setDetailModal({ open: true, profile: p })}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button onClick={() => handleApprove(p._id)} disabled={busy}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-colors border border-green-200 disabled:opacity-50">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {actionLoading[p._id] === 'approving' ? 'Approving…' : 'Approve'}
                    </button>
                    <button onClick={() => setRejectModal({ open: true, id: p._id, comment: '' })} disabled={busy}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition-colors border border-red-200 disabled:opacity-50">
                      <XCircle className="w-3.5 h-3.5" />
                      {actionLoading[p._id] === 'rejecting' ? 'Rejecting…' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detailModal.open && detailModal.profile && (() => {
        const p = detailModal.profile;
        const age = calculateAge(p.dateOfBirth);
        const busy = !!actionLoading[p._id];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Profile Detail</h2>
                <button onClick={() => setDetailModal({ open: false, profile: null })}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <img src={getPhoto(p)} alt={p.name}
                    className="w-20 h-20 rounded-2xl object-cover object-top border border-gray-100"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name||'U')}&size=200`; }} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{p.fullName || p.name}</h3>
                    <p className="text-gray-500 text-sm">{p.gender}{age ? ` · ${age} yrs` : ''} · ID: {p._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{p.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Detail label="Hometown"    value={p.hometown} />
                  <Detail label="Place of Birth" value={p.placeOfBirth} />
                  <Detail label="Religion"    value={p.religion} />
                  <Detail label="Caste"       value={p.caste} />
                  <Detail label="Mother Tongue" value={p.motherTongue} />
                  <Detail label="Rasi"        value={p.rasi} />
                  <Detail label="Nakshatram"  value={p.nakshatram} />
                  <Detail label="Paatham"     value={p.paatham} />
                  <Detail label="Gherunav"    value={p.gherunav} />
                  <Detail label="Gothru"      value={p.gothru} />
                  <Detail label="Phone"       value={p.phoneNumber} />
                  <Detail label="Contact"     value={p.primaryContactName} />
                  <Detail label="Relation"    value={p.relation} />
                  <Detail label="Family Status" value={p.familyStatus} />
                  <Detail label="Education"   value={p.education} />
                  <Detail label="Profession"  value={p.profession} />
                </div>
                {p.about && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">About</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{p.about}</p>
                  </div>
                )}
                {p.partnerPreference && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Partner Preference</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{p.partnerPreference}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => handleApprove(p._id)} disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" />
                  {actionLoading[p._id] === 'approving' ? 'Approving…' : 'Approve & Grant Badge'}
                </button>
                <button onClick={() => { setDetailModal({ open: false, profile: null }); setRejectModal({ open: true, id: p._id, comment: '' }); }} disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Reject Profile</h2>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea value={rejectModal.comment}
              onChange={e => setRejectModal(p => ({ ...p, comment: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
              rows={4} placeholder="Provide a clear reason so the user can resubmit correctly…" />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setRejectModal({ open: false, id: null, comment: '' })}
                className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button onClick={handleReject} disabled={!rejectModal.comment.trim()}
                className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewProfiles;
