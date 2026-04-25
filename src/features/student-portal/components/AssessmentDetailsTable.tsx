import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AssessmentGradeRecord } from "../types";

export function AssessmentDetailsTable({
  assessments,
  page,
  pages,
  onPageChange,
  passingThreshold = 50,
}: {
  assessments: AssessmentGradeRecord[];
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  passingThreshold: number;
}) {
  const t = useTranslations("studentPortal.grades.assessmentDetails");
  const ts = useTranslations("studentPortal.grades.status");
  const tp = useTranslations("studentPortal.grades.types");

  // Fallback to English type string if no translation key matched
  const getTypeName = (typeStr: string) => {
    const key = typeStr.toLowerCase() as any;
    return tp(key) || typeStr; 
  };

  const getPassStatus = (percentage: number) => percentage >= passingThreshold;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead className="w-[120px]">{t("date")}</TableHead>
                <TableHead className="text-right">{t("score")}</TableHead>
                <TableHead className="text-right">{t("percentage")}</TableHead>
                <TableHead className="text-center">{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t("noAssessments")}
                  </TableCell>
                </TableRow>
              ) : (
                assessments.map((record) => {
                  const isPass = getPassStatus(record.percentage);
                  return (
                    <TableRow key={record.assessmentId}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{record.assessmentName}</span>
                          <span className="text-xs text-muted-foreground">{record.subjectName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeName(record.type)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {t("scoreFormat", {
                          earned: record.scoreEarned,
                          total: record.totalMarks,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {Math.round(record.percentage)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {isPass ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {ts("pass")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {ts("fail")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {pages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
