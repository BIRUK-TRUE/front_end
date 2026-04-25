"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export function GradeFilters({
  termId,
  subjectId,
  onTermChange,
  onSubjectChange,
  availableTerms = [],
  availableSubjects = [],
}: {
  termId: string;
  subjectId: string;
  onTermChange: (val: string) => void;
  onSubjectChange: (val: string) => void;
  availableTerms?: { id: string; name: string }[];
  availableSubjects?: { id: string; name: string }[];
}) {
  const t = useTranslations("studentPortal.grades.filters");

  return (
    <Card className="mb-6">
      <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t("term")}
          </label>
          <Select value={termId} onValueChange={onTermChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("allTerms")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTerms")}</SelectItem>
              {availableTerms.map((term) => (
                <SelectItem key={term.id} value={term.id}>
                  {term.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t("subject")}
          </label>
          <Select value={subjectId} onValueChange={onSubjectChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("allSubjects")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allSubjects")}</SelectItem>
              {availableSubjects.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
