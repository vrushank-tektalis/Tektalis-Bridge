import api from './axios';

export const bugsAPI = {
  listByProject: (projectId, params) => api.get(`/projects/${projectId}/bugs`, { params }),
  get: (id) => api.get(`/bugs/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/bugs`, data),
  update: (id, data) => api.put(`/bugs/${id}`, data),
  delete: (id) => api.delete(`/bugs/${id}`),
};
