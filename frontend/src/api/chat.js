import api from './axios';

export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  getMessages: (roomId, params) => api.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, data) => api.post(`/chat/rooms/${roomId}/messages`, data),
};
