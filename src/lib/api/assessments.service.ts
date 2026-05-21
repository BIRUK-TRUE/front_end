import { axiosInstance } from './axios';

export const assessmentsService = {
  // List assessments (admin/teacher view)
  async getAll(params: { page?: number; size?: number; teacher_subject_id?: string; term_id?: string; status?: string } = {}) {
    const { data } = await axiosInstance.get('/assessments', { params });
    return data;
  },

  // Get single assessment with scores
  async getById(id: string) {
    const { data } = await axiosInstance.get(`/assessments/${id}`);
    return data;
  },

  // Create assessment
  async create(payload: {
    teacher_subject_id: string;
    term_id: string;
    title: string;
    assessment_type: string;
    max_score: number;
    assessment_date?: string;
    description?: string;
  }) {
    const { data } = await axiosInstance.post('/assessments', payload);
    return data;
  },

  // Update assessment
  async update(id: string, payload: Partial<{ title: string; max_score: number; assessment_date: string; description: string }>) {
    const { data } = await axiosInstance.patch(`/assessments/${id}`, payload);
    return data;
  },

  // Update assessment status
  async updateStatus(id: string, payload: { status: string }) {
    const { data } = await axiosInstance.patch(`/assessments/${id}/status`, payload);
    return data;
  },

  // Delete assessment
  async delete(id: string) {
    const { data } = await axiosInstance.delete(`/assessments/${id}`);
    return data;
  },

  // Get scores sheet for an assessment
  async getScoresSheet(assessmentId: string) {
    const { data } = await axiosInstance.get(`/assessments/${assessmentId}/scores-sheet`);
    return data;
  },

  // Bulk upsert scores (standard format)
  async upsertScores(assessmentId: string, payload: { scores: { enrollment_id: string; score: number; is_absent?: boolean; remark?: string }[] }) {
    const { data } = await axiosInstance.put(`/assessments/${assessmentId}/scores`, payload);
    return data;
  },

  // Bulk upsert grades (frontend-friendly format with student_id)
  async bulkUpsertGrades(assessmentId: string, payload: {
    entries?: { student_id?: string; enrollment_id?: string; score: number; is_absent?: boolean; comment?: string }[];
    scores?: { enrollment_id: string; score: number; is_absent?: boolean; remark?: string }[];
  }) {
    const { data } = await axiosInstance.post(`/assessments/${assessmentId}/grades/bulk`, payload);
    return data;
  },

  // Student portal: list my assessments
  async getMyAssessments(termId?: string) {
    const params = termId ? { term_id: termId } : {};
    const { data } = await axiosInstance.get('/assessments/students/me/list', { params });
    return data;
  },

  // Student portal: get my term gradebook
  async getMyGradebook(termId: string) {
    const { data } = await axiosInstance.get(`/assessments/students/me/gradebook/${termId}`);
    return data;
  },
};
