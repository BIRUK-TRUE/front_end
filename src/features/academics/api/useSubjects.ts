import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { type Subject, type PaginatedResponse } from '../types';
import { type SubjectForm } from '../types/schemas';
import { toast } from 'sonner';

export const academicsKeys = {
  all: ['academics'] as const,
  subjects: {
    all: () => [...academicsKeys.all, 'subjects'] as const,
    list: (filters: object) => [...academicsKeys.subjects.all(), 'list', filters] as const,
    detail: (id: string) => [...academicsKeys.subjects.all(), 'detail', id] as const,
  },
  years: {
    all: () => [...academicsKeys.all, 'years'] as const,
    list: (filters: object) => [...academicsKeys.years.all(), 'list', filters] as const,
    detail: (id: string) => [...academicsKeys.years.all(), 'detail', id] as const,
  },
  terms: {
    all: (yearId: string) => [...academicsKeys.years.detail(yearId), 'terms'] as const,
  },
  classes: {
    all: (yearId: string) => [...academicsKeys.years.detail(yearId), 'classes'] as const,
    detail: (classId: string) => [...academicsKeys.all, 'classes', 'detail', classId] as const,
  },
  sections: {
    all: (classId: string) => [...academicsKeys.classes.detail(classId), 'sections'] as const,
  }
};

interface SubjectFilters {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
}

export const useSubjects = (filters: SubjectFilters = { page: 1, size: 20 }) => {
  return useQuery({
    queryKey: academicsKeys.subjects.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Subject>>('/academics/subjects', { params: filters });
      return data;
    }
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: SubjectForm) => {
      const { data } = await axiosInstance.post('/academics/subjects', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.subjects.all() });
      toast.success('Subject created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create subject');
    }
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubjectForm> }) => {
      const response = await axiosInstance.patch(`/academics/subjects/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.subjects.all() });
      toast.success('Subject updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update subject');
    }
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/academics/subjects/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.subjects.all() });
      toast.success('Subject deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete subject');
    }
  });
};
