"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { ReportCardData } from "../types";

export function StudentReportCard({
  data,
  passingThreshold = 50,
}: {
  data: ReportCardData;
  passingThreshold: number;
}) {
  const t = useTranslations("studentPortal.grades.reportCard");
  const ts = useTranslations("studentPortal.grades.status");
  const tc = useTranslations("common");

  const getPassStatus = (percentage: number) => percentage >= passingThreshold;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-8">
      {/* 
        Print styles inject global hiding rules for common layout items.
        We specifically target the ID "student-report-card-print".
      */}
      <style jsx global>{`
        @media print {
          /* Hide standard layout components */
          aside,
          header,
          nav,
          .global-sidebar,
          .global-topbar,
          .no-print {
            display: none !important;
          }

          /* Ensure the background and text color looks right on paper */
          body {
            background-color: white !important;
            color: black !important;
            margin: 0;
            padding: 0;
          }

          /* Make the main content area expand */
          main {
            margin: 0 !important;
            padding: 0 !important;
          }

          /* The report card container takes full page */
          #student-report-card-print {
            display: block !important;
            width: 100% !important;
            margin: 1cm auto !important;
          }

          /* General Table adjustments for print */
          #student-report-card-print table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          #student-report-card-print th,
          #student-report-card-print td {
            border: 1px solid #000 !important;
            padding: 8px !important;
            color: #000 !important;
          }
        }
      `}</style>

      {/* Print Button Header */}
      <div className="mb-4 flex justify-end no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          {t("print")}
        </Button>
      </div>

      {/* Actual Report Card to be Printed */}
      <div
        id="student-report-card-print"
        className="bg-white text-black p-8 border rounded-lg shadow-sm"
      >
        <div className="flex flex-col items-center justify-center border-b pb-6 mb-6">
          {data.schoolInfo.logoUrl && (
            <img
              src={data.schoolInfo.logoUrl}
              alt={tc('schoolLogo')}
              className="h-20 w-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold uppercase tracking-wider">{data.schoolInfo.name}</h1>
          <h2 className="text-xl mt-2">{t("schoolHeader")}</h2>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
          <div>
            <span className="font-semibold">{t("student")}:</span> {data.student.fullName}
          </div>
          <div>
            <span className="font-semibold">{t("academicYear")}:</span> {data.term.academicYear}
          </div>
          <div>
            <span className="font-semibold">{t("studentId")}:</span> {data.student.studentIdNumber}
          </div>
          <div>
            <span className="font-semibold">{t("term")}:</span> {data.term.name}
          </div>
          <div>
            <span className="font-semibold">{t("class")}:</span> {data.student.className}
          </div>
          <div>
            <span className="font-semibold">{t("section")}:</span> {data.student.sectionName}
          </div>
        </div>

        {/* Grades Table */}
        <table className="w-full text-left border-collapse border border-gray-300 mb-8 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 font-bold">{t("table.subject")}</th>
              <th className="border border-gray-300 p-2 font-bold text-center">{t("table.scoreEarned")}</th>
              <th className="border border-gray-300 p-2 font-bold text-center">{t("table.totalMarks")}</th>
              <th className="border border-gray-300 p-2 font-bold text-center">{t("table.percentage")}</th>
              <th className="border border-gray-300 p-2 font-bold text-center">{t("table.status")}</th>
              <th className="border border-gray-300 p-2 font-bold">{t("table.remarks")}</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((sub, idx) => {
              const isPass = getPassStatus(sub.percentage);
              return (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2 font-medium">{sub.subjectName}</td>
                  <td className="border border-gray-300 p-2 text-center">{sub.scoreEarned}</td>
                  <td className="border border-gray-300 p-2 text-center">{sub.totalMarks}</td>
                  <td className="border border-gray-300 p-2 text-center font-bold">{Math.round(sub.percentage)}%</td>
                  <td className="border border-gray-300 p-2 text-center">
                    {isPass ? ts("pass") : ts("fail")}
                  </td>
                  <td className="border border-gray-300 p-2 italic text-gray-600">
                    {sub.teacherRemarks || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Footer */}
        <div className="flex flex-col gap-2 p-4 bg-gray-50 border border-gray-300 rounded mb-8 text-sm">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-semibold">{t("summary.totalScore")}:</span>
            <span>{data.summary.totalScoreEarned} / {data.summary.totalPossibleMarks}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2 pt-2">
            <span className="font-semibold">{t("summary.overallPercentage")}:</span>
            <span className="font-bold text-base">{Math.round(data.summary.overallPercentage)}%</span>
          </div>
          {data.summary.classRank && data.summary.totalStudentsInClass && (
            <div className="flex justify-between pt-2">
              <span className="font-semibold">{t("summary.classRank")}:</span>
              <span>{t("summary.rank", { rank: data.summary.classRank, total: data.summary.totalStudentsInClass })}</span>
            </div>
          )}
        </div>

        {/* General Remarks */}
        <div className="border border-gray-300 p-4 min-h-[100px] text-sm rounded">
          <p className="font-semibold mb-2">{t("generalRemarks")}:</p>
          <p className="italic text-gray-600">
            {data.generalRemarks || t("noRemarks")}
          </p>
        </div>
      </div>
    </div>
  );
}
