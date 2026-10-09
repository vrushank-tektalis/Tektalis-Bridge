import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  refresh: (data) => api.post('/auth/refresh', data),
  logout: (data) => api.post('/auth/logout', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
};
