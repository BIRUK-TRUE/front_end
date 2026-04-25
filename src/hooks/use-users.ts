'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type UserFilters } from '@/lib/api/users.service';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersService.getAll(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.users.roles,
    queryFn: () => usersService.getRoles(),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: () => usersService.getStats(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(t('userCreated'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('userCreateFailed'));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersService.update>[1] }) =>
      usersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
      toast.success(t('userUpdated'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('userUpdateFailed'));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(t('userDeleted'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('userDeleteFailed'));
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: usersService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(t('userRestored'));
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || t('userRestoreFailed'));
    },
  });
}
