'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "./MetricCard";
import {
  AttendanceTrendChart,
  GradeDistributionChart,
  AtRiskSummaryChart,
} from "./analytics-charts-lazy";
import { AtRiskStudentsTable } from "./AtRiskStudentsTable";
import { ClassPerformanceTable } from "./ClassPerformanceTable";
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  AlertTriangle, 
  Filter,
  RefreshCw,
  Download,
  Wallet,
  BellRing
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
import { Button } from "@/components/ui/button";
import { useClasses } from "@/features/academics/api/useClasses";
import { useAcademicYears } from "@/features/academics/api/useAcademicYears";
import { Badge } from "@/components/ui/badge";

export function AnalyticsOverview() {
  const t = useTranslations("analytics");

  // Filters State
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [timeRange, setTimeRange] = useState<number>(30);

  // Data Fetching
  const { data: yearsData } = useAcademicYears();
  const currentYearId = yearsData?.items?.find(y => y.is_current)?.id || "";
  const { data: classesData } = useClasses(currentYearId);
  
  const currentTermId = selectedTerm && selectedTerm !== "all" ? selectedTerm : yearsData?.items?.find(y => y.is_current)?.id || "";
  const activeClassId = selectedClass && selectedClass !== "all" ? selectedClass : "";

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useAnalyticsSummary({ 
    termId: currentTermId,
    classId: activeClassId 
  });

  const { data: trendData, isLoading: isLoadingTrend, refetch: refetchTrend } = useAttendanceTrend({
    days: timeRange,
    classId: activeClassId
  });

  const { data: distributionData, isLoading: isLoadingDistribution, refetch: refetchDistribution } = useGradeDistribution({
    termId: currentTermId,
    classId: activeClassId
  });

  const { data: atRiskData, isLoading: isLoadingAtRisk, refetch: refetchAtRisk } = useAtRiskStudents({
    termId: currentTermId,
    classId: activeClassId
  });

  const { data: performanceData, isLoading: isLoadingPerformance, refetch: refetchPerformance } = useClassPerformance(currentTermId);

  const handleRefreshAll = () => {
    refetchSummary();
    refetchTrend();
    refetchDistribution();
    refetchAtRisk();
    refetchPerformance();
  };

  const handleExport = () => {
    const exportData = {
      summary,
      trendData,
      distributionData,
      atRiskData,
      performanceData,
      filters: {
        termId: currentTermId,
        classId: activeClassId,
        timeRange
      },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        icon={GraduationCap}
        breadcrumb={["Admin", "Decision Support", "Analytics"]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="min-h-11 gap-2">
              <Download className="h-4 w-4" /> {t("export")}
            </Button>
            <Button variant="outline" onClick={handleRefreshAll} className="min-h-11 gap-2">
              <RefreshCw className="h-4 w-4" /> {t("refresh")}
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-4">
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full">Last updated: just now</Badge>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2 px-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase">{t("filters.term")}:</span>
        </div>
        
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger className="h-11 w-[180px] bg-background">
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
          <SelectTrigger className="h-11 w-[180px] bg-background">
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

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          title={t("metrics.totalStudents")}
          value={summary?.totalStudents || 0}
          icon={Users}
          description={t("metrics.totalStudentsDesc")}
        />
        <MetricCard
          title={t("metrics.attendanceRate")}
          value={`${summary?.schoolAttendanceRate.toFixed(1) || 0}%`}
          icon={UserCheck}
          trend={{ value: 2.1, isUp: true }}
          description={t("metrics.attendanceRateDesc")}
        />
        <MetricCard
          title={t("metrics.gradeAverage")}
          value={`${summary?.schoolGradeAverage.toFixed(1) || 0}%`}
          icon={GraduationCap}
          trend={{ value: 0.5, isUp: false }}
          description={t("metrics.gradeAverageDesc")}
        />
        <MetricCard
          title="Fee Collection"
          value="87%"
          icon={Wallet}
          trend={{ value: 5, isUp: true }}
          description="Paid or partially paid"
        />
        <MetricCard
          title="Active Teachers"
          value="48"
          icon={UserCheck}
          description="Stable roster"
        />
        <MetricCard
          title={t("metrics.atRiskStudents")}
          value={atRiskData?.total || 0}
          icon={BellRing}
          description={t("metrics.atRiskStudentsDesc")}
        />
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" aria-hidden="true" />
          <p><span className="font-semibold">Insight:</span> Review at-risk students with multiple flags first; attendance, grades, and fee issues compound quickly when handled in separate workflows.</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <AttendanceTrendChart 
          data={trendData || []} 
          isLoading={isLoadingTrend}
          days={timeRange}
          onDaysChange={setTimeRange}
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
