"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { NotificationHistory, NotificationDetail } from "../types";

interface NotificationHistoryFilters {
  page?: number;
  limit?: number;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  channel?: string;
  target?: string;
  search?: string;
  [key: string]: string | number | boolean | null | undefined;
}

const historyKeys = {
  all: ["notifications", "history"] as const,
  list: (filters: NotificationHistoryFilters) =>
    [...historyKeys.all, "list", filters] as const,
  detail: (id: string) => [...historyKeys.all, "detail", id] as const,
};

export function useNotificationHistory(
  filters: NotificationHistoryFilters = {},
) {
  return useQuery({
    queryKey: historyKeys.list(filters),
    queryFn: async (): Promise<{
      items: NotificationHistory[];
      total: number;
    }> => {
      const { data } = await axiosInstance.get("/notifications/history", {
        params: filters,
      });
      return data;
    },
    enabled: true,
  });
}

export function useNotificationDetail(notificationId: string) {
  return useQuery({
    queryKey: historyKeys.detail(notificationId),
    queryFn: async (): Promise<NotificationDetail> => {
      const { data } = await axiosInstance.get(
        `/notifications/${notificationId}/detail`,
      );
      return data;
    },
    enabled: !!notificationId,
  });
}

export function useRetryFailed() {
  const queryClient = useQueryClient();
  const t = useTranslations("notifications.history.detail");
  const tc = useTranslations("common");

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await axiosInstance.post(
        `/notifications/${notificationId}/retry`,
      );
      return data;
    },
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({
        queryKey: historyKeys.detail(notificationId),
      });
      toast.success(tc("success"));
    },
    onError: () => {
      toast.error(t("failed"));
    },
  });
}
