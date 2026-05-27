"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherDashboard } from "../hooks/useTeacherDashboard";
import { useTeacherSchedule } from "../hooks/useTeacherSchedule";
import { TeacherTodaySchedule } from "./TeacherTodaySchedule";

interface Props {
  teacherId: string;
  teacherName: string;
}

export function TeacherDashboardHome({ teacherId, teacherName }: Props) {
  const t = useTranslations("teacher.dashboard");
  const tc = useTranslations("common");
  const stats = useTeacherDashboard(teacherId);
  const schedule = useTeacherSchedule(teacherId);

  if (stats.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (stats.isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{t("error")}</p>
          <Button
            onClick={() => stats.refetch()}
            variant="outline"
            className="mt-2"
          >
            {tc("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = stats.data;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("welcome", { name: teacherName })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("todayDate", { date: format(new Date(), "PPP") })} •{" "}
            {data.currentTermName}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              {t("stats.classesToday")}
            </p>
            <p className="text-2xl font-bold">{data.todayClasses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              {t("stats.totalStudents")}
            </p>
            <p className="text-2xl font-bold">{data.totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              {t("stats.attendanceDone")}
            </p>
            <p className="text-2xl font-bold">
              {data.attendanceTakenToday.taken}/
              {data.attendanceTakenToday.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              {t("stats.pendingGrades")}
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {data.pendingGrades}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/teacher/attendance">
              {t("actions.takeAttendance")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/teacher/grades">
              {t("actions.enterGrades")}
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/teacher/schedule">
              {t("actions.viewSchedule")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <TeacherTodaySchedule entries={schedule.data ?? []} />

      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {activity.className} - {activity.sectionName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {activity.submittedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
