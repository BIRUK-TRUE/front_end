import { axiosInstance } from './axios';

export const scheduleService = {
  // Get schedule for a section (all teacher-subject assignments)
  async getSectionSchedule(sectionId: string, termId?: string) {
    const params = termId ? { term_id: termId } : {};
    const { data } = await axiosInstance.get(`/schedule/section/${sectionId}`, { params });
    return data;
  },

  // Get schedule for a teacher (all their section-subject assignments)
  async getTeacherSchedule(teacherId: string, termId?: string) {
    const params = termId ? { term_id: termId } : {};
    const { data } = await axiosInstance.get(`/schedule/teacher/${teacherId}`, { params });
    return data;
  },
};
