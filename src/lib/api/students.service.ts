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
    const { data } = await axiosInstance.get('/students', { params: filters });
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
    const { data } = await axiosInstance.get('/students/stats/summary');
    // Normalize backend field names to what the dashboard expects
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
