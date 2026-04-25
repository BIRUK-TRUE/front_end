'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { TeacherGradeEntry } from '@/features/teacher/components/TeacherGradeEntry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherGradesPage() {
  const t = useTranslations('teacher.grades');
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('enterGrades')}</p>
        </CardContent>
      </Card>

      <TeacherGradeEntry teacherId={user.id} />
    </div>
  );
}
