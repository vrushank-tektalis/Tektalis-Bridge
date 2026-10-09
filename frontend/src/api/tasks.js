import api from './axios';

export const tasksAPI = {
  listByProject: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  get: (id) => api.get(`/tasks/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};
