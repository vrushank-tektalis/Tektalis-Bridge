import api from './axios';

export const developersAPI = {
  list: (params) => api.get('/developers', { params }),
  get: (id) => api.get(`/developers/${id}`),
  create: (data) => api.post('/developers', data),
  update: (id, data) => api.put(`/developers/${id}`, data),
  delete: (id) => api.delete(`/developers/${id}`),
  getProjects: (id, params) => api.get(`/developers/${id}/projects`, { params }),
};
