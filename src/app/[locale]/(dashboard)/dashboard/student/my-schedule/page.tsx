"use client";

import { useTranslations } from "next-intl";
import { useMySchedule } from "@/features/student-portal/api/useMySchedule";
import { StudentWeeklyTimetable } from "@/features/student-portal/components/StudentWeeklyTimetable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function MySchedulePage() {
  const tc = useTranslations("studentPortal.common");
  const t = useTranslations("studentPortal.schedule");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const { data, isLoading, isError, refetch } = useMySchedule(currentWeekOffset);

  const handlePrint = () => {
    window.print();
  };

  const handlePreviousWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1);
  };

  const handleResetWeek = () => {
    setCurrentWeekOffset(0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-destructive mb-4">{tc("error")}</p>
        <Button onClick={() => refetch()} variant="outline">{tc("retry")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetWeek} disabled={currentWeekOffset === 0}>
            {tc("today")}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreviousWeek} disabled={currentWeekOffset < -4}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek} disabled={currentWeekOffset > 4}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {data && <StudentWeeklyTimetable schedule={data.schedule} />}
    </div>
  );
}
