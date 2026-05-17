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
  const t = useTranslations("common");
  return useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      toast.success(t("teacherCreated"));
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
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(variables.id),
      });
      toast.success(t("teacherUpdated"));
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
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      toast.success(t("teacherDeleted"));
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
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      toast.success(t("teacherRestored"));
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, t("teacherRestoreFailed")));
    },
  });
}
