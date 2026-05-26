import type { AttendanceRecord } from "../student-portal/types";

export interface ChildSummary {
  id: string;
  fullName: string;
  studentId: string;
  photoUrl: string | null;
  className: string;
  sectionName: string;
  attendanceRate: number;
  gradeAverage: number;
  feeStatus: 'paid' | 'unpaid' | 'partial';
}

export interface GuardianDashboardData {
  children: ChildSummary[];
  recentAlerts: GuardianAlert[];
}

export interface GuardianAlert {
  id: string;
  type: 'attendance' | 'grade' | 'fee' | 'general';
  message: string;
  studentName: string;
  createdAt: string;
}

export interface ChildDetails extends ChildSummary {
  guardianOwned: boolean;
  enrollmentDate: string;
  academicYear: string;
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
