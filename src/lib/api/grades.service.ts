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
 *
 * NOTE: The backend does not yet have dedicated /settings/grade-weights or
 * /settings/grading-scales endpoints. These methods are stubbed with sensible
 * defaults and will return real data once the settings module is implemented.
 */
export const gradesService = {
  /**
   * Get grade weight configurations for an academic year.
   * TODO: Backend endpoint /settings/grade-weights not yet implemented.
   */
  async getWeightConfigs(_academicYearId: string): Promise<GradeWeightConfig[]> {
    // Stubbed — return sensible defaults until backend settings module is added.
    return [
      {
        id: 'default-k-6',
        grade_level_min: 0,
        grade_level_max: 6,
        ca_weight: 40,
        exam_weight: 60,
        academic_year_id: _academicYearId,
        is_active: true,
      },
      {
        id: 'default-7-12',
        grade_level_min: 7,
        grade_level_max: 12,
        ca_weight: 30,
        exam_weight: 70,
        academic_year_id: _academicYearId,
        is_active: true,
      },
    ];
  },

  async createWeightConfig(_payload: Omit<GradeWeightConfig, 'id'>): Promise<GradeWeightConfig> {
    // TODO: POST /settings/grade-weights
    throw new Error('Grade weight configuration endpoint is not yet available');
  },

  /**
   * Get grading scales for an academic year.
   * TODO: Backend endpoint /settings/grading-scales not yet implemented.
   */
  async getGradingScales(_academicYearId: string): Promise<GradingScale[]> {
    // Stubbed — Ethiopian grading scale defaults
    return [
      { id: 'A', letter: 'A', min_percentage: 90, max_percentage: 100, gpa_value: 4.0, grade_level_min: 0, grade_level_max: 12, academic_year_id: _academicYearId },
      { id: 'B+', letter: 'B+', min_percentage: 85, max_percentage: 89, gpa_value: 3.5, grade_level_min: 0, grade_level_max: 12, academic_year_id: _academicYearId },
      { id: 'B', letter: 'B', min_percentage: 80, max_percentage: 84, gpa_value: 3.0, grade_level_min: 0, grade_level_max: 12, academic_year_id: _academicYearId },
      { id: 'C+', letter: 'C+', min_percentage: 75, max_percentage: 79, gpa_value: 2.5, grade_level_min: 0, grade_level_max: 12, academic_year_id: _academicYearId },
      { id: 'C', letter: 'C', min_percentage: 70, max_percentage: 74, gpa_value: 2.0, grade_level_min: 0, grade_level_max: 12, academic_year_id: _academicYearId },
      { id: 'D', letter: 'D', min_percentage: 60, max_percentage: 69, gpa_value: 1.0, grade_level_min: 0, grade_level_max: 12, academic_year_id: _academicYearId },
      { id: 'F', letter: 'F', min_percentage: 0, max_percentage: 59, gpa_value: 0.0, grade_level_min: 0, grade_level_max: 12, academic_year_id: _academicYearId },
    ];
  },

  async createGradingScale(_payload: Omit<GradingScale, 'id'>): Promise<GradingScale> {
    // TODO: POST /settings/grading-scales
    throw new Error('Grading scale configuration endpoint is not yet available');
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
