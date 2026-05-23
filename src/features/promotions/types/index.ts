/**
 * Promotion Types
 * ===============
 * TypeScript types for student promotion and enrollment management.
 */

export interface SubjectAverageItem {
  subject_name: string;
  subject_code: string;
  average_percentage: number;
  passed: boolean;
}

export interface StudentPromotionPreview {
  student_id: string;
  student_name: string;
  registration_number: string;
  current_section_id: string;
  current_section_name: string;
  current_grade_level: number;
  passed: boolean;
  subject_averages: SubjectAverageItem[];
  has_incomplete_data: boolean;
  proposed_section_id?: string;
  proposed_section_name?: string;
  proposed_grade_level?: number;
  enrollment_type: 'promoted' | 'repeated';
}

export interface SectionDistributionItem {
  section_id: string;
  section_name: string;
  full_name: string;
  capacity: number;
  current_count: number;
  proposed_count: number;
  available_slots: number;
  utilization_percentage: number;
}

export interface PromotionPreviewRequest {
  academic_year_id: string;
  source_grade_level: number;
  target_grade_level: number;
  preserve_classmates?: boolean;
}

export interface PromotionPreviewResponse {
  source_academic_year_id: string;
  source_academic_year_name: string;
  target_academic_year_id: string;
  target_academic_year_name: string;
  source_grade_level: number;
  target_grade_level: number;
  promoted_students: StudentPromotionPreview[];
  failed_students: StudentPromotionPreview[];
  section_distribution: SectionDistributionItem[];
  warnings: string[];
  total_students: number;
  passing_threshold: number;
}

export interface StudentAssignmentItem {
  student_id: string;
  section_id: string;
  enrollment_type: 'promoted' | 'repeated';
}

export interface PromotionExecuteRequest {
  source_academic_year_id: string;
  target_academic_year_id: string;
  source_grade_level: number;
  target_grade_level: number;
  assignments: StudentAssignmentItem[];
  preview_hash?: string;
}

export interface PromotionErrorItem {
  student_id: string;
  student_name: string;
  error_message: string;
}

export interface PromotionResultResponse {
  success: boolean;
  message: string;
  total_processed: number;
  successful_promotions: number;
  successful_repetitions: number;
  failed_count: number;
  errors: PromotionErrorItem[];
}

export interface BulkImportStudentItem {
  first_name: string;
  last_name: string;
  email: string;
  registration_number: string;
  date_of_birth: string; // YYYY-MM-DD
  sex: 'M' | 'F';
  nationality?: string;
  admission_date: string; // YYYY-MM-DD
  grade_level: number;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
}

export interface BulkEnrollmentImportRequest {
  students: BulkImportStudentItem[];
  academic_year_id: string;
  auto_assign_sections?: boolean;
}

export interface ImportErrorItem {
  row_number: number;
  registration_number?: string;
  error_message: string;
}

export interface BulkImportResultResponse {
  success: boolean;
  message: string;
  total_submitted: number;
  successful_imports: number;
  failed_count: number;
  errors: ImportErrorItem[];
}

export interface CapacityCheckItem {
  section_id: string;
  section_name: string;
  full_name: string;
  grade_level: number;
  capacity: number;
  current_enrollment: number;
  available_slots: number;
  is_full: boolean;
}

export interface CapacityCheckResponse {
  academic_year_id: string;
  academic_year_name: string;
  sections: CapacityCheckItem[];
  total_capacity: number;
  total_enrolled: number;
  total_available: number;
}

export interface UnassignedStudentItem {
  student_id: string;
  student_name: string;
  registration_number: string;
  status: string;
  admission_date: string;
}
