import { api } from '../utils/api';

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};
