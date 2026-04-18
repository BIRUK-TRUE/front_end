export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  section_id: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  marked_by: string;
  created_at: string;
  updated_at: string;
}

export interface DailyAttendanceSummary {
  section_id: string;
  section_name: string;
  date: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  is_submitted: boolean;
}

export interface AttendanceEntry {
  student_id: string;
  status: AttendanceStatus;
  note?: string;
}

export interface BulkAttendancePayload {
  section_id: string;
  date: string;
  entries: AttendanceEntry[];
}

export interface StudentAttendanceStats {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}
