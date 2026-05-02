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
    const { data } = await axiosInstance.get('/teachers', { params: filters });
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
    return data;
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
};
