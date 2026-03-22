import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sliders, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors";

const AdminMatchmaking = () => {
  const [config, setConfig] = useState({
    ageWeightMin: 18, ageWeightMax: 60,
    kundaliMinScore: 0,
    showOnlyApproved: true,
    showOnlyActive: true,
    defaultGenderFilter: true,
    enableKundaliFilter: true,
    dailyMatchLimit: 10,
    interestDailyLimit: 5,
    messageDailyLimit: 50,
  });
  const [saving, setSaving] = useState(false);

  const set = e => {
    const { name, value, type, checked } = e.target;
    setConfig(p => ({ ...p, [name]: type === 'checkbox' ? checked : Number(value) || value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Placeholder — wire to backend when ready
    toast.success('Matchmaking config saved!');
    setSaving(false);
  };

  const Toggle = ({ name, label, desc }) => (
    <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="relative flex-shrink-0 ml-3">
        <input type="checkbox" name={name} checked={config[name]} onChange={set} className="sr-only" />
        <div className={`block w-10 h-6 rounded-full transition-colors ${config[name] ? 'bg-primary-500' : 'bg-gray-300'}`} />
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config[name] ? 'translate-x-4' : ''}`} />
      </div>
    </label>
  );

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Matchmaking Config</h1>
          <p className="text-sm text-gray-500">Algorithm parameters and filter settings</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">Changes here affect what profiles users see and how matches are computed. Test in staging before saving to production.</p>
      </div>

      {/* Algorithm params */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Sliders className="w-4 h-4 text-primary-600" /> Algorithm Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Age Filter</label>
            <input type="number" name="ageWeightMin" value={config.ageWeightMin} onChange={set} min={18} max={100} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Age Filter</label>
            <input type="number" name="ageWeightMax" value={config.ageWeightMax} onChange={set} min={18} max={100} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Kundali Score (0–36)</label>
            <input type="number" name="kundaliMinScore" value={config.kundaliMinScore} onChange={set} min={0} max={36} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Daily Match Suggestions</label>
            <input type="number" name="dailyMatchLimit" value={config.dailyMatchLimit} onChange={set} min={1} max={100} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-3">
        <h2 className="font-bold text-gray-900">Filters</h2>
        <Toggle name="showOnlyApproved" label="Show only admin-approved profiles" desc="Unapproved profiles are hidden from browse & search" />
        <Toggle name="showOnlyActive"   label="Show only active accounts" desc="Deactivated accounts won't appear in any list" />
        <Toggle name="defaultGenderFilter" label="Auto opposite-gender filter" desc="Female users see only male profiles and vice versa" />
        <Toggle name="enableKundaliFilter" label="Enable Kundali compatibility filter" desc="Allow users to filter browse results by Kundali score" />
      </div>

      {/* Daily limits */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Daily Limits (per user)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Interests / day</label>
            <input type="number" name="interestDailyLimit" value={config.interestDailyLimit} onChange={set} min={1} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Messages / day</label>
            <input type="number" name="messageDailyLimit" value={config.messageDailyLimit} onChange={set} min={1} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Profile views / day</label>
            <input type="number" defaultValue={100} className={inputCls} disabled />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors shadow-soft disabled:opacity-60">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default AdminMatchmaking;
