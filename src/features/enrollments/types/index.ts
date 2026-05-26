export enum EnrollmentStatus {
  ACTIVE = 'active',
  WITHDRAWN = 'withdrawn',
  TRANSFERRED = 'transferred',
  GRADUATED = 'graduated',
  PROMOTED = 'promoted',
}

export interface Enrollment {
  id: string;
  student_id: string;
  student_name: string;
  student_registration_number: string;
  section_id: string;
  section_name: string;
  class_id: string | null;
  class_name: string;
  grade_level: number;
  academic_year_id: string;
  academic_year_name: string;
  enrollment_date: string;
  enrollment_type: string;
  status: EnrollmentStatus;
  withdrawal_date: string | null;
  remarks: string | null;
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
