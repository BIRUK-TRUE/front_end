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
import type { SubjectScoreSummary } from "../types";

export function SubjectScoreSummaryTable({
  subjects,
  passingThreshold = 50,
}: {
  subjects: SubjectScoreSummary[];
  passingThreshold: number;
}) {
  const t = useTranslations("studentPortal.grades.subjectSummary");
  const ts = useTranslations("studentPortal.grades.status");

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
                <TableHead>{t("subject")}</TableHead>
                <TableHead className="text-center">{t("assessments")}</TableHead>
                <TableHead className="text-right">{t("totalScore")}</TableHead>
                <TableHead className="text-right">{t("percentage")}</TableHead>
                <TableHead className="text-center">{t("status")}</TableHead>
                <TableHead className="text-right">{t("highest")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t("noSubjects")}
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => {
                  const isPass = getPassStatus(subject.percentage);
                  return (
                    <TableRow key={subject.subjectId}>
                      <TableCell className="font-medium">
                        {subject.subjectName}
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.assessmentCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {subject.totalScoreEarned} / {subject.totalPossibleMarks}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {Math.round(subject.percentage)}%
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
                      <TableCell className="text-right">
                        {Math.round(subject.highestPercentage)}%
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
