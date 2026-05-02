'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useSection, useClass } from '@/features/academics/api/useClasses';
import { useSectionStudents } from '@/features/academics/api/useSectionStudents';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Table,
  TableBody,
  TableCell,
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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: section, isLoading: isSectionLoading } = useSection(sectionId);
  const { data: classData, isLoading: isClassLoading } = useClass(classId);
  const { data: studentsResponse, isLoading: isStudentsLoading } = useSectionStudents(sectionId);
  const students = studentsResponse?.items ?? [];

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = students.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isSectionLoading || isClassLoading || isStudentsLoading) {
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
              <div className="space-y-0">
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
                    {paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.registration_number}</TableCell>
                        <TableCell>{student.gender || t('notAvailable')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/students/${student.id}`}>
                              {tc('view')}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      {t('showing', { start: startIndex + 1, end: Math.min(startIndex + ITEMS_PER_PAGE, students.length), total: students.length })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
