export interface StudentFee {
  id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  fee_type: FeeType;
  amount: number;
  paid_amount: number;
  balance: number;
  due_date: string;
  status: FeeStatus;
  academic_year: string;
  term: string;
  description?: string;
}

export enum FeeType {
  TUITION = 'tuition',
  REGISTRATION = 'registration',
  EXAM = 'exam',
  LIBRARY = 'library',
  LAB = 'lab',
  TRANSPORT = 'transport',
  OTHER = 'other',
}

export enum FeeStatus {
  PAID = 'paid',
  PARTIAL = 'partial',
  UNPAID = 'unpaid',
  OVERDUE = 'overdue',
}

export interface PaymentTransaction {
  id: string;
  student_id: string;
  student_name: string;
  fee_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string;
  chapa_reference?: string;
  paid_at: string;
  created_at: string;
  verified_at?: string;
}

export enum PaymentMethod {
  CHAPA = 'chapa',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  MOBILE_MONEY = 'mobile_money',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface ChapaPaymentPayload {
  amount: string; // Chapa API requires amount as string
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface GuardianDashboardData {
  guardian_id: string;
  guardian_name: string;
  linked_students: LinkedStudent[];
  total_balance: number;
  recent_transactions: PaymentTransaction[];
}

export interface LinkedStudent {
  id: string;
  name: string;
  registration_number: string;
  class_name: string;
  section_name: string;
  fees: StudentFee[];
  total_balance: number;
}

export interface CreatePaymentRequest {
  fee_id: string;
  amount: number;
  payment_method: PaymentMethod;
}
