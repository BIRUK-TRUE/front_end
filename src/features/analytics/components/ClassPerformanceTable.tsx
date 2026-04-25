'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClassPerformanceEntry } from "../types";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ClassPerformanceTableProps {
  data: ClassPerformanceEntry[];
  isLoading?: boolean;
}

export function ClassPerformanceTable({ data, isLoading }: ClassPerformanceTableProps) {
  const t = useTranslations("analytics.classPerformanceTable");

  return (
    <Card className="shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <CardDescription>Comparison of academic and attendance hygiene across grades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("class")}</TableHead>
                <TableHead>{t("avgAttendance")}</TableHead>
                <TableHead>{t("avgGrade")}</TableHead>
                <TableHead className="text-center">{t("atRisk")}</TableHead>
                <TableHead className="text-right">{t("totalStudents")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-10 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    No class data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((entry) => (
                  <TableRow key={entry.classId}>
                    <TableCell className="font-medium">{entry.className}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={entry.avgAttendance} className="h-1.5 w-16" />
                        <span className="text-xs">{entry.avgAttendance.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={entry.avgGrade} 
                          className="h-1.5 w-16" 
                          variant={entry.avgGrade < 50 ? "destructive" : "default"}
                        />
                        <span className="text-xs">{entry.avgGrade.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        entry.atRiskCount > 5 ? "bg-destructive/10 text-destructive" : 
                        entry.atRiskCount > 0 ? "bg-orange-500/10 text-orange-600" : 
                        "bg-emerald-500/10 text-emerald-600"
                      )}>
                        {entry.atRiskCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {entry.totalStudents}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
