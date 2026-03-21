import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import { Filter, Users, Search, X, ChevronLeft, ChevronRight, LayoutList } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import { extractProfiles } from '../utils/profileDefaults';
import { interestService } from '../services/interestService';
import { likeService } from '../services/likeService';

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-soft flex flex-col sm:flex-row overflow-hidden">
        <div className="w-full sm:w-44 lg:w-52 h-48 sm:h-auto bg-gray-200 flex-shrink-0" />
        <div className="flex-1 p-5 flex flex-col gap-3">
            <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-14" />
            </div>
            <div className="h-3.5 bg-gray-200 rounded w-1/4" />
            <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded-full w-20" />
                <div className="h-5 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="h-3.5 bg-gray-200 rounded" />
                <div className="h-3.5 bg-gray-200 rounded" />
                <div className="h-3.5 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
                <div className="h-9 bg-gray-200 rounded-xl w-28" />
                <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                <div className="h-9 w-9 bg-gray-200 rounded-xl" />
            </div>
        </div>
    </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ onClear }) => (
    <div className="flex flex-col items-center justify-center py-20 sm:py-24 bg-white rounded-3xl border border-gray-100 shadow-soft text-center px-4">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-5">
            <Users className="w-10 h-10 text-primary-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Profiles Available</h3>
        <p className="text-gray-500 mb-6 max-w-xs text-sm">
            We couldn't find any profiles matching your criteria. Try adjusting your filters.
        </p>
        {onClear && (
            <button
                onClick={onClear}
                className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm"
            >
                Clear Filters
            </button>
        )}
    </div>
);

// ── Pagination Bar ────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPrev, onNext, onPage }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
        pages.push(i);
    }

    return (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
                disabled={page <= 1}
                onClick={onPrev}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
            </button>

            {page > 3 && (
                <>
                    <button onClick={() => onPage(1)} className="w-9 h-9 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">1</button>
                    {page > 4 && <span className="text-gray-400 text-sm">…</span>}
                </>
            )}

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPage(p)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${p === page
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    {p}
                </button>
            ))}

            {page < totalPages - 2 && (
                <>
                    {page < totalPages - 3 && <span className="text-gray-400 text-sm">…</span>}
                    <button onClick={() => onPage(totalPages)} className="w-9 h-9 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">{totalPages}</button>
                </>
            )}

            <button
                disabled={page >= totalPages}
                onClick={onNext}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

// ── Main Profiles Page ────────────────────────────────────────────────────────
const LIMIT_OPTIONS = [
    { label: '10 per page', value: 10 },
    { label: '20 per page', value: 20 },
    { label: '50 per page', value: 50 },
    { label: '100 per page', value: 100 },
];

const Profiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [interactions, setInteractions] = useState({});
    const [likedUsers, setLikedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    // Init state from URL params
    const initialFilters = useMemo(() => {
        return {
            name: searchParams.get('name') || '',
            gender: searchParams.get('gender') || '',
            ageMin: searchParams.get('ageMin') || '',
            ageMax: searchParams.get('ageMax') || '',
            location: searchParams.get('location') || '',
            profession: searchParams.get('profession') || '',
            maritalStatus: searchParams.get('maritalStatus') || '',
            religion: searchParams.get('religion') || '',
            education: searchParams.get('education') || '',
            heightMin: searchParams.get('heightMin') || '',
            heightMax: searchParams.get('heightMax') || '',
            withPhoto: searchParams.get('withPhoto') === 'true',
            recentlyActive: searchParams.get('recentlyActive') === 'true',
        };
    }, [searchParams]);

    const [filters, setFilters] = useState(initialFilters);
    const [searchInput, setSearchInput] = useState(initialFilters.name);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sync state changes to URL
    const updateFiltersAndParams = (newFilters) => {
        setFilters(newFilters);
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, val]) => {
            if (val === true) params.set(key, 'true');
            else if (val && val !== false) params.set(key, val);
        });
        // Keep pagination in URL too if needed (optional)
        setSearchParams(params);
        setPage(1);
    };

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            let rawData;
            if (filters.name.trim()) {
                rawData = await userService.searchUsers(filters.name.trim());
            } else {
                rawData = await userService.getUsers(page, limit, filters);
            }

            const list = extractProfiles(rawData);
            setProfiles(list);

            // Fetch sent and received interests and likes
            try {
                const [sentRes, receivedRes, likesRes] = await Promise.all([
                    interestService.getSentInterests(),
                    interestService.getReceivedInterests(),
                    likeService.getLikedUsers()
                ]);
                const sentList = sentRes?.data || sentRes?.interests || (Array.isArray(sentRes) ? sentRes : []);
                const receivedList = receivedRes?.data || receivedRes?.interests || (Array.isArray(receivedRes) ? receivedRes : []);
                const likedList = likesRes?.data || likesRes?.likes || (Array.isArray(likesRes) ? likesRes : []);

                const interactionMap = {};
                sentList.forEach(req => {
                    if (req.receiver?._id) {
                        interactionMap[req.receiver._id] = { type: 'sent', status: req.status, id: req._id };
                    }
                });
                receivedList.forEach(req => {
                    if (req.sender?._id) {
                        // If it's accepted, we can consider it matched. If pending, received.
                        interactionMap[req.sender._id] = { type: 'received', status: req.status, id: req._id };
                    }
                });
                setInteractions(interactionMap);

                // Assuming likedList is an array of users or an array of objects referring to users
                const likedIds = likedList.map(item => item._id || item);
                setLikedUsers(likedIds);
            } catch (err) {
                console.error('Failed to fetch interactions/likes map', err);
            }

            // Extract pagination info from various shapes
            const tp = rawData?.data?.totalPages
                || rawData?.totalPages
                || rawData?.data?.pages
                || Math.ceil((rawData?.data?.totalUsers || rawData?.totalUsers || list.length) / limit)
                || 1;
            const tu = rawData?.data?.totalUsers || rawData?.totalUsers || list.length || 0;

            setTotalPages(Number(tp) || 1);
            setTotalUsers(Number(tu) || 0);
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
            toast.error('Failed to load profiles. Please try again.');
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFiltersAndParams({ ...filters, name: searchInput });
    };

    const handleFilterChange = (field, value) => {
        updateFiltersAndParams({ ...filters, [field]: value });
    };

    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

    const clearFilters = () => {
        const cleared = {
            name: '', gender: '', ageMin: '', ageMax: '',
            location: '', profession: '', maritalStatus: '',
            religion: '', education: '', heightMin: '', heightMax: '',
            withPhoto: false, recentlyActive: false,
        };
        updateFiltersAndParams(cleared);
        setSearchInput('');
    };

    const handleRemoveProfile = (profileId) => {
        setProfiles(prev => prev.filter(p => p._id !== profileId));
    };

    const hasActiveFilters = Object.values(filters).some(val => !!val && val !== false);

    // ── Sidebar content (reused for both desktop & mobile overlay) ────────────
    const renderFilterPanel = () => (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary-600" />
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

            <div className="space-y-5">
                {/* Name search */}
                <form onSubmit={handleSearchSubmit}>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Search by Name
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="flex-1 bg-gray-50 py-2.5 px-3 text-sm outline-none placeholder:text-gray-400 min-w-0"
                            placeholder="e.g. Priya, Rahul"
                        />
                        <button
                            type="submit"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-3 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                {/* Gender filter */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Gender
                    </label>
                    <select
                        value={filters.gender}
                        onChange={e => handleFilterChange('gender', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    >
                        <option value="">Any Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Age Group */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Age Group
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.ageMin}
                            onChange={e => handleFilterChange('ageMin', e.target.value)}
                            className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.ageMax}
                            onChange={e => handleFilterChange('ageMax', e.target.value)}
                            className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                    </div>
                </div>

                {/* Location filter */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        value={filters.location}
                        onChange={e => handleFilterChange('location', e.target.value)}
                        placeholder="e.g. Mumbai, New York"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                </div>

                {/* Profession filter */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Profession
                    </label>
                    <input
                        type="text"
                        value={filters.profession}
                        onChange={e => handleFilterChange('profession', e.target.value)}
                        placeholder="e.g. Engineer, Doctor"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                </div>

                {/* Marital Status */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Marital Status
                    </label>
                    <select
                        value={filters.maritalStatus}
                        onChange={e => handleFilterChange('maritalStatus', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    >
                        <option value="">Any Status</option>
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                    </select>
                </div>

                {/* Religion */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Religion
                    </label>
                    <select
                        value={filters.religion}
                        onChange={e => handleFilterChange('religion', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    >
                        <option value="">Any Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Jain">Jain</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Education */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Education
                    </label>
                    <select
                        value={filters.education}
                        onChange={e => handleFilterChange('education', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    >
                        <option value="">Any Education</option>
                        <option value="B.Tech">B.Tech / B.E.</option>
                        <option value="MBA">MBA</option>
                        <option value="MBBS">MBBS / Medical</option>
                        <option value="M.Tech">M.Tech / M.E.</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="M.Sc">M.Sc</option>
                        <option value="B.Com">B.Com</option>
                        <option value="CA">CA / CS</option>
                        <option value="PhD">PhD</option>
                        <option value="Others">Others</option>
                    </select>
                </div>

                {/* Height Range */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Height (cm)
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.heightMin}
                            onChange={e => handleFilterChange('heightMin', e.target.value)}
                            className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.heightMax}
                            onChange={e => handleFilterChange('heightMax', e.target.value)}
                            className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                    </div>
                </div>

                {/* With Photo Toggle */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={filters.withPhoto}
                                onChange={e => handleFilterChange('withPhoto', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`block w-9 h-5 rounded-full transition-colors ${filters.withPhoto ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                            <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${filters.withPhoto ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">With Photo Only</span>
                    </label>
                </div>

                {/* Recently Active Toggle */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={filters.recentlyActive}
                                onChange={e => handleFilterChange('recentlyActive', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`block w-9 h-5 rounded-full transition-colors ${filters.recentlyActive ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                            <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${filters.recentlyActive ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">Recently Active</span>
                    </label>
                </div>

                {/* Limit per page */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        <LayoutList className="w-3 h-3 inline mr-1" />
                        Profiles per page
                    </label>
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    >
                        {LIMIT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                {/* ── Page header ────────────────────────────────────────── */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-1">Browse Profiles</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">
                            {totalUsers > 0 && !filters.name
                                ? `${totalUsers.toLocaleString()} verified profiles available`
                                : 'Find your perfect match from verified profiles'}
                        </p>
                    </div>
                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm"
                    >
                        <Filter className="w-4 h-4 text-primary-600" />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">

                    {/* ── Desktop Sidebar ───────────────────────────────── */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="lg:sticky lg:top-20">
                            {renderFilterPanel()}
                        </div>
                    </aside>

                    {/* ── Mobile Sidebar Overlay ────────────────────────── */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                            <div className="absolute top-0 left-0 h-full w-72 bg-gray-50 shadow-2xl overflow-y-auto p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-bold text-gray-900">Filters</span>
                                    <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {renderFilterPanel()}
                            </div>
                        </div>
                    )}

                    {/* ── Profile Grid ──────────────────────────────────── */}
                    <div className="flex-1 min-w-0">

                        {/* Results header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                            <span className="text-sm text-gray-500 font-medium">
                                {loading ? 'Loading…' : `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} found`}
                                {totalPages > 1 && !loading && (
                                    <span className="text-gray-400"> · Page {page} of {totalPages}</span>
                                )}
                            </span>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <span className="text-xs bg-primary-50 text-primary-700 font-semibold px-3 py-1 rounded-full border border-primary-100">
                                        Filtered
                                    </span>
                                )}
                                {/* Inline limit selector (visible on desktop result bar) */}
                                <select
                                    value={limit}
                                    onChange={handleLimitChange}
                                    className="hidden sm:block text-xs bg-white border border-gray-200 rounded-lg py-1.5 px-2 outline-none text-gray-600 focus:border-primary-300"
                                >
                                    {LIMIT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
                                {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
                                    <ProfileSkeleton key={i} />
                                ))}
                            </div>
                        ) : profiles.length === 0 ? (
                            <EmptyState onClear={hasActiveFilters ? clearFilters : null} />
                        ) : (
                            <>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
                                    {profiles.map(profile => (
                                        <ProfileCard
                                            key={profile._id}
                                            profile={profile}
                                            interaction={interactions[profile._id]}
                                            isLiked={likedUsers.includes(profile._id)}
                                            onRemove={handleRemoveProfile}
                                            onLikeToggle={(id, isLikedNow) => {
                                                setLikedUsers(prev =>
                                                    isLikedNow ? [...prev, id] : prev.filter(userId => userId !== id)
                                                );
                                            }}
                                            onInteractionChange={(newInteraction) => {
                                                setInteractions(prev => ({
                                                    ...prev,
                                                    [profile._id]: newInteraction
                                                }));
                                            }}
                                        />
                                    ))}
                                </div>

                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPrev={() => setPage(p => Math.max(1, p - 1))}
                                    onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                                    onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profiles;
