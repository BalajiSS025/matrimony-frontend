import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { interestService } from '../services/interestService';
import { likeService } from '../services/likeService';
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap,
  Heart, CheckCircle2, User, Users, ShieldBan,
  Image as ImageIcon, Wallet, BookOpen, Calendar,
  Ruler, Globe, Star, Home, AlertCircle, Phone,
  Mail, Info, ZoomIn, Sparkles, FileText, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateAge, formatDate } from '../utils/dateUtils';
import { safeField, getProfilePhoto, extractProfile } from '../utils/profileDefaults';
import PhotoModal from '../components/PhotoModal';

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="bg-gray-50 min-h-screen">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-5 bg-gray-200 rounded w-32 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 animate-pulse">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-200">
            <div className="h-72 bg-gray-200" />
            <div className="p-6 space-y-4">
              <div className="h-7 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded-xl" />
              <div className="h-10 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-6" />
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(j => (
                  <div key={j}>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorState = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <h2 className="text-xl font-bold text-gray-800">Profile Not Found</h2>
    <p className="text-gray-500 text-center max-w-sm">
      This profile doesn't exist or may have been removed.
    </p>
    <Link to="/profiles" className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
      ← Back to Profiles
    </Link>
  </div>
);

// ─── Detail item ──────────────────────────────────────────────────────────────
const DetailItem = ({ label, value, icon: Icon, className = '' }) => {
  if (!value || String(value).trim() === '') return null;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 sm:p-6">
    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2 pb-4 border-b border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" />}
      {title}
    </h3>
    {children}
  </div>
);

// ─── Info chip ────────────────────────────────────────────────────────────────
const InfoChip = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
    {Icon && <Icon className="w-4 h-4 text-primary-400 flex-shrink-0" />}
    <span>{text}</span>
  </div>
);

