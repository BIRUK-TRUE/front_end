import { axiosInstance } from './axios';

export interface AdminLog {
  id: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  description: string;
  ip_address: string | null;
  status: string;
  created_at: string;
}

export interface AdminLogFilters {
  page?: number;
  size?: number;
  actor_id?: string;
  action?: string;
  resource_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export const adminLogsService = {
  async getAll(filters: AdminLogFilters = {}) {
    const { data } = await axiosInstance.get('/admin-logs', { params: filters });
    return data;
  },

  async getById(id: string) {
    const { data } = await axiosInstance.get(`/admin-logs/${id}`);
    return data;
  },

  async getActionTypes() {
    const { data } = await axiosInstance.get('/admin-logs/actions');
    return data;
  },

  async getResourceTypes() {
    const { data } = await axiosInstance.get('/admin-logs/resource-types');
    return data;
  },
};
