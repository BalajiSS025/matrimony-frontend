import api from './api';

export const userService = {
    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    // page, limit, filters supported — returns { users, totalPages, currentPage, totalUsers }
    getUsers: async (page = 1, limit = 10, filters = {}) => {
        let url = `/users/browse?page=${page}&limit=${limit}`;
        if (typeof filters === 'string') {
            if (filters) url += `&gender=${filters}`;
        } else {
            if (filters.gender) url += `&gender=${filters.gender}`;
            if (filters.ageMin) url += `&ageMin=${filters.ageMin}`;
            if (filters.ageMax) url += `&ageMax=${filters.ageMax}`;
            if (filters.location) url += `&location=${encodeURIComponent(filters.location)}`;
            if (filters.profession) url += `&profession=${encodeURIComponent(filters.profession)}`;
            if (filters.maritalStatus) url += `&maritalStatus=${encodeURIComponent(filters.maritalStatus)}`;
            if (filters.religion) url += `&religion=${encodeURIComponent(filters.religion)}`;
            if (filters.education) url += `&education=${encodeURIComponent(filters.education)}`;
            if (filters.heightMin) url += `&heightMin=${filters.heightMin}`;
            if (filters.heightMax) url += `&heightMax=${filters.heightMax}`;
            if (filters.withPhoto === true || filters.withPhoto === 'true') url += `&withPhoto=true`;
            if (filters.recentlyActive === true || filters.recentlyActive === 'true') url += `&recentlyActive=true`;
        }
        const response = await api.get(url);
        return response.data;
    },
    searchUsers: async (name) => {
        const response = await api.get(`/users/search?name=${encodeURIComponent(name)}`);
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('/users/update-profile', data);
        return response.data;
    },
    uploadFiles: async (formData) => {
        const response = await api.post('/users/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    blockUser: async (userId) => {
        const response = await api.post(`/users/block/${userId}`);
        return response.data;
    },
    // GET /api/users/blocked
    getBlockedUsers: async () => {
        const response = await api.get('/users/blocked');
        return response.data;
    },
    unblockUser: async (userId) => {
        const response = await api.patch(`/users/unblock/${userId}`);
        return response.data;
    },

    getNewThisWeek: async () => {
        const response = await api.get('/users/browse?newThisWeek=true&limit=30');
        return response.data;
    },
    getKundaliScore: async (userId) => {
        const response = await api.get(`/users/kundali/${userId}`);
        return response.data;
    },

    getProfileViewers: async () => {
        const response = await api.get('/users/viewers');
        return response.data;
    },

    reportUser: async ({ reportedUserId, reason, details }) => {
        const response = await api.post('/reports', { reportedUserId, reason, details });
        return response.data;
    },
};
