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

    console.log('🔍 [Users Service] Fetching users with filters:', params);
    console.log('🔍 [Users Service] API URL:', '/users');
    console.log('🔍 [Users Service] Base URL:', axiosInstance.defaults.baseURL);
    
    try {
      const { data } = await axiosInstance.get('/users', { params });
      
      console.log('✅ [Users Service] API Response received');
      console.log('✅ [Users Service] Data:', data);
      console.log('✅ [Users Service] Items:', data?.items);
      console.log('✅ [Users Service] Total:', data?.total);
      console.log('✅ [Users Service] Is array?', Array.isArray(data?.items));
      console.log('✅ [Users Service] Items length:', data?.items?.length);

      if (!data || !Array.isArray(data.items)) {
        console.warn('⚠️ [Users Service] Invalid response format, returning empty');
        return { items: [], total: 0, page: 1, size: 20, pages: 0 };
      }

      return data;
    } catch (error: any) {
      console.error('❌ [Users Service] Error fetching users:', error);
      console.error('❌ [Users Service] Error response:', error.response);
      console.error('❌ [Users Service] Error status:', error.response?.status);
      console.error('❌ [Users Service] Error data:', error.response?.data);
      
      // Add more specific error information
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ [Users Service] Connection refused - backend server may be down');
      }
      if (error.code === 'NETWORK_ERROR') {
        console.error('❌ [Users Service] Network error - check internet connection');
      }
      
      throw error;
      console.error('❌ [Users Service] Error status:', error.response?.status);
      console.error('❌ [Users Service] Error data:', error.response?.data);
      console.error('❌ [Users Service] Error message:', error.message);
      throw error;
    }
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
