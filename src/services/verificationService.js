import api from './api';

export const verificationService = {
  submitVerification: async (formData) => {
    const response = await api.post('/verification/request', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyStatus: async () => {
    const response = await api.get('/verification/status');
    return response.data;
  },

  // Admin
  getPendingVerifications: async () => {
    const response = await api.get('/verification/pending');
    return response.data;
  },

  approveVerification: async (id, verificationTypes) => {
    const response = await api.patch(`/verification/${id}/approve`, { verificationTypes });
    return response.data;
  },

  rejectVerification: async (id, adminNote) => {
    const response = await api.patch(`/verification/${id}/reject`, { adminNote });
    return response.data;
  },
};
