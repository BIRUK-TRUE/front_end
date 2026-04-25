"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeacherClassItem } from "../types";

interface Props {
  item: TeacherClassItem;
  /** Called when user clicks "View Students" — opens roster inline in parent */
  onViewStudents?: () => void;
}

export function TeacherClassCard({ item, onViewStudents }: Props) {
  const t = useTranslations("teacher.myClasses");

  return (
    <Card className="overflow-hidden hover:border-primary/40 transition-colors shadow-sm group">
      <CardHeader className="bg-muted/30 pb-3 border-b border-muted/50">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold leading-tight">
            {item.className}
            <span className="block text-sm font-medium text-muted-foreground mt-1">
              {item.sectionName}
            </span>
          </CardTitle>
          <Badge 
            variant={item.todayAttendanceTaken ? "default" : "outline"}
            className={cn(
              "px-2 py-0",
              item.todayAttendanceTaken ? "bg-green-600 hover:bg-green-700" : "border-orange-200 text-orange-700 bg-orange-50"
            )}
          >
            {item.todayAttendanceTaken ? t("attendanceTaken") : t("attendancePending")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground/80">{item.subjectName}</p>
          <p className="text-xs text-muted-foreground">{t("students", { count: item.studentCount })}</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild size="sm" className="flex-1 min-w-[120px]">
            <Link href={`/dashboard/teacher/attendance?sectionId=${item.sectionId}`}>
              {t("takeAttendance")}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1 min-w-[120px]">
            <Link href={`/dashboard/teacher/grades?sectionId=${item.sectionId}`}>
              {t("viewGrades")}
            </Link>
          </Button>
          {onViewStudents ? (
            <Button size="sm" variant="ghost" onClick={onViewStudents} className="w-full mt-1 border-t rounded-none py-4 text-xs">
              {t("viewStudents")}
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost" className="w-full mt-1 border-t rounded-none py-4 text-xs font-medium">
              <Link href={`/dashboard/teacher/my-classes?sectionId=${item.sectionId}`}>
                {t("viewStudents")}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
