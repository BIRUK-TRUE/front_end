import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { type Enrollment, type EnrollmentHistory } from '../types';
import { type EnrollmentForm, type TransferForm, type WithdrawalForm } from '../types/schemas';
import { type PaginatedResponse } from '@/features/academics/types';
import { toast } from 'sonner';

interface EnrollmentFilters {
  page?: number;
  size?: number;
  studentId?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  yearId?: string;
}

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (filters: EnrollmentFilters) => [...enrollmentKeys.lists(), filters] as const,
  details: () => [...enrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
  byStudent: (studentId: string) => [...enrollmentKeys.all, 'student', studentId] as const,
};

export const useEnrollments = (filters: EnrollmentFilters = {}) => {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>('/enrollments', { params: filters });
      return data;
    },
    enabled: true,
  });
};

export const useStudentEnrollmentHistory = (studentId: string) => {
  return useQuery({
    queryKey: enrollmentKeys.byStudent(studentId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Enrollment[]>(`/enrollments/student/${studentId}`);
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
    onError: (error: { response?: { data?: { detail?: string } } }) => {
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
    onError: (error: { response?: { data?: { detail?: string } } }) => {
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
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to withdraw student');
    }
  });
};

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: enrollmentData }: { id: string; data: Partial<EnrollmentForm> }) => {
      const { data } = await axiosInstance.patch(`/enrollments/${id}`, enrollmentData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(variables.id) });
      toast.success('Enrollment updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update enrollment');
    }
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/enrollments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success('Enrollment deleted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete enrollment');
    }
  });
};
