"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { gradesService } from "@/lib/api/grades.service";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";

export function useGradeWeights(academicYearId: string) {
  return useQuery({
    queryKey: ["settings", "grade-weights", academicYearId],
    queryFn: () => gradesService.getWeightConfigs(academicYearId),
    enabled: !!academicYearId,
  });
}

export function useCreateGradeWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gradesService.createWeightConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "grade-weights"],
      });
      toast.success("Grade weight configuration created");
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, "Failed to create configuration"));
    },
  });
}

export function useGradingScales(academicYearId: string) {
  return useQuery({
    queryKey: ["settings", "grading-scales", academicYearId],
    queryFn: () => gradesService.getGradingScales(academicYearId),
    enabled: !!academicYearId,
  });
}

export function useCreateGradingScale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gradesService.createGradingScale,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "grading-scales"],
      });
      toast.success("Grading scale created");
    },
    onError: (error: any) => {
      toast.error(formatApiError(error, "Failed to create scale"));
    },
  });
}

export function useCalculatedGrade(
  studentId: string,
  termId: string,
  subjectId: string,
) {
  return useQuery({
    queryKey: ["grades", "calculated", studentId, termId, subjectId],
    queryFn: () =>
      gradesService.getCalculatedGrade(studentId, termId, subjectId),
    enabled: !!studentId && !!termId && !!subjectId,
  });
}

export function useDownloadReportCard() {
  const t = useTranslations("common");
  return useMutation({
    mutationFn: ({
      studentId,
      termId,
    }: {
      studentId: string;
      termId: string;
    }) => gradesService.downloadReportCard(studentId, termId),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ReportCard_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t("downloadComplete"));
    },
    onError: () => {
      toast.error(t("downloadFailed"));
    },
  });
}
