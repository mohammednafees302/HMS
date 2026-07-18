import { api } from '../utils/api';

export const dashboardService = {
  /**
   * Fetch all real-time dashboard data in a single request:
   * stats, chart data, recent patients, today's appointments.
   */
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
