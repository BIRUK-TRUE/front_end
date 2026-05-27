"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  teachersService,
  type TeacherFilters,
} from "@/lib/api/teachers.service";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { useTranslations } from "next-intl";
import { useAuthReady } from "@/hooks/use-auth-ready";

export function useTeachers(filters: TeacherFilters = {}) {
  const authReady = useAuthReady();
  
  console.log('🔍 [useTeachers Hook] authReady:', authReady);
  console.log('🔍 [useTeachers Hook] filters:', filters);
  
  return useQuery({
    queryKey: queryKeys.teachers.list(filters),
    queryFn: () => teachersService.getAll(filters),
    enabled: authReady,
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (auth issues)
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 403) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTeacher(id: string) {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: () => teachersService.getById(id),
    enabled: authReady && !!id,
  });
}

export function useTeacherStats() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.teachers.stats,
    queryFn: () => teachersService.getStats(),
    enabled: authReady,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => {
      // Immediately refetch all teachers data
      return queryClient.refetchQueries({ queryKey: queryKeys.teachers.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("teacherCreateFailed")));
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof teachersService.update>[1];
    }) => teachersService.update(id, data),
    onSuccess: (_, variables) => {
      // Immediately refetch teachers list and detail
      return Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.teachers.all }),
        queryClient.refetchQueries({
          queryKey: queryKeys.teachers.detail(variables.id),
        }),
      ]);
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("teacherUpdateFailed")));
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: teachersService.delete,
    onSuccess: () => {
      // Immediately refetch all teachers data
      return queryClient.refetchQueries({ queryKey: queryKeys.teachers.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("teacherDeleteFailed")));
    },
  });
}

export function useRestoreTeacher() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: teachersService.restore,
    onSuccess: () => {
      // Immediately refetch all teachers data
      return queryClient.refetchQueries({ queryKey: queryKeys.teachers.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("teacherRestoreFailed")));
    },
  });
}
