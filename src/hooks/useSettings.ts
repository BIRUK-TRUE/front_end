'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService, type SchoolInfo, type AcademicSettings, type NotificationSettings } from "@/lib/api/settings.service";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const settingsKeys = {
  all: ['settings'] as const,
  school: () => [...settingsKeys.all, 'school'] as const,
  academic: () => [...settingsKeys.all, 'academic'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
};

export const useSchoolInfo = () => {
  return useQuery({
    queryKey: settingsKeys.school(),
    queryFn: settingsService.getSchoolInfo,
  });
};

export const useAcademicSettings = () => {
  return useQuery({
    queryKey: settingsKeys.academic(),
    queryFn: settingsService.getAcademicSettings,
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: settingsService.getNotificationSettings,
  });
};

export const useUpdateSettings = (type: 'school' | 'academic' | 'notifications') => {
  const queryClient = useQueryClient();
  const t = useTranslations("settings");

  return useMutation({
    mutationFn: async (data: SchoolInfo | AcademicSettings | NotificationSettings) => {
      switch (type) {
        case 'school':
          return settingsService.updateSchoolInfo(data as SchoolInfo);
        case 'academic':
          return settingsService.updateAcademicSettings(data as AcademicSettings);
        case 'notifications':
          return settingsService.updateNotificationSettings(data as NotificationSettings);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys[type]() });
      toast.success(t("savedSuccess"));
    },
    onError: () => {
      toast.error(t("saveFailed"));
    },
  });
};
