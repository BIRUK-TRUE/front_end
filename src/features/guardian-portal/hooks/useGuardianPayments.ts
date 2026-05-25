import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance as api } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { ChildFeeBalance, PaymentRecord } from "../types";

/**
 * Get fee balance summary for a student.
 * Backend: GET /payments/students/{student_id}/summary
 */
export function useFeeBalance(studentId: string) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.fees(studentId),
    queryFn: async (): Promise<ChildFeeBalance> => {
      try {
        const { data } = await api.get(
          `/payments/students/${studentId}/summary`,
        );
        return {
          studentId,
          total: data?.total_amount ?? data?.total ?? 0,
          paid: data?.paid_amount ?? data?.paid ?? 0,
          outstanding: data?.balance ?? data?.outstanding ?? 0,
          dueDate: data?.next_due_date ?? '',
          breakdown: (data?.items ?? []).map((item: Record<string, unknown>) => ({
            id: (item.id ?? '') as string,
            type: (item.fee_type ?? item.name ?? '') as string,
            amount: (item.total_amount ?? item.amount ?? 0) as number,
            paid: (item.paid_amount ?? 0) as number,
            balance: (item.balance ?? 0) as number,
            dueDate: (item.due_date ?? '') as string,
          })),
        };
      } catch {
        return {
          studentId,
          total: 0,
          paid: 0,
          outstanding: 0,
          dueDate: '',
          breakdown: [],
        };
      }
    },
    enabled: isHydrated && !!studentId,
  });
}

/**
 * Get payment history for a student.
 * Backend: GET /payments/history?student_id=...
 */
export function usePaymentHistory(studentId: string) {
  const { isHydrated } = useAuthStore();

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
    enabled: isHydrated && !!studentId,
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
