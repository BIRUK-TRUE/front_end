'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RiskBadge } from "./RiskBadge";
import { StudentRisk } from "../types";
import { useTranslations } from "next-intl";
import { MoreHorizontal, FileDown, User, Bell, MessageSquare, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NotifyGuardianModal } from "./NotifyGuardianModal";
import { InterventionNoteModal } from "./InterventionNoteModal";

interface AtRiskStudentsTableProps {
  students: StudentRisk[];
  isLoading?: boolean;
}

export function AtRiskStudentsTable({ students, isLoading }: AtRiskStudentsTableProps) {
  const t = useTranslations("analytics.atRiskTable");
  const tf = useTranslations("analytics.riskFactors");
  
  const [selectedStudent, setSelectedStudent] = useState<StudentRisk | null>(null);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const handleExportCsv = () => {
    if (students.length === 0) return;
    
    const headers = [t("name"), t("id"), t("class"), t("section"), t("attendance"), t("gradeAvg"), t("riskLevel"), t("riskFactors"), t("guardian"), t("phone")];
    const rows = students.map(s => [
      s.studentName,
      s.registrationNumber,
      s.className,
      s.sectionName,
      `${s.attendanceRate}%`,
      `${s.gradeAverage}%`,
      s.level,
      s.factors.map(f => tf(f.type as any, { value: f.value, threshold: f.threshold })).join("; "),
      s.guardianInfo?.name || "N/A",
      s.guardianInfo?.phone || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `at_risk_students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-md border-none overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" /> {t("title")}
          </CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={students.length === 0}>
          <FileDown className="mr-2 h-4 w-4" /> {t("exportCsv")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border-x border-b">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">{t("student")}</TableHead>
                <TableHead className="font-bold">{t("class")}</TableHead>
                <TableHead className="font-bold text-center">{t("attendance")}</TableHead>
                <TableHead className="font-bold text-center">{t("gradeAverage")}</TableHead>
                <TableHead className="font-bold">{t("riskLevel")}</TableHead>
                <TableHead className="font-bold hidden lg:table-cell">{t("riskReasons")}</TableHead>
                <TableHead className="text-right font-bold">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="h-12 animate-pulse bg-muted/10" />
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground whitespace-pre-wrap">
                    {t("noAtRiskStudents")}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.studentId} className="hover:bg-muted/5 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{student.studentName}</span>
                        <span className="text-xs text-muted-foreground">{student.registrationNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {student.className} - {student.sectionName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-medium",
                        student.attendanceRate < 60 ? "text-destructive" : student.attendanceRate < 75 ? "text-orange-500" : ""
                      )}>
                        {student.attendanceRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-medium",
                        student.gradeAverage < 40 ? "text-destructive" : student.gradeAverage < 50 ? "text-orange-500" : ""
                      )}>
                        {student.gradeAverage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={student.level} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {student.factors.map((factor, index) => (
                          <span key={index} className="text-[10px] bg-muted px-1.5 py-0.5 rounded leading-tight">
                            {tf(factor.type as any, { value: factor.value, threshold: factor.threshold })}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/${student.studentId}`}>
                              <User className="mr-2 h-4 w-4" /> {t("viewProfile")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsNotifyOpen(true);
                            }}
                            disabled={!student.guardianInfo}
                          >
                            <Bell className="mr-2 h-4 w-4" /> {t("notifyGuardian")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsNoteOpen(true);
                            }}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" /> {t("addNote")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {selectedStudent && (
        <>
          <NotifyGuardianModal 
            student={selectedStudent} 
            isOpen={isNotifyOpen} 
            onClose={() => setIsNotifyOpen(false)} 
          />
          <InterventionNoteModal 
            student={selectedStudent} 
            isOpen={isNoteOpen} 
            onClose={() => setIsNoteOpen(false)} 
          />
        </>
      )}
    </Card>
  );
}
