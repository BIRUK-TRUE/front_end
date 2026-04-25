import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/lib/api/query-keys';

export interface FaceDescriptor {
  student_id: string;
  descriptors: number[][]; // Multiple descriptors for better recognition
}

export interface MarkAttendanceByFacePayload {
  studentId: string;
  sectionId: string;
  timestamp: string;
  confidence: number;
  method: 'face_recognition';
  capturedImage?: string; // Optional Base64 image
}

export function useFaceAttendance(sectionId?: string) {
  const t = useTranslations('faceAttendance.station');
  const queryClient = useQueryClient();

  // Load all enrolled faces for current class into memory
  const descriptors = useQuery({
    queryKey: queryKeys.faceRecognition.descriptors(sectionId || ''),
    queryFn: async (): Promise<FaceDescriptor[]> => {
      if (!sectionId) return [];
      // BACKEND REQUIRED: GET /face-recognition/descriptors?sectionId={id}
      // Expected response: { studentId, descriptors: number[][] }[]
      const { data } = await axiosInstance.get(`/face-recognition/descriptors?sectionId=${sectionId}`);
      return data;
    },
    enabled: !!sectionId,
  });

  const markAttendance = useMutation({
    mutationFn: async (payload: MarkAttendanceByFacePayload) => {
      const { data } = await axiosInstance.post('/attendance/mark-by-face', payload);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate attendance queries to refresh the log
      queryClient.invalidateQueries({ queryKey: ['attendance', 'section'] });
      // We don't show a toast for every recognition to avoid spam,
      // the UI will show the animation/log entry.
    },
    onError: (error: any) => {
      // Only toast on critical errors
      if (error.response?.status !== 409) { // 409 usually means already marked
        toast.error(t('markFailed'));
      }
    },
  });

  const logUnknownFace = useMutation({
    mutationFn: async (payload: { sectionId: string; capturedImage: string; confidence: number }) => {
      const { data } = await axiosInstance.post('/face-recognition/unknown-face', payload);
      return data;
    },
  });

  return {
    descriptors: descriptors.data || [],
    isLoading: descriptors.isLoading,
    markAttendance,
    logUnknownFace,
  };
}
