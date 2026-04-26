"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { format } from "date-fns";
import type { ReportCard } from "../types";
import { cn } from "@/lib/utils";

interface ReportCardPreviewProps {
  reportCard: ReportCard;
  className?: string;
}

export function ReportCardPreview({ reportCard, className }: ReportCardPreviewProps) {
  const locale = useLocale();
  const t = useTranslations("gradesPage.reportCard");
  const tc = useTranslations("common");
  const isAmharic = locale === "am";

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case "A":
        return "text-green-700 bg-green-100 border-green-300";
      case "B":
        return "text-green-700 bg-green-100 border-green-300";
      case "C":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "D":
        return "text-orange-700 bg-orange-100 border-orange-300";
      case "F":
        return "text-red-700 bg-red-100 border-red-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getPromotionStatusColor = (status: string): string => {
    switch (status) {
      case "promoted":
        return "bg-green-600 text-white";
      case "retained":
        return "bg-red-600 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div
      id="report-card"
      className={cn(
        "w-full max-w-[210mm] mx-auto bg-white border-2 border-gray-300 p-6 shadow-lg",
        isAmharic ? "font-ethiopic" : "",
        className
      )}
      style={{ fontFamily: isAmharic ? "'Noto Sans Ethiopic', 'Abyssinica SIL', sans-serif" : "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-blue-800 pb-4 mb-4">
        {reportCard.school.logo_url && (
          <img
            src={reportCard.school.logo_url}
            alt={tc('schoolLogo')}
            className="h-16 mx-auto mb-2"
          />
        )}
        <h1 className="text-2xl font-bold text-blue-900">{reportCard.school.name}</h1>
        <p className="text-sm text-gray-600">
          {reportCard.school.address} | {reportCard.school.phone}
        </p>
        <h2 className="text-lg font-bold text-gray-800 mt-2 uppercase tracking-wider">
          {t("academicProgressReport")}
        </h2>
      </div>

      {/* Academic Year and Term */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div>
          <span className="font-semibold">{tc("academicYear")}:</span>{" "}
          {reportCard.academic_year}
        </div>
        <div>
          <span className="font-semibold">{t("term")}:</span> {reportCard.term.name}
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">{t("student")}:</span>{" "}
            {reportCard.student.full_name}
          </div>
          <div>
            <span className="font-semibold">{t("registrationNumber")}:</span>{" "}
            {reportCard.student.registration_number}
          </div>
          <div>
            <span className="font-semibold">{tc("class")}:</span>{" "}
            {reportCard.class_name} - {reportCard.section_name}
          </div>
          <div>
            <span className="font-semibold">{t("dateOfBirth")}:</span>{" "}
            {format(new Date(reportCard.student.date_of_birth), "MMM d, yyyy")}
          </div>
          <div>
            <span className="font-semibold">{t("sex")}:</span> {reportCard.student.sex}
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
          {t("subjectGrades")}
        </h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="border border-blue-700 px-2 py-1 text-left">{t("subject")}</th>
              <th className="border border-blue-700 px-2 py-1 text-center">{t("score")}</th>
              <th className="border border-blue-700 px-2 py-1 text-center">{t("max")}</th>
              <th className="border border-blue-700 px-2 py-1 text-center">{t("percentage")}</th>
              <th className="border border-blue-700 px-2 py-1 text-center">{t("grade")}</th>
              <th className="border border-blue-700 px-2 py-1 text-left">{t("remarks")}</th>
            </tr>
          </thead>
          <tbody>
            {reportCard.subjects.map((subject, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="border border-gray-300 px-2 py-1 font-medium">
                  {subject.subject_name}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {subject.total_score}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {subject.max_total}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {subject.percentage.toFixed(1)}%
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-xs font-bold border",
                      getGradeColor(subject.letter_grade)
                    )}
                  >
                    {subject.letter_grade}
                  </span>
                </td>
                <td className="border border-gray-300 px-2 py-1 text-xs">
                  {subject.remarks || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
          {t("summary")}
        </h3>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-blue-900 text-lg">
              {reportCard.summary.overall_average.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">{t("overallAverage")}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-blue-900 text-lg">
              {reportCard.summary.overall_letter_grade}
            </div>
            <div className="text-xs text-gray-600">{t("overallGrade")}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-blue-900 text-lg">
              {reportCard.summary.rank || "N/A"}
            </div>
            <div className="text-xs text-gray-600">
              {t("rank")} {tc("of")} {reportCard.summary.total_students || "N/A"}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-blue-900 text-lg">
              {reportCard.summary.subjects_passed}/{reportCard.summary.total_subjects}
            </div>
            <div className="text-xs text-gray-600">{t("subjectsPassed")}</div>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
          {t("attendance")}
        </h3>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-gray-800">
              {reportCard.summary.total_school_days}
            </div>
            <div className="text-xs text-gray-600">{t("schoolDays")}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-green-700">
              {reportCard.summary.days_present}
            </div>
            <div className="text-xs text-gray-600">{t("present")}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-red-700">
              {reportCard.summary.days_absent}
            </div>
            <div className="text-xs text-gray-600">{t("absent")}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="font-bold text-blue-900">
              {reportCard.summary.attendance_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">{t("attendanceRate")}</div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
          {t("remarks")}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <span className="font-semibold">{t("teacherRemarks")}:</span>
            <div className="mt-1 italic text-gray-700 min-h-[40px]">
              {reportCard.summary.teacher_remarks || "_________________________"}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <span className="font-semibold">{t("directorRemarks")}:</span>
            <div className="mt-1 italic text-gray-700 min-h-[40px]">
              {reportCard.summary.director_remarks || "_________________________"}
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Status */}
      <div className="mb-4">
        <div
          className={cn(
            "text-center py-2 rounded font-bold uppercase tracking-wider",
            getPromotionStatusColor(reportCard.promotion_status)
          )}
        >
          {t("promotionStatus")}: {reportCard.promotion_status}
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mb-1">
              {t("classTeacher")}
            </div>
            <div className="text-xs text-gray-600">{tc("date")}: ___________</div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mb-1">
              {t("director")}
            </div>
            <div className="text-xs text-gray-600">{tc("date")}: ___________</div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mb-1">
              {t("parentGuardian")}
            </div>
            <div className="text-xs text-gray-600">{tc("date")}: ___________</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>{t("officialRecord")}</p>
        <p>
          © {reportCard.school.name} - {t("generatedOn")}{" "}
          {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}
