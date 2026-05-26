export interface ScheduleEntry {
  id: string;
  section_id: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  teacher_subject_id?: string;
  day_of_week: number; // 0=Sunday, 1=Monday... 6=Saturday
  start_time: string; // HH:mm:ss format (e.g. "08:00:00")
  end_time: string;   // HH:mm:ss format
  room_number?: string;
  term_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateScheduleEntryPayload {
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number?: string;
  term_id: string;
}

// ==========================================
// SCHEDULE PERIOD TYPES (NEW)
// ==========================================

export interface SchedulePeriod {
  id: string;
  teacher_subject_id: string;
  classroom_id?: string;
  term_id: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  
  // Enriched data
  teacher_name: string;
  subject_name: string;
  subject_code: string;
  section_name: string;
  classroom_number?: string;
  classroom_type?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface CreateSchedulePeriodPayload {
  teacher_subject_id: string;
  classroom_id?: string;
  term_id: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
}

export interface UpdateSchedulePeriodPayload {
  classroom_id?: string;
  day_of_week?: number;
  period_number?: number;
  start_time?: string;
  end_time?: string;
}

export interface TimetableGenerationResult {
  success: boolean;
  periods_created: number;
  conflicts_avoided: number;
  warnings: string[];
  statistics: Record<string, any>;
}

export interface ConflictCheckResult {
  valid: boolean;
  conflicts: string[];
}

export type ViewMode = 'section' | 'teacher' | 'classroom';
