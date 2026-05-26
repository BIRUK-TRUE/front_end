"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  studentsService,
  type StudentFilters,
} from "@/lib/api/students.service";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { useTranslations } from "next-intl";
import { useAuthReady } from "@/hooks/use-auth-ready";

export function useStudents(filters: StudentFilters = {}) {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: () => studentsService.getAll(filters),
    enabled: authReady,
  });
}

export function useStudent(id: string) {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentsService.getById(id),
    enabled: authReady && !!id,
  });
}

export function useStudentStats() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.students.stats,
    queryFn: () => studentsService.getStats(),
    enabled: authReady,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => {
      // Immediately refetch all students data
      return queryClient.refetchQueries({ queryKey: queryKeys.students.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("studentCreateFailed")));
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof studentsService.update>[1];
    }) => studentsService.update(id, data),
    onSuccess: (_, variables) => {
      // Immediately refetch students list and detail
      return Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.students.all }),
        queryClient.refetchQueries({
          queryKey: queryKeys.students.detail(variables.id),
        }),
      ]);
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("studentUpdateFailed")));
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: studentsService.delete,
    onSuccess: () => {
      // Immediately refetch all students data
      return queryClient.refetchQueries({ queryKey: queryKeys.students.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("studentDeleteFailed")));
    },
  });
}

export function useRestoreStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: studentsService.restore,
    onSuccess: () => {
      // Immediately refetch all students data
      return queryClient.refetchQueries({ queryKey: queryKeys.students.all });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("studentRestoreFailed")));
    },
  });
}
