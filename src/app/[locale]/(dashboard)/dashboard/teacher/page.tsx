"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { TeacherDashboardHome } from "@/features/teacher/components/TeacherDashboardHome";

export default function TeacherHomePage() {
  const { user } = useAuthStore();
  if (!user) return null;

  return <TeacherDashboardHome teacherId={user.id} teacherName={user.full_name} />;
}
