import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';

export interface TeacherWorkloadStats {
  teacher_id: string;
  teacher_name: string;
  total_sections: number;
  total_subjects: number;
  total_weekly_periods: number;
  grade_levels_taught: number[];
  subjects_list: string[];
  utilization_percentage: number;
  status: 'underutilized' | 'balanced' | 'overloaded';
}

export interface WorkloadSummary {
  total_teachers: number;
  teachers_with_assignments: number;
  average_workload: number;
  overloaded_teachers: number;
  underutilized_teachers: number;
  balanced_teachers: number;
  teacher_stats: TeacherWorkloadStats[];
}

// Get workload for a specific teacher
export function useTeacherWorkload(teacherId: string) {
  return useQuery({
    queryKey: ['teacher-workload', teacherId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TeacherWorkloadStats>(
        `/teachers/${teacherId}/workload`
      );
      return data;
    },
    enabled: !!teacherId,
  });
}

// Get overall workload summary
export function useWorkloadSummary() {
  return useQuery({
    queryKey: ['workload-summary'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<WorkloadSummary>(
        '/teachers/workload/summary'
      );
      return data;
    },
  });
}
