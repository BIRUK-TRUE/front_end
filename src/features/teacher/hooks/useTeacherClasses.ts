"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherClassItem, TeacherRosterResponse } from "../types";

export function useTeacherClasses(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.classes(teacherId),
    queryFn: async (): Promise<TeacherClassItem[]> => {
      // BACKEND REQUIRED: GET /teachers/{teacherId}/classes
      // Expected response: TeacherClassItem[]
      const { data } = await axiosInstance.get(`/teachers/${teacherId}/classes`);
      return data;
    },
    enabled: !!teacherId,
  });
}

export function useClassRoster(sectionId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.classRoster(sectionId),
    queryFn: async (): Promise<TeacherRosterResponse> => {
      // BACKEND REQUIRED: GET /sections/{sectionId}/students
      // Expected response: { students: TeacherStudent[], summary: { presentPercent, absentPercent, latePercent } }
      const { data } = await axiosInstance.get(`/sections/${sectionId}/students`);
      return data;
    },
    enabled: !!sectionId,
  });
}
