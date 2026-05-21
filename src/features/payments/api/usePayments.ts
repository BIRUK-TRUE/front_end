"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { 
  StudentFee, 
  PaymentTransaction,
  CreatePaymentRequest,
  ChapaPaymentPayload,
} from "../types";
import { FeeStatus, FeeType, PaymentMethod, PaymentStatus } from "../types";

interface GuardianDashboardData {
  total_fees: number;
  total_paid: number;
  total_balance: number;
  students: unknown[];
  recent_payments: unknown[];
}

const paymentsKeys = {
  all: ["payments"] as const,
  guardian: (guardianId: string) =>
    [...paymentsKeys.all, "guardian", guardianId] as const,
  studentFees: (studentId: string) =>
    [...paymentsKeys.all, "fees", studentId] as const,
  transactions: (studentId: string) =>
    [...paymentsKeys.all, "transactions", studentId] as const,
  history: (filters?: Record<string, unknown>) =>
    [...paymentsKeys.all, "history", filters] as const,
  schedules: (filters?: Record<string, unknown>) =>
    [...paymentsKeys.all, "schedules", filters] as const,
  summary: (studentId: string) =>
    [...paymentsKeys.all, "summary", studentId] as const,
  feeStructures: (filters?: Record<string, unknown>) =>
    [...paymentsKeys.all, "fee-structures", filters] as const,
};

// ==========================================
// FEE STRUCTURES (Admin)
// ==========================================

/**
 * List fee structures.
 * Backend: GET /payments/fee-structures
 */
export function useFeeStructures(filters?: {
  academic_year_id?: string;
  grade_level?: number;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: paymentsKeys.feeStructures(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/payments/fee-structures", {
        params: filters,
      });
      return data;
    },
  });
}

/**
 * Create a fee structure.
 * Backend: POST /payments/fee-structures
 */
export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      academic_year_id: string;
      grade_level?: number;
      amount: number;
      fee_type?: string;
      description?: string;
      is_active?: boolean;
    }) => {
      const { data } = await axiosInstance.post(
        "/payments/fee-structures",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.feeStructures() });
      toast.success("Fee structure created");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create fee structure"));
    },
  });
}

// ==========================================
// PAYMENT SCHEDULES
// ==========================================

/**
 * List payment schedules (admin sees all, student/guardian sees own).
 * Backend: GET /payments/schedules
 */
export function usePaymentSchedules(filters?: {
  page?: number;
  size?: number;
  student_id?: string;
  status?: string;
  academic_year_id?: string;
}) {
  return useQuery({
    queryKey: paymentsKeys.schedules(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/payments/schedules", {
        params: filters,
      });
      return data;
    },
  });
}

/**
 * Get student fees via payment schedules filtered by student_id.
 * Backend: GET /payments/schedules?student_id=...
 */
export function useStudentFees(studentId: string) {
  return useQuery({
    queryKey: paymentsKeys.studentFees(studentId),
    queryFn: async (): Promise<StudentFee[]> => {
      const { data } = await axiosInstance.get("/payments/schedules", {
        params: { student_id: studentId, size: 100 },
      });
      const items = data?.items ?? (Array.isArray(data) ? data : []);
      const toFeeType = (value: unknown): FeeType => {
        const normalized = String(value ?? FeeType.TUITION).toLowerCase();
        return Object.values(FeeType).includes(normalized as FeeType)
          ? (normalized as FeeType)
          : FeeType.TUITION;
      };
      const toFeeStatus = (value: unknown): FeeStatus => {
        const normalized = String(value ?? FeeStatus.UNPAID).toLowerCase();
        return Object.values(FeeStatus).includes(normalized as FeeStatus)
          ? (normalized as FeeStatus)
          : FeeStatus.UNPAID;
      };
      return items.map(
        (s: Record<string, unknown>): StudentFee => ({
          id: s.id as string,
          student_id: (s.student_id ?? studentId) as string,
          student_name: (s.student_name ?? "") as string,
          registration_number: (s.registration_number ?? "") as string,
          fee_type: toFeeType(s.fee_type),
          amount: (s.total_amount ?? s.amount ?? 0) as number,
          paid_amount: (s.paid_amount ?? 0) as number,
          balance: (s.balance ?? 0) as number,
          status: toFeeStatus(s.status),
          due_date: (s.due_date ?? "") as string,
          academic_year: (s.academic_year_name ?? "") as string,
          term: (s.term_name ?? "") as string,
          description: (s.fee_structure_name ?? s.fee_name ?? "") as string,
        }),
      );
    },
    enabled: !!studentId,
  });
}

/**
 * Get payment transactions for a student.
 * Backend: GET /payments/history?student_id=...
 */
