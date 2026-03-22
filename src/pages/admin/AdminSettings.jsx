import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Settings, Shield, FileText, Key, Save, Info, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 transition-colors";

const AUDIT_LOGS = [
  { action: 'Profile Approved', user: 'Admin', target: 'User #A1F3B2', time: '2 min ago' },
  { action: 'Profile Rejected', user: 'Admin', target: 'User #B2C4D1', time: '15 min ago' },
  { action: 'User Deactivated', user: 'Admin', target: 'User #E5F2A9', time: '1 hr ago' },
  { action: 'Config Updated',   user: 'Admin', target: 'Matchmaking settings', time: '3 hrs ago' },
  { action: 'Profile Approved', user: 'Admin', target: 'User #C3D5E7', time: '5 hrs ago' },
];

const AdminSystemSettings = () => {
  const { user } = useAuth();
  const [showAudit, setShowAudit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Sourashtra Matrimony',
    supportEmail: 'support@sourashtravivah.com',
    maxPhotosPerUser: 5,
    otpExpiry: 10,
    jwtExpiry: 7,
  });

  const set = e => setSettings(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('System settings saved!');
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">Roles, permissions, audit logs and general config</p>
        </div>
      </div>

      {/* Admin info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-primary-600" /> Admin Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">Logged in as</p>
            <p className="font-bold text-gray-900 mt-1">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-primary-600 text-white rounded-full">Super Admin</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Permissions</p>
            {['Approve / Reject Profiles', 'Manage Users', 'View Analytics', 'Configure System', 'Send Campaigns'].map(p => (
              <div key={p} className="flex items-center gap-2 text-xs text-gray-700 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />{p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* General settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-600" /> General Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Site Name</label>
            <input name="siteName" value={settings.siteName} onChange={set} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Support Email</label>
            <input name="supportEmail" value={settings.supportEmail} onChange={set} className={inputCls} type="email" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Photos Per User</label>
            <input name="maxPhotosPerUser" value={settings.maxPhotosPerUser} onChange={set} className={inputCls} type="number" min={1} max={20} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">OTP Expiry (minutes)</label>
            <input name="otpExpiry" value={settings.otpExpiry} onChange={set} className={inputCls} type="number" min={5} max={60} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">JWT Expiry (days)</label>
            <input name="jwtExpiry" value={settings.jwtExpiry} onChange={set} className={inputCls} type="number" min={1} max={30} />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">JWT and OTP expiry changes require a server restart to take effect.</p>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Audit logs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <button onClick={() => setShowAudit(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-600" /> Audit Log</h2>
          {showAudit ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAudit && (
          <div className="divide-y divide-gray-50">
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-gray-800">{log.action}</span>
                  <span className="text-xs text-gray-400 ml-2">on {log.target}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{log.time}</span>
              </div>
            ))}
            <div className="px-5 py-3 text-center">
              <p className="text-xs text-gray-400">Full audit log available with database query. Connect to your MongoDB to view complete history.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSystemSettings;
