import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { type Enrollment } from "../types";
import {
  type EnrollmentForm,
  type TransferForm,
  type WithdrawalForm,
  type EnrollmentRemarks,
} from "../types/schemas";
import { type PaginatedResponse } from "@/features/academics/types";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

interface EnrollmentFilters {
  page?: number;
  size?: number;
  search?: string;
  studentId?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  yearId?: string;
}

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  lists: () => [...enrollmentKeys.all, "list"] as const,
  list: (filters: EnrollmentFilters) =>
    [...enrollmentKeys.lists(), filters] as const,
  details: () => [...enrollmentKeys.all, "detail"] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
  byStudent: (studentId: string) =>
    [...enrollmentKeys.all, "student", studentId] as const,
  bySection: (sectionId: string) =>
    [...enrollmentKeys.all, "section", sectionId] as const,
  byYear: (yearId: string) =>
    [...enrollmentKeys.all, "year", yearId] as const,
};

/**
 * List enrollments with smart routing based on available filters.
 *
 * Backend endpoints:
 * - GET /enrollments/section/{section_id}  — by section
 * - GET /enrollments/student/{student_id}  — by student
 * - GET /enrollments/year/{year_id}        — by academic year
 *
 * There is no generic `GET /enrollments` endpoint, so we route
 * based on which filter is provided.
 */
export const useEnrollments = (filters: EnrollmentFilters = {}) => {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: async () => {
      const { page = 1, size = 50, status } = filters;

      // Route to the appropriate backend endpoint
      if (filters.sectionId) {
        const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>(
          `/enrollments/section/${filters.sectionId}`,
          { params: { page, size, status } },
        );
        return data;
      }

      if (filters.studentId) {
        const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>(
          `/enrollments/student/${filters.studentId}`,
          { params: { page, size } },
        );
        return data;
      }

      if (filters.yearId) {
        const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>(
          `/enrollments/year/${filters.yearId}`,
          { params: { page, size, status, search: filters.search || undefined } },
        );
        return data;
      }

      // Fallback: empty result if no filter specified
      return { items: [], total: 0, page: 1, size, pages: 0 };
    },
    // Always enable the query - let it return empty data if no filters
    // This prevents the "no data" confusion when filters aren't set
    enabled: true,
  });
};

/**
 * Get a single enrollment by ID.
 * Backend: GET /enrollments/{id}
 */
export const useEnrollment = (enrollmentId: string) => {
  return useQuery({
    queryKey: enrollmentKeys.detail(enrollmentId),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/enrollments/${enrollmentId}`);
      return data;
    },
    enabled: !!enrollmentId,
  });
};

/**
 * List enrollment history for a student.
 * Backend: GET /enrollments/student/{student_id}
 */
export const useStudentEnrollmentHistory = (studentId: string) => {
  return useQuery({
    queryKey: enrollmentKeys.byStudent(studentId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>(
        `/enrollments/student/${studentId}`,
      );
      return data.items || [];
    },
    enabled: !!studentId,
  });
};

/**
 * List enrollments by section.
 * Backend: GET /enrollments/section/{section_id}
 */
export const useSectionEnrollments = (sectionId: string, status?: string) => {
  return useQuery({
    queryKey: enrollmentKeys.bySection(sectionId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>(
        `/enrollments/section/${sectionId}`,
        { params: { size: 100, status } },
      );
      return data;
    },
    enabled: !!sectionId,
  });
};

/**
 * Get enrollment statistics for an academic year.
 * Backend: GET /enrollments/year/{year_id}/stats
 */
export const useEnrollmentStats = (yearId: string) => {
  return useQuery({
    queryKey: [...enrollmentKeys.byYear(yearId), "stats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/enrollments/year/${yearId}/stats`,
      );
      return data;
    },
    enabled: !!yearId,
  });
};

/**
 * Enroll a student.
 * Backend: POST /enrollments
 */
export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EnrollmentForm) => {
      const { data } = await axiosInstance.post("/enrollments", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success("Student enrolled successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to enroll student"));
    },
  });
};

/**
 * Transfer a student to another section.
 * Backend: POST /enrollments/{id}/transfer
 */
export const useTransferStudent = (enrollmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TransferForm) => {
      const { data } = await axiosInstance.post(
        `/enrollments/${enrollmentId}/transfer`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success("Student transferred successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to transfer student"));
    },
  });
};

/**
 * Withdraw a student.
 * Backend: POST /enrollments/{id}/withdraw
 */
export const useWithdrawStudent = (enrollmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WithdrawalForm) => {
      const { data } = await axiosInstance.post(
        `/enrollments/${enrollmentId}/withdraw`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success("Student withdrawn successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to withdraw student"));
    },
  });
};

/**
 * Update enrollment remarks.
 * Backend: PATCH /enrollments/{id}
 */
export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: enrollmentData,
    }: {
      id: string;
      data: EnrollmentRemarks;
    }) => {
      const { data } = await axiosInstance.patch(
        `/enrollments/${id}`,
        enrollmentData,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.detail(variables.id),
      });
      toast.success("Enrollment updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update enrollment"));
    },
  });
};

/**
 * Delete / withdraw an enrollment.
 * Backend does not have DELETE /enrollments/{id}.
 * Uses POST /enrollments/{id}/withdraw as a proxy.
 */
export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(
        `/enrollments/${id}/withdraw`,
        { remarks: "Removed by administrator" },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success("Enrollment removed successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to remove enrollment"));
    },
  });
};
