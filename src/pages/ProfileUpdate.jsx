import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import { UserCircle, Heart, Briefcase, Users, Save, Image as ImageIcon, FileText, Upload, Trash2, ShieldCheck } from 'lucide-react';
import {
  COMPLEXION_OPTIONS, RASI_OPTIONS, NAKSHATRAM_OPTIONS, PAATHAM_OPTIONS,
  RELIGION_OPTIONS, MOTHER_TONGUE_OPTIONS, EDUCATION_OPTIONS, PROFESSION_OPTIONS,
  FAMILY_STATUS_OPTIONS, RELATION_OPTIONS, HEIGHT_OPTIONS, NRI_COUNTRY_OPTIONS,
} from '../utils/constants';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Reusable form components ──────────────────────────────────────────────────

const SectionTitle = ({ icon: IconComponent, title }) => (
  <div className="flex items-center mb-6 pb-2 border-b border-gray-100">
    <div className="bg-primary-50 p-2 rounded-lg mr-3">
      <IconComponent className="w-5 h-5 text-primary-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
  </div>
);

const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors outline-none text-gray-800";
const selectCls = `${inputCls} appearance-none`;

const InputField = ({ label, name, type = 'text', value, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input type={type} name={name} value={value || ''} onChange={onChange} className={inputCls} {...props} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select name={name} value={value || ''} onChange={onChange} className={selectCls}>
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map(opt => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? opt.label : opt;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </div>
);

const ToggleField = ({ label, name, checked, onChange }) => (
  <label className="flex items-center cursor-pointer p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="relative">
      <input type="checkbox" name={name} checked={checked || false} onChange={onChange} className="sr-only" />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-gray-300'}`} />
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`} />
    </div>
    <div className="ml-3 text-sm font-medium text-gray-700">{label}</div>
  </label>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ProfileUpdate = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [horoscope, setHoroscope] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [formData, setFormData] = useState({
    // Personal
    fullName: '', dateOfBirth: '', hometown: '', placeOfBirth: '',
    height: '', weight: '', gender: '', color: '',
    rasi: '', nakshatram: '', paatham: '',
    isDivorceeOrWidowed: false, isPhysicallyHandicapped: false,
    religion: '', caste: '', motherTongue: '',
    // Family & Contact
    primaryContactName: '', phoneNumber: '', relation: '',
    secondaryEmail: '', address1: '', address2: '',
    // Family Details
    gherunav: '', gothru: '',
    sisters: '0', sistersMarried: '0', brothers: '0', brothersMarried: '0',
    familyStatus: '',
    // Profession
    education: '', profession: '', hobby: '',
    monthlySalary: '', isNRI: false, nriStatus: '',
    // Bio
    about: '', partnerPreference: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setPageLoading(true);
      try {
        const response = await userService.getMe();
        if (response) {
          // Map API fields to form fields
          setFormData(prev => ({
            ...prev,
            fullName:              response.fullName || response.name || '',
            dateOfBirth:           response.dateOfBirth ? response.dateOfBirth.split('T')[0] : '',
            hometown:              response.hometown || '',
            placeOfBirth:          response.placeOfBirth || '',
            height:                response.height || '',
            weight:                response.weight || '',
            gender:                response.gender || '',
            color:                 response.color || '',
            rasi:                  response.rasi || '',
            nakshatram:            response.nakshatram || '',
            paatham:               response.paatham || '',
            isDivorceeOrWidowed:   response.isDivorceeOrWidowed || false,
            isPhysicallyHandicapped: response.isPhysicallyHandicapped || false,
            religion:              response.religion || '',
            caste:                 response.caste || '',
            motherTongue:          response.motherTongue || '',
            primaryContactName:    response.primaryContactName || '',
            phoneNumber:           response.phoneNumber || '',
            relation:              response.relation || '',
            secondaryEmail:        response.secondaryEmail || '',
            address1:              response.address1 || '',
            address2:              response.address2 || '',
            gherunav:              response.gherunav || '',
            gothru:                response.gothru || '',
            sisters:               response.sisters ?? 0,
            sistersMarried:        response.sistersMarried ?? 0,
            brothers:              response.brothers ?? 0,
            brothersMarried:       response.brothersMarried ?? 0,
            familyStatus:          response.familyStatus || '',
            education:             response.education || '',
            profession:            response.profession || '',
            hobby:                 response.hobby || '',
            monthlySalary:         response.monthlySalary || '',
            isNRI:                 response.isNRI || false,
            nriStatus:             response.nriStatus || '',
            about:                 response.about || '',
            partnerPreference:     response.partnerPreference || '',
          }));
          if (response.photos) setExistingPhotos(response.photos);
        }
      } catch (error) {
        console.error('Error fetching profile', error);
        toast.error('Failed to load profile data');
      } finally {
        setPageLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        photos: existingPhotos,
        // Map form names to schema names
        dob: formData.dateOfBirth,
      };
      await userService.updateProfile(payload);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. ' + (error.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExistingPhoto = async (photo) => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    try {
      const result = await userService.deletePhoto(photo);
      setExistingPhotos(result.photos || (prev => prev.filter(p => p !== photo)));
      toast.success('Photo deleted');
    } catch {
      // Optimistically remove from UI even if API fails (local-only fallback)
      setExistingPhotos(prev => prev.filter(p => p !== photo));
      toast.error('Failed to delete from server — removed locally');
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) setPhotos(Array.from(e.target.files));
  };

  const handleHoroscopeChange = (e) => {
    if (e.target.files?.[0]) setHoroscope(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (photos.length === 0 && !horoscope) {
      toast.error('Please select files to upload');
      return;
    }
    setUploadingFiles(true);
    const uploadData = new FormData();
    photos.forEach(photo => uploadData.append('photos', photo));
    if (horoscope) uploadData.append('horoscope', horoscope);
    try {
      await userService.uploadFiles(uploadData);
      toast.success('Files uploaded successfully!');
      setPhotos([]);
      setHoroscope(null);
      // Refresh profile to get new photo URLs
      const response = await userService.getMe();
      if (response?.photos) setExistingPhotos(response.photos);
    } catch (error) {
      toast.error('Failed to upload files. ' + (error.response?.data?.message || ''));
    } finally {
      setUploadingFiles(false);
    }
  };

  const getPhotoSrc = (photo) => photo?.startsWith('http') ? photo : `${BASE_URL}${photo}`;

  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-3xl p-8 shadow-soft border border-gray-100 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">Update Your Profile</h1>
        <p className="text-gray-600 text-sm sm:text-base">Complete your profile to find more relevant and accurate matches.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Section 1: Personal Details ─────────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={UserCircle} title="Personal Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
            <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
            <InputField label="Hometown" name="hometown" value={formData.hometown} onChange={handleChange} placeholder="e.g. Chennai" />
            <InputField label="Place of Birth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} placeholder="e.g. Madurai" />

            <SelectField label="Height" name="height" value={formData.height} onChange={handleChange} options={HEIGHT_OPTIONS} placeholder="Select height" />
            <InputField label="Weight (in kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="e.g. 65" />

            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female']} />

            <SelectField label="Complexion" name="color" value={formData.color} onChange={handleChange} options={COMPLEXION_OPTIONS} placeholder="Select complexion" />

            <SelectField label="Religion" name="religion" value={formData.religion} onChange={handleChange} options={RELIGION_OPTIONS} />
            <InputField label="Caste" name="caste" value={formData.caste} onChange={handleChange} placeholder="e.g. Brahmin, Nadar, Chettiar" />
            <SelectField label="Mother Tongue" name="motherTongue" value={formData.motherTongue} onChange={handleChange} options={MOTHER_TONGUE_OPTIONS} />

            {/* Astrological Details */}
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Astrological Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField label="Rasi (Moon Sign)" name="rasi" value={formData.rasi} onChange={handleChange} options={RASI_OPTIONS} placeholder="Select Rasi" />
                <SelectField label="Nakshatram (Star)" name="nakshatram" value={formData.nakshatram} onChange={handleChange} options={NAKSHATRAM_OPTIONS} placeholder="Select Star" />
                <SelectField label="Paatham (Quarter)" name="paatham" value={formData.paatham} onChange={handleChange} options={PAATHAM_OPTIONS} placeholder="Select Paatham" />
              </div>
            </div>

            <ToggleField label="Divorcee / Widowed" name="isDivorceeOrWidowed" checked={formData.isDivorceeOrWidowed} onChange={handleChange} />
            <ToggleField label="Physically Handicapped" name="isPhysicallyHandicapped" checked={formData.isPhysicallyHandicapped} onChange={handleChange} />
          </div>
        </div>

        {/* ── Section 2: Family & Contact ─────────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={UserCircle} title="Family & Contact Info" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField label="Primary Contact Name" name="primaryContactName" value={formData.primaryContactName} onChange={handleChange} placeholder="Name of person to contact" />
            <InputField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder="+91 9876543210" />
            <SelectField label="Relation to Profile" name="relation" value={formData.relation} onChange={handleChange} options={RELATION_OPTIONS} />
            <InputField label="Secondary Email" name="secondaryEmail" type="email" value={formData.secondaryEmail} onChange={handleChange} placeholder="alternate@email.com" />
            <div className="col-span-1 sm:col-span-2">
              <InputField label="Address Line 1" name="address1" value={formData.address1} onChange={handleChange} placeholder="House/Flat No., Street Name" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <InputField label="Address Line 2 (Optional)" name="address2" value={formData.address2} onChange={handleChange} placeholder="City, District, State - PIN" />
            </div>
          </div>
        </div>

        {/* ── Section 3: Family Details ────────────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={Users} title="Family Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField label="Gherunav (Surname / Family Name)" name="gherunav" value={formData.gherunav} onChange={handleChange} placeholder="Family surname" />
            <InputField label="Gothru (Gothram)" name="gothru" value={formData.gothru} onChange={handleChange} placeholder="e.g. Vasishtha, Bharadwaj" />

            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InputField label="Sisters" name="sisters" type="number" min="0" max="20" value={formData.sisters} onChange={handleChange} />
              <InputField label="Sisters Married" name="sistersMarried" type="number" min="0" max="20" value={formData.sistersMarried} onChange={handleChange} />
              <InputField label="Brothers" name="brothers" type="number" min="0" max="20" value={formData.brothers} onChange={handleChange} />
              <InputField label="Brothers Married" name="brothersMarried" type="number" min="0" max="20" value={formData.brothersMarried} onChange={handleChange} />
            </div>

            <SelectField label="Family Status" name="familyStatus" value={formData.familyStatus} onChange={handleChange} options={FAMILY_STATUS_OPTIONS} />
          </div>
        </div>

        {/* ── Section 4: Profession & Education ───────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={Briefcase} title="Profession & Education" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="col-span-1 sm:col-span-2">
              <SelectField label="Highest Education" name="education" value={formData.education} onChange={handleChange} options={EDUCATION_OPTIONS} placeholder="Select qualification" />
            </div>
            <SelectField label="Profession / Occupation" name="profession" value={formData.profession} onChange={handleChange} options={PROFESSION_OPTIONS} placeholder="Select profession" />
            <InputField label="Monthly Salary (INR)" name="monthlySalary" type="number" value={formData.monthlySalary} onChange={handleChange} placeholder="e.g. 50000" />
            <div className="col-span-1 sm:col-span-2">
              <InputField label="Hobbies & Interests" name="hobby" value={formData.hobby} onChange={handleChange} placeholder="e.g. Reading, Travelling, Cooking, Cricket" />
            </div>
            <ToggleField label="Is NRI? (Non-Resident Indian)" name="isNRI" checked={formData.isNRI} onChange={handleChange} />
            {formData.isNRI && (
              <SelectField label="Country of Residence" name="nriStatus" value={formData.nriStatus} onChange={handleChange} options={NRI_COUNTRY_OPTIONS} placeholder="Select country" />
            )}
          </div>
        </div>

        {/* ── Section 5: About & Preferences ──────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={Heart} title="About & Partner Preferences" />
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Bride / Groom</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 resize-none"
                placeholder="Write a few lines about their personality, goals, values and lifestyle..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Partner Preference</label>
              <textarea
                name="partnerPreference"
                value={formData.partnerPreference}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 resize-none"
                placeholder="Describe the ideal partner: education, profession, family background, values, location..."
              />
            </div>
          </div>
        </div>

        {/* ── Section 6: Photos & Horoscope ───────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100 mb-8">
          <SectionTitle icon={ImageIcon} title="Profile Photos & Horoscope" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Photo Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Photos</label>
              <p className="text-xs text-gray-400 mb-3">JPG, PNG, WebP — max 10MB each, up to 5 photos</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 outline-none cursor-pointer"
              />
              {photos.length > 0 && (
                <p className="mt-3 text-sm text-primary-600 font-medium">{photos.length} photo(s) selected</p>
              )}
            </div>

            {/* Horoscope Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-secondary-500 transition-colors">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Horoscope</label>
              <p className="text-xs text-gray-400 mb-3">PDF or image (JPG, PNG) — max 10MB</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleHoroscopeChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-secondary-50 file:text-secondary-700 hover:file:bg-secondary-100 outline-none cursor-pointer"
              />
              {horoscope && (
                <p className="mt-3 text-sm text-secondary-600 font-medium">{horoscope.name}</p>
              )}
            </div>
          </div>

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Current Photos</label>
              <div className="flex flex-wrap gap-3">
                {existingPhotos.map((photo, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={getPhotoSrc(photo)}
                      alt={`Photo ${idx + 1}`}
                      className="w-24 h-24 object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=Photo&size=96`; }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingPhoto(photo)}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={uploadingFiles || (photos.length === 0 && !horoscope)}
              className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm transform transition-all text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingFiles ? (
                <span className="animate-pulse">Uploading...</span>
              ) : (
                <><Upload className="w-5 h-5 mr-2" />Upload Files</>
              )}
            </button>
          </div>
        </div>

        {/* ── Verification CTA ─────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 sm:p-6 flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-800 text-sm">Get Verified</p>
            <p className="text-blue-600 text-xs mt-1">
              Submit a government ID for admin review to get a verification badge on your profile — builds trust with potential matches.
            </p>
            <a href="/settings/verification" className="inline-block mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2">
              Request Verification →
            </a>
          </div>
        </div>

        {/* ── Submit ───────────────────────────────────────────── */}
        <div className="flex justify-end pt-4 mb-16 sm:mb-20">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 sm:py-4 px-8 sm:px-10 rounded-xl shadow-premium transform hover:-translate-y-1 transition-all text-base sm:text-lg flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Saving Profile...</span>
            ) : (
              <><Save className="w-5 h-5 mr-2" />Save All Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;
