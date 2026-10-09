import api from './axios';

export const aiAPI = {
  analyzeProject: (data) => api.post('/ai/analyze-project', data),
  getRequest: (id) => api.get(`/ai/requests/${id}`),
};
