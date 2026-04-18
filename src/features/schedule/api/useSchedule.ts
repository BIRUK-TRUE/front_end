'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import type { ScheduleEntry, CreateScheduleEntryPayload } from '../types';

export const scheduleKeys = {
  all: ['schedule'] as const,
  bySection: (sectionId: string, termId: string) => [...scheduleKeys.all, 'section', sectionId, termId] as const,
  byTeacher: (teacherId: string, termId: string) => [...scheduleKeys.all, 'teacher', teacherId, termId] as const,
};

export function useSectionSchedule(sectionId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.bySection(sectionId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      // Mocked endpoint: the backend doesn't exist yet, we will handle 404 or return [] safely.
      try {
        const { data } = await axiosInstance.get(`/schedule/section/${sectionId}`, {
          params: { term_id: termId },
        });
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: !!sectionId && !!termId,
    // Provide some dummy initialData if we want to visually test a timetable
    // initialData: []
  });
}

export function useTeacherSchedule(teacherId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.byTeacher(teacherId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      // Mocked endpoint
      try {
        const { data } = await axiosInstance.get(`/schedule/teacher/${teacherId}`, {
          params: { term_id: termId },
        });
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: !!teacherId && !!termId,
  });
}

export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateScheduleEntryPayload) => {
      const { data } = await axiosInstance.post('/schedule', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.bySection(variables.section_id, variables.term_id),
      });
      toast.success('Schedule entry created');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create schedule entry');
    },
  });
}

export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await axiosInstance.delete(`/schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Schedule entry deleted');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete entry');
    },
  });
}
