import { axiosInstance } from './axios';

export interface StudentFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'graduated' | 'transferred' | 'expelled' | 'withdrawn';
  is_active?: boolean;
  sex?: 'M' | 'F';
  nationality?: string;
  sort_by?: 'created_at' | 'full_name' | 'registration_number' | 'admission_date';
  sort_order?: 'asc' | 'desc';
}

export const studentsService = {
  async getAll(filters: StudentFilters = {}) {
    console.log('🔍 studentsService.getAll called with filters:', filters);
    
    const { data } = await axiosInstance.get('/students', { params: filters });
    
    console.log('✅ studentsService.getAll RAW response:', JSON.stringify(data, null, 2));
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
    const { data } = await axiosInstance.get(`/students/${id}`);
    return data;
  },

  async getByRegistration(regNumber: string) {
    const { data } = await axiosInstance.get(
      `/students/registration/${regNumber}`
    );
    return data;
  },

  async getStats() {
    console.log('🔍 studentsService.getStats called');
    
    const { data } = await axiosInstance.get('/students/stats/summary');
    
    console.log('✅ studentsService.getStats response:', data);
    
    // Normalize backend field names to what the dashboard expects
    const normalized = {
      total: data.total_students ?? data.total ?? 0,
      active: data.active_students ?? data.active ?? 0,
      male: data.male_students ?? 0,
      female: data.female_students ?? 0,
      graduated: data.graduated_students ?? 0,
      growth: data.growth ?? 0,
    };
    
    console.log('✅ Normalized stats:', normalized);
    
    return normalized;
  },

  async create(payload: {
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    password?: string;
    admission_date: string;
    date_of_birth: string;
    sex: 'M' | 'F';
    nationality?: string;
    previous_school?: string;
    ministry_exam_result?: number;
    guardian_id?: string;
    profile_image_url?: string;
  }) {
    const { data } = await axiosInstance.post('/students', payload);
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
      nationality?: string;
      previous_school?: string;
      ministry_exam_result?: number;
    }
  ) {
    const { data } = await axiosInstance.patch(`/students/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    const { data } = await axiosInstance.delete(`/students/${id}`);
    return data;
  },

  async restore(id: string) {
    const { data } = await axiosInstance.post(`/students/${id}/restore`);
    return data;
  },
};
