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
  student_id: string;
  student_name: string;
  registration_number: string;
  term_name: string;
  academic_year: string;
  class_name: string;
  section_name: string;
  subjects: StudentGradeSummary[];
  overall_average: number;
  rank?: number;
  total_students?: number;
  conduct?: string;
  teacher_comment?: string;
}
