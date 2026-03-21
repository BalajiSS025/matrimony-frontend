/**
 * Safely get a profile field value.
 * Returns 'Not Provided' if value is null, undefined, or empty string.
 */
export const safeField = (value, fallback = 'Not Provided') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value).trim() || fallback;
};

/**
 * Extract an array of profiles from various API response shapes:
 *   - { data: { users: [...] } }
 *   - { data: [...] }
 *   - { users: [...] }
 *   - [...]
 */
export const extractProfiles = (responseData) => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData.data)) return responseData.data;
    if (responseData.data && Array.isArray(responseData.data.users)) return responseData.data.users;
    if (Array.isArray(responseData.users)) return responseData.users;
    if (responseData.data && typeof responseData.data === 'object') {
        const values = Object.values(responseData.data);
        const arr = values.find(v => Array.isArray(v));
        if (arr) return arr;
    }
    return [];
};

/**
 * Extract a single profile from various API response shapes:
 *   - { data: { ...profile } }
 *   - { data: { user: { ...profile } } }
 *   - { user: { ...profile } }
 *   - { ...profile }
 */
export const extractProfile = (responseData) => {
    if (!responseData) return null;
    if (responseData.data?.user) return responseData.data.user;
    if (responseData.data && responseData.data._id) return responseData.data;
    if (responseData.user) return responseData.user;
    if (responseData._id) return responseData;
    if (responseData.data && typeof responseData.data === 'object') return responseData.data;
    return responseData;
};

/**
 * Build a fallback avatar URL using UI Avatars service
 */
export const getAvatarUrl = (name, bgColor = 'f1cdcd', textColor = '8f2c2c', size = 256) => {
    const safeName = name && name.trim() ? name.trim() : 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=${bgColor}&color=${textColor}&size=${size}&bold=true`;
};

/**
 * Get profile photo, falling back to avatar if not present
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getProfilePhoto = (profile, size = 256) => {
    if (Array.isArray(profile?.photos) && profile.photos.length > 0) {
        const p = profile.photos[0];
        return p.startsWith('http') ? p : `${BASE_URL}${p}`;
    }

    if (profile?.profilePhoto) {
        const p = profile.profilePhoto;
        return p.startsWith('http') ? p : `${BASE_URL}${p}`;
    }

    const name = profile?.name || 'U';
    const gender = String(profile?.gender || '').toLowerCase();

    // Feminine colors (Pink/Maroon)
    if (gender === 'female') {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fce7f3&color=9d174d&size=${size}&bold=true`;
    }
    // Masculine colors (Blue)
    if (gender === 'male') {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0f2fe&color=075985&size=${size}&bold=true`;
    }

    // Default fallback
    return getAvatarUrl(name, 'f1cdcd', '8f2c2c', size);
};