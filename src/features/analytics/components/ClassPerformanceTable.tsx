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
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, FileDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useState } from "react";

interface ClassPerformanceTableProps {
  data: ClassPerformanceEntry[];
  isLoading?: boolean;
}

type SortField = 'className' | 'avgAttendance' | 'avgGrade' | 'atRiskCount' | 'totalStudents';
type SortDirection = 'asc' | 'desc';

export function ClassPerformanceTable({ data, isLoading }: ClassPerformanceTableProps) {
  const t = useTranslations("analytics.classPerformanceTable");
  const [sortField, setSortField] = useState<SortField>('avgGrade');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const handleExportCsv = () => {
    if (sortedData.length === 0) return;
    
    const headers = [t("class"), t("section"), t("avgAttendance"), t("avgGrade"), t("atRisk"), t("onTrack"), t("totalStudents")];
    const rows = sortedData.map(d => [
      d.className,
      d.sectionName || 'N/A',
      `${d.avgAttendance.toFixed(1)}%`,
      `${d.avgGrade.toFixed(1)}%`,
      d.atRiskCount,
      d.onTrackCount,
      d.totalStudents
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `class_performance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-20" />;
    return sortDirection === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />;
  };

  return (
    <Card className="shadow-md border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={sortedData.length === 0}>
          <FileDown className="mr-2 h-4 w-4" /> {t("exportCsv")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('className')}>
                  <div className="flex items-center gap-1">
                    {t("class")} <SortIcon field="className" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('avgAttendance')}>
                  <div className="flex items-center gap-1">
                    {t("avgAttendance")} <SortIcon field="avgAttendance" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('avgGrade')}>
                  <div className="flex items-center gap-1">
                    {t("avgGrade")} <SortIcon field="avgGrade" />
                  </div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort('atRiskCount')}>
                  <div className="flex items-center justify-center gap-1">
                    {t("atRisk")} <SortIcon field="atRiskCount" />
                  </div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalStudents')}>
                  <div className="flex items-center justify-center gap-1">
                    {t("totalStudents")} <SortIcon field="totalStudents" />
                  </div>
                </TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-10 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    {t("noData")}
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((entry) => (
                  <TableRow key={entry.classId}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{entry.className}</span>
                        {entry.sectionName && <span className="text-xs text-muted-foreground">{entry.sectionName}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={entry.avgAttendance} 
                          className="h-1.5 w-16" 
                          variant={entry.avgAttendance < 60 ? "destructive" : "default"}
                        />
                        <span className={cn(
                          "text-xs font-medium",
                          entry.avgAttendance < 60 ? "text-destructive" : entry.avgAttendance < 75 ? "text-orange-500" : ""
                        )}>
                          {entry.avgAttendance.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={entry.avgGrade} 
                          className="h-1.5 w-16" 
                          variant={entry.avgGrade < 50 ? "destructive" : "default"}
                        />
                        <span className={cn(
                          "text-xs font-medium",
                          entry.avgGrade < 40 ? "text-destructive" : entry.avgGrade < 50 ? "text-orange-500" : ""
                        )}>
                          {entry.avgGrade.toFixed(1)}%
                        </span>
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
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {entry.totalStudents}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/academics/classes/${entry.classId}`}>
                          <Eye className="h-4 w-4 mr-1" /> {t("viewDetails")}
                        </Link>
                      </Button>
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
