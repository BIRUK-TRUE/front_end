import { axiosInstance } from './axios';

// ── Academic Years ──────────────────────────────────────────────────────────

export const academicsService = {
  // Academic Years
  async getYears(params: { page?: number; size?: number; status?: string; search?: string } = {}) {
    const { data } = await axiosInstance.get('/academics/years', { params: { size: 100, ...params } });
    return data;
  },

  async getCurrentYear() {
    const { data } = await axiosInstance.get('/academics/years/current');
    return data;
  },

  async getYear(id: string) {
    const { data } = await axiosInstance.get(`/academics/years/${id}`);
    return data;
  },

  async createYear(payload: { name: string; start_date: string; end_date: string; is_current?: boolean }) {
    const { data } = await axiosInstance.post('/academics/years', payload);
    return data;
  },

  async updateYear(id: string, payload: Partial<{ name: string; start_date: string; end_date: string; is_current: boolean; status: string }>) {
    const { data } = await axiosInstance.patch(`/academics/years/${id}`, payload);
    return data;
  },

  async deleteYear(id: string) {
    const { data } = await axiosInstance.delete(`/academics/years/${id}`);
    return data;
  },

  // Terms
  async getTerms(yearId: string) {
    const { data } = await axiosInstance.get(`/academics/years/${yearId}/terms`);
    return data;
  },

  async getCurrentTerm() {
    const { data } = await axiosInstance.get('/academics/terms/current');
    return data;
  },

  async getTerm(termId: string) {
    const { data } = await axiosInstance.get(`/academics/terms/${termId}`);
    return data;
  },

  async createTerm(yearId: string, payload: { name: string; term_number: number; start_date: string; end_date: string; is_current?: boolean }) {
    const { data } = await axiosInstance.post(`/academics/years/${yearId}/terms`, payload);
    return data;
  },

  async updateTerm(termId: string, payload: Partial<{ name: string; start_date: string; end_date: string; is_current: boolean }>) {
    const { data } = await axiosInstance.patch(`/academics/terms/${termId}`, payload);
    return data;
  },

  async deleteTerm(termId: string) {
    const { data } = await axiosInstance.delete(`/academics/terms/${termId}`);
    return data;
  },

  // Subjects
  async getSubjects(params: { page?: number; size?: number; category?: string; is_active?: boolean; search?: string } = {}) {
    const { data } = await axiosInstance.get('/academics/subjects', { params: { size: 100, ...params } });
    return data;
  },

  async getSubject(id: string) {
    const { data } = await axiosInstance.get(`/academics/subjects/${id}`);
    return data;
  },

  async createSubject(payload: { name: string; code: string; description?: string; category?: string; credit_hours?: number }) {
    const { data } = await axiosInstance.post('/academics/subjects', payload);
    return data;
  },

  async updateSubject(id: string, payload: Partial<{ name: string; code: string; description: string; category: string; is_active: boolean }>) {
    const { data } = await axiosInstance.patch(`/academics/subjects/${id}`, payload);
    return data;
  },

  async deleteSubject(id: string) {
    const { data } = await axiosInstance.delete(`/academics/subjects/${id}`);
    return data;
  },

  // Classes
  async getClasses(yearId: string, params: { page?: number; size?: number } = {}) {
    const { data } = await axiosInstance.get(`/academics/years/${yearId}/classes`, { params: { size: 100, ...params } });
    return data;
  },

  async getClass(id: string) {
    const { data } = await axiosInstance.get(`/academics/classes/${id}`);
    return data;
  },

  async createClass(yearId: string, payload: { name: string; grade_level: number; capacity?: number }) {
    const { data } = await axiosInstance.post(`/academics/years/${yearId}/classes`, payload);
    return data;
  },

  async updateClass(id: string, payload: Partial<{ name: string; capacity: number }>) {
    const { data } = await axiosInstance.patch(`/academics/classes/${id}`, payload);
    return data;
  },

  async deleteClass(id: string) {
    const { data } = await axiosInstance.delete(`/academics/classes/${id}`);
    return data;
  },

  // Sections
  async getSections(classId: string) {
    const { data } = await axiosInstance.get(`/academics/classes/${classId}/sections`);
    return data;
  },

  async getSection(id: string) {
    const { data } = await axiosInstance.get(`/academics/sections/${id}`);
    return data;
  },

  async getSectionStudents(sectionId: string, params: { page?: number; size?: number; status?: string } = {}) {
    const { data } = await axiosInstance.get(`/academics/sections/${sectionId}/students`, { params });
    return data;
  },

  async createSection(classId: string, payload: { name: string; capacity?: number; homeroom_teacher_id?: string }) {
    const { data } = await axiosInstance.post(`/academics/classes/${classId}/sections`, payload);
    return data;
  },

  async updateSection(id: string, payload: Partial<{ name: string; capacity: number; homeroom_teacher_id: string }>) {
    const { data } = await axiosInstance.patch(`/academics/sections/${id}`, payload);
    return data;
  },

  async deleteSection(id: string) {
    const { data } = await axiosInstance.delete(`/academics/sections/${id}`);
    return data;
  },

  // Class Subjects
  async getClassSubjects(classId: string) {
    const { data } = await axiosInstance.get(`/academics/classes/${classId}/subjects`);
    return data;
  },

  async assignSubjectToClass(classId: string, payload: { subject_id: string; weekly_periods?: number }) {
    const { data } = await axiosInstance.post(`/academics/classes/${classId}/subjects`, payload);
    return data;
  },

  async updateClassSubject(csId: string, payload: Partial<{ weekly_periods: number; is_active: boolean }>) {
    const { data } = await axiosInstance.patch(`/academics/class-subjects/${csId}`, payload);
    return data;
  },

  async removeSubjectFromClass(classId: string, subjectId: string) {
    const { data } = await axiosInstance.delete(`/academics/classes/${classId}/subjects/${subjectId}`);
    return data;
  },
};