// ─── Main ProfileView ─────────────────────────────────────────────────────────
const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [interaction, setInteraction] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Photo modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const raw = await userService.getUserById(id);
      const p = extractProfile(raw);
      if (!p) throw new Error('No profile data');
      setProfile(p);
      
      const [sentRes, receivedRes, likesRes] = await Promise.all([
          interestService.getSentInterests(),
          interestService.getReceivedInterests(),
          likeService.getLikedUsers()
      ]);
      const sentList = sentRes?.data || sentRes?.interests || (Array.isArray(sentRes) ? sentRes : []);
      const receivedList = receivedRes?.data || receivedRes?.interests || (Array.isArray(receivedRes) ? receivedRes : []);
      const likedList = likesRes?.data || likesRes?.likes || (Array.isArray(likesRes) ? likesRes : []);

      let currentInteraction = null;
      const sentReq = sentList.find(req => req.receiver?._id === id);
      if (sentReq) currentInteraction = { type: 'sent', status: sentReq.status, id: sentReq._id };
      else {
          const recvReq = receivedList.find(req => req.sender?._id === id);
          if (recvReq) currentInteraction = { type: 'received', status: recvReq.status, id: recvReq._id };
      }
      setInteraction(currentInteraction);
      setIsLiked(likedList.some(item => (item._id || item) === id));
      
    } catch (err) {
      console.error('ProfileView: fetch error', err);
      toast.error('Failed to load profile.');
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSendInterest = async () => {
    if (actionLoading || interestSent) return;
    setActionLoading(true);
    try {
      await interestService.sendInterest(id);
      setInterestSent(true);
      toast.success('Interest sent successfully! 💌');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (actionLoading) return;
    if (!window.confirm('Are you sure you want to block this user? They will no longer be able to view your profile or contact you.')) return;
    setActionLoading(true);
    try {
      await userService.blockUser(id);
      toast.success('User has been blocked.');
      navigate('/profiles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInterest = async () => {
      if (!interaction?.id) return;
      setActionLoading(true);
      try {
          await interestService.acceptInterest(interaction.id);
          toast.success('Interest accepted! 🎉');
          setInteraction(prev => ({ ...prev, status: 'accepted' }));
      } catch {
          toast.error('Failed to accept interest.');
      } finally {
          setActionLoading(false);
      }
  };

  const handleRejectInterest = async () => {
      if (!interaction?.id) return;
      setActionLoading(true);
      try {
          await interestService.rejectInterest(interaction.id);
          toast.success('Interest rejected.');
          setInteraction(prev => ({ ...prev, status: 'rejected' }));
      } catch {
          toast.error('Failed to reject interest.');
      } finally {
          setActionLoading(false);
      }
  };

  const handleToggleLike = async () => {
      if (likeLoading) return;
      setLikeLoading(true);
      try {
          if (isLiked) {
              await likeService.unlikeUser(id);
              setIsLiked(false);
              toast.success('Removed from shortlist');
          } else {
              await likeService.likeUser(id);
              setIsLiked(true);
              toast.success('Added to shortlist');
          }
      } catch {
          toast.error('Failed to update shortlist status');
      } finally {
          setLikeLoading(false);
      }
  };

  const openPhoto = (index = 0) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  if (loading) return <LoadingSkeleton />;
  if (error || !profile) return <ErrorState />;

  // ── Derived values ─────────────────────────────────────────────────────────
  const age = profile.age || calculateAge(profile.dob);
  const ageText = age ? `${age} Yrs` : null;
  const mainPhoto = getProfilePhoto(profile, 512);
  const hasPhotos = Array.isArray(profile.photos) && profile.photos.length > 0;

  // Build a full absolute-URL photo array for the modal
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const allPhotoUrls = hasPhotos
    ? profile.photos.map(p => (p.startsWith('http') ? p : `${BASE_URL}${p}`))
    : [mainPhoto];

  const maritalStatus =
    profile.maritalStatus ||
    (profile.divorcee === true ? 'Divorced' : profile.divorcee === false ? 'Never Married' : null);

  // ── Action buttons ─────────────────────────────────────────────────────────
  const ActionButtons = ({ fullWidth = false }) => (
    <div className={`flex gap-2 sm:gap-3 ${fullWidth ? 'flex-row' : 'flex-col'}`}>
      {interaction?.status === 'accepted' ? (
          <button disabled className={`${fullWidth ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all text-sm bg-green-50 text-green-700 border border-green-200 cursor-not-allowed`}>
              <Check className="w-4 h-4" />
              Accepted
          </button>
      ) : interaction?.status === 'rejected' ? (
          <button disabled className={`${fullWidth ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all text-sm bg-red-50 text-red-700 border border-red-200 cursor-not-allowed`}>
              <X className="w-4 h-4" />
              Rejected
          </button>
      ) : (interaction?.type === 'sent' && interaction?.status === 'pending') || interestSent ? (
          <button disabled className={`${fullWidth ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 cursor-not-allowed`}>
              <Heart className="w-4 h-4 fill-yellow-600" />
              Pending
          </button>
      ) : interaction?.type === 'received' && interaction?.status === 'pending' ? (
          <div className={`${fullWidth ? 'flex-1 flex gap-2' : 'w-full flex gap-2'}`}>
              <button onClick={handleAcceptInterest} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-1 font-bold py-3 px-4 rounded-xl transition-all text-sm border border-gray-200 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">
                  <Check className="w-4 h-4" /> Accept
              </button>
              <button onClick={handleRejectInterest} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-1 font-bold py-3 px-4 rounded-xl transition-all text-sm border border-gray-200 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50">
                  <X className="w-4 h-4" /> Reject
              </button>
          </div>
      ) : (
          <button
              onClick={handleSendInterest}
              disabled={actionLoading}
              className={`${fullWidth ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all text-sm bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-premium hover:-translate-y-0.5 disabled:opacity-60`}
          >
              <Heart className="w-4 h-4" />
              {actionLoading ? 'Sending…' : 'Send Interest'}
          </button>
      )}
      <button
        onClick={handleBlockUser}
        disabled={actionLoading}
        className={`${fullWidth ? 'w-auto' : 'w-full'} flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all text-sm disabled:opacity-50`}
      >
        <ShieldBan className="w-4 h-4" />
        <span className={`${fullWidth ? 'hidden sm:inline' : 'inline'}`}>Block</span>
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">

      {/* Photo Modal */}
      <PhotoModal
        photos={allPhotoUrls}
        startIndex={modalIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-3 z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <ActionButtons fullWidth />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <Link to="/profiles" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Profiles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* ── LEFT: Photo Card ────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden lg:sticky lg:top-24">

              {/* Main photo — click to open modal */}
              <div
                className="relative h-72 sm:h-80 bg-gray-100 cursor-pointer group"
                onClick={() => openPhoto(0)}
                title="Click to enlarge"
              >
                <img
                  src={mainPhoto}
                  alt={profile.name || 'Profile'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => {
                    e.target.onerror = null;
                    const gender = String(profile.gender || '').toLowerCase();
                    const name = profile.name || 'U';
                    const bg = gender === 'female' ? 'fce7f3' : (gender === 'male' ? 'e0f2fe' : 'f1cdcd');
                    const color = gender === 'female' ? '9d174d' : (gender === 'male' ? '075985' : '8f2c2c');
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${color}&size=512&bold=true`;
                  }}
                />
                {/* Zoom hint overlay */}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3 h-3" />
                  Enlarge
                </div>
                {profile.verified && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm flex items-center gap-1 text-xs font-bold text-green-700 px-2 py-0.5 rounded-full shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </div>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                    disabled={likeLoading}
                    className="absolute top-3 right-3 p-2.5 bg-white/60 backdrop-blur-md rounded-full shadow-soft hover:bg-white/90 transition-all z-10"
                    title={isLiked ? "Remove from shortlist" : "Add to shortlist"}
                >
                    <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-red-500'}`} />
                </button>
              </div>

              {/* Name + chips */}
              <div className="p-5">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-1">
                  {safeField(profile.name, 'Unknown User')}
                </h1>
                <p className="text-gray-500 text-sm mb-4">
                  {[ageText, profile.location].filter(Boolean).join(' · ')}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {profile.profession && <InfoChip icon={Briefcase} text={profile.profession} />}
                  {profile.education && <InfoChip icon={GraduationCap} text={profile.education} />}
                  {profile.location && <InfoChip icon={MapPin} text={profile.location} />}
                </div>
                {/* Desktop action buttons */}
                <div className="hidden md:block">
                  <ActionButtons />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Detail Sections ────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            {profile.about?.trim() && (
              <Section title="About Me" icon={User}>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {profile.about.trim()}
                </p>
              </Section>
            )}

            {/* Basic Details */}
            <Section title="Basic Details" icon={BookOpen}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <DetailItem icon={User} label="Gender" value={profile.gender} />
                <DetailItem icon={Calendar} label="Date of Birth" value={formatDate(profile.dob)} />
                <DetailItem label="Age" value={ageText} />
                <DetailItem icon={Star} label="Marital Status" value={maritalStatus} />
                <DetailItem icon={Ruler} label="Height" value={profile.height} />
                <DetailItem label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                <DetailItem icon={Globe} label="Religion" value={profile.religion} />
                <DetailItem icon={Users} label="Caste" value={profile.caste} />
                <DetailItem icon={Globe} label="Mother Tongue" value={profile.motherTongue} />
                <DetailItem label="Rasi" value={profile.rasi} />
                <DetailItem label="Nakshatram" value={profile.nakshatram} />
                <DetailItem label="Paatham" value={profile.paatham} />
                <DetailItem label="Place of Birth" value={profile.placeOfBirth} />
                <DetailItem label="Hometown" value={profile.hometown} />
                <DetailItem label="Complexion" value={profile.color} />
                {profile.divorcee !== undefined && profile.divorcee !== null && (
                  <DetailItem label="Divorcee" value={profile.divorcee ? 'Yes' : 'No'} />
                )}
                {profile.handicapped !== undefined && profile.handicapped !== null && (
                  <DetailItem label="Physically Handicapped" value={profile.handicapped ? 'Yes' : 'No'} />
                )}
              </div>
            </Section>

            {/* Professional Details */}
            <Section title="Professional Details" icon={Wallet}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <DetailItem icon={GraduationCap} label="Education" value={profile.education} />
                <DetailItem icon={Briefcase} label="Profession" value={profile.profession} />
                <DetailItem label="Monthly Salary" value={profile.monthlySalary ? `₹${Number(profile.monthlySalary).toLocaleString('en-IN')}` : null} />
                <DetailItem label="Annual Income" value={profile.income} />
                {profile.isNri && <DetailItem label="NRI Status" value={profile.nriStatus || 'NRI'} />}
                <DetailItem label="Hobbies" value={profile.hobby} />
              </div>
            </Section>

            {/* Family Details */}
            <Section title="Family Details" icon={Home}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <DetailItem label="Surname (Gherunav)" value={profile.gherunav} />
                <DetailItem label="Gothru" value={profile.gothru} />
                <DetailItem label="Father's Occupation" value={profile.fatherOccupation} />
                <DetailItem label="Mother's Occupation" value={profile.motherOccupation} />
                <DetailItem label="Sisters" value={profile.sisters !== undefined && profile.sisters !== null ? String(profile.sisters) : null} />
                <DetailItem label="Sisters Married" value={profile.sistersMarried !== undefined && profile.sistersMarried !== null ? String(profile.sistersMarried) : null} />
                <DetailItem label="Brothers" value={profile.brothers !== undefined && profile.brothers !== null ? String(profile.brothers) : null} />
                <DetailItem label="Brothers Married" value={profile.brothersMarried !== undefined && profile.brothersMarried !== null ? String(profile.brothersMarried) : null} />
                <DetailItem label="Family Status" value={profile.familyStatus} />
              </div>
            </Section>

            {/* Contact Info — only shown if data exists */}
            {(profile.primaryContactName || profile.phoneNumber || profile.secondaryEmail || profile.relation) && (
              <Section title="Contact Information" icon={Phone}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <DetailItem icon={User} label="Contact Name" value={profile.primaryContactName} />
                  <DetailItem label="Relation" value={profile.relation} />
                  <DetailItem icon={Phone} label="Phone Number" value={profile.phoneNumber} />
                  <DetailItem icon={Mail} label="Email" value={profile.secondaryEmail} />
                </div>
              </Section>
            )}

            {/* Address */}
            {(profile.address1 || profile.address2) && (
              <Section title="Address" icon={MapPin}>
                <div className="space-y-2">
                  {profile.address1 && (
                    <p className="text-sm text-gray-700">{profile.address1}</p>
                  )}
                  {profile.address2 && (
                    <p className="text-sm text-gray-500">{profile.address2}</p>
                  )}
                </div>
              </Section>
            )}

            {/* Horoscope */}
            {profile.horoscope && (
              <Section title="Horoscope" icon={FileText}>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <FileText className="w-5 h-5 text-secondary-500" />
                    <span className="text-sm font-medium">Horoscope Document</span>
                  </div>
                  <a
                    href={profile.horoscope.startsWith('http') ? profile.horoscope : `${BASE_URL}${profile.horoscope}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-secondary-600 border border-secondary-200 rounded-lg text-sm font-semibold hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
                  >
                    View / Download
                  </a>
                </div>
              </Section>
            )}

            {/* Preferences */}
            {(profile.preferences || profile.partnerPreferences || profile.partnerPreference) && (
              <Section title="Partner Preferences" icon={Sparkles}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <DetailItem
                    label="Preferred Age"
                    value={profile.preferences?.minAge || profile.preferences?.maxAge ? `${profile.preferences?.minAge || '—'} to ${profile.preferences?.maxAge || '—'} years` : null}
                  />
                  <DetailItem label="Preferred Gender" value={profile.preferences?.preferredGender} />
                  <DetailItem label="Preferred Religion" value={profile.preferences?.religion} />
                  <DetailItem label="Preferred Caste" value={profile.preferences?.caste} />
                  <DetailItem label="Preferred Height" value={profile.preferences?.minHeight || profile.preferences?.maxHeight ? `${profile.preferences?.minHeight || '—'} to ${profile.preferences?.maxHeight || '—'} cm` : null} />
                  
                  {(profile.partnerPreferences || profile.partnerPreference) && (
                    <div className="col-span-2 sm:col-span-3 mt-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Expectations</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{profile.partnerPreferences || profile.partnerPreference}</p>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Photo Gallery */}
            <Section title="Photo Gallery" icon={ImageIcon}>
              {hasPhotos ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.photos.map((photo, i) => {
                    const photoUrl = photo.startsWith('http') ? photo : `${BASE_URL}${photo}`;
                    return (
                      <div
                        key={i}
                        onClick={() => openPhoto(i)}
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 group cursor-pointer relative"
                      >
                        <img
                          src={photoUrl}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Photo')}&background=f1cdcd&color=8f2c2c&size=400&bold=true`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No photos uploaded yet.</p>
                </div>
              )}
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
