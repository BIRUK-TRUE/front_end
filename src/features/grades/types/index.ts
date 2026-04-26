export enum AssessmentType {
  QUIZ = 'quiz',
  TEST = 'test',
  MIDTERM = 'midterm',
  FINAL = 'final',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
}

export interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  term_id: string;
  term_name: string;
  max_score: number;
  weight: number;
  date?: string;
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  assessment_id: string;
  score: number | null;
  letter_grade?: string;
  comment?: string;
}

export interface GradeEntry {
  student_id: string;
  score: number | null;
  comment?: string;
}

export interface BulkGradePayload {
  assessment_id: string;
  entries: GradeEntry[];
}

export interface StudentGradeSummary {
  subject_name: string;
  assessments: {
    name: string;
    type: AssessmentType;
    score: number | null;
    max_score: number;
    weight: number;
  }[];
  average: number;
  letter_grade: string;
}

export interface ReportCard {
  student: {
    id: string;
    full_name: string;
    registration_number: string;
    photo_url?: string;
    date_of_birth: string;
    sex: string;
  };
  school: {
    name: string;
    address: string;
    phone: string;
    logo_url?: string;
  };
  academic_year: string;
  term: {
    name: string;
    start_date: string;
    end_date: string;
  };
  class_name: string;
  section_name: string;
  subjects: ReportCardSubject[];
  summary: {
    total_subjects: number;
    subjects_passed: number;
    subjects_failed: number;
    overall_average: number;
    overall_letter_grade: string;
    rank?: number;
    total_students?: number;
    attendance_rate: number;
    total_school_days: number;
    days_present: number;
    days_absent: number;
    teacher_remarks?: string;
    director_remarks?: string;
  };
  promotion_status: 'promoted' | 'retained' | 'pending';
}

export interface ReportCardSubject {
  subject_name: string;
  subject_category: string;
  teacher_name: string;
  assessments: {
    name: string;
    type: string;
    score: number;
    max_score: number;
    weight: number;
  }[];
  total_score: number;
  max_total: number;
  percentage: number;
  letter_grade: string;
  passed: boolean;
  remarks?: string;
}
