"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, FileText, Loader2, Award, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ReportCard } from "../types";

interface ReportCardGeneratorProps {
  students: Array<{
    id: string;
    name: string;
    registration_number: string;
    class_name: string;
    section_name: string;
  }>;
  terms: Array<{ id: string; name: string }>;
  onGenerateReport: (
    studentId: string,
    termId: string,
  ) => Promise<ReportCard | null>;
}

export function ReportCardGenerator({
  students,
  terms,
  onGenerateReport,
}: ReportCardGeneratorProps) {
  const locale = useLocale();
  const t = useTranslations("gradesPage.reportCard");
  const tc = useTranslations("common");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportCard | null>(null);

  const handleGenerate = async () => {
    if (!selectedStudentId || !selectedTermId) {
      toast.error(t("selectStudentAndTerm"));
      return;
    }

    setIsGenerating(true);
    try {
      const report = await onGenerateReport(selectedStudentId, selectedTermId);
      if (report) {
        setReportData(report);
        toast.success(t("reportGenerated"));
      }
    } catch (_error) {
      toast.error(t("reportGenerationFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrintView = useCallback(() => {
    if (!reportData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error(t("unableToOpenPrintWindow"));
      return;
    }

    const isAmharic = locale === "am";
    const today = format(new Date(), "MMMM d, yyyy");

    const labels = {
      title: t("studentReportCard"),
      schoolName: tc("appName"),
      academicYear: tc("academicYear"),
      term: t("term"),
      class: tc("class"),
      studentInfo: t("studentInformation"),
      registrationNumber: t("registrationNumber"),
      subjects: t("subjects"),
      assessments: t("assessments"),
      average: t("average"),
      overallGrade: t("overallGrade"),
      grade: t("grade"),
      rank: t("rank"),
      rankOf: tc("of"),
      conduct: t("conduct"),
      teacherComment: t("teacherComment"),
      principal: t("principal"),
      parentGuardian: t("parentGuardian"),
      date: tc("date"),
      notAvailable: t("notAvailable"),
      officialRecord: t("officialRecord"),
      generatedOn: t("generatedOn"),
      printButton: t("printButton"),
    };

    const getLetterGrade = (pct: number): string => {
      if (pct >= 90) return "A";
      if (pct >= 80) return "B";
      if (pct >= 70) return "C";
      if (pct >= 60) return "D";
      return "F";
    };

    const getGradeColor = (grade: string): string => {
      switch (grade) {
        case "A":
          return "#166534";
        case "B":
          return "#1e40af";
        case "C":
          return "#92400e";
        case "D":
          return "#c2410c";
        case "F":
          return "#991b1b";
        default:
          return "#6b7280";
      }
    };

    const html = `
      <!DOCTYPE html>
      <html dir="${isAmharic ? "rtl" : "ltr"}">
        <head>
          <title>${labels.title} - ${reportData.student_name}</title>
          <meta charset="UTF-8">
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: ${isAmharic ? '"Noto Sans Ethiopic", "Abyssinica SIL",' : ""} 'Segoe UI', Arial, sans-serif;
              font-size: 11px;
              line-height: 1.5;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 3px solid #1e40af;
              padding-bottom: 15px;
            }
            .school-name { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
            .report-title { font-size: 14px; color: #4b5563; text-transform: uppercase; letter-spacing: 1px; }
            .student-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .info-row { display: flex; justify-content: space-between; }
            .info-label { font-weight: 600; color: #4b5563; }
            .info-value { font-weight: 500; }
            .subjects-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .subjects-table th {
              background: #1e40af;
              color: white;
              padding: 8px;
              text-align: left;
              font-size: 10px;
              text-transform: uppercase;
            }
            .subjects-table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
            .subjects-table tr:nth-child(even) { background: #f9fafb; }
            .assessments-cell { font-size: 9px; color: #6b7280; }
            .grade-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 999px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              background: #f3f4f6;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .summary-box {
              text-align: center;
              padding: 12px;
              border-radius: 8px;
              background: #f8fafc;
              border: 2px solid #e2e8f0;
            }
            .summary-value { font-size: 20px; font-weight: bold; color: #1e40af; }
            .summary-label { font-size: 9px; text-transform: uppercase; color: #6b7280; margin-top: 4px; }
            .comments { margin: 20px 0; }
            .comment-box {
              background: #f8fafc;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 10px;
              border: 1px solid #e2e8f0;
            }
            .comment-label { font-weight: 600; font-size: 10px; text-transform: uppercase; color: #4b5563; margin-bottom: 5px; }
            .comment-text { font-style: italic; color: #374151; min-height: 30px; }
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .signature-box { text-align: center; }
            .signature-line {
              border-top: 1px solid #333;
              padding-top: 5px;
              font-size: 10px;
              margin-bottom: 3px;
            }
            .signature-title { font-size: 9px; color: #6b7280; text-transform: uppercase; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 8px;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
            @media print {
              .no-print { display: none; }
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">${labels.schoolName}</div>
            <div class="report-title">${labels.title}</div>
            <div style="margin-top: 8px; font-size: 10px; color: #6b7280;">
              ${labels.academicYear}: ${reportData.academic_year} | ${labels.term}: ${reportData.term_name}
            </div>
          </div>

          <div class="student-info">
            <div class="info-row">
              <span class="info-label">${labels.studentInfo}:</span>
              <span class="info-value" style="font-size: 14px; color: #1e40af;">${reportData.student_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${labels.class}:</span>
              <span class="info-value">${reportData.class_name} - ${reportData.section_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${labels.registrationNumber}:</span>
              <span class="info-value font-mono">${reportData.registration_number}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${labels.date}:</span>
              <span class="info-value">${today}</span>
            </div>
          </div>

          <table class="subjects-table">
            <thead>
              <tr>
                <th style="width: 25%;">${labels.subjects}</th>
                <th style="width: 40%;">${labels.assessments}</th>
                <th style="width: 15%; text-align: center;">${labels.average}</th>
                <th style="width: 10%; text-align: center;">${labels.grade}</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.subjects
                .map((subject) => {
                  const avg = subject.average;
                  const grade = getLetterGrade(avg);
                  const assessments = subject.assessments
                    .map(
                      (a) =>
                        `${a.name}: ${a.score !== null ? a.score + "/" + a.max_score : labels.notAvailable} (${a.weight}%)`,
                    )
                    .join(", ");
                  return `
                  <tr>
                    <td style="font-weight: 500;">${subject.subject_name}</td>
                    <td class="assessments-cell">${assessments}</td>
                    <td style="text-align: center; font-weight: 600;">${avg.toFixed(1)}%</td>
                    <td style="text-align: center;">
                      <span class="grade-badge" style="color: ${getGradeColor(grade)}; background: ${getGradeColor(grade)}15;">
                        ${grade}
                      </span>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-value">${reportData.overall_average.toFixed(1)}%</div>
              <div class="summary-label">${labels.average}</div>
            </div>
            <div class="summary-box">
              <div class="summary-value">${getLetterGrade(reportData.overall_average)}</div>
              <div class="summary-label">${labels.overallGrade}</div>
            </div>
            <div class="summary-box">
              <div class="summary-value">${reportData.rank || labels.notAvailable}</div>
              <div class="summary-label">${labels.rank} ${labels.rankOf} ${reportData.total_students || labels.notAvailable}</div>
            </div>
            <div class="summary-box">
              <div class="summary-value">${reportData.subjects.length}</div>
              <div class="summary-label">${labels.subjects}</div>
            </div>
          </div>

          <div class="comments">
            <div class="comment-box">
              <div class="comment-label">${labels.conduct}</div>
              <div class="comment-text">${reportData.conduct || "_________________________________"}</div>
            </div>
            <div class="comment-box">
              <div class="comment-label">${labels.teacherComment}</div>
              <div class="comment-text">${reportData.teacher_comment || "_________________________________"}</div>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">${labels.teacherComment}</div>
              <div class="signature-title">${labels.date}: ___________</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">${labels.principal}</div>
              <div class="signature-title">${labels.date}: ___________</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">${labels.parentGuardian}</div>
              <div class="signature-title">${labels.date}: ___________</div>
            </div>
          </div>

          <div class="footer">
            <p>${labels.officialRecord}</p>
            <p>© ${labels.schoolName} - ${labels.generatedOn} ${today}</p>
          </div>

          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ${labels.printButton}
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success(t("openedForPrinting"));
  }, [locale, reportData, t, tc]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("student")}</Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectStudent")} />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.registration_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("term")}</Label>
            <Select value={selectedTermId} onValueChange={setSelectedTermId}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectTerm")} />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedStudentId || !selectedTermId}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {t("generate")}
        </Button>

        {reportData && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{reportData.student_name}</p>
                <p className="text-sm text-muted-foreground">
                  {t("average")}: {reportData.overall_average.toFixed(1)}%
                  {reportData.rank &&
                    ` | ${t("rank")}: ${reportData.rank}/${reportData.total_students}`}
                </p>
              </div>
            </div>

            <Button
              onClick={generatePrintView}
              variant="outline"
              className="w-full gap-2"
            >
              <Printer className="h-4 w-4" />
              {t("printPreview")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
