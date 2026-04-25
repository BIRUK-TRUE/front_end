'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeacherClasses, useClassRoster } from '@/features/teacher/hooks/useTeacherClasses';
import { TeacherClassCard } from '@/features/teacher/components/TeacherClassCard';
import { TeacherClassRoster } from '@/features/teacher/components/TeacherClassRoster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function MyClassesPage() {
  const t = useTranslations('teacher.myClasses');
  const tc = useTranslations('common');
  const { user } = useAuthStore();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  const classes = useTeacherClasses(user?.id ?? '');
  const roster = useClassRoster(selectedSectionId ?? '');

  if (!user) return null;

  // Show roster detail view when a section is selected
  if (selectedSectionId && roster.data) {
    const selectedClass = classes.data?.find(c => c.sectionId === selectedSectionId);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedSectionId(null)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {tc('back')}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClass?.className} - {selectedClass?.sectionName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedClass?.subjectName} • {t('students', { count: selectedClass?.studentCount || 0 })}
            </p>
          </CardContent>
        </Card>

        <TeacherClassRoster data={roster.data} />
      </div>
    );
  }

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

      {classes.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : classes.isError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{tc('errorOccurred')}</p>
            <Button onClick={() => classes.refetch()} variant="outline" className="mt-2">
              {tc('retry')}
            </Button>
          </CardContent>
        </Card>
      ) : (classes.data?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t('noClasses')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.data?.map((item) => (
            <TeacherClassCard 
              key={item.sectionId} 
              item={item} 
              onViewStudents={() => setSelectedSectionId(item.sectionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
