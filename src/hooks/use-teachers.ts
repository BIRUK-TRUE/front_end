'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersService, type TeacherFilters } from '@/lib/api/teachers.service';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';

export function useTeachers(filters: TeacherFilters = {}) {
  return useQuery({
    queryKey: queryKeys.teachers.list(filters),
    queryFn: () => teachersService.getAll(filters),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: () => teachersService.getById(id),
    enabled: !!id,
  });
}

export function useTeacherStats() {
  return useQuery({
    queryKey: queryKeys.teachers.stats,
    queryFn: () => teachersService.getStats(),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      toast.success('Teacher created successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create teacher');
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof teachersService.update>[1] }) =>
      teachersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(variables.id),
      });
      toast.success('Teacher updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update teacher');
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teachersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      toast.success('Teacher deleted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete teacher');
    },
  });
}

export function useRestoreTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teachersService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      toast.success('Teacher restored successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to restore teacher');
    },
  });
}
