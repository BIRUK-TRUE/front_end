"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAcademicYears } from "@/features/academics/api/useAcademicYears";
import { useClasses, useClass } from "@/features/academics/api/useClasses";
import { useFaceEnrollment } from "@/features/attendance/hooks/useFaceEnrollment";
import { useSectionStudents } from "@/features/attendance/hooks/useSectionStudents";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ScanFace,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FaceEnrollmentFlow } from "@/features/attendance/components/FaceEnrollmentFlow";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export default function FaceEnrollmentPage() {
  const t = useTranslations("faceAttendance.enrollment");
  const tc = useTranslations("common");

  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  interface StudentBasic {
    id: string;
    name: string;
    registration_number: string;
  }

  const [enrollingStudent, setEnrollingStudent] = useState<StudentBasic | null>(
    null,
  );

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const {
    enrollmentStatus,
    isLoading: isLoadingStatus,
    deleteEnrollment,
  } = useFaceEnrollment(selectedSectionId);
  const { data: sectionStudents, isLoading: isLoadingStudents } =
    useSectionStudents(selectedSectionId);

  const students: StudentBasic[] = sectionStudents || [];

  const getStatus = (studentId: string) => {
    return enrollmentStatus?.find((s) => s.studentId === studentId);
  };

  if (enrollingStudent) {
    return (
      <div className="p-6">
        <FaceEnrollmentFlow
          student={enrollingStudent}
          onComplete={() => setEnrollingStudent(null)}
          onCancel={() => setEnrollingStudent(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <PageHeader title={t("title")} description={t("subtitle")} />
        <Link href="/dashboard/attendance">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Attendance
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectValue placeholder={tc("selectClass")} />
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
                  <SelectValue placeholder={tc("selectSection")} />
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
        </CardContent>
      </Card>

      {!selectedSectionId ? (
        <EmptyState
          icon={ScanFace}
          title={t("selectSection")}
          description={t("selectSectionDescription")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {isLoadingStatus || isLoadingStudents ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              icon={Search}
              title={t("noStudentsFound")}
              description={t("noStudentsDescription")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => {
                const status = getStatus(student.id);
                const isEnrolled = status?.enrolled;
                const initials = student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <Card
                    key={student.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border-2 border-slate-100 shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold truncate">
                            {student.name}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono mb-2">
                            {student.registration_number}
                          </p>

                          <div className="flex items-center gap-2">
                            {isEnrolled ? (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-500/10 text-emerald-600 border-none px-2 py-0 h-5"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t("enrolled")}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground text-[10px] h-5 px-2"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                {t("notEnrolled")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-100">
                        {isEnrolled ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteId(student.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            {t("deleteEnrollment")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setEnrollingStudent(student)}
                          >
                            <ScanFace className="h-3 w-3 mr-2" />
                            {t("startEnrollment")}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/students/${student.id}`}>
                            {tc("view")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Card className="bg-emerald-50 border-emerald-100 max-w-xl">
              <CardContent className="p-10 flex flex-col items-center text-center">
                <ShieldCheck className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="font-bold text-emerald-800 mb-2">
                  {t("privacyTitle")}
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {t("privacyAssurance")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteEnrollment.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        title={tc("confirmDelete")}
        description={t("deleteConfirm", {
          name: students.find((s) => s.id === deleteId)?.name || "Unknown",
        })}
        isLoading={deleteEnrollment.isPending}
      />
    </div>
  );
}
