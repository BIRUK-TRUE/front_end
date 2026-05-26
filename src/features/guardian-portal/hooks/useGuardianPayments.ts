import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance as api } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { ChildFeeBalance, PaymentRecord } from "../types";

/**
 * Get fee balance summary for a student.
 * Backend: GET /payments/students/{student_id}/summary + GET /payments/schedules?student_id=...
 */
export function useFeeBalance(studentId: string) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.guardianPortal.fees(studentId),
    queryFn: async (): Promise<ChildFeeBalance> => {
      const [summaryRes, schedulesRes] = await Promise.all([
        api.get(`/payments/students/${studentId}/summary`).catch(() => ({ data: null })),
        api.get(`/payments/schedules`, { params: { student_id: studentId, size: 50 } }).catch(() => ({ data: null })),
      ]);

      const summary = summaryRes.data;
      const scheduleItems: Record<string, unknown>[] = schedulesRes.data?.items ?? [];

      const firstDue = scheduleItems
        .filter((s) => s.status === 'pending' && s.due_date)
        .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))[0];

      return {
        studentId,
        total: Number(summary?.total_due ?? summary?.total_amount ?? summary?.total ?? 0),
        paid: Number(summary?.total_paid ?? summary?.paid_amount ?? summary?.paid ?? 0),
        outstanding: Number(summary?.total_balance ?? summary?.balance ?? summary?.outstanding ?? 0),
        dueDate: String(firstDue?.due_date ?? ''),
        breakdown: scheduleItems.map((item) => ({
          id: (item.id ?? '') as string,
          type: (item.fee_type ?? item.name ?? 'Fee') as string,
          amount: Number(item.total_amount ?? item.amount ?? 0),
          paid: Number(item.paid_amount ?? 0),
          balance: Number(item.balance ?? item.remaining_amount ?? 0),
          dueDate: (item.due_date ?? '') as string,
        })),
      };
    },
    enabled: authReady && !!studentId,
  });
}

/**
 * Get payment history for a student.
 * Backend: GET /payments/history?student_id=...
 */
export function usePaymentHistory(studentId: string) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.guardianPortal.payments(studentId),
    queryFn: async (): Promise<PaymentRecord[]> => {
      try {
        const { data } = await api.get("/payments/history", {
          params: { student_id: studentId, size: 100 },
        });
        const items = data?.items ?? (Array.isArray(data) ? data : []);
        return items.map((p: Record<string, unknown>): PaymentRecord => ({
          id: (p.id ?? '') as string,
          date: (p.created_at ?? p.date ?? '') as string,
          amount: (p.amount ?? 0) as number,
          method: (p.payment_method ?? p.method ?? 'cash') as string,
          status: (p.status ?? 'pending') as PaymentRecord['status'],
          receiptUrl: (p.receipt_url ?? '') as string,
          reference: (p.tx_ref ?? p.receipt_number ?? '') as string,
        }));
      } catch {
        return [];
      }
    },
    enabled: authReady && !!studentId,
  });
}

/**
 * Initiate a Chapa payment for a student's fee.
 * Backend: POST /payments/chapa/initialize
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      studentId: string;
      amount: number;
      method: string;
      scheduleId?: string;
    }) => {
      const { data } = await api.post("/payments/chapa/initialize", {
        student_id: payload.studentId,
        schedule_id: payload.scheduleId,
        amount: payload.amount,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.fees(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.payments(variables.studentId),
      });
      toast.success("Payment initiated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to initiate payment"));
    },
  });
}
