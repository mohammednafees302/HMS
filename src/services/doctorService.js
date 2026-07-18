import { api } from '../utils/api';

export const doctorService = {
  getDoctors: async (params) => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },
  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },
  createDoctor: async (data) => {
    const res = await api.post('/doctors', data);
    return res.data;
  },
  updateDoctor: async (id, data) => {
    const res = await api.put(`/doctors/${id}`, data);
    return res.data;
  },
  deleteDoctor: async (id) => {
    const res = await api.delete(`/doctors/${id}`);
    return res.data;
  }
};
