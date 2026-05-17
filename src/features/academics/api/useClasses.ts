import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import {
  type Class,
  type Section,
  type Subject,
  type PaginatedResponse,
} from "../types";
import { type ClassForm, type SectionForm } from "../types/schemas";
import { academicsKeys } from "./useSubjects";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

// --- CLASSES ---

export const useClasses = (yearId: string, page = 1, size = 50) => {
  return useQuery({
    queryKey: [
      ...academicsKeys.years.detail(yearId),
      "classes",
      { page, size },
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Class>>(
        `/academics/years/${yearId}/classes`,
        {
          params: { page, size },
        },
      );
      return data;
    },
    enabled: !!yearId,
  });
};

export const useClass = (classId: string) => {
  return useQuery({
    queryKey: academicsKeys.classes.detail(classId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Class>(
        `/academics/classes/${classId}`,
      );
      return data;
    },
    enabled: !!classId,
  });
};

export const useCreateClass = (yearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClassForm) => {
      const { data } = await axiosInstance.post(
        `/academics/years/${yearId}/classes`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...academicsKeys.years.detail(yearId), "classes"],
      });
      queryClient.invalidateQueries({
        queryKey: academicsKeys.years.detail(yearId),
      }); // Update class count
      toast.success("Class created successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create class"));
    },
  });
};

export const useUpdateClass = (yearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ClassForm>;
    }) => {
      const response = await axiosInstance.patch(
        `/academics/classes/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...academicsKeys.years.detail(yearId), "classes"],
      });
      queryClient.invalidateQueries({
        queryKey: academicsKeys.classes.detail(variables.id),
      });
      toast.success("Class updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update class"));
    },
  });
};

export const useDeleteClass = (yearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...academicsKeys.years.detail(yearId), "classes"],
      });
      queryClient.invalidateQueries({
        queryKey: academicsKeys.years.detail(yearId),
      });
      toast.success("Class deleted successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(
        formatApiError(
          error,
          "Failed to delete class. Ensure it has no active dependencies.",
        ),
      );
    },
  });
};

// --- SECTIONS ---

export const useCreateSection = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SectionForm) => {
      const { data } = await axiosInstance.post(
        `/academics/classes/${classId}/sections`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: academicsKeys.classes.detail(classId),
      });
      toast.success("Section created successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create section"));
    },
  });
};

export const useUpdateSection = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SectionForm>;
    }) => {
      const response = await axiosInstance.patch(
        `/academics/sections/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: academicsKeys.classes.detail(classId),
      });
      toast.success("Section updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update section"));
    },
  });
};

export const useSection = (sectionId: string) => {
  return useQuery({
    queryKey: [...academicsKeys.all, "sections", "detail", sectionId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Section>(
        `/academics/sections/${sectionId}`,
      );
      return data;
    },
    enabled: !!sectionId,
  });
};

export const useDeleteSection = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: academicsKeys.classes.detail(classId),
      });
      toast.success("Section deleted successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(
        formatApiError(
          error,
          "Failed to delete section. Ensure it has no active dependencies.",
        ),
      );
    },
  });
};
// --- CLASS SUBJECTS ---

export const useClassSubjects = (classId: string) => {
  return useQuery({
    queryKey: [...academicsKeys.classes.detail(classId), "subjects"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Subject[]>(
        `/academics/classes/${classId}/subjects`,
      );
      return data;
    },
    enabled: !!classId,
  });
};

export const useAssignSubject = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subjectId: string) => {
      const { data } = await axiosInstance.post(
        `/academics/classes/${classId}/subjects`,
        { subject_id: subjectId },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...academicsKeys.classes.detail(classId), "subjects"],
      });
      toast.success("Subject assigned successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to assign subject"));
    },
  });
};

export const useRemoveSubject = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subjectId: string) => {
      await axiosInstance.delete(
        `/academics/classes/${classId}/subjects/${subjectId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...academicsKeys.classes.detail(classId), "subjects"],
      });
      toast.success("Subject removed successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to remove subject"));
    },
  });
};
