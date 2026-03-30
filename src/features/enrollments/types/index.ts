export enum EnrollmentStatus {
  ACTIVE = 'active',
  WITHDRAWN = 'withdrawn',
  TRANSFERRED = 'transferred',
  COMPLETED = 'completed'
}

export interface Enrollment {
  id: string;
  student_id: string;
  student_name: string;
  academic_year_id: string;
  academic_year_name: string;
  class_id: string;
  class_name: string;
  section_id: string;
  section_name: string;
  enrollment_date: string;
  status: EnrollmentStatus;
  withdrawal_date: string | null;
  withdrawal_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentHistory {
  id: string;
  academic_year: string;
  class_name: string;
  section_name: string;
  status: EnrollmentStatus;
  date: string;
}
