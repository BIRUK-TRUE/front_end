"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileDown, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { AttendanceRecord, DailyAttendanceSummary } from "../types";

interface AttendancePDFReportProps {
  records: AttendanceRecord[];
  summary: DailyAttendanceSummary;
  sectionName: string;
  date: string;
}

export function AttendancePDFReport({
  records,
  summary,
  sectionName,
  date,
}: AttendancePDFReportProps) {
  const tc = useTranslations("common");
  const ta = useTranslations("attendance");
  const t = useTranslations("attendanceReport");

  // Generate HTML content for printing (works better than PDF in browser)
  const generatePrintView = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error(t("unableToOpenPrintWindow"));
      return;
    }

    const formattedDate = format(new Date(date), "MMMM d, yyyy");
    const today = format(new Date(), "MMMM d, yyyy");

    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const lateCount = records.filter((r) => r.status === "late").length;
    const excusedCount = records.filter((r) => r.status === "excused").length;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t("attendanceReportTitle")} - ${sectionName}</title>
          <style>
            @page { size: A4 landscape; margin: 20mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .school-name { font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
            .report-title { font-size: 16px; color: #4b5563; margin-bottom: 5px; }
            .meta-info { display: flex; justify-content: space-between; margin-top: 10px; font-size: 10px; color: #6b7280; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .stat-box { text-align: center; padding: 10px; border-radius: 6px; }
            .stat-box.present { background: #dcfce7; border: 1px solid #86efac; }
            .stat-box.absent { background: #fee2e2; border: 1px solid #fca5a5; }
            .stat-box.late { background: #fef3c7; border: 1px solid #fcd34d; }
            .stat-box.excused { background: #dbeafe; border: 1px solid #93c5fd; }
            .stat-number { font-size: 24px; font-weight: bold; }
            .stat-label { font-size: 10px; text-transform: uppercase; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #1e40af; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
            td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) { background: #f9fafb; }
            .status-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
            .status-present { background: #dcfce7; color: #166534; }
            .status-absent { background: #fee2e2; color: #991b1b; }
            .status-late { background: #fef3c7; color: #92400e; }
            .status-excused { background: #dbeafe; color: #1e40af; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-line { width: 200px; border-top: 1px solid #333; padding-top: 5px; text-align: center; font-size: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">${tc("appName")}</div>
            <div class="report-title">${t("dailyAttendanceReport")}</div>
            <div style="font-size: 12px; color: #4b5563;">${tc("section")}: ${sectionName}</div>
            <div class="meta-info">
              <span>${tc("date")}: ${formattedDate}</span>
              <span>${t("generated")}: ${today}</span>
              <span>${t("totalStudents")}: ${records.length}</span>
            </div>
          </div>

          <div class="stats">
            <div class="stat-box present">
              <div class="stat-number" style="color: #166534;">${presentCount}</div>
              <div class="stat-label">${ta("present")}</div>
            </div>
            <div class="stat-box absent">
              <div class="stat-number" style="color: #991b1b;">${absentCount}</div>
              <div class="stat-label">${ta("absent")}</div>
            </div>
            <div class="stat-box late">
              <div class="stat-number" style="color: #92400e;">${lateCount}</div>
              <div class="stat-label">${ta("late")}</div>
            </div>
            <div class="stat-box excused">
              <div class="stat-number" style="color: #1e40af;">${excusedCount}</div>
              <div class="stat-label">${ta("excused")}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 25%;">${t("studentName")}</th>
                <th style="width: 20%;">${t("registrationNumber")}</th>
                <th style="width: 15%;">${tc("status")}</th>
                <th style="width: 20%;">${t("note")}</th>
                <th style="width: 15%;">${t("markedBy")}</th>
              </tr>
            </thead>
            <tbody>
              ${records
                .map(
                  (r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${r.student_name}</td>
                  <td>${r.registration_number}</td>
                  <td>
                    <span class="status-badge status-${r.status}">${r.status}</span>
                  </td>
                  <td>${r.note || "-"}</td>
                  <td>${r.marked_by}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="signature">
            <div class="signature-line">${t("teacherSignature")}</div>
            <div class="signature-line">${t("principalSignature")}</div>
          </div>

          <div class="footer">
            <p>${t("officialAttendanceRecord")}</p>
            <p>© ${tc("appName")} - ${t("confidential")}</p>
          </div>

          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ${t("printReport")}
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success(t("attendanceReportOpened"));
  }, [records, sectionName, date, t, ta, tc]);

  // Generate CSV download
  const generateCSV = useCallback(() => {
    const headers = [
      "#",
      t("studentName"),
      t("registrationNumber"),
      tc("status"),
      t("note"),
      t("markedBy"),
    ];
    const rows = records.map((r, i) => [
      i + 1,
      r.student_name,
      r.registration_number,
      r.status,
      r.note || "",
      r.marked_by,
    ]);

    const csvContent = [
      [
        t("attendanceReportTitle"),
        sectionName,
        format(new Date(date), "yyyy-MM-dd"),
      ].join(","),
      "",
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${sectionName.replace(/\s+/g, "_")}_${date}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(t("csvReportDownloaded"));
  }, [records, sectionName, date, t, tc]);

  if (!records.length) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{t("noAttendanceDataToReport")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">
              {t("attendanceReportTitle")}
            </CardTitle>
          </div>
          <Badge variant="outline">
            {records.length} {t("students")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={generatePrintView}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {t("printPdf")}
          </Button>
          <Button onClick={generateCSV} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            {t("downloadCsv")}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>
              {tc("date")}: {format(new Date(date), "MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {tc("section")}: {sectionName}
            </span>
          </div>
        </div>

        {/* Summary Preview */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t">
          <div className="text-center p-2 bg-green-500/10 rounded">
            <div className="text-lg font-bold text-green-600">
              {summary.present}
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">
              {ta("present")}
            </div>
          </div>
          <div className="text-center p-2 bg-red-500/10 rounded">
            <div className="text-lg font-bold text-red-600">
              {summary.absent}
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">
              {ta("absent")}
            </div>
          </div>
          <div className="text-center p-2 bg-amber-500/10 rounded">
            <div className="text-lg font-bold text-amber-600">
              {summary.late}
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">
              {ta("late")}
            </div>
          </div>
          <div className="text-center p-2 bg-blue-500/10 rounded">
            <div className="text-lg font-bold text-blue-600">
              {summary.excused}
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">
              {ta("excused")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
