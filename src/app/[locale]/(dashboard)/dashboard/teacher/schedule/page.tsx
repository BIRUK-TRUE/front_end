"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTeacherSchedule } from "@/features/teacher/hooks/useTeacherSchedule";
import { TeacherWeeklyTimetable } from "@/features/teacher/components/TeacherWeeklyTimetable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function TeacherSchedulePage() {
  const t = useTranslations("teacher.schedule");
  const tc = useTranslations("common");
  const { user } = useAuthStore();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const schedule = useTeacherSchedule(user?.id ?? "", currentWeekOffset);

  if (!user) return null;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
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

      {schedule.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {schedule.isError && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{tc("errorOccurred")}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => schedule.refetch()}
            >
              {tc("reset")}
            </Button>
          </CardContent>
        </Card>
      )}

      {schedule.data && <TeacherWeeklyTimetable entries={schedule.data} />}
    </div>
  );
}
