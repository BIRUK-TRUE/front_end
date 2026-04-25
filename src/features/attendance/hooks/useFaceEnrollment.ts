import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/lib/api/query-keys';

export interface EnrollmentStatus {
  studentId: string;
  enrolled: boolean;
  enrolledAt?: string;
}

export function useFaceEnrollment(sectionId?: string) {
  const t = useTranslations('faceAttendance.enrollment');
  const queryClient = useQueryClient();

  const enrollmentStatus = useQuery({
    queryKey: queryKeys.faceRecognition.enrollmentStatus(sectionId || ''),
    queryFn: async (): Promise<EnrollmentStatus[]> => {
      if (!sectionId) return [];
      // BACKEND REQUIRED: GET /face-recognition/enrollment-status?sectionId={id}
      // Expected response: { studentId, enrolled: boolean, enrolledAt? }[]
      const { data } = await axiosInstance.get(`/face-recognition/enrollment-status?sectionId=${sectionId}`);
      return data;
    },
    enabled: !!sectionId,
  });

  const enrollFace = useMutation({
    mutationFn: async (payload: { studentId: string; descriptors: number[][] }) => {
      const { data } = await axiosInstance.post('/face-recognition/enroll', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'enrollment-status'] });
      toast.success(t('enrollSuccess'));
    },
    onError: (error: any) => {
      console.error('Face enrollment error:', error);
      toast.error(t('enrollFailed'));
    },
  });

  const deleteEnrollment = useMutation({
    mutationFn: async (studentId: string) => {
      await axiosInstance.delete(`/face-recognition/enroll/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'enrollment-status'] });
      toast.success(t('deleteEnrollmentSuccess'));
    },
  });

  return {
    enrollmentStatus: enrollmentStatus.data || [],
    isLoading: enrollmentStatus.isLoading,
    enrollFace,
    deleteEnrollment,
  };
}
