"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useMyAttendanceSummary,
  useMyAttendanceCalendar,
  useMyAttendanceRecords,
} from "@/features/student-portal/api/useMyAttendance";
import { AttendanceWarningBanner } from "@/features/student-portal/components/AttendanceWarningBanner";
import { AttendanceSummaryCard } from "@/features/student-portal/components/AttendanceSummaryCard";
import { AttendanceCalendar } from "@/features/student-portal/components/AttendanceCalendar";
import { AttendanceRecordsTable } from "@/features/student-portal/components/AttendanceRecordsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getMonth, getYear } from "date-fns";

export default function MyAttendancePage() {
  const tc = useTranslations("studentPortal.common");
  const t = useTranslations("studentPortal.attendance");

  // State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const calMonth = getMonth(calendarDate) + 1; // getMonth is 0-indexed
  const calYear = getYear(calendarDate);

  // Queries
  const summaryQ = useMyAttendanceSummary();
  const calendarQ = useMyAttendanceCalendar(calMonth, calYear);
  const recordsQ = useMyAttendanceRecords({
    page,
    size: 10,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const isLoading = summaryQ.isLoading || calendarQ.isLoading || recordsQ.isLoading;
  const isError = summaryQ.isError || calendarQ.isError || recordsQ.isError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-destructive mb-4">{tc("error")}</p>
        <Button onClick={() => {
          summaryQ.refetch();
          calendarQ.refetch();
          recordsQ.refetch();
        }} variant="outline">{tc("retry")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      {summaryQ.data && (
        <>
          <AttendanceWarningBanner rate={summaryQ.data.attendanceRate} threshold={75} />
          <AttendanceSummaryCard summary={summaryQ.data} />
        </>
      )}

      {calendarQ.data && (
        <AttendanceCalendar
          records={calendarQ.data.records}
          currentDate={calendarDate}
          onMonthChange={setCalendarDate}
        />
      )}

      {recordsQ.data && (
        <AttendanceRecordsTable
          records={recordsQ.data.items}
          page={recordsQ.data.page}
          pages={recordsQ.data.pages}
          onPageChange={setPage}
          statusFilter={statusFilter}
          onStatusFilterChange={(s) => {
            setStatusFilter(s);
            setPage(1); // Reset page on filter change
          }}
        />
      )}
    </div>
  );
}
