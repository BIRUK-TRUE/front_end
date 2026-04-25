"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useChildSchedule } from "../hooks/useChildDetails";
import { cn } from "@/lib/utils";

interface Props {
  studentId: string;
}

const DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export function GuardianScheduleView({ studentId }: Props) {
  const t = useTranslations("guardianPortal.childDetail");
  const tc = useTranslations("common");
  const ts = useTranslations("teacher.schedule"); // Reuse day translations if available
  const { data: entries, isLoading } = useChildSchedule(studentId);

  const periods = useMemo(() => {
    if (!entries || !Array.isArray(entries)) return [];
    return Array.from(new Set(entries.map((e: any) => e.periodNumber))).sort((a: any, b: any) => a - b);
  }, [entries]);

  const dayLabel = (day: number) => {
    const keys = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
    return ts(`days.${keys[day - 1]}`);
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!entries || entries.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-20 text-center">
          <p className="text-muted-foreground italic">{t('scheduleTab.noScheduleFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm overflow-hidden border-muted/60">
      <CardHeader className="bg-muted/10 border-b">
        <CardTitle className="text-lg">{t('weeklyTimetable')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="border-r border-b p-3 text-center text-[10px] font-bold uppercase tracking-wider w-20 text-muted-foreground">
                  {tc("period")}
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="border-r border-b p-3 text-center text-[10px] font-bold uppercase tracking-wider min-w-[140px] text-muted-foreground">
                    {dayLabel(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period: any) => (
                <tr key={period} className="group">
                  <td className="border-r border-b p-3 text-center bg-muted/20 font-bold text-sm text-muted-foreground group-hover:bg-muted/40 transition-colors">
                    {period}
                  </td>
                  {DAYS.map((day) => {
                    const entry = entries.find(
                      (e: any) => e.dayOfWeek === day && e.periodNumber === period
                    );

                    return (
                      <td key={`${day}-${period}`} className={cn("border-r border-b p-3 align-top min-h-[80px] transition-colors hover:bg-primary/[0.02]", !entry && "bg-muted/[0.05]")}>
                        {entry ? (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-tighter">
                              {entry.startTime} - {entry.endTime}
                            </span>
                            <p className="font-bold text-xs text-foreground leading-tight">{entry.subjectName}</p>
                            <p className="text-[10px] text-muted-foreground italic">Teacher: {entry.teacherName || "Unassigned"}</p>
                            {entry.room && (
                              <p className="text-[9px] bg-primary/5 text-primary-foreground/70 px-1.5 py-0.5 rounded-sm w-fit">
                                RM: {entry.room}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center min-h-[40px]">
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
      </CardContent>
    </Card>
  );
}
