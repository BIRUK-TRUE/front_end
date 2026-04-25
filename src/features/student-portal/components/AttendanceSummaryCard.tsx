import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import type { AttendanceSummary } from "../types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function AttendanceSummaryCard({ summary }: { summary: AttendanceSummary }) {
  const t = useTranslations("studentPortal.attendance.summary");

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500 indicator-green-500";
    if (rate >= 60) return "bg-yellow-500 indicator-yellow-500";
    return "bg-red-500 indicator-red-500";
  };

  const calculatePct = (count: number, total: number) => {
    if (!total) return "0%";
    return `${Math.round((count / total) * 100)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-medium">{t("rate")}</span>
            <span className="text-2xl font-bold">{Math.round(summary.attendanceRate)}%</span>
          </div>
          <Progress 
            value={summary.attendanceRate} 
            className="h-2"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center divide-x divide-border">
          <div className="flex flex-col border-none!">
            <span className="text-2xl font-semibold">{summary.totalDays}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("totalDays")}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold text-green-600 dark:text-green-400">{summary.present}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("present")}</span>
            <span className="text-[10px] text-muted-foreground">{calculatePct(summary.present, summary.totalDays)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold text-red-600 dark:text-red-400">{summary.absent}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("absent")}</span>
            <span className="text-[10px] text-muted-foreground">{calculatePct(summary.absent, summary.totalDays)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{summary.late}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("late")}</span>
            <span className="text-[10px] text-muted-foreground">{calculatePct(summary.late, summary.totalDays)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">{summary.excused}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("excused")}</span>
            <span className="text-[10px] text-muted-foreground">{calculatePct(summary.excused, summary.totalDays)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
