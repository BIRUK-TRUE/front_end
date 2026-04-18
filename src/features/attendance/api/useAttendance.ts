'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import type { AttendanceRecord, BulkAttendancePayload, DailyAttendanceSummary, StudentAttendanceStats } from '../types';

const attendanceKeys = {
  all: ['attendance'] as const,
  bySection: (sectionId: string, date: string) => [...attendanceKeys.all, 'section', sectionId, date] as const,
  byStudent: (studentId: string) => [...attendanceKeys.all, 'student', studentId] as const,
  stats: (sectionId: string) => [...attendanceKeys.all, 'stats', sectionId] as const,
  studentStats: (studentId: string) => [...attendanceKeys.all, 'student-stats', studentId] as const,
};

export function useAttendanceBySection(sectionId: string, date: string) {
  return useQuery({
    queryKey: attendanceKeys.bySection(sectionId, date),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const { data } = await axiosInstance.get(`/attendance/section/${sectionId}`, {
        params: { date },
      });
      return data;
    },
    enabled: !!sectionId && !!date,
  });
}

export function useStudentAttendance(studentId: string, page = 1, size = 50) {
  return useQuery({
    queryKey: attendanceKeys.byStudent(studentId),
    queryFn: async (): Promise<{ items: AttendanceRecord[]; total: number }> => {
      const { data } = await axiosInstance.get(`/attendance/student/${studentId}`, {
        params: { page, size },
      });
      return data;
    },
    enabled: !!studentId,
  });
}

export function useStudentAttendanceStats(studentId: string) {
  return useQuery({
    queryKey: attendanceKeys.studentStats(studentId),
    queryFn: async (): Promise<StudentAttendanceStats> => {
      const { data } = await axiosInstance.get(`/attendance/student/${studentId}/stats`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useSubmitAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkAttendancePayload) => {
      const { data } = await axiosInstance.post('/attendance/bulk', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.bySection(variables.section_id, variables.date),
      });
      toast.success('Attendance submitted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to submit attendance');
    },
  });
}
