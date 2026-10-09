import api from './axios';

export const developerRequestsAPI = {
  create: (projectId, data) => api.post(`/projects/${projectId}/developer-requests`, data),
  list: (params) => api.get('/developer-requests', { params }),
  get: (id) => api.get(`/developer-requests/${id}`),
  update: (id, data) => api.put(`/developer-requests/${id}`, data),
};
