"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeacherScheduleEntry } from "../types";

interface Props {
  entries: TeacherScheduleEntry[];
}

export function TeacherTodaySchedule({ entries }: Props) {
  const t = useTranslations("teacher.schedule");
  const today = new Date();
  const day = today.getDay();
  const dayOfWeek = day === 0 ? 7 : day;
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  const todayEntries = useMemo(
    () =>
      entries
        .filter((item) => item.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.periodNumber - b.periodNumber),
    [dayOfWeek, entries],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noSchedule")}</p>
        ) : (
          todayEntries.map((entry) => {
            const [h, m] = entry.startTime.split(":").map(Number);
            const [eh, em] = entry.endTime.split(":").map(Number);
            const active =
              currentMinutes >= h * 60 + m && currentMinutes <= eh * 60 + em;
            return (
              <div
                key={entry.id}
                className="rounded-lg border p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{entry.subjectName}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.className} {entry.sectionName} • {entry.startTime} -{" "}
                    {entry.endTime}
                  </p>
                </div>
                {active ? <Badge>{t("today")}</Badge> : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
