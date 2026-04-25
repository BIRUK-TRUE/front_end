'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import type { Notification, NotificationPreferences, CreateNotificationPayload } from '../types';

const notificationsKeys = {
  all: ['notifications'] as const,
  list: (userId: string) => [...notificationsKeys.all, 'list', userId] as const,
  unread: (userId: string) => [...notificationsKeys.all, 'unread', userId] as const,
  preferences: (userId: string) => [...notificationsKeys.all, 'preferences', userId] as const,
};

// Get all notifications for user
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: notificationsKeys.list(userId),
    queryFn: async (): Promise<Notification[]> => {
      const { data } = await axiosInstance.get(`/notifications`);
      return data;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Get unread count
export function useUnreadNotifications(userId: string) {
  return useQuery({
    queryKey: notificationsKeys.unread(userId),
    queryFn: async (): Promise<number> => {
      const { data } = await axiosInstance.get(`/notifications/unread/count`);
      return data.count;
    },
    enabled: !!userId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
  });
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await axiosInstance.post(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success('Notification marked as read');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to mark notification as read');
    },
  });
}

// Mark all as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post(`/notifications/read-all`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success('All notifications marked as read');
    },
  });
}

// Get notification preferences
export function useNotificationPreferences(userId: string) {
  return useQuery({
    queryKey: notificationsKeys.preferences(userId),
    queryFn: async (): Promise<NotificationPreferences> => {
      const { data } = await axiosInstance.get(`/notifications/preferences`);
      return data;
    },
    enabled: !!userId,
  });
}

// Update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data } = await axiosInstance.patch(`/notifications/preferences`, preferences);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.preferences('') });
      toast.success('Preferences updated');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update preferences');
    },
  });
}

// Create notification (admin only)
export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateNotificationPayload) => {
      const { data } = await axiosInstance.post(`/notifications`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success('Notification sent');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to send notification');
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await axiosInstance.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success('Notification deleted');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete notification');
    },
  });
}
