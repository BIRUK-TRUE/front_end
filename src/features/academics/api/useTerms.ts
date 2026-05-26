import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { type Term, type PaginatedResponse } from "../types";
import { type TermForm } from "../types/schemas";
import { academicsKeys } from "./useSubjects"; // Sharing the key factory
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

export const useTerms = (yearId: string) => {
  return useQuery({
    queryKey: [...academicsKeys.years.detail(yearId), "terms"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        PaginatedResponse<Term> | Term[]
      >(`/academics/years/${yearId}/terms`, {
        params: { page: 1, size: 50 },
      });

      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: 1,
          size: data.length,
        } as PaginatedResponse<Term>;
      }

      return data as PaginatedResponse<Term>;
    },
    enabled: !!yearId,
  });
};

export const useCreateTerm = (yearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TermForm) => {
      const { data } = await axiosInstance.post(
        `/academics/years/${yearId}/terms`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      // Immediately refetch terms and year details
      return Promise.all([
        queryClient.refetchQueries({
          queryKey: [...academicsKeys.years.detail(yearId), "terms"],
        }),
        queryClient.refetchQueries({
          queryKey: academicsKeys.years.detail(yearId),
        }),
      ]);
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create term"));
    },
  });
};

export const useUpdateTerm = (yearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TermForm> & { is_active?: boolean };
    }) => {
      const response = await axiosInstance.patch(
        `/academics/terms/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Immediately refetch terms list
      return queryClient.refetchQueries({
        queryKey: [...academicsKeys.years.detail(yearId), "terms"],
      });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update term"));
    },
  });
};

export const useDeleteTerm = (yearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/terms/${id}`);
    },
    onSuccess: () => {
      // Immediately refetch terms and year details
      return Promise.all([
        queryClient.refetchQueries({
          queryKey: [...academicsKeys.years.detail(yearId), "terms"],
        }),
        queryClient.refetchQueries({
          queryKey: academicsKeys.years.detail(yearId),
        }),
      ]);
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(
        formatApiError(
          error,
          "Failed to delete term. Ensure it has no active dependencies.",
        ),
      );
    },
  });
};
