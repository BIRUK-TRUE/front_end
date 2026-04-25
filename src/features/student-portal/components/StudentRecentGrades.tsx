"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentGradeEntry } from "../types";

export function StudentRecentGrades({ grades, passingThreshold = 50 }: { grades: RecentGradeEntry[]; passingThreshold?: number }) {
  const t = useTranslations("studentPortal.dashboard");
  const ts = useTranslations("studentPortal.grades.status");

  const getPassStatus = (percentage: number) => percentage >= passingThreshold;

  if (!grades || grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("recentGrades")}</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground">
          {t("noRecentGrades")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("recentGrades")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {grades.map((grade, idx) => {
          const isPass = getPassStatus(grade.percentage);
          return (
            <div
              key={idx}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-sm">{grade.subjectName}</p>
                <p className="text-xs text-muted-foreground">
                  {grade.assessmentName} • {new Date(grade.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {t("percentage", { value: grade.percentage })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("scoreOf", {
                    score: grade.scoreEarned,
                    total: grade.totalMarks,
                  })}
                </p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 ${isPass ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                  {ts(isPass ? "pass" : "fail")}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
