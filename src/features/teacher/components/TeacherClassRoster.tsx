"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TeacherRosterResponse } from "../types";

interface Props {
  data: TeacherRosterResponse;
}

export function TeacherClassRoster({ data }: Props) {
  const t = useTranslations("teacher.myClasses");
  const ta = useTranslations("teacher.attendance");
  const tc = useTranslations("common");

  // Sort students alphabetically by name
  const sortedStudents = [...data.students].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 shadow-sm border-muted/60">
        <CardHeader className="pb-3 border-b border-muted/40">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>{t("viewStudents")}</span>
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {data.students.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {sortedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground italic">{ta("noStudents")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center gap-3 rounded-xl border border-muted/50 p-3 hover:bg-muted/30 transition-colors bg-card"
                >
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={student.photoUrl ?? ""} alt={student.fullName} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                      {student.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{student.studentId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit shadow-sm border-muted/60 sticky top-4">
        <CardHeader className="pb-3 border-b border-muted/40">
          <CardTitle className="text-xl">{t("attendanceSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-sm font-medium text-foreground">{ta("statuses.present")}</p>
              <p className="text-xs font-bold text-green-600">{data.summary.presentPercent.toFixed(1)}%</p>
            </div>
            <Progress value={data.summary.presentPercent} className="h-2 bg-green-100" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-sm font-medium text-foreground">{ta("statuses.absent")}</p>
              <p className="text-xs font-bold text-red-600">{data.summary.absentPercent.toFixed(1)}%</p>
            </div>
            <Progress value={data.summary.absentPercent} className="h-2 bg-red-100" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-sm font-medium text-foreground">{ta("statuses.late")}</p>
              <p className="text-xs font-bold text-yellow-600">{data.summary.latePercent.toFixed(1)}%</p>
            </div>
            <Progress value={data.summary.latePercent} className="h-2 bg-yellow-100" />
          </div>

          <div className="pt-4 border-t border-muted/40 italic text-xs text-muted-foreground">
            {t("subtitle")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
