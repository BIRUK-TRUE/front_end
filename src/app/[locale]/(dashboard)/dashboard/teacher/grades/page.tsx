"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth-store";
import { TeacherGradeEntry } from "@/features/teacher/components/TeacherGradeEntry";

export default function TeacherGradesPage() {
  const t = useTranslations("teacher.grades");
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>
      <TeacherGradeEntry teacherId={user.teacher_id || user.id} />
    </div>
  );
}
