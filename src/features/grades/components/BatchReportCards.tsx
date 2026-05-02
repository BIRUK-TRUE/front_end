"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAcademicYears } from "@/features/academics/api/useAcademicYears";
import { useClasses, useClass } from "@/features/academics/api/useClasses";
import { useSectionStudents } from "@/features/attendance/hooks/useSectionStudents";
import { useReportCard } from "../api/useGrades";
import { exportReportCardAsPDF } from "../utils/exportReportCardPDF";

export function BatchReportCards() {
  const t = useTranslations("gradesPage.batchReportCards");
  const tc = useTranslations("common");
  
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const { data: sectionStudents } = useSectionStudents(selectedSectionId);

  const selectedSectionName = classDetail?.sections?.find(s => s.id === selectedSectionId)?.name || '';

  const handleBatchGenerate = async () => {
    if (!selectedSectionId || !selectedTermId || !sectionStudents || sectionStudents.length === 0) {
      toast.error(t("selectSectionAndTerm"));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedCount(0);

    const totalStudents = sectionStudents.length;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < totalStudents; i++) {
      const student = sectionStudents[i];
      
      try {
        // Fetch report card for this student
        const response = await fetch(`/api/grades/report-card/${student.id}?term_id=${selectedTermId}`);
        if (!response.ok) throw new Error('Failed to fetch report card');
        
        const reportCard = await response.json();
        
        // Generate PDF
        const filename = `${student.name.replace(/\s+/g, '_')}_ReportCard.pdf`;
        await exportReportCardAsPDF(`report-card-${student.id}`, filename);
        
        successCount++;
        setGeneratedCount(successCount);
      } catch (error) {
        failedCount++;
      }

      setProgress(((i + 1) / totalStudents) * 100);
      
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsGenerating(false);
    
    if (failedCount === 0) {
      toast.success(t("allReportCardsGenerated", { count: successCount }));
    } else {
      toast.warning(t("someReportCardsFailed", { success: successCount, failed: failedCount }));
    }
  };

  const canGenerate = selectedSectionId && selectedTermId && sectionStudents && sectionStudents.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{tc("academicYear")}</Label>
            <Select
              value={selectedYearId}
              onValueChange={(val) => {
                setSelectedYearId(val);
                setSelectedClassId('');
                setSelectedSectionId('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={tc("selectYear")} />
              </SelectTrigger>
              <SelectContent>
                {yearsData?.items?.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tc("class")}</Label>
            <Select
              value={selectedClassId}
              onValueChange={(val) => {
                setSelectedClassId(val);
                setSelectedSectionId('');
              }}
              disabled={!selectedYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedYearId ? tc("selectYearFirst") : tc("selectClass")} />
              </SelectTrigger>
              <SelectContent>
                {classesData?.items?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tc("section")}</Label>
            <Select
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              disabled={!selectedClassId}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedClassId ? tc("selectClassFirst") : tc("selectSection")} />
              </SelectTrigger>
              <SelectContent>
                {classDetail?.sections?.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("term")}</Label>
            <Select
              value={selectedTermId}
              onValueChange={setSelectedTermId}
              disabled={!selectedSectionId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectTerm")} />
              </SelectTrigger>
              <SelectContent>
                {/* This would be populated from actual terms data */}
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {sectionStudents && sectionStudents.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {t("studentsInSection")}: {sectionStudents.length}
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("generating")}</span>
              <span>{generatedCount}/{sectionStudents?.length || 0}</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {!isGenerating && generatedCount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {t("completed", { count: generatedCount })}
            </p>
          </div>
        )}

        <Button
          onClick={handleBatchGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isGenerating ? t("generating") : t("generateAll")}
        </Button>
      </CardContent>
    </Card>
  );
}
