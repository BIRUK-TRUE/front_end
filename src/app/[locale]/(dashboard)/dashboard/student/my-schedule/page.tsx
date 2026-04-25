"use client";

import { useTranslations } from "next-intl";
import { useMySchedule } from "@/features/student-portal/api/useMySchedule";
import { StudentWeeklyTimetable } from "@/features/student-portal/components/StudentWeeklyTimetable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function MySchedulePage() {
  const tc = useTranslations("studentPortal.common");
  const t = useTranslations("studentPortal.schedule");
  const { data, isLoading, isError, refetch } = useMySchedule();

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      {data && <StudentWeeklyTimetable schedule={data.schedule} />}
    </div>
  );
}
