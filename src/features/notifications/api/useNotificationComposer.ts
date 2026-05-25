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
      // Transform frontend payload to backend format
      const backendPayload: any = {
        title: payload.title,
        message: payload.message,
        notification_type: "system",
        target_user_ids: [],
        target_roles: [],
        send_email: payload.channels.includes("email"),
        metadata: payload.scheduledAt ? { scheduledAt: payload.scheduledAt } : undefined,
      };

      // Map targetType to target_roles or target_user_ids
      if (payload.targetType === "all_students") {
        backendPayload.target_roles = ["student"];
      } else if (payload.targetType === "all_guardians") {
        backendPayload.target_roles = ["guardian"];
      } else if (payload.targetType === "all_teachers") {
        backendPayload.target_roles = ["teacher"];
      } else if (["class", "section", "individual"].includes(payload.targetType)) {
        // For specific targets, use targetIds as user IDs
        backendPayload.target_user_ids = payload.targetIds;
      }

      const { data } = await axiosInstance.post("/notifications/send", backendPayload);
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
