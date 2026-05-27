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
    console.log('🔍 [Students Service] Fetching students with filters:', filters);
    
    try {
      const { data } = await axiosInstance.get('/students', { params: filters });
      
      console.log('✅ [Students Service] API Response received');
      console.log('✅ [Students Service] Data:', data);
      console.log('✅ [Students Service] Items:', data?.items);
      console.log('✅ [Students Service] Items length:', data?.items?.length);

      if (!data) {
        console.warn('⚠️ [Students Service] No data received, returning empty');
        return { items: [], total: 0, page: 1, size: 20, pages: 0 };
      }

      if (!Array.isArray(data.items)) {
        console.warn('⚠️ [Students Service] Invalid response format, returning empty');
        return { items: [], total: 0, page: 1, size: 20, pages: 0 };
      }

      return data;
    } catch (error: any) {
      console.error('❌ [Students Service] Error fetching students:', error);
      console.error('❌ [Students Service] Error response:', error.response);
      throw error;
    }
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
    const { data } = await axiosInstance.get('/students/stats/summary');

    return {
      total: data.total_students ?? data.total ?? 0,
      active: data.active_students ?? data.active ?? 0,
      male: data.male_students ?? 0,
      female: data.female_students ?? 0,
      graduated: data.graduated_students ?? 0,
      growth: data.growth ?? 0,
    };
  },

  async create(payload: {
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    password?: string;
    date_of_birth: string;
    sex: 'M' | 'F';
    nationality?: string;
    previous_school?: string;
    ministry_exam_result?: string;
    admission_date: string;
    status?: string;
  }) {
    const { data } = await axiosInstance.post('/students', payload);
    return data;
  },

  async update(id: string, payload: Record<string, unknown>) {
    const { data } = await axiosInstance.patch(`/students/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    await axiosInstance.delete(`/students/${id}`);
  },

  async restore(id: string) {
    const { data } = await axiosInstance.post(`/students/${id}/restore`);
    return data;
  },

  async exportCsv(filters: StudentFilters = {}) {
    const { data } = await axiosInstance.get('/students/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};
