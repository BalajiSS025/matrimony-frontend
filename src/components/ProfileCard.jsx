import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, Briefcase, Heart, ShieldBan,
    GraduationCap, Users, Eye, CheckCircle,
    Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { interestService } from '../services/interestService';
import { userService } from '../services/userService';
import { likeService } from '../services/likeService';
import { calculateAge } from '../utils/dateUtils';
import { safeField, getProfilePhoto } from '../utils/profileDefaults';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Individual info row inside a card ───────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const InfoRow = ({ icon: IconComponent, text }) => (
    <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
        <IconComponent className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
        <span className="truncate">{text}</span>
    </div>
);

// ─── Badge chip ───────────────────────────────────────────────────────────────
const Chip = ({ label }) => (
    <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-100">
        {label}
    </span>
);

// ─── Main ProfileCard component ───────────────────────────────────────────────
const ProfileCard = ({ profile, onRemove, interaction, onInteractionChange, isLiked, onLikeToggle }) => {
    const [interestSent, setInterestSent] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    // Guard: always render even if profile is empty
    if (!profile) return null;

    const handleSendInterest = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (actionLoading || interestSent) return;
        setActionLoading(true);
        try {
            await interestService.sendInterest(profile._id);
            setInterestSent(true);
            toast.success('Interest sent successfully! 💌');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send interest.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlockUser = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (actionLoading) return;
        if (!window.confirm('Are you sure you want to block this user?')) return;
        setActionLoading(true);
        try {
            await userService.blockUser(profile._id);
            toast.success('User blocked.');
            if (onRemove) onRemove(profile._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to block user.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptInterest = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!interaction?.id) return;
        setActionLoading(true);
        try {
            await interestService.acceptInterest(interaction.id);
            toast.success('Interest accepted! 🎉');
            if (onInteractionChange) {
                onInteractionChange({ ...interaction, status: 'accepted' });
            }
        } catch {
            toast.error('Failed to accept interest.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectInterest = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!interaction?.id) return;
        setActionLoading(true);
        try {
            await interestService.rejectInterest(interaction.id);
            toast.success('Interest rejected.');
            if (onInteractionChange) {
                onInteractionChange({ ...interaction, status: 'rejected' });
            }
        } catch {
            toast.error('Failed to reject interest.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (likeLoading) return;
        setLikeLoading(true);
        try {
            if (isLiked) {
                await likeService.unlikeUser(profile._id);
                toast.success('Removed from shortlist');
                if (onLikeToggle) onLikeToggle(profile._id, false);
            } else {
                await likeService.likeUser(profile._id);
                toast.success('Added to shortlist');
                if (onLikeToggle) onLikeToggle(profile._id, true);
            }
        } catch {
            toast.error('Failed to update shortlist status');
        } finally {
            setLikeLoading(false);
        }
    };

    // ── Derived display values ──────────────────────────────────────────────
    const age = profile.age || calculateAge(profile.dob);
    const ageText = age ? `${age} Yrs` : 'Age N/A';
    const photoUrl = getProfilePhoto(profile);
    const bio = profile.about?.trim();
    const displayBio = bio
        ? bio.length > 120 ? bio.substring(0, 120) + '…' : bio
        : 'No description available.';

    const infoRows = [
        { icon: GraduationCap, text: safeField(profile.education) },
        { icon: Briefcase, text: safeField(profile.profession) },
        { icon: MapPin, text: safeField(profile.location) },
    ];

    const chips = [
        profile.religion,
        profile.caste,
    ].filter(Boolean);

    return (
        <article className="group bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row overflow-hidden">

            {/* ── LEFT: Photo ─────────────────────────────────────────────── */}
            <div className="relative w-full sm:w-44 lg:w-52 h-56 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-100">
                <Link to={`/profiles/${profile._id}`} className="block w-full h-full" tabIndex={-1}>
                    <img
                        src={profile.photos?.length > 0
                            ? (profile.photos[0].startsWith('http') ? profile.photos[0] : `${BASE_URL}${profile.photos[0]}`)
                            : '/default-profile.png'
                        }
                        alt={profile.name || 'User'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=f1cdcd&color=8f2c2c&size=256&bold=true`;
                        }}
                    />
                </Link>

                {/* Like Button */}
                <button
                    onClick={handleToggleLike}
                    disabled={likeLoading}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/50 backdrop-blur-md rounded-full shadow hover:bg-white/80 transition-all z-10"
                    aria-label={isLiked ? "Remove from shortlist" : "Add to shortlist"}
                >
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-red-500'}`} />
                </button>

                {/* Verified badge */}
                {profile.verified && (
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm flex items-center gap-1 text-xs font-bold text-green-700 px-2 py-0.5 rounded-full shadow-sm">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                    </div>
                )}

                {/* Profile ID badge (bottom right of photo) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                    <span className="text-white/80 text-[10px] font-medium">
                        ID: {profile.customId || profile._id?.toString().slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* ── RIGHT: Info ──────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">

                {/* Primary info row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                        to={`/profiles/${profile._id}`}
                        className="font-bold text-gray-900 text-lg leading-tight hover:text-primary-700 transition-colors truncate"
                    >
                        {safeField(profile.name, 'Unknown User')}
                    </Link>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full border border-primary-100 whitespace-nowrap flex-shrink-0">
                        {ageText}
                    </span>
                </div>

                {/* Gender + marital status */}
                <p className="text-sm text-gray-500 mb-3">
                    {safeField(profile.gender, 'Gender N/A')}
                    {profile.maritalStatus ? ` · ${profile.maritalStatus}` : ''}
                </p>

                {/* Chips for religion/caste */}
                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {chips.map((c, i) => <Chip key={i} label={c} />)}
                    </div>
                )}

                {/* Secondary info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                    {infoRows.map((row, i) => (
                        <InfoRow key={i} icon={row.icon} text={row.text} />
                    ))}
                    {/* extra religion/caste row if not shown as chips */}
                    {chips.length === 0 && (
                        <InfoRow icon={Users} text="Religion / Caste: N/A" />
                    )}
                </div>

                {/* Bio excerpt */}
                <p className="text-sm text-gray-500 italic border-l-2 border-primary-100 pl-3 mb-4 line-clamp-2">
                    {displayBio}
                </p>

                {/* Action Buttons */}
                <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <Link
                        to={`/profiles/${profile._id}`}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 hover:border-primary-300 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        View Profile
                    </Link>

                    {/* Interaction Buttons Logic */}
                    {interaction?.status === 'accepted' ? (
                        <button disabled className="flex-1 flex flex-row items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-green-50 text-green-700 border border-green-200 cursor-not-allowed">
                            <Heart className="w-4 h-4 fill-green-600" />
                            Accepted
                        </button>
                    ) : interaction?.status === 'rejected' ? (
                        <button disabled className="flex-1 flex flex-row items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-red-50 text-red-700 border border-red-200 cursor-not-allowed">
                            <X className="w-4 h-4 text-red-600" />
                            Rejected
                        </button>
                    ) : (interaction?.type === 'sent' && interaction?.status === 'pending') || interestSent ? (
                        <button disabled className="flex-1 flex flex-row items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 cursor-not-allowed">
                            <Heart className="w-4 h-4 fill-yellow-600" />
                            Pending
                        </button>
                    ) : interaction?.type === 'received' && interaction?.status === 'pending' ? (
                        <div className="flex-1 flex gap-2">
                            <button
                                onClick={handleAcceptInterest}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors font-semibold disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" /> Accept
                            </button>
                            <button
                                onClick={handleRejectInterest}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors font-semibold disabled:opacity-50"
                            >
                                <X className="w-4 h-4" /> Reject
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleSendInterest}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md disabled:opacity-60"
                        >
                            <Heart className="w-4 h-4" />
                            {actionLoading ? 'Sending…' : 'Send Interest'}
                        </button>
                    )}

                    <button
                        onClick={handleBlockUser}
                        disabled={actionLoading}
                        title="Block User"
                        className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                    >
                        <ShieldBan className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProfileCard;
