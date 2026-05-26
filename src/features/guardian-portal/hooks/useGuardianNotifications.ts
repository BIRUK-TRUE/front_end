import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance as api } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { GuardianNotification } from "../types";
import type { PaginatedResponse } from "../../student-portal/types";

interface NotificationFilters {
  page?: number;
  size?: number;
  is_read?: boolean;
  type?: string;
}

/**
 * Get guardian's notifications.
 * Backend: GET /notifications/me (returns current user's notifications)
 *
 * NOTE: The backend doesn't have a guardian-specific notification endpoint.
 * We use the generic /notifications/me which returns notifications for the
 * authenticated user (including guardians).
 */
export function useGuardianNotifications(filters: NotificationFilters) {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const guardianId = user?.guardian_id ?? "";

  return useQuery({
    queryKey: queryKeys.guardianPortal.notifications(guardianId, filters),
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.page ?? 1,
        size: filters.size ?? 20,
      };
      // Backend status filter accepts: unread | read | archived (not type names)
      if (filters.is_read === false) params.status = 'unread';
      else if (filters.is_read === true) params.status = 'read';
      // type filter maps to notification_type on backend
      if (filters.type) params.notification_type = filters.type;

      const { data } = await api.get(`/notifications/me`, { params });

      // Normalize backend snake_case fields → frontend camelCase
      const items: GuardianNotification[] = (data?.items ?? []).map(
        (n: Record<string, unknown>) => ({
          id: String(n.id ?? ''),
          title: String(n.title ?? ''),
          message: String(n.message ?? n.body ?? ''),
          type: (n.notification_type ?? n.type ?? 'general') as GuardianNotification['type'],
          studentName: String(n.student_name ?? n.related_name ?? ''),
          createdAt: String(n.created_at ?? n.createdAt ?? ''),
          isRead: n.status === 'read' || n.status === 'archived' || Boolean(n.is_read),
        })
      );

      return {
        items,
        total: data?.total ?? items.length,
        page: data?.page ?? 1,
        size: data?.size ?? items.length,
        pages: data?.pages ?? 1,
      } as PaginatedResponse<GuardianNotification>;
    },
    enabled: authReady && !!guardianId,
  });
}

/**
 * Mark a single notification as read.
 * Backend: PATCH /notifications/{id}/read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const guardianId = user?.guardian_id ?? "";

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.notifications(guardianId, {}),
      });
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
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const guardianId = user?.guardian_id ?? "";

  return useMutation({
    mutationFn: async () => {
      await api.patch(`/notifications/me/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.notifications(guardianId, {}),
      });
      toast.success("All notifications marked as read");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(
        formatApiError(error, "Failed to mark all notifications as read"),
      );
    },
  });
}

/**
 * Archive a notification (soft delete).
 * Backend: PATCH /notifications/{id}/archive
 *
 * NOTE: Backend doesn't support DELETE — uses archive instead.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const guardianId = user?.guardian_id ?? "";

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/notifications/${notificationId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.notifications(guardianId, {}),
      });
      toast.success("Notification archived");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to archive notification"));
    },
  });
}
