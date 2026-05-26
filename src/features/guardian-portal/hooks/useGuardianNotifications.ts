import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance as api } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
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
      if (filters.type) {
        params.status = filters.type;
      }

      const { data } = await api.get<PaginatedResponse<GuardianNotification>>(
        `/notifications/me`,
        { params },
      );
      return data;
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
