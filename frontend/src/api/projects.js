import api from './axios';

export const projectsAPI = {
  list: (params) => api.get('/projects', { params }),
  listAvailable: (params) => api.get('/projects/available', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  changeStage: (id, data) => api.put(`/projects/${id}/stage`, data),
  assignDeveloper: (id, data) => api.post(`/projects/${id}/assign-developer`, data),
  removeDeveloper: (id, devId) => api.delete(`/projects/${id}/developers/${devId}`),
  getActivity: (id, params) => api.get(`/projects/${id}/activity`, { params }),
};
