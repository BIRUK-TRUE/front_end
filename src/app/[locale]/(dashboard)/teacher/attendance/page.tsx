'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { TeacherAttendanceForm } from '@/features/teacher/components/TeacherAttendanceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherAttendancePage() {
  const t = useTranslations('teacher.attendance');
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('takeAttendance')}</p>
        </CardContent>
      </Card>

      <TeacherAttendanceForm teacherId={user.id} />
    </div>
  );
}
