"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { CreateNotificationPayload } from "../types";

export function useNotificationComposer() {
  const queryClient = useQueryClient();

  const previewRecipients = useMutation({
    mutationFn: async ({
      targetType,
      targetIds,
    }: {
      targetType: string;
      targetIds: string[];
    }) => {
      const { data } = await axiosInstance.post(
        "/notifications/preview-recipients",
        {
          targetType,
          targetIds,
        },
      );
      return data as { count: number; sampleNames: string[] };
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to preview recipients"));
    },
  });

  const sendNotification = useMutation({
    mutationFn: async (payload: CreateNotificationPayload) => {
      const { data } = await axiosInstance.post("/notifications/send", payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "history"] });
      toast.success(
        `Notification sent to ${variables.targetIds.length > 0 ? "selected" : "all"} recipients`,
      );
    },
    onError: () => {
      toast.error("Failed to send notification");
    },
  });

  return {
    previewRecipients,
    sendNotification,
  };
}
