'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import type { 
  StudentFee, 
  PaymentTransaction, 
  GuardianDashboardData, 
  CreatePaymentRequest,
  ChapaPaymentPayload 
} from '../types';

const paymentsKeys = {
  all: ['payments'] as const,
  guardian: (guardianId: string) => [...paymentsKeys.all, 'guardian', guardianId] as const,
  studentFees: (studentId: string) => [...paymentsKeys.all, 'fees', studentId] as const,
  transactions: (studentId: string) => [...paymentsKeys.all, 'transactions', studentId] as const,
  history: (guardianId: string) => [...paymentsKeys.all, 'history', guardianId] as const,
};

// Get guardian dashboard data
export function useGuardianDashboard(guardianId: string) {
  return useQuery({
    queryKey: paymentsKeys.guardian(guardianId),
    queryFn: async (): Promise<GuardianDashboardData> => {
      const { data } = await axiosInstance.get(`/guardians/${guardianId}/dashboard`);
      return data;
    },
    enabled: !!guardianId,
  });
}

// Get student fees
export function useStudentFees(studentId: string) {
  return useQuery({
    queryKey: paymentsKeys.studentFees(studentId),
    queryFn: async (): Promise<StudentFee[]> => {
      const { data } = await axiosInstance.get(`/students/${studentId}/fees`);
      return data;
    },
    enabled: !!studentId,
  });
}

// Get payment transactions
export function usePaymentTransactions(studentId: string) {
  return useQuery({
    queryKey: paymentsKeys.transactions(studentId),
    queryFn: async (): Promise<PaymentTransaction[]> => {
      const { data } = await axiosInstance.get(`/students/${studentId}/payments`);
      return data;
    },
    enabled: !!studentId,
  });
}

// Get payment history for guardian
export function usePaymentHistory(guardianId: string) {
  return useQuery({
    queryKey: paymentsKeys.history(guardianId),
    queryFn: async (): Promise<PaymentTransaction[]> => {
      const { data } = await axiosInstance.get(`/guardians/${guardianId}/payments`);
      return data;
    },
    enabled: !!guardianId,
  });
}

// Initialize Chapa payment
export function useInitiateChapaPayment() {
  return useMutation({
    mutationFn: async (payload: ChapaPaymentPayload & { fee_id: string }) => {
      const { data } = await axiosInstance.post('/payments/chapa/initialize', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Redirecting to Chapa payment...');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    },
  });
}

// Verify Chapa payment
export function useVerifyChapaPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reference }: { reference: string }) => {
      const { data } = await axiosInstance.post(`/payments/chapa/verify/${reference}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      toast.success('Payment verified successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to verify payment');
    },
  });
}

// Create manual payment (for admin/registrar)
export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePaymentRequest) => {
      const { data } = await axiosInstance.post('/payments', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.studentFees(variables.fee_id),
      });
      toast.success('Payment recorded successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to record payment');
    },
  });
}
