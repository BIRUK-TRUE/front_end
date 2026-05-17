"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useChildGrades } from "../hooks/useChildDetails";
import { cn } from "@/lib/utils";

interface Props {
  studentId: string;
}

export function GuardianGradesView({ studentId }: Props) {
  const t = useTranslations("guardianPortal.childDetail");
  const tg = useTranslations("guardianPortal.childDetail.gradesTab");
  const tc = useTranslations("common");
  const { data, isLoading } = useChildGrades(studentId, { termId: "current" });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const grades = data?.items || [];

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-muted/10 border-b">
        <CardTitle className="text-lg">{tg("academicPerformance")}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {grades.length === 0 ? (
          <p className="text-sm text-center py-10 text-muted-foreground italic">
            {tg("noGradeRecords")}
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">{tg("subject")}</TableHead>
                  <TableHead className="font-bold">
                    {tg("assessment")}
                  </TableHead>
                  <TableHead className="font-bold text-center">
                    {tg("score")}
                  </TableHead>
                  <TableHead className="font-bold text-center">
                    {tg("total")}
                  </TableHead>
                  <TableHead className="font-bold">{tg("remarks")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade: any, idx: number) => (
                  <TableRow key={grade.id || idx} className="hover:bg-muted/30">
                    <TableCell className="font-bold text-primary">
                      {grade.subjectName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {grade.assessmentName}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded",
                          grade.score / grade.totalMarks >= 0.5
                            ? "text-green-700 bg-green-50"
                            : "text-red-700 bg-red-50",
                        )}
                      >
                        {grade.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-mono">
                      {grade.totalMarks}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground italic">
                      {grade.remarks || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
