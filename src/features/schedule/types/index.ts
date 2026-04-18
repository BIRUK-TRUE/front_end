export interface ScheduleEntry {
  id: string;
  section_id: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
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
