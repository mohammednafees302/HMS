import { api } from '../utils/api';

export const userService = {
  getUsers: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/users/me', data);
    return res.data;
  },
  uploadAvatar: async (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await api.post('/users/me/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
};
