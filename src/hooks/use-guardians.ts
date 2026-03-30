'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  guardiansService,
  type GuardianFilters,
  type StudentLinkPayload,
} from '@/lib/api/guardians.service';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';

export function useGuardians(filters: GuardianFilters = {}) {
  return useQuery({
    queryKey: queryKeys.guardians.list(filters),
    queryFn: () => guardiansService.getAll(filters),
  });
}

export function useGuardian(id: string) {
  return useQuery({
    queryKey: queryKeys.guardians.detail(id),
    queryFn: () => guardiansService.getById(id),
    enabled: !!id,
  });
}

export function useGuardianStats() {
  return useQuery({
    queryKey: queryKeys.guardians.stats,
    queryFn: () => guardiansService.getStats(),
  });
}

export function useGuardiansForStudent(studentId: string) {
  return useQuery({
    queryKey: queryKeys.guardians.forStudent(studentId),
    queryFn: () => guardiansService.getForStudent(studentId),
    enabled: !!studentId,
  });
}

export function useCreateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: guardiansService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guardians.all });
      toast.success('Guardian created successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create guardian');
    },
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof guardiansService.update>[1] }) =>
      guardiansService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guardians.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardians.detail(variables.id),
      });
      toast.success('Guardian updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update guardian');
    },
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: guardiansService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guardians.all });
      toast.success('Guardian deleted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete guardian');
    },
  });
}

export function useLinkStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      guardianId,
      payload,
    }: {
      guardianId: string;
      payload: StudentLinkPayload;
    }) => guardiansService.linkStudent(guardianId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardians.detail(variables.guardianId),
      });
      toast.success('Student linked successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to link student');
    },
  });
}

export function useUnlinkStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      guardianId,
      studentId,
    }: {
      guardianId: string;
      studentId: string;
    }) => guardiansService.unlinkStudent(guardianId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardians.detail(variables.guardianId),
      });
      toast.success('Student unlinked successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to unlink student');
    },
  });
}
