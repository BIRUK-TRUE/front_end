import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { type AcademicYear, type PaginatedResponse } from '../types';
import { type AcademicYearForm } from '../types/schemas';
import { academicsKeys } from './useSubjects'; // Sharing the key factory
import { toast } from 'sonner';

export const useAcademicYears = (page = 1, size = 20) => {
  return useQuery({
    queryKey: academicsKeys.years.list({ page, size }),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<AcademicYear>>('/academics/years', {
        params: { page, size }
      });
      return data;
    }
  });
};

export const useAcademicYear = (id: string) => {
  return useQuery({
    queryKey: academicsKeys.years.detail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AcademicYear>(`/academics/years/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: AcademicYearForm) => {
      const { data } = await axiosInstance.post('/academics/years', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.years.all() });
      toast.success('Academic Year created successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create academic year');
    }
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AcademicYearForm> & { is_current?: boolean, status?: string } }) => {
      const response = await axiosInstance.patch(`/academics/years/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.years.all() });
      queryClient.invalidateQueries({ queryKey: academicsKeys.years.detail(variables.id) });
      toast.success('Academic Year updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update academic year');
    }
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/years/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.years.all() });
      toast.success('Academic Year deleted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete academic year');
    }
  });
};
