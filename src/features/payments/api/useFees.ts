"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { FeeConfig, CreateFeeConfig, UpdateFeeConfig } from "../types";
import type { PaginatedResponse } from "@/features/academics/types";

export const feeKeys = {
  all: ["fees"] as const,
  lists: () => [...feeKeys.all, "list"] as const,
  list: (filters: {
    academic_year_id?: string;
    grade_level?: number;
    is_active?: boolean;
  }) => [...feeKeys.lists(), filters] as const,
  detail: (id: string) => [...feeKeys.all, "detail", id] as const,
};

/**
 * List fee structures.
 * Backend: GET /payments/fee-structures
 */
export function useFees(
  filters: {
    academic_year_id?: string;
    grade_level?: number;
    is_active?: boolean;
  } = {},
) {
  return useQuery({
    queryKey: feeKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<FeeConfig>> => {
      const { data } = await axiosInstance.get("/payments/fee-structures", {
        params: filters,
      });
      // Backend returns a list[], wrap in paginated shape for compatibility
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      return {
        items,
        total: items.length,
        page: 1,
        size: items.length,
        pages: 1,
      };
    },
  });
}

/**
 * Get single fee structure.
 * Backend: GET /payments/fee-structures (filtered) — no single-item endpoint.
 */
export function useFee(id: string) {
  return useQuery({
    queryKey: feeKeys.detail(id),
    queryFn: async (): Promise<FeeConfig> => {
      // Backend doesn't have GET /payments/fee-structures/{id}.
      // Fetch all and find by ID.
      const { data } = await axiosInstance.get("/payments/fee-structures");
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      const fee = items.find((f: Record<string, unknown>) => f.id === id);
      if (!fee) throw new Error("Fee structure not found");
      return fee;
    },
    enabled: !!id,
  });
}

/**
 * Create fee structure.
 * Backend: POST /payments/fee-structures
 */
export function useCreateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFeeConfig) => {
      const { data: result } = await axiosInstance.post(
        "/payments/fee-structures",
        data,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.all });
      toast.success("Fee structure created successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create fee structure"));
    },
  });
}

/**
 * Update fee structure.
 * Backend: PATCH /payments/fee-structures/{id}
 */
export function useUpdateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFeeConfig }) => {
      const { data: result } = await axiosInstance.patch(
        `/payments/fee-structures/${id}`,
        data,
      );
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feeKeys.all });
      queryClient.invalidateQueries({ queryKey: feeKeys.detail(variables.id) });
      toast.success("Fee structure updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update fee structure"));
    },
  });
}

/**
 * Delete fee structure — backend does not support DELETE for fee structures.
 * Uses deactivation instead (PATCH with is_active=false).
 */
export function useDeleteFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(`/payments/fee-structures/${id}`, {
        is_active: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.all });
      toast.success("Fee structure deactivated");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to deactivate fee structure"));
    },
  });
}
