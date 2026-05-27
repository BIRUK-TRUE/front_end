import { axiosInstance } from './axios';

export interface GradeWeightConfig {
  id: string;
  grade_level_min: number;
  grade_level_max: number;
  ca_weight: number;
  exam_weight: number;
  academic_year_id: string;
  is_active: boolean;
}

export interface GradingScale {
  id: string;
  letter: string;
  min_percentage: number;
  max_percentage: number;
  gpa_value: number;
  grade_level_min: number;
  grade_level_max: number;
  academic_year_id: string;
}

/**
 * Grades service for grade weight configs, grading scales, and student grade calculation.
 */
export const gradesService = {
  /**
   * Get grade weight configurations for an academic year.
   */
  async getWeightConfigs(academicYearId: string): Promise<GradeWeightConfig[]> {
    const { data } = await axiosInstance.get('/settings/grade-weights', {
      params: { academic_year_id: academicYearId, size: 100 },
    });
    return data.items || [];
  },

  async createWeightConfig(payload: Omit<GradeWeightConfig, 'id' | 'academic_year_name'>): Promise<GradeWeightConfig> {
    const { data } = await axiosInstance.post('/settings/grade-weights', payload);
    return data;
  },

  /**
   * Get grading scales for an academic year.
   */
  async getGradingScales(academicYearId: string): Promise<GradingScale[]> {
    const { data } = await axiosInstance.get('/settings/grading-scales', {
      params: { academic_year_id: academicYearId, size: 100 },
    });
    return data.items || [];
  },

  async createGradingScale(payload: Omit<GradingScale, 'id' | 'academic_year_name'>): Promise<GradingScale> {
    const { data } = await axiosInstance.post('/settings/grading-scales', payload);
    return data;
  },

  /**
   * Get student's term gradebook.
   * Backend: GET /assessments/students/me/gradebook/{term_id}
   */
  async getCalculatedGrade(studentId: string, termId: string, _subjectId: string) {
    const { data } = await axiosInstance.get(
      `/assessments/students/me/gradebook/${termId}`,
    );
    return data;
  },

  /**
   * Download report card.
   * NOTE: Backend does not have a report card PDF endpoint yet.
   * This is a placeholder.
   */
  async downloadReportCard(_studentId: string, _termId: string) {
    throw new Error('Report card download is not yet available');
  },
};
