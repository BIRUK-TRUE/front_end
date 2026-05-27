import type { AttendanceRecord } from "../student-portal/types";

export interface ChildSummary {
  id: string;
  full_name: string;
  student_id: string;
  photo_url: string | null;
  class_name: string;
  section_name: string;
  attendance_rate: number;
  grade_average: number;
  fee_status: 'paid' | 'unpaid' | 'partial';
}

export interface GuardianDashboardData {
  children: ChildSummary[];
  recent_alerts: GuardianAlert[];
}

export interface GuardianAlert {
  id: string;
  type: 'attendance' | 'grade' | 'fee' | 'general';
  message: string;
  student_name: string;
  created_at: string;
}

export interface ChildDetails extends ChildSummary {
  guardian_owned?: boolean;
  enrollment_date?: string;
  academic_year?: string;
}

export interface FeeBreakdown {
  id: string;
  type: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
}

export interface ChildFeeBalance {
  studentId: string;
  total: number;
  paid: number;
  outstanding: number;
  dueDate: string;
  breakdown: FeeBreakdown[];
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  receiptUrl: string;
  reference: string;
}

export interface GuardianNotification {
  id: string;
  title: string;
  message: string;
  type: 'attendance' | 'academic' | 'fee_reminder' | 'announcement' | 'system' | 'grade' | 'fee' | 'general';
  studentName: string;
  createdAt: string;
  isRead: boolean;
}
