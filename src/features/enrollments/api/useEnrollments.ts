import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { type Enrollment, type EnrollmentHistory } from '../types';
import { type EnrollmentForm, type TransferForm, type WithdrawalForm } from '../types/schemas';
import { type PaginatedResponse } from '@/features/academics/types';
import { toast } from 'sonner';

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (filters: object) => [...enrollmentKeys.lists(), filters] as const,
  details: () => [...enrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
  byStudent: (studentId: string) => [...enrollmentKeys.all, 'student', studentId] as const,
};

export const useEnrollments = (filters: object = {}) => {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>('/enrollments', { params: filters });
      return data;
    },
  });
};

export const useStudentEnrollmentHistory = (studentId: string) => {
  return useQuery({
    queryKey: enrollmentKeys.byStudent(studentId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Enrollment[]>(`/students/${studentId}/enrollments`);
      return data;
    },
    enabled: !!studentId,
  });
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: EnrollmentForm) => {
      const { data } = await axiosInstance.post('/enrollments', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success('Student enrolled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to enroll student');
    }
  });
};

export const useTransferStudent = (enrollmentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: TransferForm) => {
      const { data } = await axiosInstance.post(`/enrollments/${enrollmentId}/transfer`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success('Student transferred successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to transfer student');
    }
  });
};

export const useWithdrawStudent = (enrollmentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: WithdrawalForm) => {
      const { data } = await axiosInstance.post(`/enrollments/${enrollmentId}/withdraw`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success('Student withdrawn successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to withdraw student');
    }
  });
};
