import { axiosInstance } from './axios';

export interface GuardianFilters {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  has_students?: boolean;
  sort_by?: 'created_at' | 'full_name' | 'email';
  sort_order?: 'asc' | 'desc';
}

export interface StudentLinkPayload {
  student_id: string;
  relationship_type:
    | 'father'
    | 'mother'
    | 'guardian'
    | 'uncle'
    | 'aunt'
    | 'grandparent'
    | 'sibling'
    | 'other';
  is_primary?: boolean;
  is_emergency_contact?: boolean;
  can_pickup?: boolean;
}

export const guardiansService = {
  async getAll(filters: GuardianFilters = {}) {
    console.log('🔍 [Guardians Service] Fetching guardians with filters:', filters);
    
    try {
      const { data } = await axiosInstance.get('/guardians', { params: filters });
      
      console.log('✅ [Guardians Service] API Response received');
      console.log('✅ [Guardians Service] Data:', data);
      console.log('✅ [Guardians Service] Items:', data?.items);
      console.log('✅ [Guardians Service] Items length:', data?.items?.length);

      if (!data || !Array.isArray(data.items)) {
        console.warn('⚠️ [Guardians Service] Invalid response format, returning empty');
        return { items: [], total: 0, page: 1, size: 20, pages: 0 };
      }

      return data;
    } catch (error: any) {
      console.error('❌ [Guardians Service] Error fetching guardians:', error);
      console.error('❌ [Guardians Service] Error response:', error.response);
      throw error;
    }
  },

  async getById(id: string) {
    const { data } = await axiosInstance.get(`/guardians/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await axiosInstance.get('/guardians/stats/summary');
    // Normalize backend field names to what the dashboard expects
    return {
      total: data.total_guardians ?? data.total ?? 0,
      active: data.active_guardians ?? data.active ?? 0,
      growth: data.growth ?? 0,
    };
  },

  async getForStudent(studentId: string) {
    const { data } = await axiosInstance.get(
      `/guardians/student/${studentId}/guardians`
    );
    return data;
  },

  async create(payload: {
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    password?: string;
    occupation?: string;
    workplace?: string;
    student_links?: StudentLinkPayload[];
  }) {
    const { data } = await axiosInstance.post('/guardians', payload);
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
      occupation?: string;
      workplace?: string;
    }
  ) {
    const { data } = await axiosInstance.patch(`/guardians/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    const { data } = await axiosInstance.delete(`/guardians/${id}`);
    return data;
  },

  async linkStudent(guardianId: string, payload: StudentLinkPayload) {
    const { data } = await axiosInstance.post(
      `/guardians/${guardianId}/students`,
      payload
    );
    return data;
  },

  async unlinkStudent(guardianId: string, studentId: string) {
    const { data } = await axiosInstance.delete(
      `/guardians/${guardianId}/students/${studentId}`
    );
    return data;
  },

  async exportCsv() {
    const response = await axiosInstance.get('/guardians/export/csv', {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `guardians_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
