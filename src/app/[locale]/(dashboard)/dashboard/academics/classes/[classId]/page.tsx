"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useClass } from "@/features/academics/api/useClasses";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Users,
  BookOpen,
  LayoutGrid,
  Calendar,
  Hash,
} from "lucide-react";

export default function ClassDetailPage() {
  const t = useTranslations("classes");
  const tc = useTranslations("common");
  const { classId } = useParams<{ classId: string }>();

  const { data: classData, isLoading, error } = useClass(classId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("detail")}
          description={t("detailNotFound")}
          actions={
            <Button variant="outline" asChild>
              <Link href="/dashboard/analytics">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {tc("back")}
              </Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>{t("notFound")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={classData.name}
        description={`${t("grade")} ${classData.grade_level}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tc("back")}
            </Link>
          </Button>
        }
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalStudents")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("studentsInClass")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalSections")}
            </CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.sections?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("sections")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("gradeLevel")}
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.grade_level}</div>
            <p className="text-xs text-muted-foreground">
              {t("academicYear")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sections Table */}
      {classData.sections && classData.sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("sections")}</CardTitle>
            <CardDescription>{t("sectionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sectionName")}</TableHead>
                  <TableHead>{t("room")}</TableHead>
                  <TableHead className="text-right">{t("capacity")}</TableHead>
                  <TableHead className="text-right">{t("enrolled")}</TableHead>
                  <TableHead className="text-right">{t("available")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell>{section.room_number || "-"}</TableCell>
                    <TableCell className="text-right">{section.capacity}</TableCell>
                    <TableCell className="text-right">{section.student_count}</TableCell>
                    <TableCell className="text-right">
                      {section.available_slots !== undefined 
                        ? section.available_slots 
                        : Math.max(0, section.capacity - section.student_count)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={section.is_full || section.student_count >= section.capacity ? "destructive" : "default"}>
                        {section.is_full || section.student_count >= section.capacity ? t("full") : t("open")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("additionalInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("className")}
              </p>
              <p className="text-base">{classData.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("gradeLevel")}
              </p>
              <p className="text-base">{classData.grade_level}</p>
            </div>
          </div>
          {classData.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("description")}
              </p>
              <p className="text-base">{classData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
