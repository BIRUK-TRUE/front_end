"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type {
  Notification,
  NotificationPreferences,
  CreateNotificationPayload,
  NotificationHistory,
  AlertRule,
  NotificationDetail,
} from "../types";
import { NotificationPriority } from "../types";

/**
 * Map backend NotificationResponse → frontend Notification shape.
 * The backend sends `notification_type` instead of `type`, omits `priority`,
 * and omits `is_automated` — this normalizer bridges that gap safely.
 */
function normalizeNotification(raw: Record<string, unknown>): Notification {
  const type = (raw.notification_type ?? raw.type ?? "system") as string;
  const priority = ((raw.priority as string) ??
    NotificationPriority.LOW) as Notification["priority"];
  return {
    id: raw.id as string,
    type: type as Notification["type"],
    priority,
    title: (raw.title ?? "") as string,
    message: (raw.message ?? "") as string,
    data: raw.metadata as Record<string, unknown> | undefined,
    read_at: (raw.read_at ?? null) as string | null,
    created_at: raw.created_at as string,
    user_id: raw.user_id as string,
    link: raw.link as string | undefined,
    icon: raw.icon as string | undefined,
    is_automated: (raw.is_automated ?? false) as boolean,
  };
}

const notificationsKeys = {
  all: ["notifications"] as const,
  list: (userId: string) =>
    [...notificationsKeys.all, "list", userId] as const,
  unread: (userId: string) =>
    [...notificationsKeys.all, "unread", userId] as const,
  preferences: (userId: string) =>
    [...notificationsKeys.all, "preferences", userId] as const,
  history: (filters?: Record<string, unknown>) =>
    [...notificationsKeys.all, "history", filters] as const,
  detail: (id: string) => [...notificationsKeys.all, "detail", id] as const,
  announcements: () => [...notificationsKeys.all, "announcements"] as const,
  announcement: (id: string) =>
    [...notificationsKeys.all, "announcement", id] as const,
  alertRules: () => [...notificationsKeys.all, "alertRules"] as const,
  alertRule: (id: string) =>
    [...notificationsKeys.all, "alertRule", id] as const,
};

// ==========================================
// NOTIFICATIONS (User Inbox)
// ==========================================

