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
import { Printer, FileText, Loader2, Award, GraduationCap, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ReportCard } from "../types";
import { ReportCardPreview } from "./ReportCardPreview";
import { exportReportCardAsPDF } from "../utils/exportReportCardPDF";

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
  const [isExporting, setIsExporting] = useState(false);
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

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    
    setIsExporting(true);
    try {
      const filename = `${reportData.student.full_name.replace(/\s+/g, '_')}_ReportCard_${reportData.term.name}.pdf`;
      await exportReportCardAsPDF('report-card', filename);
      toast.success(t("pdfDownloaded"));
    } catch (error) {
      toast.error(t("pdfDownloadFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!reportData) return;
    window.print();
  };

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
                <p className="font-medium">{reportData.student.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {t("average")}: {reportData.summary.overall_average.toFixed(1)}%
                  {reportData.summary.rank &&
                    ` | ${t("rank")}: ${reportData.summary.rank}/${reportData.summary.total_students}`}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex-1 gap-2"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {t("downloadPDF")}
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Printer className="h-4 w-4" />
                {t("print")}
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <ReportCardPreview reportCard={reportData} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
