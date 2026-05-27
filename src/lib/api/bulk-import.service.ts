import { axiosInstance } from './axios';

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface BulkRowResult {
  row: number;
  success: boolean;
  email?: string;
  error?: string;
  // entity-specific identifiers
  registration_number?: string; // students
  employee_id?: string;         // teachers
  guardian_id?: string;         // guardians
}

export interface BulkImportResponse {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkRowResult[];
}

// ─── Student ─────────────────────────────────────────────────────────────────

export interface StudentBulkRow {
  email: string;
  full_name: string;
  admission_date: string;
  date_of_birth: string;
  sex: 'M' | 'F';
  phone_number?: string;
  address?: string;
  password?: string;
  nationality?: string;
  previous_school?: string;
  ministry_exam_result?: number;
}

// ─── Teacher ─────────────────────────────────────────────────────────────────

export interface TeacherBulkRow {
  email: string;
  full_name: string;
  hire_date: string;
  date_of_birth: string;
  sex: 'M' | 'F';
  phone_number?: string;
  address?: string;
  password?: string;
  qualification?: string;
  specialization?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  office_location?: string;
}

// ─── Guardian ────────────────────────────────────────────────────────────────

export interface GuardianBulkRow {
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  password?: string;
  occupation?: string;
  workplace?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const bulkImportService = {
  async importStudents(rows: StudentBulkRow[]): Promise<BulkImportResponse> {
    const { data } = await axiosInstance.post('/students/bulk', { rows });
    return data;
  },

  async importTeachers(rows: TeacherBulkRow[]): Promise<BulkImportResponse> {
    const { data } = await axiosInstance.post('/teachers/bulk', { rows });
    return data;
  },

  async importGuardians(rows: GuardianBulkRow[]): Promise<BulkImportResponse> {
    const { data } = await axiosInstance.post('/guardians/bulk', { rows });
    return data;
  },
};
