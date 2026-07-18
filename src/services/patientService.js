import { api } from '../utils/api';

export const patientService = {
  getAll: async (params = {}) => {
    // params can include search, status, department, page, limit, sort, order
    const response = await api.get('/patients', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  }
};
