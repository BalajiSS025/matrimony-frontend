import api from './api';

export const notificationService = {
    // GET /api/notifications
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    // PATCH /api/notifications/read/:id
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/read/${id}`);
        return response.data;
    },
    // PATCH /api/notifications/read-all
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },
};
