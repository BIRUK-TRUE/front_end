import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { type Term, type PaginatedResponse } from '../types';
import { type TermForm } from '../types/schemas';
import { academicsKeys } from './useSubjects'; // Sharing the key factory
import { toast } from 'sonner';

export const useTerms = (yearId: string) => {
  return useQuery({
    queryKey: [...academicsKeys.years.detail(yearId), 'terms'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Term>>(`/academics/years/${yearId}/terms`, {
        params: { page: 1, size: 50 } // Terms usually don't exceed a handful per year
      });
      return data;
    },
    enabled: !!yearId,
  });
};

export const useCreateTerm = (yearId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: TermForm) => {
      const { data } = await axiosInstance.post(`/academics/years/${yearId}/terms`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...academicsKeys.years.detail(yearId), 'terms'] });
      queryClient.invalidateQueries({ queryKey: academicsKeys.years.detail(yearId) }); // Invalidate year to update term_count
      toast.success('Term created successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create term');
    }
  });
};

export const useUpdateTerm = (yearId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TermForm> & { is_active?: boolean } }) => {
      const response = await axiosInstance.patch(`/academics/terms/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...academicsKeys.years.detail(yearId), 'terms'] });
      toast.success('Term updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update term');
    }
  });
};

export const useDeleteTerm = (yearId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...academicsKeys.years.detail(yearId), 'terms'] });
      queryClient.invalidateQueries({ queryKey: academicsKeys.years.detail(yearId) }); // Update term count
      toast.success('Term deleted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete term. Ensure it has no active dependencies.');
    }
  });
};
