import api from './api';

export const interestService = {
    // POST /api/interests/send/:userId
    sendInterest: async (userId) => {
        // We pass an empty object {} as the second argument (the body)
        const response = await api.post(`/interests/send/${userId}`, {});
        return response.data;
    },

    // PATCH /api/interests/accept/:id
    acceptInterest: async (interestId) => {
        const response = await api.patch(`/interests/accept/${interestId}`, {});
        return response.data;
    },

    rejectInterest: async (interestId) => {
        const response = await api.patch(`/interests/reject/${interestId}`, {});
        return response.data;
    },

    getSentInterests: async () => {
        const response = await api.get('/interests/sent');
        return response.data;
    },

    getReceivedInterests: async () => {
        const response = await api.get('/interests/received');
        return response.data;
    },
};