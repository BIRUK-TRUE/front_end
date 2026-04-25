"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTeacherAssessments, useAssessmentGrades, useSubmitTeacherGrades } from "../hooks/useTeacherGrades";
import type { TeacherAssessmentFilter } from "../types";

export function TeacherGradeEntry({ teacherId }: { teacherId: string }) {
  const t = useTranslations("teacher.grades");
  const tc = useTranslations("common");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<TeacherAssessmentFilter>({ page: 1, size: 10 });
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const assessments = useTeacherAssessments(teacherId, { ...filter, page, size: 10 });
  const selected = (assessments.data?.items ?? []).find((a) => a.id === selectedAssessment);
  const grades = useAssessmentGrades(selectedAssessment);
  const submit = useSubmitTeacherGrades();

  const stats = useMemo(() => {
    const values = Object.values(scores).filter(v => v !== null && !isNaN(v));
    if (values.length === 0) return { avg: 0, max: 0, min: 0 };
    const total = values.reduce((acc, v) => acc + v, 0);
    return {
      avg: total / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
    };
  }, [scores]);

  const handleSubmit = async () => {
    if (!selected) return;
    
    // Validate all scores are within range
    const invalid = rows.some(row => (scores[row.studentId] ?? 0) > selected.totalMarks);
    if (invalid) {
      toast.error(t("errorMaxScore", { max: selected.totalMarks }));
      return;
    }

    const payload = (grades.data ?? []).map((row) => ({
      studentId: row.studentId,
      score: scores[row.studentId] ?? 0,
      remarks: remarks[row.studentId] ?? "",
    }));

    try {
      await submit.mutateAsync({
        assessmentId: selected.id,
        totalMarks: selected.totalMarks,
        grades: payload,
      });
      toast.success(t("submitSuccess"));
    } catch (error) {
      toast.error(tc("errorOccurred"));
    }
  };

  const rows = grades.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tc("class")}</label>
            <Input
              placeholder={tc("class")}
              value={filter.sectionId ?? ""}
              onChange={(e) => setFilter((prev) => ({ ...prev, sectionId: e.target.value }))}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tc("subject")}</label>
            <Input
              placeholder={tc("subject")}
              value={filter.subjectName ?? ""}
              onChange={(e) => setFilter((prev) => ({ ...prev, subjectName: e.target.value }))}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tc("academicYear")}</label>
            <Input
              placeholder={tc("academicYear")}
              value={filter.termName ?? ""}
              onChange={(e) => setFilter((prev) => ({ ...prev, termName: e.target.value }))}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-primary/20">
        <CardContent className="pt-6 space-y-4">
          {assessments.isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (assessments.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-center py-6 text-muted-foreground italic">{t("noAssessments")}</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("assessmentName")}</label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger className="h-11 shadow-sm">
                    <SelectValue placeholder={t("assessmentName")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(assessments.data?.items ?? []).map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            assessment.gradesEntered ? "bg-green-500" : "bg-orange-500"
                          )} />
                          <span className="font-medium">{assessment.assessmentName}</span>
                          <span className="text-muted-foreground font-normal">
                            — {assessment.className} ({assessment.totalMarks} {tc("score")})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {tc("previous")}
                </Button>
                <span className="text-xs font-semibold bg-muted px-3 py-1 rounded-full">{tc("page")} {page}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!assessments.data?.items || assessments.data.items.length < 10}
                >
                  {tc("next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selected ? (
        <Card className="shadow-md border-primary/30">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  {selected.assessmentName} 
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selected.className} • {selected.subjectName} • {selected.totalMarks} {tc("score")}
                </p>
              </div>
              <div className="flex gap-4 p-3 bg-card rounded-lg border shadow-sm self-start">
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{t("classAverage")}</p>
                  <p className="text-lg font-bold text-primary">{stats.avg.toFixed(1)}</p>
                </div>
                <div className="border-l h-8 self-center" />
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{t("highest")}</p>
                  <p className="text-lg font-bold text-green-600">{stats.max}</p>
                </div>
                <div className="border-l h-8 self-center" />
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{t("lowest")}</p>
                  <p className="text-lg font-bold text-red-600">{stats.min}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {grades.isLoading ? (
              <div className="space-y-3 py-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[300px] font-bold">{tc("name")}</TableHead>
                        <TableHead className="w-[120px] font-bold">{t("score")}</TableHead>
                        <TableHead className="font-bold">{t("remarks")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.studentId} className="hover:bg-muted/30">
                          <TableCell className="py-4 font-medium">
                            <p className="leading-none">{row.studentName}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{row.studentCode}</p>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                max={selected.totalMarks}
                                value={scores[row.studentId] ?? row.score ?? 0}
                                onChange={(e) =>
                                  setScores((prev) => ({
                                    ...prev,
                                    [row.studentId]: Number(e.target.value),
                                  }))
                                }
                                className={cn(
                                  "h-10 font-bold text-center pr-8",
                                  (scores[row.studentId] > selected.totalMarks) && "border-red-500 text-red-600 bg-red-50"
                                )}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                                / {selected.totalMarks}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder={t("remarksPlaceholder") || tc("remarks")}
                              value={remarks[row.studentId] ?? row.remarks ?? ""}
                              onChange={(e) =>
                                setRemarks((prev) => ({
                                  ...prev,
                                  [row.studentId]: e.target.value,
                                }))
                              }
                              className="h-10"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    size="lg" 
                    onClick={handleSubmit} 
                    disabled={submit.isPending}
                    className="px-8 font-bold shadow-lg"
                  >
                    {submit.isPending ? tc("loading") : t("submitGrades")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
