import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';

export interface TeacherQualification {
  id: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  min_grade_level: number;
  max_grade_level: number;
  allowed_streams: string[] | null;
  competency_level: 'beginner' | 'proficient' | 'expert';
  years_experience: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QualificationCreate {
  subject_id: string;
  min_grade_level?: number;
  max_grade_level?: number;
  allowed_streams?: string[] | null;
  competency_level?: 'beginner' | 'proficient' | 'expert';
  years_experience?: number | null;
  notes?: string | null;
}

export interface QualificationUpdate {
  min_grade_level?: number;
  max_grade_level?: number;
  allowed_streams?: string[] | null;
  competency_level?: 'beginner' | 'proficient' | 'expert';
  years_experience?: number | null;
  notes?: string | null;
}

// Get qualifications for a teacher
export function useTeacherQualifications(teacherId: string) {
  return useQuery({
    queryKey: ['teacher-qualifications', teacherId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TeacherQualification[]>(
        `/teachers/${teacherId}/qualifications`
      );
      return data;
    },
    enabled: !!teacherId,
  });
}

// Add qualification
export function useAddQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teacherId, data }: { teacherId: string; data: QualificationCreate }) => {
      const { data: response } = await axiosInstance.post<TeacherQualification>(
        `/teachers/qualifications?teacher_id=${teacherId}`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      toast.success('Qualification added successfully');
      queryClient.invalidateQueries({ queryKey: ['teacher-qualifications', variables.teacherId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add qualification');
    },
  });
}

// Update qualification
export function useUpdateQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ qualId, data }: { qualId: string; data: QualificationUpdate }) => {
      const { data: response } = await axiosInstance.patch<TeacherQualification>(
        `/teachers/qualifications/${qualId}`,
        data
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success('Qualification updated successfully');
      queryClient.invalidateQueries({ queryKey: ['teacher-qualifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update qualification');
    },
  });
}

// Delete qualification
export function useDeleteQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qualId: string) => {
      await axiosInstance.delete(`/teachers/qualifications/${qualId}`);
    },
    onSuccess: () => {
      toast.success('Qualification deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teacher-qualifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete qualification');
    },
  });
}

// Get qualified teachers for a subject
export function useQualifiedTeachers(subjectId: string, gradeLevel: number, stream?: string) {
  return useQuery({
    queryKey: ['qualified-teachers', subjectId, gradeLevel, stream],
    queryFn: async () => {
      const params = new URLSearchParams({
        grade_level: gradeLevel.toString(),
      });
      if (stream) {
        params.append('stream', stream);
      }
      
      const { data } = await axiosInstance.get<TeacherQualification[]>(
        `/teachers/subjects/${subjectId}/qualified-teachers?${params}`
      );
      return data;
    },
    enabled: !!subjectId && gradeLevel >= 0,
  });
}
