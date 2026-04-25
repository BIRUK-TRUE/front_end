import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';
import type { StudentProfile } from '../types';

export function useMyProfile() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.profile(studentId),
    queryFn: async () => {
      const { data } = await api.get<StudentProfile>(
        `/api/students/${studentId}/profile`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const studentId = user?.id ?? '';

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.patch(
        `/api/students/${studentId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      if (studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentPortal.profile(studentId),
        });
      }
      toast.success('Profile photo updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update profile photo');
    },
  });
}
