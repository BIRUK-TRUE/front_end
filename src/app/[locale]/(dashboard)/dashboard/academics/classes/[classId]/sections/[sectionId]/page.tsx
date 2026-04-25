'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useSection, useClass } from '@/features/academics/api/useClasses';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  Users,
  UserPlus,
  GraduationCap,
  School,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SectionRosterPage() {
  const tc = useTranslations('common');
  const t = useTranslations('academicsPages.sectionRoster');
  const params = useParams();
  const sectionId = params.sectionId as string;
  const classId = params.classId as string;

  const { data: section, isLoading: isSectionLoading } = useSection(sectionId);
  const { data: classData, isLoading: isClassLoading } = useClass(classId);

  const students: unknown[] = [];

  if (isSectionLoading || isClassLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!section || !classData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{t('notFoundTitle')}</h2>
        <p className="text-muted-foreground">{t('notFoundDescription')}</p>
        <Button asChild>
          <Link href={`/dashboard/academics/classes/${classId}`}>{t('backToClass')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link
          href={`/dashboard/academics/classes/${classId}`}
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToClassName', { name: classData.name })}
        </Link>
      </div>

      <PageHeader
        title={section.full_name || `${classData.name} - ${section.name}`}
        description={t('description')}
        actions={
          <div className="flex items-center gap-2">
            <Button className="gap-2" asChild>
              <Link href="/dashboard/enrollments">
                <UserPlus className="h-4 w-4" />
                {t('enrollStudent')}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sectionInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-1 border-b text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> {t('capacity')}
              </span>
              <span className="font-medium">{section.capacity}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> {t('students')}
              </span>
              <span className="font-medium">{section.student_count}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <School className="h-4 w-4" /> {t('room')}
              </span>
              <span className="font-medium">{section.room_number || t('notAvailable')}</span>
            </div>
            <div className="pt-2">
              {section.is_full ? (
                <Badge variant="destructive" className="w-full justify-center">
                  {t('fullCapacity')}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="w-full justify-center bg-success/10 text-success border-success/30"
                >
                  {t('slotsAvailable', { count: section.available_slots })}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t('studentRosterTitle')}</CardTitle>
            <CardDescription>{t('studentRosterDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t('noStudentsTitle')}
                description={t('noStudentsDescription')}
                action={
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/enrollments">{t('goToEnrollments')}</Link>
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('studentName')}</TableHead>
                    <TableHead>{t('idNumber')}</TableHead>
                    <TableHead>{t('gender')}</TableHead>
                    <TableHead className="text-right">{tc('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Student rows will go here in a later phase */}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
