import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, User, ChevronRight, ChevronLeft, Star, Users, Phone, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  RASI_OPTIONS, NAKSHATRAM_OPTIONS, PAATHAM_OPTIONS,
  COMPLEXION_OPTIONS, HEIGHT_OPTIONS, FAMILY_STATUS_OPTIONS,
  RELATION_OPTIONS, EDUCATION_OPTIONS, PROFESSION_OPTIONS,
} from '../utils/constants';

// ── Shared input styles ───────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors outline-none text-gray-800 text-sm";
const selectCls = `${inputCls} appearance-none`;
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
const requiredMark = <span className="text-red-500 ml-0.5">*</span>;

const Field = ({ label, required, children }) => (
  <div>
    <label className={labelCls}>{label}{required && requiredMark}</label>
    {children}
  </div>
);

// ── Step indicator ────────────────────────────────────────────────────────────
const StepDot = ({ active, done, label }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
      done ? 'bg-green-500 text-white' :
      active ? 'bg-primary-600 text-white shadow-lg scale-110' :
      'bg-gray-200 text-gray-400'
    }`}>
      {done ? '✓' : label}
    </div>
  </div>
);

const STEPS = ['Account', 'Personal', 'Astro', 'Family', 'About'];

// ── Main Register Component ───────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 0 — Account
    name: '', email: '', password: '', confirmPassword: '',
    // Step 1 — Personal
    fullName: '', dateOfBirth: '', gender: '',
    hometown: '', placeOfBirth: '',
    height: '', color: '',
    motherTongue: 'Sourashtra',
    // Step 2 — Astro (religion/caste fixed)
    religion: 'Hindu',
    caste: 'Sourashtra',
    rasi: '', nakshatram: '', paatham: '',
    isDivorceeOrWidowed: false,
    // Step 3 — Family & Contact
    primaryContactName: '', phoneNumber: '', relation: '',
    gherunav: '', gothru: '',
    familyStatus: '',
    sisters: '0', sistersMarried: '0', brothers: '0', brothersMarried: '0',
    // Step 4 — About
    education: '', profession: '',
    about: '', partnerPreference: '',
  });

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const validateStep = () => {
    const d = formData;
    if (step === 0) {
      if (d.name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return false; }
      if (!validateEmail(d.email)) { toast.error('Enter a valid email address'); return false; }
      if (d.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (d.password !== d.confirmPassword) { toast.error('Passwords do not match'); return false; }
    }
    if (step === 1) {
      if (!d.fullName.trim()) { toast.error('Full name is required'); return false; }
      if (!d.dateOfBirth) { toast.error('Date of birth is required'); return false; }
      if (!d.gender) { toast.error('Gender is required'); return false; }
      if (!d.hometown.trim()) { toast.error('Hometown is required'); return false; }
      if (!d.placeOfBirth.trim()) { toast.error('Place of birth is required'); return false; }
    }
    if (step === 2) {
      if (!d.rasi) { toast.error('Rasi is required'); return false; }
      if (!d.nakshatram) { toast.error('Nakshatram is required'); return false; }
      if (!d.paatham) { toast.error('Paatham is required'); return false; }
    }
    if (step === 3) {
      if (!d.primaryContactName.trim()) { toast.error('Primary contact name is required'); return false; }
      if (!d.phoneNumber.trim()) { toast.error('Phone number is required'); return false; }
      if (!d.relation) { toast.error('Relation is required'); return false; }
      if (!d.gherunav.trim()) { toast.error('Gherunav (surname) is required'); return false; }
      if (!d.gothru.trim()) { toast.error('Gothru is required'); return false; }
      if (!d.familyStatus) { toast.error('Family status is required'); return false; }
    }
    if (step === 4) {
      if (!d.about.trim()) { toast.error('About is required'); return false; }
      if (!d.partnerPreference.trim()) { toast.error('Partner preference is required'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      // All profile fields sent at registration
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      hometown: formData.hometown,
      placeOfBirth: formData.placeOfBirth,
      height: formData.height,
      color: formData.color,
      motherTongue: formData.motherTongue,
      religion: 'Hindu',
      caste: 'Sourashtra',
      rasi: formData.rasi,
      nakshatram: formData.nakshatram,
      paatham: formData.paatham,
      isDivorceeOrWidowed: formData.isDivorceeOrWidowed,
      primaryContactName: formData.primaryContactName,
      phoneNumber: formData.phoneNumber,
      relation: formData.relation,
      gherunav: formData.gherunav,
      gothru: formData.gothru,
      familyStatus: formData.familyStatus,
      sisters: Number(formData.sisters) || 0,
      sistersMarried: Number(formData.sistersMarried) || 0,
      brothers: Number(formData.brothers) || 0,
      brothersMarried: Number(formData.brothersMarried) || 0,
      education: formData.education,
      profession: formData.profession,
      about: formData.about,
      partnerPreference: formData.partnerPreference,
    };

    const response = await register(payload);
    setLoading(false);

    if (response.success) {
      toast.success('Registration successful! Please verify your OTP.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } else {
      toast.error(response.message);
    }
  };

  // ── Step content ────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <Field label="Display Name" required>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="name" type="text" required value={formData.name} onChange={set}
                className={inputCls + ' pl-10'} placeholder="Name shown on your profile" />
            </div>
          </Field>
          <Field label="Email Address" required>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="email" type="email" required value={formData.email} onChange={set}
                className={inputCls + ' pl-10'} placeholder="you@example.com" />
            </div>
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="password" type="password" required value={formData.password} onChange={set}
                className={inputCls + ' pl-10'} placeholder="Min. 6 characters" minLength={6} />
            </div>
          </Field>
          <Field label="Confirm Password" required>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={set}
                className={inputCls + ' pl-10'} placeholder="Re-enter password" minLength={6} />
            </div>
          </Field>
        </div>
      );

      case 1: return (
        <div className="space-y-4">
          <Field label="Full Name (as in documents)" required>
            <input name="fullName" type="text" value={formData.fullName} onChange={set} className={inputCls} placeholder="As per birth certificate / Aadhaar" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of Birth" required>
              <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={set} className={inputCls}
                max={new Date(Date.now() - 18 * 365.25 * 24 * 3600000).toISOString().split('T')[0]} />
            </Field>
            <Field label="Gender" required>
              <select name="gender" value={formData.gender} onChange={set} className={selectCls}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hometown" required>
              <input name="hometown" type="text" value={formData.hometown} onChange={set} className={inputCls} placeholder="e.g. Madurai" />
            </Field>
            <Field label="Place of Birth" required>
              <input name="placeOfBirth" type="text" value={formData.placeOfBirth} onChange={set} className={inputCls} placeholder="e.g. Chennai" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height">
              <select name="height" value={formData.height} onChange={set} className={selectCls}>
                <option value="">Select height</option>
                {HEIGHT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Complexion">
              <select name="color" value={formData.color} onChange={set} className={selectCls}>
                <option value="">Select</option>
                {COMPLEXION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Mother Tongue" required>
            <select name="motherTongue" value={formData.motherTongue} onChange={set} className={selectCls}>
              <option value="Sourashtra">Sourashtra</option>
              <option value="Tamil">Tamil</option>
            </select>
          </Field>
        </div>
      );

      case 2: return (
        <div className="space-y-4">
          {/* Religion & Caste fixed */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Religion">
              <input value="Hindu" readOnly className={inputCls + ' bg-gray-100 text-gray-500 cursor-not-allowed'} />
            </Field>
            <Field label="Caste">
              <input value="Sourashtra" readOnly className={inputCls + ' bg-gray-100 text-gray-500 cursor-not-allowed'} />
            </Field>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Astrological Details</p>
          <Field label="Rasi (Moon Sign)" required>
            <select name="rasi" value={formData.rasi} onChange={set} className={selectCls}>
              <option value="">Select Rasi</option>
              {RASI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Nakshatram (Birth Star)" required>
            <select name="nakshatram" value={formData.nakshatram} onChange={set} className={selectCls}>
              <option value="">Select Nakshatram</option>
              {NAKSHATRAM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Paatham (Quarter)" required>
            <select name="paatham" value={formData.paatham} onChange={set} className={selectCls}>
              <option value="">Select Paatham</option>
              {PAATHAM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl bg-gray-50">
            <div className="relative flex-shrink-0">
              <input type="checkbox" name="isDivorceeOrWidowed" checked={formData.isDivorceeOrWidowed} onChange={set} className="sr-only" />
              <div className={`block w-9 h-5 rounded-full transition-colors ${formData.isDivorceeOrWidowed ? 'bg-primary-500' : 'bg-gray-300'}`} />
              <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${formData.isDivorceeOrWidowed ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Divorcee / Widowed</span>
          </label>
        </div>
      );

      case 3: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary Contact Name" required>
              <input name="primaryContactName" type="text" value={formData.primaryContactName} onChange={set} className={inputCls} placeholder="Father / Mother name" />
            </Field>
            <Field label="Relation" required>
              <select name="relation" value={formData.relation} onChange={set} className={selectCls}>
                <option value="">Select</option>
                {RELATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Phone Number" required>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={set}
                className={inputCls + ' pl-10'} placeholder="+91 9876543210" />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gherunav (Surname)" required>
              <input name="gherunav" type="text" value={formData.gherunav} onChange={set} className={inputCls} placeholder="Family surname" />
            </Field>
            <Field label="Gothru" required>
              <input name="gothru" type="text" value={formData.gothru} onChange={set} className={inputCls} placeholder="e.g. Vasishtha" />
            </Field>
          </div>
          <Field label="Family Status" required>
            <select name="familyStatus" value={formData.familyStatus} onChange={set} className={selectCls}>
              <option value="">Select</option>
              {FAMILY_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-4 gap-2">
            {[['Sisters', 'sisters'], ['Sis. Married', 'sistersMarried'], ['Brothers', 'brothers'], ['Bro. Married', 'brothersMarried']].map(([lbl, nm]) => (
              <Field key={nm} label={lbl}>
                <input name={nm} type="number" min="0" max="20" value={formData[nm]} onChange={set} className={inputCls + ' text-center'} />
              </Field>
            ))}
          </div>
        </div>
      );

      case 4: return (
        <div className="space-y-4">
          <Field label="Education">
            <select name="education" value={formData.education} onChange={set} className={selectCls}>
              <option value="">Select qualification</option>
              {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Profession">
            <select name="profession" value={formData.profession} onChange={set} className={selectCls}>
              <option value="">Select profession</option>
              {PROFESSION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="About Bride / Groom" required>
            <textarea name="about" value={formData.about} onChange={set} rows={3}
              className={inputCls + ' resize-none'} placeholder="A few lines about personality, values, goals..." />
          </Field>
          <Field label="Partner Preference" required>
            <textarea name="partnerPreference" value={formData.partnerPreference} onChange={set} rows={3}
              className={inputCls + ' resize-none'} placeholder="Describe what you are looking for in a partner..." />
          </Field>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            <strong>Note:</strong> After registration, your profile will be reviewed by our admin team before becoming visible to other members. You will be notified once approved.
          </div>
        </div>
      );

      default: return null;
    }
  };

  const stepIcons = [Lock, User, Star, Users, Heart];
  const StepIcon = stepIcons[step];

  return (
    <div className="min-h-[calc(100vh-80px)] py-10 flex items-center justify-center px-4 relative bg-primary-50/50">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-premium border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-500 px-6 py-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Create Your Profile</h2>
              <p className="text-primary-200 text-xs">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <StepDot active={i === step} done={i < step} label={i + 1} />
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-green-400' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
          {step > 0 ? (
            <button type="button" onClick={back}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <Link to="/login" className="text-sm text-gray-500 hover:text-primary-600 font-medium">
              Already have an account?
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-soft hover:shadow-premium">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all shadow-soft disabled:opacity-60">
              {loading ? <span className="animate-pulse">Registering…</span> : <><Heart className="w-4 h-4" /> Complete Registration</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
