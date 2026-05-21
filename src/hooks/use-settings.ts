"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  settingsService,
  type SchoolInfo,
  type AcademicSettings,
  type NotificationSettings,
} from "@/lib/api/settings.service";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { useTranslations } from "next-intl";

export function useSchoolInfo() {
  return useQuery({
    queryKey: queryKeys.settings.schoolInfo,
    queryFn: settingsService.getSchoolInfo,
    staleTime: 0,
  });
}

export function useAcademicSettings() {
  return useQuery({
    queryKey: queryKeys.settings.academic,
    queryFn: settingsService.getAcademicSettings,
    staleTime: 0,
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.settings.notifications,
    queryFn: settingsService.getNotificationSettings,
    staleTime: 0,
  });
}

export function useUpdateSchoolInfo() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: (data: Partial<SchoolInfo>) =>
      settingsService.updateSchoolInfo(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.schoolInfo });
      const previous = queryClient.getQueryData<SchoolInfo>(queryKeys.settings.schoolInfo);
      queryClient.setQueryData(queryKeys.settings.schoolInfo, {
        ...previous,
        ...data,
      });
      return { previous };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings.schoolInfo, data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.schoolInfo,
      });
      toast.success(t("settingsSaved"));
    },
    onError: (_error, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.schoolInfo, context.previous);
      }
      toast.error(t("settingsSaveFailed"));
    },
  });
}

export function useUpdateAcademicSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: (data: Partial<AcademicSettings>) =>
      settingsService.updateAcademicSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.academic });
      toast.success(t("settingsSaved"));
    },
    onError: () => {
      toast.error(t("settingsSaveFailed"));
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      settingsService.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.notifications,
      });
      toast.success(t("settingsSaved"));
    },
    onError: () => {
      toast.error(t("settingsSaveFailed"));
    },
  });
}

export function useSmsProviders() {
  return useQuery({
    queryKey: ["settings", "sms", "providers"],
    queryFn: settingsService.getSmsProviders,
  });
}

export function useSmsLogs(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["settings", "sms", "logs", limit, offset],
    queryFn: () => settingsService.getSmsLogs(limit, offset),
  });
}

export function useActivateSmsProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) =>
      settingsService.activateSmsProvider(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "sms", "providers"],
      });
      toast.success("SMS Provider activated");
    },
  });
}

export function useTestSms() {
  return useMutation({
    mutationFn: (payload: { phone: string; message: string }) =>
      settingsService.testSms(payload),
    onSuccess: () => {
      toast.success("Test SMS sent successfully");
    },
    onError: (error: unknown) => {
      toast.error(formatApiError(error, "Failed to send test SMS"));
    },
  });
}
