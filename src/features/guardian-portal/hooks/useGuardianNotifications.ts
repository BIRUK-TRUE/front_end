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

export function useGuardianNotifications(filters: NotificationFilters) {
  const { user, isHydrated } = useAuthStore();
  const guardianId = user?.guardian_id ?? "";

  return useQuery({
    queryKey: queryKeys.guardianPortal.notifications(guardianId, filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<GuardianNotification>>(
        `/guardians/${guardianId}/notifications`,
        { params: filters },
      );
      return data;
    },
    enabled: isHydrated && !!guardianId,
  });
}

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

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const guardianId = user?.guardian_id ?? "";

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.notifications(guardianId, {}),
      });
      toast.success("Notification deleted");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete notification"));
    },
  });
}