export function usePaymentTransactions(studentId: string) {
  return useQuery({
    queryKey: paymentsKeys.transactions(studentId),
    queryFn: async (): Promise<PaymentTransaction[]> => {
      const { data } = await axiosInstance.get("/payments/history", {
        params: { student_id: studentId, size: 100 },
      });
      const items = data?.items ?? (Array.isArray(data) ? data : []);
      const toPaymentMethod = (value: unknown): PaymentMethod => {
        const normalized = String(value ?? PaymentMethod.CASH).toLowerCase();
        return Object.values(PaymentMethod).includes(normalized as PaymentMethod)
          ? (normalized as PaymentMethod)
          : PaymentMethod.CASH;
      };
      const toPaymentStatus = (value: unknown): PaymentStatus => {
        const normalized = String(value ?? PaymentStatus.PENDING).toLowerCase();
        return Object.values(PaymentStatus).includes(normalized as PaymentStatus)
          ? (normalized as PaymentStatus)
          : PaymentStatus.PENDING;
      };
      return items.map(
        (p: Record<string, unknown>): PaymentTransaction => ({
          id: p.id as string,
          student_id: (p.student_id ?? studentId) as string,
          student_name: (p.student_name ?? "") as string,
          fee_id: (p.fee_id ?? p.schedule_id ?? "") as string,
          amount: (p.amount ?? 0) as number,
          currency: (p.currency ?? "ETB") as string,
          payment_method: toPaymentMethod(p.payment_method ?? p.method),
          status: toPaymentStatus(p.status),
          reference_number: (p.tx_ref ?? p.receipt_number ?? "") as string,
          chapa_reference: (p.chapa_reference ?? undefined) as string | undefined,
          paid_at: (p.paid_at ?? p.created_at ?? "") as string,
          created_at: (p.created_at ?? "") as string,
          verified_at: (p.verified_at ?? undefined) as string | undefined,
        }),
      );
    },
    enabled: !!studentId,
  });
}

/**
 * Get student payment summary.
 * Backend: GET /payments/students/{student_id}/summary
 */
export function useStudentPaymentSummary(studentId: string) {
  return useQuery({
    queryKey: paymentsKeys.summary(studentId),
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/payments/students/${studentId}/summary`,
      );
      return data;
    },
    enabled: !!studentId,
  });
}

/**
 * Get guardian dashboard data (aggregate from linked students).
 * Constructs dashboard data from payment schedules.
 */
export function useGuardianDashboard(guardianId: string) {
  return useQuery({
    queryKey: paymentsKeys.guardian(guardianId),
    queryFn: async (): Promise<GuardianDashboardData> => {
      // Guardian dashboard is constructed from available data.
      // The backend doesn't have a dedicated guardian dashboard endpoint.
      try {
        const { data } = await axiosInstance.get("/payments/schedules", {
          params: { size: 100 },
        });
        const items = data?.items ?? [];
        const totalFees = items.reduce(
          (sum: number, s: Record<string, unknown>) =>
            sum + ((s.total_amount as number) ?? 0),
          0,
        );
        const totalPaid = items.reduce(
          (sum: number, s: Record<string, unknown>) =>
            sum + ((s.paid_amount as number) ?? 0),
          0,
        );
        return {
          total_fees: totalFees,
          total_paid: totalPaid,
          total_balance: totalFees - totalPaid,
          students: [],
          recent_payments: [],
        };
      } catch {
        return {
          total_fees: 0,
          total_paid: 0,
          total_balance: 0,
          students: [],
          recent_payments: [],
        };
      }
    },
    enabled: !!guardianId,
  });
}

/**
 * Get payment history for the current user.
 * Backend: GET /payments/history
 */
export function usePaymentHistory(filters?: {
  page?: number;
  size?: number;
  student_id?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: paymentsKeys.history(filters),
    queryFn: async (): Promise<PaymentTransaction[]> => {
      const { data } = await axiosInstance.get("/payments/history", {
        params: filters,
      });
      const items = data?.items ?? (Array.isArray(data) ? data : []);
      return items;
    },
  });
}

// ==========================================
// PAYMENT ACTIONS
// ==========================================

/**
 * Initialize Chapa payment.
 * Backend: POST /payments/chapa/initialize
 */
export function useInitiateChapaPayment() {
  return useMutation({
    mutationFn: async (payload: ChapaPaymentPayload & { fee_id: string }) => {
      const { data } = await axiosInstance.post("/payments/chapa/initialize", {
        schedule_id: payload.fee_id,
        amount: payload.amount,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Redirecting to Chapa payment...");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to initiate payment"));
    },
  });
}

/**
 * Verify Chapa payment.
 * Backend: POST /payments/chapa/verify/{tx_ref}
 */
export function useVerifyChapaPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reference }: { reference: string }) => {
      const { data } = await axiosInstance.post(
        `/payments/chapa/verify/${reference}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      toast.success("Payment verified successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to verify payment"));
    },
  });
}

/**
 * Record a manual payment.
 * Backend: POST /payments/manual
 * Maps frontend CreatePaymentRequest fields to backend ManualPaymentCreate schema.
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePaymentRequest) => {
      const { data } = await axiosInstance.post("/payments/manual", {
        schedule_id: payload.fee_id,
        amount: payload.amount,
        method: payload.payment_method ?? "cash",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      toast.success("Payment recorded successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to record payment"));
    },
  });
}
