"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAcademicYears } from "@/features/academics/api/useAcademicYears";
import { useClasses, useClass } from "@/features/academics/api/useClasses";
import { PageHeader } from "@/components/shared/page-header";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, PlayCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FaceAttendanceStation } from "@/features/attendance/components/FaceAttendanceStation";
import { useSectionStudents } from "@/features/attendance/hooks/useSectionStudents";

export default function FaceScanPage() {
  const t = useTranslations("faceAttendance.station");
  const tc = useTranslations("common");

  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [isStationActive, setIsStationActive] = useState(false);

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const { data: sectionStudents } = useSectionStudents(selectedSectionId);

  const selectedSectionName =
    classDetail?.sections?.find((s) => s.id === selectedSectionId)?.name || "";

  if (isStationActive && selectedSectionId) {
    return (
      <FaceAttendanceStation
        sectionId={selectedSectionId}
        sectionName={selectedSectionName}
        students={sectionStudents || []}
        onClose={() => setIsStationActive(false)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/dashboard/attendance">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("backToAttendance")}
            </Link>
          </Button>
        }
      />

      <Card className="mx-auto max-w-2xl">
        <CardHeader className="space-y-3 border-b">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Camera className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">
                {t("selectSection")}
              </CardTitle>
              <CardDescription>{t("selectSectionPrompt")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>{tc("academicYear")}</Label>
              <Select
                value={selectedYearId}
                onValueChange={(val) => {
                  setSelectedYearId(val);
                  setSelectedClassId("");
                  setSelectedSectionId("");
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
                  setSelectedSectionId("");
                }}
                disabled={!selectedYearId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedYearId
                        ? tc("selectYearFirst")
                        : tc("selectClass")
                    }
                  />
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
                  <SelectValue
                    placeholder={
                      !selectedClassId
                        ? tc("selectClassFirst")
                        : tc("selectSection")
                    }
                  />
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
          </div>

          <Button
            className="w-full gap-2"
            disabled={!selectedSectionId}
            onClick={() => setIsStationActive(true)}
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            {t("startSession")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
