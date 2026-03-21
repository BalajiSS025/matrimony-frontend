import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import { UserCircle, Heart, Briefcase, Users, Save, Image as ImageIcon, FileText, Upload, Trash2 } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// eslint-disable-next-line no-unused-vars
const SectionTitle = ({ icon: IconComponent, title }) => (
  <div className="flex items-center mb-6 pb-2 border-b border-gray-100">
    <div className="bg-primary-50 p-2 rounded-lg mr-3">
      <IconComponent className="w-5 h-5 text-primary-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
  </div>
);

const InputField = ({ label, name, type = "text", value, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors outline-none text-gray-800"
      {...props}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_16px_center]"
    >
      <option value="" disabled>Select {label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const ToggleField = ({ label, name, checked, onChange }) => (
  <label className="flex items-center cursor-pointer p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="relative">
      <input type="checkbox" name={name} checked={checked || false} onChange={onChange} className="sr-only" />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
    </div>
    <div className="ml-3 text-sm font-medium text-gray-700">{label}</div>
  </label>
);

const ProfileUpdate = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // File Upload States
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [horoscope, setHoroscope] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // A comprehensive state object covering requested fields
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: user?.name || '',
    dob: '',
    hometown: '',
    placeOfBirth: '',
    height: '',
    weight: '',
    gender: 'Male',
    color: '',
    rasi: '',
    nakshatram: '',
    paatham: '',
    divorcee: false,
    handicapped: false,

    // Family & Contact
    primaryContactName: '',
    phoneNumber: '',
    relation: 'Self',
    secondaryEmail: '',
    address1: '',
    address2: '',

    // Family Details
    gherunav: '',
    gothru: '',
    sisters: '0',
    sistersMarried: '0',
    brothers: '0',
    brothersMarried: '0',
    familyStatus: 'Middle Class',

    // Profession details
    education: '',
    profession: '',
    hobby: '',
    monthlySalary: '',
    isNri: false,
    nriStatus: '',

    // Bio & Preferences
    about: '',
    partnerPreference: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getMe();
        if (response) {
          setFormData(prev => ({ ...prev, ...response }));
          if (response.photos) setExistingPhotos(response.photos);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create a payload including the existing photos that weren't deleted
      const payload = { ...formData, photos: existingPhotos };
      await userService.updateProfile(payload);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. ' + (error.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExistingPhoto = (photoToRemove) => {
    setExistingPhotos(prev => prev.filter(p => p !== photoToRemove));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleHoroscopeChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setHoroscope(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (photos.length === 0 && !horoscope) {
      toast.error('Please select files to upload');
      return;
    }

    setUploadingFiles(true);
    const uploadData = new FormData();
    photos.forEach(photo => uploadData.append('photos', photo));
    if (horoscope) {
      uploadData.append('horoscope', horoscope);
    }

    try {
      await userService.uploadFiles(uploadData);
      toast.success('Files uploaded successfully!');
      setPhotos([]);
      setHoroscope(null);
    } catch (error) {
      toast.error('Failed to upload files. ' + (error.response?.data?.message || ''));
    } finally {
      setUploadingFiles(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">Update Your Profile</h1>
        <p className="text-gray-600 text-sm sm:text-base">Complete your profile to find more relevant and accurate matches.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={UserCircle} title="Personal Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
            <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
            <InputField label="Hometown" name="hometown" value={formData.hometown} onChange={handleChange} />
            <InputField label="Place of Birth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} />
            <InputField label="Height (e.g., 5ft 10in)" name="height" value={formData.height} onChange={handleChange} />
            <InputField label="Weight (in kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
            <InputField label="Complexion / Color" name="color" value={formData.color} onChange={handleChange} />

            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <InputField label="Rasi" name="rasi" value={formData.rasi} onChange={handleChange} />
              <InputField label="Nakshatram" name="nakshatram" value={formData.nakshatram} onChange={handleChange} />
              <InputField label="Paatham" name="paatham" value={formData.paatham} onChange={handleChange} />
            </div>

            <ToggleField label="Divorcee / Widowed" name="divorcee" checked={formData.divorcee} onChange={handleChange} />
            <ToggleField label="Physically Handicapped" name="handicapped" checked={formData.handicapped} onChange={handleChange} />
          </div>
        </div>

        {/* Section 2: Contact Info */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={UserCircle} title="Family &amp; Contact Info" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField label="Primary Contact Name" name="primaryContactName" value={formData.primaryContactName} onChange={handleChange} />
            <InputField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} />
            <SelectField label="Relation to profile" name="relation" value={formData.relation} onChange={handleChange} options={['Self', 'Parent', 'Sibling', 'Relative', 'Friend']} />
            <InputField label="Secondary Email" name="secondaryEmail" type="email" value={formData.secondaryEmail} onChange={handleChange} />
            <div className="col-span-1 md:col-span-2">
              <InputField label="Address Line 1" name="address1" value={formData.address1} onChange={handleChange} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <InputField label="Address Line 2 (Optional)" name="address2" value={formData.address2} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Section 3: Family Details */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={Users} title="Family Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField label="Gherunav (Surname/Family Name)" name="gherunav" value={formData.gherunav} onChange={handleChange} />
            <InputField label="Gothru (Gothram)" name="gothru" value={formData.gothru} onChange={handleChange} />

            <div className="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InputField label="Sisters" name="sisters" type="number" min="0" value={formData.sisters} onChange={handleChange} />
              <InputField label="Sisters Married" name="sistersMarried" type="number" min="0" value={formData.sistersMarried} onChange={handleChange} />
              <InputField label="Brothers" name="brothers" type="number" min="0" value={formData.brothers} onChange={handleChange} />
              <InputField label="Brothers Married" name="brothersMarried" type="number" min="0" value={formData.brothersMarried} onChange={handleChange} />
            </div>

            <SelectField label="Family Status" name="familyStatus" value={formData.familyStatus} onChange={handleChange} options={['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent']} />
          </div>
        </div>

        {/* Section 4: Profession Details */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={Briefcase} title="Profession &amp; Education" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="col-span-1 md:col-span-2">
              <InputField label="Highest Education" name="education" placeholder="e.g., B.Tech, MBA" value={formData.education} onChange={handleChange} />
            </div>
            <InputField label="Profession" name="profession" value={formData.profession} onChange={handleChange} />
            <InputField label="Monthly Salary (INR)" name="monthlySalary" type="number" value={formData.monthlySalary} onChange={handleChange} />
            <div className="col-span-1 md:col-span-2">
              <InputField label="Hobbies & Interests" name="hobby" placeholder="e.g., Reading, Travelling, Cooking" value={formData.hobby} onChange={handleChange} />
            </div>

            <ToggleField label="Is NRI? (Non-Resident Indian)" name="isNri" checked={formData.isNri} onChange={handleChange} />
            {formData.isNri && (
              <InputField label="NRI Status (Country/Visa)" name="nriStatus" placeholder="e.g., H1B Visa, USA" value={formData.nriStatus} onChange={handleChange} />
            )}
          </div>
        </div>

        {/* Section 5: Bio & Preferences */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100">
          <SectionTitle icon={Heart} title="About &amp; Preferences" />
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Bride / Groom</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 resize-none"
                placeholder="Write a few lines about their personality, goals, and lifestyle."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Partner Preference</label>
              <textarea
                name="partnerPreference"
                value={formData.partnerPreference}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 resize-none"
                placeholder="Describe the ideal partner, expectations regarding education, profession, family background, etc."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 6: Media & Horoscope Uploads */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-gray-100 mb-8">
          <SectionTitle icon={ImageIcon} title="Profile Photos & Horoscope" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">

            {/* Photos Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Photos</label>
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

            {/* Display Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Existing Photos</label>
                <div className="flex flex-wrap gap-4">
                  {existingPhotos.map((photo, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={`${BASE_URL}${photo}`}
                        alt="Profile"
                        className="w-24 h-24 object-cover"
                        onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=Photo&size=96` }}
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

            {/* Horoscope Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-secondary-500 transition-colors">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Horoscope</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleHoroscopeChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-secondary-50 file:text-secondary-700 hover:file:bg-secondary-100 outline-none cursor-pointer"
              />
              {horoscope && (
                <p className="mt-3 text-sm text-secondary-600 font-medium">{horoscope?.name}</p>
              )}
            </div>
          </div>

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
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Files
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 mb-16 sm:mb-20">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 sm:py-4 px-8 sm:px-10 rounded-xl shadow-premium transform hover:-translate-y-1 transition-all text-base sm:text-lg flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Saving Profile...</span>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;
