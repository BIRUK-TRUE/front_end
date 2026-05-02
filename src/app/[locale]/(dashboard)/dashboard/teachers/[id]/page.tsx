'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTeacher, useDeleteTeacher, useRestoreTeacher } from '@/hooks/use-teachers';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, AlertTriangle, Building, User, CalendarDays, Trash2, RotateCcw } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimetableGrid } from '@/features/schedule/components/TimetableGrid';
import { useTeacherSchedule } from '@/features/schedule/api/useSchedule';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useTerms } from '@/features/academics/api/useTerms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { useState } from 'react';

function TeacherDetailPage() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const ts = useTranslations('students');
  const { id } = useParams<{ id: string }>();
  const { data: teacher, isLoading } = useTeacher(id);
  const { canManageTeachers, canDeleteTeacher, canRestoreTeacher } = usePermissions();
  const deleteTeacher = useDeleteTeacher();
  const restoreTeacher = useRestoreTeacher();
  const [yearId, setYearId] = useState<string>('');
  const [termId, setTermId] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: years } = useAcademicYears(1, 50);
  const { data: terms } = useTerms(yearId);
  const { data: scheduleData, isLoading: isLoadingSchedule } = useTeacherSchedule(id, termId);

  const handleDelete = () => {
    if (deleteId) {
      deleteTeacher.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!teacher) return null;

  const initials = teacher.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const yearsOfService = teacher.hire_date ? differenceInYears(new Date(), new Date(teacher.hire_date)) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard/teachers" className="hover:text-foreground">
          {t('title')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{teacher.full_name}</span>
      </nav>

      <PageHeader
        title={t('teacherDetails')}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/teachers"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>
            {canManageTeachers && (
              <Link href={`/dashboard/teachers/${id}/edit`}><Button className="gap-2 min-h-[44px]"><Pencil className="h-4 w-4" />{tc('edit')}</Button></Link>
            )}
            {!teacher.is_active && canRestoreTeacher && (
              <Button
                variant="outline"
                onClick={() => restoreTeacher.mutate(id)}
                className="gap-2 min-h-[44px]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {tc('restore')}
              </Button>
            )}
            {canDeleteTeacher && teacher.is_active && (
              <Button
                variant="destructive"
                onClick={() => setDeleteId(id)}
                className="gap-2 min-h-[44px]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {tc('delete')}
              </Button>
            )}
          </div>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{tc('profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">{t('currentClasses')}</span>
          </TabsTrigger>
          <TabsTrigger value="timetable" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">{t('schedule')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 outline-none">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="p-6 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4"><AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback></Avatar>
                <h2 className="text-xl font-semibold">{teacher.full_name}</h2>
                <p className="text-sm font-mono text-muted-foreground mt-1">{teacher.employee_id || '—'}</p>
                <div className="mt-3"><StatusBadge status={teacher.status || 'active'} /></div>
                <p className="text-sm text-muted-foreground mt-2">{t('specialization')}: {teacher.specialization || '—'}</p>
                <p className="text-sm text-muted-foreground">{t('qualification')}: {teacher.qualification || '—'}</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{tc('details')}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={Mail} label={tc('email')} value={teacher.email} />
                  <InfoRow icon={Phone} label={tc('phone')} value={teacher.phone_number || '—'} />
                  <InfoRow icon={MapPin} label={tc('address')} value={teacher.address || '—'} />
                  <InfoRow icon={Calendar} label={t('hireDate')} value={teacher.hire_date ? format(new Date(teacher.hire_date), 'MMM d, yyyy') : '—'} />
                  <InfoRow icon={Calendar} label={t('yearsOfService')} value={yearsOfService > 0 ? `${yearsOfService} years` : '—'} />
                  <InfoRow icon={Calendar} label={ts('dateOfBirth')} value={teacher.date_of_birth ? format(new Date(teacher.date_of_birth), 'MMM d, yyyy') : '—'} />
                  <InfoRow icon={GraduationCap} label={t('qualification')} value={teacher.qualification || '—'} />
                  <InfoRow icon={Briefcase} label={t('specialization')} value={teacher.specialization || '—'} />
                  <InfoRow icon={Building} label={t('officeLocation')} value={teacher.office_location || '—'} />
                </div>
              </CardContent>
            </Card>

            {(teacher.emergency_contact_name || teacher.emergency_contact_phone) && (
              <Card className="lg:col-span-3">
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Emergency Contact</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow icon={Phone} label={t('emergencyContactName')} value={teacher.emergency_contact_name || '—'} />
                    <InfoRow icon={Phone} label={t('emergencyContactPhone')} value={teacher.emergency_contact_phone || '—'} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>{t('currentClasses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Briefcase}
                title={t('noTeachers')}
                description={t('noClassesAssigned')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-6 outline-none">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>{t('schedule')}</CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={yearId} onValueChange={(v) => { setYearId(v); setTermId(''); }}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder={tc('selectAcademicYear')} />
                  </SelectTrigger>
                  <SelectContent>
                    {years?.items?.map((y: { id: string; name: string }) => (
                      <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={termId} onValueChange={setTermId} disabled={!yearId}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder={tc('selectTerm')} />
                  </SelectTrigger>
                  <SelectContent>
                    {terms?.items?.map((t: { id: string; name: string }) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!termId ? (
                <EmptyState
                  icon={CalendarDays}
                  title={t('selectAcademicTerm')}
                  description={t('selectTermDescription')}
                />
              ) : (
                <TimetableGrid entries={scheduleData || []} isLoading={isLoadingSchedule} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteTeacher.isPending}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>
    </div>
  );
}

export default function TeacherDetailPageWrapper() {
  return <ProtectedRoute><TeacherDetailPage /></ProtectedRoute>;
}
