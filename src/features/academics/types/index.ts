// --- ENUMS ---
export enum AcademicYearStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}
export enum TermStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}
export enum SubjectCategory {
  CORE = 'core',
  ELECTIVE = 'elective',
  VOCATIONAL = 'vocational',
  EXTRACURRICULAR = 'extracurricular'
}

// --- ACADEMICS INTERFACES ---
export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: AcademicYearStatus;
  description: string | null;
  class_count: number;
  term_count: number;
  created_at: string;
  updated_at: string;
}

export interface Term {
  id: string;
  academic_year_id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: TermStatus;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: SubjectCategory;
  is_active: boolean;
  description: string | null;
}

export interface Class {
  id: string;
  academic_year_id: string;
  name: string;
  grade_level: number;
  description: string | null;
  capacity: number | null;
  section_count: number;
  total_students: number;
  sections?: Section[];
}

export interface Section {
  id: string;
  class_id: string;
  name: string;
  full_name: string;
  capacity: number;
  room_number: string | null;
  student_count: number;
  available_slots: number;
  is_full: boolean;
  homeroom_teacher_id: string | null;
  homeroom_teacher_name: string | null;
}

export interface Student {
  id: string;
  full_name: string;
  registration_number: string;
  email?: string;
  is_active?: boolean;
  gender?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
