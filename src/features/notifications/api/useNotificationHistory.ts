'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import type { NotificationHistory, NotificationDetail } from '../types';

const historyKeys = {
  all: ['notifications', 'history'] as const,
  list: (filters: any) => [...historyKeys.all, 'list', filters] as const,
  detail: (id: string) => [...historyKeys.all, 'detail', id] as const,
};

export function useNotificationHistory(filters: any = {}) {
  return useQuery({
    queryKey: historyKeys.list(filters),
    queryFn: async (): Promise<{ items: NotificationHistory[]; total: number }> => {
      const { data } = await axiosInstance.get('/notifications/history', { params: filters });
      return data;
    },
    enabled: true,
  });
}

export function useNotificationDetail(notificationId: string) {
  return useQuery({
    queryKey: historyKeys.detail(notificationId),
    queryFn: async (): Promise<NotificationDetail> => {
      const { data } = await axiosInstance.get(`/notifications/${notificationId}/detail`);
      return data;
    },
    enabled: !!notificationId,
  });
}

export function useRetryFailed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await axiosInstance.post(`/notifications/${notificationId}/retry`);
      return data;
    },
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: historyKeys.detail(notificationId) });
      toast.success('Retry initiated');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to retry notification');
    },
  });
}
