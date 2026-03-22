import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Send, Mail, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 transition-colors";

const AdminNotifications = () => {
  const [pushForm, setPushForm]   = useState({ title: '', body: '', audience: 'all' });
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', audience: 'all' });
  const [sending, setSending]     = useState({ push: false, email: false });

  const handlePush = async (e) => {
    e.preventDefault();
    if (!pushForm.title.trim() || !pushForm.body.trim()) { toast.error('Title and message required'); return; }
    setSending(p => ({ ...p, push: true }));
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Push notification sent!');
    setPushForm({ title: '', body: '', audience: 'all' });
    setSending(p => ({ ...p, push: false }));
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.subject.trim() || !emailForm.body.trim()) { toast.error('Subject and body required'); return; }
    setSending(p => ({ ...p, email: true }));
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Email campaign queued!');
    setEmailForm({ subject: '', body: '', audience: 'all' });
    setSending(p => ({ ...p, email: false }));
  };

  const AudienceSelect = ({ value, onChange }) => (
    <select value={value} onChange={onChange} className={inputCls}>
      <option value="all">All Users</option>
      <option value="approved">Approved Only</option>
      <option value="pending">Pending Approval</option>
      <option value="premium">Premium Users</option>
    </select>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Notifications & Campaigns</h1>
          <p className="text-sm text-gray-500">Push notifications and email campaigns</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">Push requires FCM integration. Email requires Nodemailer/SendGrid setup.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-yellow-500" /> Send Push Notification</h2>
          <form onSubmit={handlePush} className="space-y-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Audience</label>
              <AudienceSelect value={pushForm.audience} onChange={e => setPushForm(p => ({ ...p, audience: e.target.value }))} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
              <input className={inputCls} value={pushForm.title} onChange={e => setPushForm(p => ({ ...p, title: e.target.value }))} placeholder="Notification title" maxLength={80} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Message *</label>
              <textarea className={inputCls + ' resize-none'} rows={4} value={pushForm.body}
                onChange={e => setPushForm(p => ({ ...p, body: e.target.value }))} placeholder="Body text…" maxLength={200} /></div>
            <button type="submit" disabled={sending.push}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold rounded-xl disabled:opacity-60">
              <Send className="w-4 h-4" />{sending.push ? 'Sending…' : 'Send Push'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-blue-500" /> Email Campaign</h2>
          <form onSubmit={handleEmail} className="space-y-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Audience</label>
              <AudienceSelect value={emailForm.audience} onChange={e => setEmailForm(p => ({ ...p, audience: e.target.value }))} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
              <input className={inputCls} value={emailForm.subject} onChange={e => setEmailForm(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Body *</label>
              <textarea className={inputCls + ' resize-none'} rows={4} value={emailForm.body}
                onChange={e => setEmailForm(p => ({ ...p, body: e.target.value }))} placeholder="Email content…" /></div>
            <button type="submit" disabled={sending.email}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-60">
              <Mail className="w-4 h-4" />{sending.email ? 'Queuing…' : 'Send Campaign'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
