import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';
import type { ChildFeeBalance, PaymentRecord } from '../types';

export function useFeeBalance(studentId: string) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.fees(studentId),
    queryFn: async () => {
      const { data } = await api.get<ChildFeeBalance>(
        `/api/students/${studentId}/fees/balance`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function usePaymentHistory(studentId: string) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.payments(studentId),
    queryFn: async () => {
      const { data } = await api.get<PaymentRecord[]>(
        `/api/students/${studentId}/payments`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { studentId: string; amount: number; method: string }) => {
      const { data } = await api.post('/api/payments/initiate', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.fees(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.payments(variables.studentId),
      });
      toast.success('Payment initiated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    },
  });
}
