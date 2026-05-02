"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import type { TeacherScheduleEntry } from "../types";

const DAYS = [1, 2, 3, 4, 5];

export function TeacherWeeklyTimetable({ entries }: { entries: TeacherScheduleEntry[] }) {
  const t = useTranslations("teacher.schedule");
  const tc = useTranslations("common");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
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

  const handleExport = () => {
    const csvContent = [
      ["Period", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      ...periods.map((period) => {
        const row = [period.toString()];
        DAYS.forEach((day) => {
          const entry = entries.find((e) => e.dayOfWeek === day && e.periodNumber === period);
          if (entry) {
            row.push(`${entry.subjectName} - ${entry.className} ${entry.sectionName} (${entry.startTime}-${entry.endTime})`);
          } else {
            row.push("");
          }
        });
        return row;
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `schedule-week-${currentWeekOffset}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const goToPreviousWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekOffset(0);
  };

  return (
    <Card className="shadow-lg border-muted/60 overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {t("title")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              disabled={currentWeekOffset <= -4}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {tc("previous")}
            </Button>
            {currentWeekOffset !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToCurrentWeek}
              >
                {tc("today")}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              disabled={currentWeekOffset >= 4}
              className="gap-1"
            >
              {tc("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              {tc("export")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1"
            >
              <Printer className="h-4 w-4" />
              {tc("print")}
            </Button>
          </div>
        </div>
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
