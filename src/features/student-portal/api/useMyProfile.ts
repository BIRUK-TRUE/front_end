import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance as api } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { StudentProfile } from "../types";

export function useMyProfile() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || "";

  return useQuery({
    queryKey: queryKeys.studentPortal.profile(studentId),
    queryFn: async () => {
      const { data } = await api.get<StudentProfile>(
        `/students/${studentId}/profile`,
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const studentId = user?.student_id || user?.id || "";

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.patch(
        `/students/${studentId}/photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      if (studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentPortal.profile(studentId),
        });
      }
      toast.success("Profile photo updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update profile photo"));
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const studentId = user?.student_id || user?.id || "";

  return useMutation({
    mutationFn: async (data: Partial<StudentProfile>) => {
      const { data: response } = await api.patch(
        `/students/${studentId}/profile`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      if (studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentPortal.profile(studentId),
        });
      }
      toast.success("Profile updated successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update profile"));
    },
  });
}
