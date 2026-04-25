'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeacherSchedule } from '@/features/teacher/hooks/useTeacherSchedule';
import { TeacherWeeklyTimetable } from '@/features/teacher/components/TeacherWeeklyTimetable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function TeacherSchedulePage() {
  const t = useTranslations('teacher.schedule');
  const tc = useTranslations('common');
  const { user } = useAuthStore();
  const schedule = useTeacherSchedule(user?.id ?? '');

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </CardContent>
      </Card>

      {schedule.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : schedule.isError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{tc('errorOccurred')}</p>
            <Button onClick={() => schedule.refetch()} variant="outline" className="mt-2">
              {tc('retry')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TeacherWeeklyTimetable entries={schedule.data ?? []} />
      )}
    </div>
  );
}