/**
 * Get current user's notifications (paginated).
 * Backend: GET /notifications/me
 */
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: notificationsKeys.list(userId),
    queryFn: async (): Promise<Notification[]> => {
      const { data } = await axiosInstance.get(`/notifications/me`, {
        params: { page: 1, size: 50 },
      });
      const arr = Array.isArray(data) ? data : (data?.items ?? []);
      return arr.map(normalizeNotification);
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

/**
 * Get unread notification count.
 * Backend: GET /notifications/me/unread-count
 */
export function useUnreadNotifications(userId: string) {
  return useQuery({
    queryKey: notificationsKeys.unread(userId),
    queryFn: async (): Promise<number> => {
      const { data } = await axiosInstance.get(`/notifications/me/unread-count`);
      return data.unread_count ?? data.count ?? 0;
    },
    enabled: !!userId,
    refetchInterval: 10000,
  });
}

/**
 * Get notification history — returns announcements list as history.
 * Backend: GET /announcements
 */
export function useNotificationHistory(filters?: {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  channel?: string;
  target?: string;
}) {
  return useQuery({
    queryKey: notificationsKeys.history(filters),
    queryFn: async (): Promise<NotificationHistory[]> => {
      const { data } = await axiosInstance.get("/announcements", {
        params: {
          page: 1,
          size: 50,
          include_unpublished: false,
        },
      });
      const items = data?.items ?? [];
      return items.map(
        (a: Record<string, unknown>): NotificationHistory => ({
          id: a.id as string,
          type: "manual",
          title: (a.title ?? "") as string,
          message_preview: ((a.content ?? a.message ?? "") as string).slice(0, 140),
          sent_at: (a.published_at ?? a.created_at ?? "") as string,
          sent_by_name: (a.created_by_name ?? "School admin") as string,
          recipient_count: (a.recipients_count ?? 0) as number,
          priority: NotificationPriority.MEDIUM,
          status: {
            delivered: (a.recipients_count ?? 0) as number,
            pending: 0,
            failed: 0,
          },
        }),
      );
    },
  });
}

/**
 * Get a single announcement detail.
 * Backend: GET /announcements/{id}
 */
export function useNotificationDetail(id: string) {
  return useQuery({
    queryKey: notificationsKeys.detail(id),
    queryFn: async (): Promise<NotificationDetail> => {
      const { data } = await axiosInstance.get(`/announcements/${id}`);
      return {
        id: data.id,
        type: "manual",
        title: data.title ?? "",
        message_preview: (data.content ?? data.message ?? "").slice(0, 140),
        full_message: data.content ?? data.message ?? "",
        sent_at: data.published_at ?? data.created_at ?? "",
        sent_by_name: data.created_by_name ?? "School admin",
        recipient_count: data.recipients_count ?? 0,
        priority: NotificationPriority.MEDIUM,
        status: {
          delivered: data.recipients_count ?? 0,
          pending: 0,
          failed: 0,
        },
        recipients: [],
      };
    },
    enabled: !!id,
  });
}

// ==========================================
// MARK AS READ
// ==========================================

/**
 * Mark a single notification as read.
 * Backend: PATCH /notifications/{id}/read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await axiosInstance.patch(
        `/notifications/${notificationId}/read`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success("Notification marked as read");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to mark notification as read"));
    },
  });
}

/**
 * Mark all notifications as read.
 * Backend: PATCH /notifications/me/read-all
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.patch(`/notifications/me/read-all`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success("All notifications marked as read");
    },
  });
}

// ==========================================
// NOTIFICATION PREFERENCES (stubbed — no backend endpoint yet)
// ==========================================

export function useNotificationPreferences(userId: string) {
  return useQuery({
    queryKey: notificationsKeys.preferences(userId),
    queryFn: async (): Promise<NotificationPreferences> => {
      // Backend does not have a preferences endpoint yet.
      // Return sensible defaults.
      return {
        user_id: userId,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        attendance_alerts: true,
        grade_published: true,
        fee_reminders: true,
        schedule_changes: true,
        announcement_alerts: true,
      };
    },
    enabled: !!userId,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_preferences: Partial<NotificationPreferences>) => {
      // Backend does not support this yet — no-op.
      toast.info("Notification preferences will be available soon");
      return _preferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.preferences(""),
      });
    },
  });
}

// ==========================================
// CREATE / SEND NOTIFICATION
// ==========================================

/**
 * Send an in-app notification.
 * Backend: POST /notifications
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateNotificationPayload) => {
      const { data } = await axiosInstance.post(`/notifications`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.history() });
      toast.success("Notification sent");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to send notification"));
    },
  });
}

/** Alias for create. */
export function useSendNotification() {
  return useCreateNotification();
}

/**
 * Archive a notification (soft delete).
 * Backend: PATCH /notifications/{id}/archive
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await axiosInstance.patch(`/notifications/${notificationId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success("Notification archived");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to archive notification"));
    },
  });
}

// ==========================================
// ANNOUNCEMENTS (Admin-facing)
// ==========================================

export function useAnnouncements(page = 1, size = 20, includeUnpublished = false) {
  return useQuery({
    queryKey: [...notificationsKeys.announcements(), { page, size, includeUnpublished }],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/announcements", {
        params: { page, size, include_unpublished: includeUnpublished },
      });
      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content: string;
      target_roles?: string[];
      is_published?: boolean;
    }) => {
      const { data } = await axiosInstance.post("/announcements", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.history() });
      toast.success("Announcement created");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create announcement"));
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        title?: string;
        content?: string;
        target_roles?: string[];
        is_published?: boolean;
      };
    }) => {
      const { data } = await axiosInstance.patch(`/announcements/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.announcements() });
      toast.success("Announcement updated");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update announcement"));
    },
  });
}

// ==========================================
// ALERT RULES (stubbed — no backend endpoint yet)
// ==========================================

export function useAlertRules() {
  return useQuery({
    queryKey: notificationsKeys.alertRules(),
    queryFn: async (): Promise<AlertRule[]> => {
      // Backend does not have alert rules endpoints yet.
      return [];
    },
  });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_payload: Omit<AlertRule, "id" | "created_at">) => {
      toast.info("Alert rules will be available soon");
      return _payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.alertRules(),
      });
    },
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payload,
    }: {
      id: string;
      payload: Partial<AlertRule>;
    }) => {
      toast.info("Alert rules will be available soon");
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.alertRules(),
      });
    },
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      void id;
      toast.info("Alert rules will be available soon");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.alertRules(),
      });
    },
  });
}
