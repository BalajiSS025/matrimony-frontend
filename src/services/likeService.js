import api from './api';

export const likeService = {
    // POST /likes/:userId
    likeUser: async (userId) => {
        const response = await api.post(`users/like/${userId}`);
        return response.data;
    },
    // DELETE /likes/:userId
    unlikeUser: async (userId) => {
        const response = await api.delete(`users/like/${userId}`);
        return response.data;
    },
    // GET /likes
    getLikedUsers: async () => {
        const response = await api.get('users/likes');
        return response.data;
    }
};
