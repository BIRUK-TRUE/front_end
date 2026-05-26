import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { type AcademicYear, type PaginatedResponse } from "../types";
import { type AcademicYearForm } from "../types/schemas";
import { academicsKeys } from "./useSubjects"; // Sharing the key factory
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

export const useAcademicYears = (page = 1, size = 20) => {
  return useQuery({
    queryKey: academicsKeys.years.list({ page, size }),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<AcademicYear>>(
        "/academics/years",
        {
          params: { page, size },
        },
      );

      if (!data) {
        return { items: [], total: 0, page: 1, size: 20, pages: 0 };
      }

      if (!Array.isArray(data.items)) {
        return { items: [], total: 0, page: 1, size: 20, pages: 0 };
      }

      return data;
    },
  });
};

export const useAcademicYear = (id: string) => {
  return useQuery({
    queryKey: academicsKeys.years.detail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AcademicYear>(
        `/academics/years/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: AcademicYearForm & { clone_from_year_id?: string },
    ) => {
      const { data } = await axiosInstance.post("/academics/years", payload);
      return data;
    },
    onSuccess: () => {
      // Immediately refetch all academic years data
      return queryClient.refetchQueries({ queryKey: academicsKeys.years.all() });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create academic year"));
    },
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AcademicYearForm> & {
        is_current?: boolean;
        status?: string;
      };
    }) => {
      const response = await axiosInstance.patch(
        `/academics/years/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Immediately refetch all academic years and the specific year
      return Promise.all([
        queryClient.refetchQueries({ queryKey: academicsKeys.years.all() }),
        queryClient.refetchQueries({
          queryKey: academicsKeys.years.detail(variables.id),
        }),
      ]);
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update academic year"));
    },
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/years/${id}`);
    },
    onSuccess: () => {
      // Immediately refetch all academic years data
      return queryClient.refetchQueries({ queryKey: academicsKeys.years.all() });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete academic year"));
    },
  });
};

export const useSetCurrentAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(`/academics/years/${id}/set-current`);
      return data;
    },
    onSuccess: () => {
      // Immediately refetch all academic years data
      return queryClient.refetchQueries({ queryKey: academicsKeys.years.all() });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to set current academic year"));
    },
  });
};
