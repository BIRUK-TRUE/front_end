"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  GraduationCap, 
  Wallet, 
  Clock,
  AlertCircle
} from "lucide-react";
import type { ChildDetails } from "../types";
import { GuardianAttendanceView } from "./GuardianAttendanceView";
import { GuardianGradesView } from "./GuardianGradesView";
import { GuardianFeesView } from "./GuardianFeesView";
import { GuardianScheduleView } from "./GuardianScheduleView";
import { Progress } from "@/components/ui/progress";

interface Props {
  child: ChildDetails;
}

export function ChildDetailTabs({ child }: Props) {
  const t = useTranslations("guardianPortal.childDetail");

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <TabsList className="grid grid-cols-3 md:flex md:w-auto h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2 hidden sm:inline" />
            {t("tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
            {t("tabs.attendance")}
          </TabsTrigger>
          <TabsTrigger value="grades" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <GraduationCap className="h-4 w-4 mr-2 hidden sm:inline" />
            {t("tabs.grades")}
          </TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Wallet className="h-4 w-4 mr-2 hidden sm:inline" />
            {t("tabs.fees")}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Clock className="h-4 w-4 mr-2 hidden sm:inline" />
            {t("tabs.schedule")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t("overviewTab.studentProfile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/20 overflow-hidden">
                  {child.photoUrl ? (
                    <img src={child.photoUrl} alt={child.fullName} className="h-full w-full object-cover" />
                  ) : (
                    child.fullName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">{child.fullName}</h3>
                  <p className="text-muted-foreground">{child.studentId} • {child.className} - {child.sectionName}</p>
                  <p className="text-xs bg-primary/10 text-primary w-fit px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-2">
                    {child.academicYear}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("overviewTab.enrollmentDate")}</p>
                  <p className="font-medium">{new Date(child.enrollmentDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("overviewTab.status")}</p>
                  <p className="font-medium text-green-600">{t("overviewTab.active")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm border-l-4 border-l-primary">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase text-muted-foreground tracking-tighter">{t("overviewTab.attendanceRate")}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-black text-primary">{child.attendanceRate}%</span>
                    <span className="text-sm text-muted-foreground mb-1">{t("overviewTab.target")}</span>
                  </div>
                </div>
                <Progress value={child.attendanceRate} className="h-2" />
                {child.attendanceRate < 75 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md border border-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{t("overviewTab.belowMinimum")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase text-muted-foreground tracking-tighter">{t("overviewTab.currentAcademicAvg")}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-black text-blue-600">{child.gradeAverage}%</span>
                    <span className="text-sm text-muted-foreground mb-1">{t("overviewTab.rawScoreSum")}</span>
                  </div>
                </div>
                <Progress value={child.gradeAverage} className="h-2 bg-blue-100" />
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="attendance">
        <GuardianAttendanceView studentId={child.id} />
      </TabsContent>

      <TabsContent value="grades">
        <GuardianGradesView studentId={child.id} />
      </TabsContent>

      <TabsContent value="fees">
        <GuardianFeesView studentId={child.id} />
      </TabsContent>

      <TabsContent value="schedule">
        <GuardianScheduleView studentId={child.id} />
      </TabsContent>
    </Tabs>
  );
}
