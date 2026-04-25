import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ScheduleEntry } from "../types";

export function StudentWeeklyTimetable({
  schedule,
}: {
  schedule: ScheduleEntry[];
}) {
  const t = useTranslations("studentPortal.schedule");
  
  if (!schedule || schedule.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          {t("noSchedule")}
        </CardContent>
      </Card>
    );
  }

  // Pre-process schedule into a grid: 
  // Map Day -> Period Number -> Entry
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
  
  // Find max period number to determine grid rows
  const maxPeriod = Math.max(...schedule.map((s) => s.periodNumber), 0);
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const grid: Record<string, Record<number, ScheduleEntry>> = {
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
  };

  schedule.forEach((entry) => {
    grid[entry.dayOfWeek][entry.periodNumber] = entry;
  });

  // Highlight logic
  const todayDayMap: Record<number, string> = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
  };
  const todayDayOfWeek = todayDayMap[new Date().getDay()]; // 0 is Sunday, so 1-5 is Mon-Fri
  const currentHour = new Date().getHours();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 font-semibold text-muted-foreground text-left w-24">
                  {/* Empty corner for periods column */}
                </th>
                {dayNames.map((day) => {
                  const isToday = day === todayDayOfWeek;
                  return (
                    <th
                      key={day}
                      className={`p-3 font-semibold text-center border-l border-r border-t bg-muted/30 ${
                        isToday ? "bg-primary/10 text-primary border-primary/20" : ""
                      }`}
                    >
                      {t(`days.${day}`)}
                      {isToday && <span className="ml-2 inline-flex text-[10px] uppercase font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">{t("today")}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {periods.map((periodNum) => {
                // Find a representative start/end time for the leftmost column from any day that has this period
                const rep = schedule.find((s) => s.periodNumber === periodNum);

                return (
                  <tr key={periodNum} className="border-b">
                    <td className="p-3 text-center border-l bg-muted/10">
                      <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        {t("periods.period", { number: periodNum })}
                      </div>
                      <div className="text-xs">
                        {rep
                          ? t("periods.time", { start: rep.startTime, end: rep.endTime })
                          : "-"}
                      </div>
                    </td>
                    {dayNames.map((day) => {
                      const entry = grid[day][periodNum];
                      const isToday = day === todayDayOfWeek;
                      
                      let isCurrentPeriod = false;
                      if (isToday && entry) {
                        const startH = parseInt(entry.startTime.split(":")[0] || "0");
                        const endH = parseInt(entry.endTime.split(":")[0] || "0");
                        if (currentHour >= startH && currentHour < endH) {
                          isCurrentPeriod = true;
                        }
                      }

                      return (
                        <td
                          key={day}
                          className={`p-3 border-l border-r relative ${
                            isToday ? "bg-primary/5" : ""
                          } ${isCurrentPeriod ? "ring-2 ring-inset ring-primary bg-primary/10" : ""}`}
                        >
                          {entry ? (
                            <div className="flex flex-col h-full justify-center">
                              <span className="font-bold text-sm leading-tight text-center mb-1">
                                {entry.subjectName}
                              </span>
                              <span className="text-xs text-muted-foreground text-center">
                                {entry.teacherName}
                              </span>
                              <span className="text-xs text-muted-foreground text-center">
                                {entry.room ?? t("noRoom")}
                              </span>
                              {isCurrentPeriod && (
                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase px-1 rounded">
                                  {t("currentPeriod")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full min-h-[60px] bg-muted/20 rounded"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs justify-center border-t border-border pt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-primary/10 rounded"></div>
            <span>{t("legend.today")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 ring-2 ring-primary ring-inset bg-primary/10 rounded"></div>
            <span>{t("legend.currentPeriod")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
