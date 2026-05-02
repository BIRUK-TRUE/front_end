"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { TeacherAttendanceForm } from "@/features/teacher/components/TeacherAttendanceForm";

export default function TeacherAttendancePage() {
  const t = useTranslations("teacher.attendance");
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>
      <TeacherAttendanceForm teacherId={user.teacher_id || user.id} />
    </div>
  );
}
