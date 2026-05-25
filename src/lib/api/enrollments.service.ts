import { axiosInstance } from './axios';

export const enrollmentsService = {
  async enroll(payload: { student_id: string; section_id: string; remarks?: string }) {
    const { data } = await axiosInstance.post('/enrollments', payload);
    return data;
  },

  async getById(id: string) {
    const { data } = await axiosInstance.get(`/enrollments/${id}`);
    return data;
  },

  async update(id: string, payload: { remarks?: string }) {
    const { data } = await axiosInstance.patch(`/enrollments/${id}`, payload);
    return data;
  },

  async withdraw(id: string, payload: { reason?: string }) {
    const { data } = await axiosInstance.post(`/enrollments/${id}/withdraw`, payload);
    return data;
  },

  async transfer(id: string, payload: { new_section_id: string; reason?: string }) {
    const { data } = await axiosInstance.post(`/enrollments/${id}/transfer`, payload);
    return data;
  },

  async getBySection(sectionId: string, params: { page?: number; size?: number; status?: string } = {}) {
    const { data } = await axiosInstance.get(`/enrollments/section/${sectionId}`, { params });
    return data;
  },

  async getByStudent(studentId: string, params: { page?: number; size?: number } = {}) {
    const { data } = await axiosInstance.get(`/enrollments/student/${studentId}`, { params });
    return data;
  },

  async getByYear(yearId: string, params: { page?: number; size?: number; status?: string; search?: string } = {}) {
    const { data } = await axiosInstance.get(`/enrollments/year/${yearId}`, { params });
    return data;
  },

  async getYearStats(yearId: string) {
    const { data } = await axiosInstance.get(`/enrollments/year/${yearId}/stats`);
    return data;
  },

  async getHistoricalStats() {
    const { data } = await axiosInstance.get('/enrollments/historical-stats');
    return data;
  },
};
