"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type {
  StudentFee,
  PaymentTransaction,
  GuardianDashboardData,
  CreatePaymentRequest,
  ChapaPaymentPayload,
  FeeStatus,
  FeeType,
  PaymentMethod,
  PaymentStatus,
} from "../types";

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

// ==========================================
// PAYMENT SCHEDULES
// ==========================================

/**
 * List payment schedules.
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
      return items.map(
        (s: Record<string, unknown>): StudentFee => ({
          id: (s.id ?? "") as string,
          student_id: (s.student_id ?? studentId) as string,
          student_name: (s.student_name ?? "") as string,
          registration_number: (s.registration_number ?? "") as string,
          fee_type: (s.fee_type ?? FeeType.TUITION) as FeeType,
          amount: (s.total_amount ?? s.amount ?? 0) as number,
          paid_amount: (s.paid_amount ?? 0) as number,
          balance: (s.balance ?? 0) as number,
          due_date: (s.due_date ?? "") as string,
          status: (s.status ?? FeeStatus.UNPAID) as FeeStatus,
          academic_year: (s.academic_year_name ?? "") as string,
          term: (s.term_name ?? "") as string,
          description: (s.description ?? "") as string,
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
      return items.map(
        (p: Record<string, unknown>): PaymentTransaction => ({
          id: (p.id ?? "") as string,
          student_id: (p.student_id ?? studentId) as string,
          student_name: (p.student_name ?? "") as string,
          fee_id: (p.schedule_id ?? p.fee_id ?? "") as string,
          amount: (p.amount ?? 0) as number,
          currency: (p.currency ?? "ETB") as string,
          payment_method: (p.payment_method ?? PaymentMethod.CASH) as PaymentMethod,
          status: (p.status ?? PaymentStatus.PENDING) as PaymentStatus,
          reference_number: (p.receipt_number ?? p.reference_number ?? "") as string,
          chapa_reference: (p.tx_ref ?? p.chapa_reference) as string | undefined,
          paid_at: (p.paid_at ?? p.created_at ?? "") as string,
          created_at: (p.created_at ?? "") as string,
          verified_at: (p.verified_at) as string | undefined,
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
 * Get guardian dashboard data.
 * Constructs from the guardian's linked students via GET /guardians/{id}.
 */
export function useGuardianDashboard(guardianId: string) {
  return useQuery({
    queryKey: paymentsKeys.guardian(guardianId),
    queryFn: async (): Promise<GuardianDashboardData> => {
      try {
        const { data: guardian } = await axiosInstance.get(
          `/guardians/${guardianId}`,
        );
        const students = guardian?.students ?? guardian?.linked_students ?? [];
        return {
          guardian_id: guardianId,
          guardian_name: `${guardian?.first_name ?? ""} ${guardian?.last_name ?? ""}`.trim(),
          linked_students: students.map((s: Record<string, unknown>) => ({
            id: (s.id ?? s.student_id ?? "") as string,
            name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim(),
            registration_number: (s.registration_number ?? "") as string,
            class_name: (s.class_name ?? "") as string,
            section_name: (s.section_name ?? "") as string,
            fees: [],
            total_balance: 0,
          })),
          total_balance: 0,
          recent_transactions: [],
        };
      } catch {
        return {
          guardian_id: guardianId,
          guardian_name: "",
          linked_students: [],
          total_balance: 0,
          recent_transactions: [],
        };
      }
    },
    enabled: !!guardianId,
  });
}

/**
 * Get payment history.
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
    queryFn: async () => {
      const { data } = await axiosInstance.get("/payments/history", {
        params: filters,
      });
      return data;
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
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePaymentRequest) => {
      const { data } = await axiosInstance.post("/payments/manual", payload);
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
