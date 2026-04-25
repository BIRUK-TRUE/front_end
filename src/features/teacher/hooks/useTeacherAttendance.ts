"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import type {
  TeacherAttendanceFilter,
  TeacherAttendanceRecord,
  TeacherAttendanceSubmitPayload,
} from "../types";

export function useTeacherAttendanceRecords(
  teacherId: string,
  filters: TeacherAttendanceFilter,
) {
  return useQuery({
    queryKey: queryKeys.teacher.attendanceRecords(teacherId, filters),
    queryFn: async (): Promise<{ items: TeacherAttendanceRecord[]; total: number }> => {
      // BACKEND REQUIRED: GET /teachers/{teacherId}/attendance-records
      // Expected query params: { sectionId, fromDate, toDate, page, size }
      const { data } = await axiosInstance.get(
        `/teachers/${teacherId}/attendance-records`,
        {
          params: filters,
        },
      );
      return data;
    },
    enabled: !!teacherId,
  });
}

export function useSubmitTeacherAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TeacherAttendanceSubmitPayload) => {
      // BACKEND REQUIRED: GET /attendance/check
      // Expected query params: { sectionId, date }
      const check = await axiosInstance.get("/attendance/check", {
        params: { sectionId: payload.sectionId, date: payload.date },
      });

      if (check.data?.alreadyTaken && !check.data?.allowEdit) {
        throw new Error("ALREADY_TAKEN");
      }

      // BACKEND REQUIRED: POST /attendance/bulk
      // Expected request body: { sectionId, date, records: [{ studentId, status, note }] }
      const { data } = await axiosInstance.post("/attendance/bulk", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success("Attendance submitted successfully");
    },
    onError: (error: { message?: string; response?: { data?: { detail?: string } } }) => {
      if (error.message === "ALREADY_TAKEN") {
        toast.error("Attendance already exists for this date. Edit it instead.");
        return;
      }
      toast.error(error.response?.data?.detail || "Failed to submit attendance");
    },
  });
}
