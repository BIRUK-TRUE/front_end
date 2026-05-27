import { axiosInstance } from './axios';

export interface ReportStats {
  total_students: number;
  total_teachers: number;
  total_guardians: number;
  total_classes: number;
  active_enrollments: number;
  attendance_rate: number;
  average_grade: number;
  pending_payments: number;
  at_risk_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface AttendanceTrendData {
  date: string;
  present_count: number;
  absent_count: number;
  attendance_percentage: number;
}

export interface AttendanceTrend {
  data: AttendanceTrendData[];
  average_attendance: number;
  trend: string;
}

export interface GradeDistributionItem {
  grade: string;
  count: number;
  percentage: number;
}

export interface GradeDistribution {
  data: GradeDistributionItem[];
  total_assessments: number;
  distribution: GradeDistributionItem[];
}

export interface AtRiskStudent {
  student_id: string;
  student_name: string;
  registration_number: string;
  class_name: string;
  section_name: string;
  risk_factors: string[];
  attendance_rate: number;
  average_grade: number;
  pending_payments: number;
}

export interface ClassPerformance {
  class_id: string;
  class_name: string;
  section_name: string;
  student_count: number;
  average_grade: number;
  attendance_rate: number;
  at_risk_count: number;
}

export interface EnrollmentTrend {
  year: string;
  students: number;
}

export const reportsService = {
  /**
   * Get overall school summary statistics
   */
  async getSummary(params?: { termId?: string; classId?: string }): Promise<ReportStats> {
    const { data } = await axiosInstance.get('/analytics/summary', { params });
    return data;
  },

  /**
   * Get daily attendance trend for the last N days
   */
  async getAttendanceTrend(params?: {
    days?: number;
    classId?: string;
    sectionId?: string;
  }): Promise<AttendanceTrend> {
    const { data } = await axiosInstance.get('/analytics/attendance-trend', { params });
    return data;
  },

  /**
   * Get grade letter distribution across assessments
   */
  async getGradeDistribution(params?: {
    termId?: string;
    classId?: string;
    subjectId?: string;
  }): Promise<GradeDistribution> {
    const { data } = await axiosInstance.get('/analytics/grade-distribution', { params });
    return data;
  },

  /**
   * Get students at risk based on attendance, grades, and payment status
   */
  async getAtRiskStudents(params?: {
    termId?: string;
    classId?: string;
    sectionId?: string;
    riskLevel?: string;
  }): Promise<{ data: AtRiskStudent[]; total: number }> {
    const { data } = await axiosInstance.get('/analytics/at-risk-students', { params });
    return data;
  },

  /**
   * Get per-class performance metrics
   */
  async getClassPerformance(params?: {
    termId?: string;
  }): Promise<{ data: ClassPerformance[]; school_average: number }> {
    const { data } = await axiosInstance.get('/analytics/class-performance', { params });
    return data;
  },

  /**
   * Get year-over-year enrollment counts
   */
  async getEnrollmentTrends(): Promise<EnrollmentTrend[]> {
    const { data } = await axiosInstance.get('/analytics/enrollment-trends');
    return data;
  },

  /**
   * Get recent activity from notifications and admin logs
   */
  async getRecentActivity(params?: { limit?: number }) {
    const { data } = await axiosInstance.get('/analytics/recent-activity', { params });
    return data;
  },

  /**
   * Export students to CSV
   */
  async exportStudents(filters?: any): Promise<Blob> {
    const { data } = await axiosInstance.get('/students/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Export teachers to CSV
   */
  async exportTeachers(filters?: any): Promise<Blob> {
    const { data } = await axiosInstance.get('/teachers/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Export users to CSV
   */
  async exportUsers(filters?: any): Promise<Blob> {
    const { data } = await axiosInstance.get('/users/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Export guardians to CSV
   */
  async exportGuardians(filters?: any): Promise<Blob> {
    const { data } = await axiosInstance.get('/guardians/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};
