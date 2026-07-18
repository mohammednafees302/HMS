import { api } from '../utils/api';

export const appointmentService = {
  getAppointments: async (params) => {
    const res = await api.get('/appointments', { params });
    return res.data;
  },
  getAppointmentById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },
  createAppointment: async (data) => {
    const res = await api.post('/appointments', data);
    return res.data;
  },
  updateAppointment: async (id, data) => {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data;
  },
  deleteAppointment: async (id) => {
    const res = await api.delete(`/appointments/${id}`);
    return res.data;
  }
};
