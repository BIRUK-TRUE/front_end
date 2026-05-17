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

export const gradesService = {
  async getWeightConfigs(academicYearId: string) {
    const { data } = await axiosInstance.get<GradeWeightConfig[]>(
      `/settings/grade-weights`,
      { params: { academic_year_id: academicYearId } }
    );
    return data;
  },

  async createWeightConfig(payload: Omit<GradeWeightConfig, 'id'>) {
    const { data } = await axiosInstance.post<GradeWeightConfig>(
      `/settings/grade-weights`,
      payload
    );
    return data;
  },

  async getGradingScales(academicYearId: string) {
    const { data } = await axiosInstance.get<GradingScale[]>(
      `/settings/grading-scales`,
      { params: { academic_year_id: academicYearId } }
    );
    return data;
  },

  async createGradingScale(payload: Omit<GradingScale, 'id'>) {
    const { data } = await axiosInstance.post<GradingScale>(
      `/settings/grading-scales`,
      payload
    );
    return data;
  },

  async getCalculatedGrade(studentId: string, termId: string, subjectId: string) {
    const { data } = await axiosInstance.get(
      `/grades/student/${studentId}/term/${termId}/calculated`,
      { params: { subject_id: subjectId } }
    );
    return data;
  },
  
  async downloadReportCard(studentId: string, termId: string) {
    const response = await axiosInstance.get(
      `/reports/report-card/${studentId}/${termId}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};
