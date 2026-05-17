export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RiskFactor {
  type: 'attendance' | 'grade' | 'consecutive_absence' | 'financial';
  value: number;
  threshold: number;
  message: string;
}

export interface StudentRisk {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  className: string;
  sectionName: string;
  level: RiskLevel;
  factors: RiskFactor[];
  score: number;
  attendanceRate: number;
  gradeAverage: number;
  lastAbsenceDate?: string;
  consecutiveAbsences: number;
  guardianInfo?: {
    name: string;
    phone: string;
    id: string;
  };
}

export interface AnalyticsSummary {
  totalStudents: number;
  schoolAttendanceRate: number;
  schoolGradeAverage: number;
  atRiskCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface AttendanceTrendEntry {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
}

export interface GradeDistributionEntry {
  grade_letter: string;
  count: number;
  percentage: number;
}

export interface ClassPerformanceEntry {
  classId: string;
  className: string;
  sectionName: string;
  avgAttendance: number;
  avgGrade: number;
  atRiskCount: number;
  onTrackCount: number;
  totalStudents: number;
}

export const analyticsKeys = {
  atRisk: (filters?: object) => ['analytics', 'at-risk', filters] as const,
  trend: (filters?: object) => ['analytics', 'attendance-trend', filters] as const,
  distribution: (filters?: object) => ['analytics', 'grade-distribution', filters] as const,
  performance: (termId?: string) => ['analytics', 'class-performance', termId] as const,
  summary: () => ['analytics', 'summary'] as const,
  interventions: (studentId: string) => ['analytics', 'interventions', studentId] as const,
};

export interface Intervention {
  id: string;
  studentId: string;
  type: 'counseling' | 'parent_meeting' | 'tutoring' | 'other';
  note: string;
  createdAt: string;
  createdBy: string;
}
