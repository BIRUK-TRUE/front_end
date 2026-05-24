import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { type Subject, type PaginatedResponse } from "../types";
import { type SubjectForm } from "../types/schemas";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

export const academicsKeys = {
  all: ["academics"] as const,
  subjects: {
    all: () => [...academicsKeys.all, "subjects"] as const,
    list: (filters: object) =>
      [...academicsKeys.subjects.all(), "list", filters] as const,
    detail: (id: string) =>
      [...academicsKeys.subjects.all(), "detail", id] as const,
  },
  years: {
    all: () => [...academicsKeys.all, "years"] as const,
    list: (filters: object) =>
      [...academicsKeys.years.all(), "list", filters] as const,
    detail: (id: string) =>
      [...academicsKeys.years.all(), "detail", id] as const,
  },
  terms: {
    all: (yearId: string) =>
      [...academicsKeys.years.detail(yearId), "terms"] as const,
  },
  classes: {
    all: (yearId: string) =>
      [...academicsKeys.years.detail(yearId), "classes"] as const,
    detail: (classId: string) =>
      [...academicsKeys.all, "classes", "detail", classId] as const,
  },
  sections: {
    all: (classId: string) =>
      [...academicsKeys.classes.detail(classId), "sections"] as const,
  },
};

interface SubjectFilters {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
}

export const useSubjects = (
  filters: SubjectFilters = { page: 1, size: 20 },
) => {
  return useQuery({
    queryKey: academicsKeys.subjects.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Subject>>(
        "/academics/subjects",
        { params: filters },
      );
      return data;
    },
    enabled: true,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubjectForm) => {
      const { data } = await axiosInstance.post("/academics/subjects", payload);
      return data;
    },
    onSuccess: () => {
      // Immediately refetch all subjects
      return queryClient.refetchQueries({ queryKey: academicsKeys.subjects.all() });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create subject"));
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SubjectForm>;
    }) => {
      const response = await axiosInstance.patch(
        `/academics/subjects/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Immediately refetch subjects list and subject details
      return Promise.all([
        queryClient.refetchQueries({ queryKey: academicsKeys.subjects.all() }),
        queryClient.refetchQueries({
          queryKey: academicsKeys.subjects.detail(variables.id),
        }),
      ]);
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update subject"));
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/academics/subjects/${id}`);
      return data;
    },
    onSuccess: () => {
      // Immediately refetch all subjects
      return queryClient.refetchQueries({ queryKey: academicsKeys.subjects.all() });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete subject"));
    },
  });
};
