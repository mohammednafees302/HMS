import { api } from '../utils/api';

export const departmentService = {
  getDepartments: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  getDepartmentById: async (id) => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },
  createDepartment: async (data) => {
    const res = await api.post('/departments', data);
    return res.data;
  },
  updateDepartment: async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },
  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  }
};
