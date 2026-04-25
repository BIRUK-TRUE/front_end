"use client";

import { useTranslations } from "next-intl";
import { useStudentDashboard } from "../api/useStudentPortalDashboard";
import { StudentStatCard } from "./StudentStatCard";
import { StudentTodaySchedule } from "./StudentTodaySchedule";
import { StudentRecentGrades } from "./StudentRecentGrades";
import { StudentAnnouncements } from "./StudentAnnouncements";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function StudentDashboardHome() {
  const t = useTranslations("studentPortal.dashboard");
  const tc = useTranslations("studentPortal.common");
  const { data, isLoading, isError, refetch } = useStudentDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-destructive mb-4">{tc("error")}</p>
        <Button onClick={() => refetch()} variant="outline">{tc("retry")}</Button>
      </div>
    );
  }

  // Passing threshold logic for Score Average indicator
  const getScoreColor = (score: number) => {
    if (score >= 60) return "green";
    if (score >= 40) return "yellow";
    return "red";
  };

  // Fixed threshold logic for Attendance Rate
  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "green";
    if (rate >= 60) return "yellow";
    return "red";
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("welcome", { name: data.student.fullName })}
          </h1>
          <p className="mt-1 text-muted-foreground pt-1">
            {t("class", {
              className: data.student.className,
              section: data.student.sectionName,
            })}
          </p>
        </div>
        <div className="text-left md:text-right text-sm">
          <p className="font-medium">{t("currentTerm", { term: data.currentTerm.name })}</p>
          <p className="text-muted-foreground">{t("academicYear", { year: data.currentTerm.academicYear })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StudentStatCard
          title={t("stats.attendanceRate")}
          value={`${Math.round(data.stats.attendanceRate)}%`}
          label={t("stats.thisTerm")}
          indicatorColor={getAttendanceColor(data.stats.attendanceRate)}
        />
        <StudentStatCard
          title={t("stats.scoreAverage")}
          value={`${Math.round(data.stats.scoreAverage)}%`}
          label={t("stats.thisTerm")}
          indicatorColor={getScoreColor(data.stats.scoreAverage)}
        />
        <StudentStatCard
          title={t("stats.daysPresent")}
          value={data.stats.daysPresentThisMonth}
          label={t("stats.daysPresentMonth")}
        />
        <StudentStatCard
          title={t("stats.upcomingAssessments")}
          value={data.stats.upcomingAssessmentsCount}
          label={t("stats.upcomingAssessmentsNext")}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <StudentTodaySchedule schedule={data.todaySchedule} />
        <StudentRecentGrades grades={data.recentGrades} />
      </div>

      <div className="pt-4">
        <StudentAnnouncements announcements={data.announcements} />
      </div>
    </div>
  );
}
