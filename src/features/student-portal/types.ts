/**
 * Data shapes specifically for the Student Portal endpoints
 */

export interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  datePosted: string;
}

export interface RecentGradeEntry {
  subjectName: string;
  assessmentName: string;
  scoreEarned: number;
  totalMarks: number;
  percentage: number;
  date: string;
}

export interface StudentDashboardData {
  student: {
    id: string;
    fullName: string;
    studentIdNumber: string;
    className: string;
    sectionName: string;
  };
  currentTerm: {
    id: string;
    name: string;
    academicYear: string;
  };
  stats: {
    attendanceRate: number; // 0-100
    scoreAverage: number; // 0-100
    daysPresentThisMonth: number;
    upcomingAssessmentsCount: number;
  };
  todaySchedule: ScheduleEntry[];
  recentGrades: RecentGradeEntry[];
  announcements: Announcement[];
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number; // 0-100
}

export interface AttendanceCalendarRecord {
  date: string; // ISO format "2024-01-15"
  status: "present" | "absent" | "late" | "excused";
  className: string;
  note: string | null;
}

export interface AttendanceCalendarResponse {
  records: AttendanceCalendarRecord[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  className: string;
  note: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface SubjectScoreSummary {
  subjectId: string;
  subjectName: string;
  assessmentCount: number;
  totalScoreEarned: number;
  totalPossibleMarks: number;
  percentage: number;
  highestPercentage: number;
  passed: boolean;
}

export interface GradesSummaryResponse {
  subjects: SubjectScoreSummary[];
}

export interface AssessmentGradeRecord {
  assessmentId: string;
  assessmentName: string;
  type: string;
  date: string;
  scoreEarned: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  subjectName: string;
}

export interface ReportCardData {
  student: {
    fullName: string;
    studentIdNumber: string;
    className: string;
    sectionName: string;
  };
  term: {
    name: string;
    academicYear: string;
  };
  schoolInfo: {
    name: string;
    logoUrl: string | null;
  };
  subjects: {
    subjectName: string;
    scoreEarned: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    teacherRemarks: string | null;
  }[];
  summary: {
    totalScoreEarned: number;
    totalPossibleMarks: number;
    overallPercentage: number;
    classRank: number | null;
    totalStudentsInClass: number | null;
  };
  generalRemarks: string | null;
}

export interface ScheduleEntry {
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  periodNumber: number;
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "09:00"
  subjectName: string;
  teacherName: string;
  room: string | null;
}

export interface ScheduleResponse {
  schedule: ScheduleEntry[];
}

export interface Guardian {
  fullName: string;
  relationship: string;
  phone: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  studentIdNumber: string;
  dateOfBirth: string;
  gender: string;
  className: string;
  sectionName: string;
  enrollmentDate: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  guardians: Guardian[];
}

export interface AcademicSettings {
  passingThreshold: number;
  [key: string]: unknown;
}
