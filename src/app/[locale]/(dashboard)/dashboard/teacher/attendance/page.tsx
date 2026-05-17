"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { TeacherAttendanceForm } from "@/features/teacher/components/TeacherAttendanceForm";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ScanFace } from "lucide-react";

export default function TeacherAttendancePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Take Attendance"
        description="Your first assigned class is pre-selected. Change the class or date if needed."
        actions={
          <Link href="/dashboard/attendance/face-scan">
            <Button variant="outline" className="gap-2 min-h-[44px]">
              <ScanFace className="h-4 w-4" />
              Use Face Scan
            </Button>
          </Link>
        }
      />
      <TeacherAttendanceForm teacherId={user.teacher_id || user.id} />
    </div>
  );
}
