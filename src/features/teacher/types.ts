export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface TeacherRecentActivity {
  id: string;
  sectionId: string;
  className: string;
  sectionName: string;
  date: string;
  submittedAt: string;
}

export interface TeacherDashboardStats {
  todayClasses: number;
  totalStudents: number;
  pendingGrades: number;
  attendanceTakenToday: {
    taken: number;
    total: number;
  };
  currentTermName: string;
  recentActivity: TeacherRecentActivity[];
}

export interface TeacherClassItem {
  sectionId: string;
  className: string;
  sectionName: string;
  subjectName: string;
  studentCount: number;
  todayAttendanceTaken: boolean;
}

export interface TeacherStudent {
  id: string;
  fullName: string;
  studentId: string;
  photoUrl?: string | null;
}

export interface TeacherRosterResponse {
  students: TeacherStudent[];
  summary: {
    presentPercent: number;
    absentPercent: number;
    latePercent: number;
  };
}

export interface TeacherScheduleEntry {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  className: string;
  sectionName: string;
  room?: string | null;
}

export interface TeacherAttendanceRecord {
  id: string;
  date: string;
  className: string;
  sectionName: string;
  statusCounts: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

export interface TeacherAttendanceFilter {
  sectionId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export interface TeacherAttendanceSubmitPayload {
  sectionId: string;
  date: string;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    note?: string;
  }>;
}

export interface TeacherAssessment {
  id: string;
  sectionId: string;
  className: string;
  sectionName: string;
  subjectName: string;
  termName: string;
  assessmentName: string;
  type: "exam" | "quiz" | "assignment";
  date: string;
  totalMarks: number;
  gradesEntered: boolean;
}

export interface TeacherAssessmentFilter {
  sectionId?: string;
  subjectName?: string;
  termName?: string;
  termId?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface TeacherAssessmentGrade {
  studentId: string;
  studentName: string;
  studentCode: string;
  score: number | null;
  remarks?: string;
}

export interface TeacherGradeSubmitItem {
  studentId: string;
  score: number;
  remarks?: string;
}
