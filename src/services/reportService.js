import api from './api';

export const reportService = {
  createReport: async ({ reportedUserId, reason, details }) => {
    const response = await api.post('/reports', { reportedUserId, reason, details });
    return response.data;
  },

  getMyReports: async () => {
    const response = await api.get('/reports/my');
    return response.data;
  },

  // Admin
  getAllReports: async (status = 'pending', page = 1) => {
    const response = await api.get(`/reports?status=${status}&page=${page}`);
    return response.data;
  },

  updateReportStatus: async (reportId, status, adminNote) => {
    const response = await api.patch(`/reports/${reportId}`, { status, adminNote });
    return response.data;
  },
};
