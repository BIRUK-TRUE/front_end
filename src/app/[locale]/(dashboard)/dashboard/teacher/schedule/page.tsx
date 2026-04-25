"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTeacherSchedule } from "@/features/teacher/hooks/useTeacherSchedule";
import { TeacherWeeklyTimetable } from "@/features/teacher/components/TeacherWeeklyTimetable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TeacherSchedulePage() {
  const t = useTranslations("teacher.schedule");
  const tc = useTranslations("common");
  const { user } = useAuthStore();
  const schedule = useTeacherSchedule(user?.id ?? "");

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
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
