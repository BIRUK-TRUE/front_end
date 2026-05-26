"use client";

import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherClassItem, TeacherRosterResponse } from "../types";

type TeacherSubjectApiResponse = {
  id: string;
  teacher_id: string;
  section_id: string;
  section_name: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
};

export function useTeacherClasses(teacherId: string) {
  return useAuthenticatedQuery({
    queryKey: queryKeys.teacher.classes(teacherId),
    queryFn: async (): Promise<TeacherClassItem[]> => {
      const { data } = await axiosInstance.get<TeacherSubjectApiResponse[] | { classes: TeacherSubjectApiResponse[] }>(
        `/teachers/${teacherId}/classes`
      );
      // Backend returns array of TeacherSubjectResponse directly
      const items: TeacherSubjectApiResponse[] = Array.isArray(data) ? data : (data.classes ?? []);
      return items.map((c) => ({
        sectionId: c.section_id,
        className: c.class_name,
        sectionName: c.section_name,
        subjectName: c.subject_name,
        subjectCode: c.subject_code,
        studentCount: 0,
        todayAttendanceTaken: false,
        teacherSubjectId: c.id,
      }));
    },
    enabled: !!teacherId,
  });
}

export function useClassRoster(sectionId: string) {
  return useAuthenticatedQuery({
    queryKey: queryKeys.teacher.classRoster(sectionId),
    queryFn: async (): Promise<TeacherRosterResponse> => {
      // Use the academics sections students endpoint
      const { data } = await axiosInstance.get<{
        items?: Array<{
          id: string;
          student_id: string;
          student_name: string;
          student_registration_number: string;
          status: string;
        }>;
        total?: number;
      }>(`/academics/sections/${sectionId}/students`, {
        params: { page: 1, size: 200, status: 'active' },
      });

      const items = data.items ?? [];
      return {
        students: items.map((e) => ({
          id: e.student_id,
          fullName: e.student_name,
          studentId: e.student_registration_number,
          photoUrl: null,
        })),
        summary: {
          presentPercent: 0,
          absentPercent: 0,
          latePercent: 0,
        },
      };
    },
    enabled: !!sectionId,
  });
}
