"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherClassItem, TeacherRosterResponse } from "../types";

type TeacherScheduleApiEntry = {
  section_id: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
};

type SectionApiResponse = {
  id: string;
  class_id: string;
  name: string;
  full_name: string;
};

type ClassApiResponse = {
  id: string;
  name: string;
};

type SectionStudentsResponse = {
  items?: Array<{
    id: string;
    full_name: string;
    registration_number: string;
  }>;
  total?: number;
};

type AttendanceApiRecord = {
  status: "present" | "absent" | "late" | "excused";
};

type SectionStudentApiItem = NonNullable<SectionStudentsResponse["items"]>[number];

function isMissingEndpointError(error: unknown) {
  return isAxiosError(error) && [404, 405, 501].includes(error.response?.status ?? 0);
}

async function getRosterFallback(sectionId: string): Promise<TeacherRosterResponse> {
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: studentsResponse }, attendanceResponse] = await Promise.all([
    axiosInstance.get<SectionStudentsResponse>(
      `/academics/sections/${sectionId}/students`,
      { params: { page: 1, size: 200 } },
    ),
    axiosInstance
      .get<AttendanceApiRecord[]>(`/attendance/section/${sectionId}`, {
        params: { date: today },
      })
      .catch(() => ({ data: [] as AttendanceApiRecord[] })),
  ]);

  const records = attendanceResponse.data;
  const total = records.length;
  const countStatus = (status: AttendanceApiRecord["status"]) =>
    records.filter((record) => record.status === status).length;

  return {
    students: (studentsResponse.items ?? []).map((student) => ({
      id: student.id,
      fullName: student.full_name,
      studentId: student.registration_number,
      photoUrl: null,
    })),
    summary: {
      presentPercent: total ? (countStatus("present") / total) * 100 : 0,
      absentPercent: total ? (countStatus("absent") / total) * 100 : 0,
      latePercent: total ? (countStatus("late") / total) * 100 : 0,
    },
  };
}

export function useTeacherClasses(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.classes(teacherId),
    queryFn: async (): Promise<TeacherClassItem[]> => {
      const { data } = await axiosInstance.get(
        `/teachers/${teacherId}/classes`
      );
      // The backend returns { teacher_id, classes: [...] }
      // The hook expects TeacherClassItem[]
      return (data.classes || []).map((c: any) => ({
        sectionId: c.section_id,
        className: c.class_name,
        sectionName: c.section_name,
        subjectName: c.subject_name,
        studentCount: c.studentCount || 0, // Backend might need to provide this
        todayAttendanceTaken: c.todayAttendanceTaken || false,
      }));
    },
    enabled: !!teacherId,
  });
}

export function useClassRoster(sectionId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.classRoster(sectionId),
    queryFn: async (): Promise<TeacherRosterResponse> => {
      const { data } = await axiosInstance.get(
        `/sections/${sectionId}/roster`
      );
      return data;
    },
    enabled: !!sectionId,
  });
}
