import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { faceRecognitionService } from "@/lib/api/face-recognition.service";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

export function useFaceEnrollmentStatus(studentId: string) {
  return useQuery({
    queryKey: ["face-recognition", "status", studentId],
    queryFn: () => faceRecognitionService.getEnrollmentStatus(studentId),
    enabled: !!studentId,
  });
}

export function useEnrollFace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, photo }: { studentId: string; photo: File }) =>
      faceRecognitionService.enrollFace(studentId, photo),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["face-recognition", "status", data.student_id],
      });
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, "Failed to enroll face"));
    },
  });
}

export function useDeleteFaceEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      faceRecognitionService.deleteEnrollment(studentId),
    onSuccess: (_, studentId) => {
      toast.success("Face enrollment deleted");
      queryClient.invalidateQueries({
        queryKey: ["face-recognition", "status", studentId],
      });
    },
  });
}

export function useRecognizeFaces() {
  return useMutation({
    mutationFn: ({ sectionId, photo }: { sectionId: string; photo: File }) =>
      faceRecognitionService.recognizeInSection(sectionId, photo),
  });
}
