'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "./MetricCard";
import { AttendanceTrendChart } from "./AttendanceTrendChart";
import { GradeDistributionChart } from "./GradeDistributionChart";
import { AtRiskSummaryChart } from "./AtRiskSummaryChart";
import { AtRiskStudentsTable } from "./AtRiskStudentsTable";
import { ClassPerformanceTable } from "./ClassPerformanceTable";
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  AlertTriangle, 
  ChevronDown,
  Filter
} from "lucide-react";
import { 
  useAnalyticsSummary 
} from "../hooks/useAnalyticsDashboard";
import { useAtRiskStudents } from "../hooks/useAtRiskStudents";
import { useAttendanceTrend } from "../hooks/useAttendanceTrend";
import { useGradeDistribution } from "../hooks/useGradeDistribution";
import { useClassPerformance } from "../hooks/useClassPerformance";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useClasses } from "@/features/academics/api/useClasses";
import { useAcademicYears } from "@/features/academics/api/useAcademicYears";

export function AnalyticsOverview() {
  const t = useTranslations("analytics");
  const tc = useTranslations("common");

  // Filters State
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [timeRange, setTimeRange] = useState<number>(30);

  // Data Fetching
  const { data: yearsData } = useAcademicYears();
  const currentYearId = yearsData?.items?.find(y => y.is_current)?.id || "";
  const { data: classesData } = useClasses(currentYearId);
  
  const currentTermId = selectedTerm || yearsData?.items?.find(y => y.is_current)?.id || "";

  const { data: summary, isLoading: isLoadingSummary } = useAnalyticsSummary({ 
    termId: currentTermId,
    classId: selectedClass 
  });

  const { data: trendData, isLoading: isLoadingTrend } = useAttendanceTrend({
    days: timeRange,
    classId: selectedClass
  });

  const { data: distributionData, isLoading: isLoadingDistribution } = useGradeDistribution({
    termId: currentTermId,
    classId: selectedClass
  });

  const { data: atRiskData, isLoading: isLoadingAtRisk } = useAtRiskStudents({
    termId: currentTermId,
    classId: selectedClass
  });

  const { data: performanceData, isLoading: isLoadingPerformance } = useClassPerformance(currentTermId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-muted/40 p-2 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 px-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">{t("filters.term")}:</span>
          </div>
          
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[180px] h-9 border-none bg-background shadow-sm">
              <SelectValue placeholder={t("filters.allTerms")} />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="all">{t("filters.allTerms")}</SelectItem>
               {yearsData?.items?.map(year => (
                 <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
               ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px] h-9 border-none bg-background shadow-sm">
              <SelectValue placeholder={t("filters.allClasses")} />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="all">{t("filters.allClasses")}</SelectItem>
                {classesData?.items?.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("metrics.totalStudents")}
          value={summary?.totalStudents || 0}
          icon={Users}
          description={t("metrics.totalStudentsDesc")}
          className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20"
        />
        <MetricCard
          title={t("metrics.attendanceRate")}
          value={`${summary?.schoolAttendanceRate.toFixed(1) || 0}%`}
          icon={UserCheck}
          trend={{ value: 2.1, isUp: true }}
          description={t("metrics.attendanceRateDesc")}
          className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20"
        />
        <MetricCard
          title={t("metrics.gradeAverage")}
          value={`${summary?.schoolGradeAverage.toFixed(1) || 0}%`}
          icon={GraduationCap}
          trend={{ value: 0.5, isUp: false }}
          description={t("metrics.gradeAverageDesc")}
          className="bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20"
        />
        <MetricCard
          title={t("metrics.atRiskStudents")}
          value={atRiskData?.total || 0}
          icon={AlertTriangle}
          description={t("metrics.atRiskStudentsDesc")}
          className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <AttendanceTrendChart 
          data={trendData || []} 
          isLoading={isLoadingTrend} 
        />
        <GradeDistributionChart 
          data={distributionData || []} 
          isLoading={isLoadingDistribution} 
        />
        <AtRiskSummaryChart 
          data={summary?.atRiskCounts || { critical: 0, high: 0, medium: 0, low: 0 }} 
          isLoading={isLoadingSummary} 
        />
      </div>

      {/* At Risk Table */}
      <AtRiskStudentsTable 
        students={atRiskData?.students || []} 
        isLoading={isLoadingAtRisk} 
      />

      {/* Class Comparison */}
      <ClassPerformanceTable 
        data={performanceData || []} 
        isLoading={isLoadingPerformance} 
      />
    </div>
  );
}
