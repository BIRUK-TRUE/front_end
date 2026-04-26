'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type SchoolInfo, type AcademicSettings, type NotificationSettings } from '@/lib/api/settings.service';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('common');
  return useMutation({
    mutationFn: (data: Partial<SchoolInfo>) => settingsService.updateSchoolInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.schoolInfo });
      toast.success(t('settingsSaved'));
    },
    onError: () => {
      toast.error(t('settingsSaveFailed'));
    },
  });
}

export function useUpdateAcademicSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: (data: Partial<AcademicSettings>) => settingsService.updateAcademicSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.academic });
      toast.success(t('settingsSaved'));
    },
    onError: () => {
      toast.error(t('settingsSaveFailed'));
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) => settingsService.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.notifications });
      toast.success(t('settingsSaved'));
    },
    onError: () => {
      toast.error(t('settingsSaveFailed'));
    },
  });
}
