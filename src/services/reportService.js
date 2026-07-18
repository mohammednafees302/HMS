import { api } from '../utils/api';

export const reportService = {
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  }
};
