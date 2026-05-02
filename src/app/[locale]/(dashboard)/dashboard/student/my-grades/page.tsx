"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useMySubjectSummary,
  useMyAssessmentGrades,
  useMyReportCard,
} from "@/features/student-portal/api/useMyGrades";
import { useAcademicSettings, useStudentTerms } from "@/features/student-portal/api/useAcademicSettings";
import { GradeFilters } from "@/features/student-portal/components/GradeFilters";
import { SubjectScoreSummaryTable } from "@/features/student-portal/components/SubjectScoreSummaryTable";
import { AssessmentDetailsTable } from "@/features/student-portal/components/AssessmentDetailsTable";
import { StudentReportCard } from "@/features/student-portal/components/StudentReportCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyGradesPage() {
  const tc = useTranslations("studentPortal.common");
  const t = useTranslations("studentPortal.grades");

  const [termIdFilter, setTermIdFilter] = useState("all");
  const [subjectIdFilter, setSubjectIdFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Settings
  const settingsQ = useAcademicSettings();
  const passingThreshold = settingsQ.data?.passingThreshold ?? 50;

  // Terms for filter
  const termsQ = useStudentTerms();
  const availableTerms = termsQ.data?.map((t: any) => ({
    id: t.id,
    name: t.name,
  })) || [];

  // Real Queries
  const summaryQ = useMySubjectSummary(termIdFilter === "all" ? undefined : termIdFilter);
  const assessmentsQ = useMyAssessmentGrades({
    page,
    size: 10,
    termId: termIdFilter === "all" ? undefined : termIdFilter,
    subjectId: subjectIdFilter === "all" ? undefined : subjectIdFilter,
  });

  // Report Card Query (only run if a specific term is selected)
  const reportCardTermId = termIdFilter !== "all" ? termIdFilter : "";
  const reportCardQ = useMyReportCard(reportCardTermId);

  const isLoading = summaryQ.isLoading || assessmentsQ.isLoading;
  const isError = summaryQ.isError || assessmentsQ.isError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-destructive mb-4">{tc("error")}</p>
        <Button onClick={() => {
          summaryQ.refetch();
          assessmentsQ.refetch();
        }} variant="outline">{tc("retry")}</Button>
      </div>
    );
  }

  // Derive filters options from the summary payload
  // In a real scenario, this could come from a dedicated "terms" and "subjects" lookup API.
  // Here we fallback to extracting subjects from the summary if available.
  const availableSubjects = summaryQ.data?.subjects.map((s: { subjectId: string; subjectName: string }) => ({
    id: s.subjectId,
    name: s.subjectName,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      <div className="no-print">
        <GradeFilters
          termId={termIdFilter}
          subjectId={subjectIdFilter}
          onTermChange={(v) => {
            setTermIdFilter(v);
            setPage(1);
          }}
          onSubjectChange={(v) => {
            setSubjectIdFilter(v);
            setPage(1);
          }}
          availableTerms={availableTerms}
          availableSubjects={availableSubjects}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="no-print">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reportCard">Report Card</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="no-print">
            {summaryQ.data && (
              <SubjectScoreSummaryTable
                subjects={summaryQ.data.subjects}
                passingThreshold={passingThreshold}
              />
            )}
            
            {assessmentsQ.data && (
              <AssessmentDetailsTable
                assessments={assessmentsQ.data.items}
                page={assessmentsQ.data.page}
                pages={assessmentsQ.data.pages}
                onPageChange={setPage}
                passingThreshold={passingThreshold}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="reportCard">
          {reportCardTermId === "" ? (
            <div className="p-12 text-center border rounded-md bg-muted/10 text-muted-foreground no-print">
              {t("reportCard.selectTermPrompt")}
            </div>
          ) : reportCardQ.isLoading ? (
            <div className="space-y-4 no-print">
              <Skeleton className="h-[40px] w-1/4 mx-auto" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : reportCardQ.isError ? (
            <div className="p-12 text-center text-destructive border rounded-md bg-destructive/10 no-print">
              {tc("error")}
            </div>
          ) : reportCardQ.data ? (
            <StudentReportCard
              data={reportCardQ.data}
              passingThreshold={passingThreshold}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
