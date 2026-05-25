import { axiosInstance } from './axios';

export interface TeacherFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'retired';
  is_active?: boolean;
  specialization?: string;
  sort_by?: 'created_at' | 'full_name' | 'employee_id' | 'hire_date';
  sort_order?: 'asc' | 'desc';
}

export const teachersService = {
  async getAll(filters: TeacherFilters = {}) {
    console.log('🔍 teachersService.getAll called with filters:', filters);
    
    const { data } = await axiosInstance.get('/teachers', { params: filters });
    
    console.log('✅ teachersService.getAll RAW response:', JSON.stringify(data, null, 2));
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
    const { data } = await axiosInstance.get(`/teachers/${id}`);
    return data;
  },

  async getByEmployeeId(employeeId: string) {
    const { data } = await axiosInstance.get(
      `/teachers/employee/${employeeId}`
    );
    return data;
  },

  async getStats() {
    const { data } = await axiosInstance.get('/teachers/stats/summary');
    // Normalize backend field names to what the dashboard expects
    return {
      total: data.total_teachers ?? data.total ?? 0,
      active: data.active_teachers ?? data.active ?? 0,
      on_leave: data.on_leave_teachers ?? 0,
      growth: data.growth ?? 0,
    };
  },

  async create(payload: {
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    password?: string;
    hire_date: string;
    date_of_birth: string;
    sex: 'M' | 'F';
    qualification?: string;
    specialization?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    office_location?: string;
  }) {
    const { data } = await axiosInstance.post('/teachers', payload);
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
      status?: string;
      qualification?: string;
      specialization?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      office_location?: string;
    }
  ) {
    const { data } = await axiosInstance.patch(`/teachers/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    const { data } = await axiosInstance.delete(`/teachers/${id}`);
    return data;
  },

  async restore(id: string) {
    const { data } = await axiosInstance.post(`/teachers/${id}/restore`);
    return data;
  },

  async exportCsv() {
    const response = await axiosInstance.get('/teachers/export/csv', {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
