"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  guardiansService,
  type GuardianFilters,
  type StudentLinkPayload,
} from "@/lib/api/guardians.service";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { useTranslations } from "next-intl";
import { useAuthReady } from "@/hooks/use-auth-ready";

export function useGuardians(filters: GuardianFilters = {}) {
  const authReady = useAuthReady();
  
  console.log('🔍 [useGuardians Hook] authReady:', authReady);
  console.log('🔍 [useGuardians Hook] filters:', filters);
  
  return useQuery({
    queryKey: queryKeys.guardians.list(filters),
    queryFn: () => guardiansService.getAll(filters),
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

export function useGuardian(id: string) {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.guardians.detail(id),
    queryFn: () => guardiansService.getById(id),
    enabled: authReady && !!id,
  });
}

export function useGuardianStats() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.guardians.stats,
    queryFn: () => guardiansService.getStats(),
    enabled: authReady,
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
  const t = useTranslations("common");
  return useMutation({
    mutationFn: guardiansService.create,
    onSuccess: () => {
      // Immediately refetch all guardians data
      return queryClient.refetchQueries({ queryKey: queryKeys.guardians.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("guardianCreateFailed")));
    },
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof guardiansService.update>[1];
    }) => guardiansService.update(id, data),
    onSuccess: (_, variables) => {
      // Immediately refetch guardians list and detail
      return Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.guardians.all }),
        queryClient.refetchQueries({
          queryKey: queryKeys.guardians.detail(variables.id),
        }),
      ]);
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("guardianUpdateFailed")));
    },
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: guardiansService.delete,
    onSuccess: () => {
      // Immediately refetch all guardians data
      return queryClient.refetchQueries({ queryKey: queryKeys.guardians.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("guardianDeleteFailed")));
    },
  });
}

export function useLinkStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({
      guardianId,
      payload,
    }: {
      guardianId: string;
      payload: StudentLinkPayload;
    }) => guardiansService.linkStudent(guardianId, payload),
    onSuccess: (_, variables) => {
      // Immediately refetch guardian details
      return queryClient.refetchQueries({
        queryKey: queryKeys.guardians.detail(variables.guardianId),
      });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("studentLinkFailed")));
    },
  });
}

export function useUnlinkStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({
      guardianId,
      studentId,
    }: {
      guardianId: string;
      studentId: string;
    }) => guardiansService.unlinkStudent(guardianId, studentId),
    onSuccess: (_, variables) => {
      // Immediately refetch guardian details
      return queryClient.refetchQueries({
        queryKey: queryKeys.guardians.detail(variables.guardianId),
      });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("studentUnlinkFailed")));
    },
  });
}
