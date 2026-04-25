"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeacherScheduleEntry } from "../types";

const DAYS = [1, 2, 3, 4, 5];

export function TeacherWeeklyTimetable({ entries }: { entries: TeacherScheduleEntry[] }) {
  const t = useTranslations("teacher.schedule");
  const tc = useTranslations("common");
  const today = new Date();
  const currentDay = today.getDay() === 0 ? 7 : today.getDay();
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  const periods = useMemo(
    () =>
      Array.from(new Set(entries.map((e) => e.periodNumber))).sort((a, b) => a - b),
    [entries],
  );

  const dayLabel = (day: number) => {
    const keys = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
    return t(`days.${keys[day - 1]}`);
  };

  return (
    <Card className="shadow-lg border-muted/60 overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground italic">{t("noSchedule")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border-r border-b p-3 text-center text-xs font-bold uppercase tracking-wider w-20">
                    {tc("period")}
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className={cn(
                        "border-r border-b p-3 text-center text-xs font-bold uppercase tracking-wider min-w-[150px]",
                        day === currentDay && "bg-primary/10 text-primary"
                      )}
                    >
                      {dayLabel(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period} className="group">
                    <td className="border-r border-b p-3 text-center bg-muted/20 font-bold text-sm text-muted-foreground group-hover:bg-muted/40 transition-colors">
                      {period}
                    </td>
                    {DAYS.map((day) => {
                      const entry = entries.find(
                        (e) => e.dayOfWeek === day && e.periodNumber === period,
                      );
                      
                      const startMins = entry ? Number(entry.startTime.split(":")[0]) * 60 + Number(entry.startTime.split(":")[1]) : 0;
                      const endMins = entry ? Number(entry.endTime.split(":")[0]) * 60 + Number(entry.endTime.split(":")[1]) : 0;
                      
                      const active = day === currentDay && !!entry && currentMinutes >= startMins && currentMinutes <= endMins;

                      return (
                        <td
                          key={`${day}-${period}`}
                          className={cn(
                            "border-r border-b p-4 align-top transition-colors min-h-[100px]",
                            day === currentDay && "bg-primary/[0.02]",
                            active && "bg-primary/5 ring-2 ring-inset ring-primary z-10",
                            !entry && "bg-muted/[0.05]"
                          )}
                        >
                          {entry ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                  {entry.startTime} - {entry.endTime}
                                </span>
                                {active && (
                                  <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                  </span>
                                )}
                              </div>
                              <p className="font-bold text-sm text-foreground leading-tight">{entry.subjectName}</p>
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                  {entry.className} {entry.sectionName}
                                </p>
                                {entry.room && (
                                  <p className="text-[10px] text-muted-foreground/70 italic flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                                    {entry.room}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full min-h-[60px]">
                              <span className="text-muted-foreground/10 font-bold text-lg select-none">-</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
