'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import type { AlertRule } from '../types';

const alertRulesKeys = {
  all: ['notification-rules'] as const,
  list: () => [...alertRulesKeys.all, 'list'] as const,
};

export function useAlertRules() {
  return useQuery({
    queryKey: alertRulesKeys.list(),
    queryFn: async (): Promise<AlertRule[]> => {
      const { data } = await axiosInstance.get('/notification-rules');
      return data;
    },
    enabled: true,
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ruleId, ...data }: Partial<AlertRule> & { ruleId: string }) => {
      const { data: response } = await axiosInstance.patch(`/notification-rules/${ruleId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertRulesKeys.all });
      toast.success('Alert rule updated');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update alert rule');
    },
  });
}

export function useToggleAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
      const { data } = await axiosInstance.patch(`/notification-rules/${ruleId}/toggle`, { enabled });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: alertRulesKeys.all });
      toast.success(variables.enabled ? 'Alert rule enabled' : 'Alert rule disabled');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to toggle alert rule');
    },
  });
}
