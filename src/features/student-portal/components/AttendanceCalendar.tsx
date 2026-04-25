"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isWeekend,
  isFuture,
  format,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import type { AttendanceCalendarRecord } from "../types";
import { AttendanceDayPopover } from "./AttendanceDayPopover";

export function AttendanceCalendar({
  records,
  currentDate,
  onMonthChange,
}: {
  records: AttendanceCalendarRecord[];
  currentDate: Date;
  onMonthChange: (newDate: Date) => void;
}) {
  const t = useTranslations("studentPortal.attendance.calendar");
  const tDays = useTranslations("common.days");
  const today = new Date();

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get weekday of first day (0 = Sun, 1 = Mon). In Ethiopia, school week is Mon-Fri.
  // We'll show Mon-Sun grid (1 = Mon to 0 = Sun). Let's convert to JS native logic (0=Sun)
  // Standard grid: Sun Mon Tue Wed Thu Fri Sat
  const firstDayOffset = getDay(monthStart);

  const prevMonth = () => {
    onMonthChange(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    const next = addMonths(currentDate, 1);
    // Don't navigate to future months
    if (!isFuture(startOfMonth(next))) {
      onMonthChange(next);
    }
  };

  const canGoNext = !isFuture(startOfMonth(addMonths(currentDate, 1))) && !isSameMonth(currentDate, today);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle>{t("title")}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth} aria-label={t("previousMonth")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold px-4">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            disabled={!canGoNext}
            aria-label={t("nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Days Header */}
        <div className="grid grid-cols-7 text-center mb-2">
          {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((d) => (
            <div key={d} className="font-semibold text-xs text-muted-foreground uppercase tracking-wider py-1">
              {tDays(d)}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-14 rounded-md bg-transparent" />
          ))}

          {/* Actual days */}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const record = records.find((r) => r.date.startsWith(dateStr));
            const weekend = isWeekend(day);
            const future = isFuture(day);

            let bgColor = "bg-white dark:bg-card border"; // default school day, no record (or future)
            let cursor = "cursor-default";

            if (future) {
              bgColor = "bg-white dark:bg-card border-dashed text-muted-foreground/30";
            } else if (weekend) {
              bgColor = "bg-muted text-muted-foreground";
            } else if (record) {
              cursor = "cursor-pointer hover:ring-2 hover:ring-primary ring-offset-1";
              switch (record.status) {
                case "present":
                  bgColor = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-900";
                  break;
                case "absent":
                  bgColor = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900";
                  break;
                case "late":
                  bgColor = "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-900";
                  break;
                case "excused":
                  bgColor = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
                  break;
              }
            }

            const content = (
              <div
                className={`col-span-1 h-10 sm:h-14 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${bgColor} ${cursor}`}
              >
                {format(day, "d")}
              </div>
            );

            if (record && !future && !weekend) {
              return (
                <AttendanceDayPopover key={day.toISOString()} record={record}>
                  {content}
                </AttendanceDayPopover>
              );
            }

            return <div key={day.toISOString()}>{content}</div>;
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium justify-center border-t pt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-200 dark:bg-green-900/40"></div>
            <span>{t("legend.present")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 dark:bg-red-900/40"></div>
            <span>{t("legend.absent")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-200 dark:bg-yellow-900/40"></div>
            <span>{t("legend.late")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 dark:bg-gray-800"></div>
            <span>{t("legend.excused")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted border border-border"></div>
            <span>{t("legend.noSchool")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
