'use client';

import { useTranslations } from "next-intl";
import { MetricCard } from "./MetricCard";
import { AttendanceTrendChart } from "./AttendanceTrendChart";
import { AtRiskStudentsTable } from "./AtRiskStudentsTable";
import { AtRiskSummaryChart } from "./AtRiskSummaryChart";
import { GraduationCap, UserCheck, AlertTriangle } from "lucide-react";
import { useAtRiskStudents } from "../hooks/useAtRiskStudents";
import { useAttendanceTrend } from "../hooks/useAttendanceTrend";
import { useAnalyticsSummary } from "../hooks/useAnalyticsDashboard";
import { useAuthStore } from "@/lib/store/auth-store";

export function TeacherAnalyticsView() {
  const t = useTranslations("analytics");
  const tt = useTranslations("analytics.teacher");
  const { user } = useAuthStore();

  const { data: summary, isLoading: isLoadingSummary } = useAnalyticsSummary({ 
    teacherId: user?.id 
  });

  const { data: trendData, isLoading: isLoadingTrend } = useAttendanceTrend({
    days: 30,
    teacherId: user?.id
  });

  const { data: atRiskData, isLoading: isLoadingAtRisk } = useAtRiskStudents({
    teacherId: user?.id
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">{tt("title")}</h1>
        <p className="text-muted-foreground">{tt("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={t("metrics.attendanceRate")}
          value={`${summary?.schoolAttendanceRate.toFixed(1) || 0}%`}
          icon={UserCheck}
          description={tt("attendanceRateDesc")}
          className="bg-blue-50/50 dark:bg-blue-900/10"
        />
        <MetricCard
          title={t("metrics.gradeAverage")}
          value={`${summary?.schoolGradeAverage.toFixed(1) || 0}%`}
          icon={GraduationCap}
          description={tt("gradeAverageDesc")}
          className="bg-indigo-50/50 dark:bg-indigo-900/10"
        />
        <MetricCard
          title={t("metrics.atRiskStudents")}
          value={atRiskData?.total || 0}
          icon={AlertTriangle}
          description={tt("atRiskStudentsDesc")}
          className="bg-rose-50/50 dark:bg-rose-900/10"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceTrendChart 
            data={trendData || []} 
            isLoading={isLoadingTrend} 
          />
        </div>
        <div className="lg:col-span-1">
          <AtRiskSummaryChart 
            data={summary?.atRiskCounts || { critical: 0, high: 0, medium: 0, low: 0 }} 
            isLoading={isLoadingSummary} 
          />
        </div>
      </div>

      <AtRiskStudentsTable 
        students={atRiskData?.students || []} 
        isLoading={isLoadingAtRisk} 
      />
    </div>
  );
}
