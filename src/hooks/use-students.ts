'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsService, type StudentFilters } from '@/lib/api/students.service';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: () => studentsService.getAll(filters),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentsService.getById(id),
    enabled: !!id,
  });
}

export function useStudentStats() {
  return useQuery({
    queryKey: queryKeys.students.stats,
    queryFn: () => studentsService.getStats(),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success(t('studentCreated'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('studentCreateFailed'));
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof studentsService.update>[1] }) =>
      studentsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.id),
      });
      toast.success(t('studentUpdated'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('studentUpdateFailed'));
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: studentsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success(t('studentDeleted'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('studentDeleteFailed'));
    },
  });
}

export function useRestoreStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: studentsService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success(t('studentRestored'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('studentRestoreFailed'));
    },
  });
}
