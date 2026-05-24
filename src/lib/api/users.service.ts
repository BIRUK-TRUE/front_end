import { axiosInstance } from './axios';

export interface UserFilters {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  role_name?: string;
  /** @deprecated Use role_name instead */
  role?: string;
  sort_by?: 'created_at' | 'full_name' | 'email';
  sort_order?: 'asc' | 'desc';
}

export const usersService = {
  async getAll(filters: UserFilters = {}) {
    // Normalise legacy `role` param → `role_name` that the backend expects
    const params = { ...filters };
    if (params.role && !params.role_name) {
      params.role_name = params.role;
    }
    delete params.role;
    
    // Debug logging
    console.log('🔍 usersService.getAll called with filters:', filters);
    console.log('🔍 Sending params to backend:', params);
    
    const { data } = await axiosInstance.get('/users', { params });
    
    console.log('✅ usersService.getAll RAW response:', JSON.stringify(data, null, 2));
    console.log('✅ Response type:', typeof data);
    console.log('✅ Has items?:', Array.isArray(data?.items));
    console.log('✅ Items length:', data?.items?.length);
    console.log('✅ Total:', data?.total);
    
    // Ensure we always return a properly structured response
    if (!data) {
      console.error('❌ No data returned from API');
      return { items: [], total: 0, page: 1, size: 20, pages: 0 };
    }
    
    if (!Array.isArray(data.items)) {
      console.error('❌ data.items is not an array:', data.items);
      return { items: [], total: 0, page: 1, size: 20, pages: 0 };
    }
    
    return data;
  },

  async getById(id: string) {
    const { data } = await axiosInstance.get(`/users/${id}`);
    return data;
  },

  async getMe() {
    const { data } = await axiosInstance.get('/users/me');
    return data;
  },

  async getRoles() {
    const { data } = await axiosInstance.get('/users/roles/all');
    return data;
  },

  async getStats() {
    const { data } = await axiosInstance.get('/users/stats/summary');
    // Normalize backend field names to what the dashboard expects
    return {
      total: data.total_users ?? data.total ?? 0,
      active: data.active_users ?? data.active ?? 0,
      inactive: data.inactive_users ?? data.inactive ?? 0,
      growth: data.growth ?? 0,
    };
  },

  async create(payload: {
    email: string;
    full_name: string;
    password?: string;
    phone_number?: string;
    address?: string;
    role_names: string[];
  }) {
    const { data } = await axiosInstance.post('/users', payload);
    return data;
  },

  async update(
    id: string,
    payload: {
      full_name?: string;
      phone_number?: string;
      address?: string;
      profile_image_url?: string;
      is_active?: boolean;
    }
  ) {
    const { data } = await axiosInstance.patch(`/users/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    const { data } = await axiosInstance.delete(`/users/${id}`);
    return data;
  },

  async restore(id: string) {
    const { data } = await axiosInstance.post(`/users/${id}/restore`);
    return data;
  },

  async updateRoles(id: string, roleNames: string[]) {
    const { data } = await axiosInstance.put(`/users/${id}/roles`, {
      role_names: roleNames,
    });
    return data;
  },
};
