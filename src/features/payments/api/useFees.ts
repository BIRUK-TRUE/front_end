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
    term_id?: string;
    is_active?: boolean;
  }) => [...feeKeys.lists(), filters] as const,
  detail: (id: string) => [...feeKeys.all, "detail", id] as const,
};

export function useFees(
  filters: {
    academic_year_id?: string;
    term_id?: string;
    is_active?: boolean;
  } = {},
) {
  return useQuery({
    queryKey: feeKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<FeeConfig>> => {
      const { data } = await axiosInstance.get("/fees", { params: filters });
      return data;
    },
  });
}

export function useFee(id: string) {
  return useQuery({
    queryKey: feeKeys.detail(id),
    queryFn: async (): Promise<FeeConfig> => {
      const { data } = await axiosInstance.get(`/fees/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFeeConfig) => {
      const { data: result } = await axiosInstance.post("/fees", data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.all });
      toast.success("Fee created successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create fee"));
    },
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFeeConfig }) => {
      const { data: result } = await axiosInstance.patch(`/fees/${id}`, data);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feeKeys.all });
      queryClient.invalidateQueries({ queryKey: feeKeys.detail(variables.id) });
      toast.success("Fee updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update fee"));
    },
  });
}

export function useDeleteFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/fees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.all });
      toast.success("Fee deleted successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete fee"));
    },
  });
}
