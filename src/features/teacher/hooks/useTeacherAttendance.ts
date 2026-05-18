"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type {
  TeacherAttendanceFilter,
  TeacherAttendanceRecord,
  TeacherAttendanceSubmitPayload,
} from "../types";

type AttendanceApiRecord = {
  id: string;
  date: string;
  section_id: string;
  status: "present" | "absent" | "late" | "excused";
};

type SectionApiResponse = {
  class_id: string;
  name: string;
  full_name: string;
};

type ClassApiResponse = {
  name: string;
};

function getDatesInRange(fromDate?: string, toDate?: string) {
  const start = new Date(
    fromDate || toDate || new Date().toISOString().slice(0, 10),
  );
  const end = new Date(
    toDate || fromDate || new Date().toISOString().slice(0, 10),
  );
  const dates: string[] = [];

  for (
    const date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

type AttendanceRecordsApiResponse = {
  items: Array<{
    session_id: string;
    section_id: string;
    attendance_date: string;
    total_records: number;
    present_count: number;
    created_at: string;
  }>;
  total: number;
  page: number;
  size: number;
  pages: number;
};

export function useTeacherAttendanceRecords(
  teacherId: string,
  filters: TeacherAttendanceFilter,
) {
  return useQuery({
    queryKey: queryKeys.teacher.attendanceRecords(teacherId, filters),
    queryFn: async (): Promise<{
      items: TeacherAttendanceRecord[];
      total: number;
    }> => {
      const { data } = await axiosInstance.get<AttendanceRecordsApiResponse>(
        `/teachers/${teacherId}/attendance-records`,
        {
          params: {
            page: filters.page ?? 1,
            size: filters.size ?? 10,
            section_id: filters.sectionId,
            from_date: filters.fromDate,
            to_date: filters.toDate,
          },
        },
      );

      const apiItems = Array.isArray(data) ? data : (data?.items ?? []);

      return {
        items: apiItems.map((item) => {
          const absentCount = Math.max((item.total_records ?? 0) - (item.present_count ?? 0), 0);
          return {
            id: item.session_id,
            date: item.attendance_date,
            className: '',
            sectionName: '',
            statusCounts: {
              present: item.present_count ?? 0,
              absent: absentCount,
              late: 0,
              excused: 0,
            },
          };
        }),
        total: Array.isArray(data) ? apiItems.length : (data?.total ?? 0),
      };
    },
    enabled: !!teacherId,
  });
}

export function useSubmitTeacherAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TeacherAttendanceSubmitPayload) => {
      const { data } = await axiosInstance.post("/attendance/bulk", {
        section_id: payload.sectionId,
        attendance_date: payload.date,
        entries: payload.records.map((record) => ({
          student_id: record.studentId,
          status: record.status,
          note: record.note,
        })),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success("Attendance submitted successfully");
    },
    onError: (error: {
      message?: string;
      response?: { data?: { detail?: string } };
    }) => {
      toast.error(formatApiError(error, "Failed to submit attendance"));
    },
  });
}
