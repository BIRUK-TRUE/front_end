"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleEntry } from "../types";

export function StudentTodaySchedule({
  schedule,
}: {
  schedule: ScheduleEntry[];
}) {
  const t = useTranslations("studentPortal.dashboard");
  const ts = useTranslations("studentPortal.schedule");
  
  if (!schedule || schedule.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("todaySchedule")}</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground">
          {t("noScheduleToday")}
        </CardContent>
      </Card>
    );
  }

  // Basic "current period" naive check or we can just list them
  const currentHour = new Date().getHours();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("todaySchedule")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.map((entry, idx) => {
          const startHour = parseInt(entry.startTime.split(":")[0] || "0");
          const endHour = parseInt(entry.endTime.split(":")[0] || "0");
          const isCurrent = currentHour >= startHour && currentHour < endHour;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between rounded-md border p-3 pl-4 ${
                isCurrent ? "border-l-4 border-l-primary bg-primary/5" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-sm">{entry.subjectName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{entry.teacherName}</span>
                  <span>•</span>
                  <span>{entry.room ?? ts("noRoom")}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-medium text-sm">
                  {entry.startTime} - {entry.endTime}
                </span>
                {isCurrent && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                    {ts("currentPeriod")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
