import api from './axios';

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};
