"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, type UserFilters } from "@/lib/api/users.service";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { useTranslations } from "next-intl";
import { useAuthReady } from "@/hooks/use-auth-ready";

export function useUsers(filters: UserFilters = {}) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersService.getAll(filters),
    enabled: authReady,
    retry: (failureCount, error) => {
      const status = (error as any)?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUser(id: string) {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: authReady && !!id,
  });
}

export function useRoles() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.users.roles,
    queryFn: () => usersService.getRoles(),
    enabled: authReady,
  });
}

export function useUserStats() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: () => usersService.getStats(),
    enabled: authReady,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      // Immediately refetch all users data
      return queryClient.refetchQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("userCreateFailed")));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof usersService.update>[1];
    }) => usersService.update(id, data),
    onSuccess: (_, variables) => {
      // Immediately refetch users list and detail
      return Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.users.all }),
        queryClient.refetchQueries({
          queryKey: queryKeys.users.detail(variables.id),
        }),
      ]);
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("userUpdateFailed")));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      // Immediately refetch all users data
      return queryClient.refetchQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("userDeleteFailed")));
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: usersService.restore,
    onSuccess: () => {
      // Immediately refetch all users data
      return queryClient.refetchQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("userRestoreFailed")));
    },
  });
}

export function useUpdateRoles() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({ id, roleNames }: { id: string; roleNames: string[] }) =>
      usersService.updateRoles(id, roleNames),
    onSuccess: (_, variables) => {
      // Immediately refetch users list and detail
      return Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.users.all }),
        queryClient.refetchQueries({
          queryKey: queryKeys.users.detail(variables.id),
        }),
      ]);
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("rolesUpdateFailed")));
    },
  });
}
