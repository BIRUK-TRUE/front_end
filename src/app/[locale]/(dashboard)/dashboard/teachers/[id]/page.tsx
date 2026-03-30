'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTeacher } from '@/hooks/use-teachers';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, AlertTriangle, Building } from 'lucide-react';
import { format } from 'date-fns';

export default function TeacherDetailPage() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const ts = useTranslations('students');
  const { id } = useParams<{ id: string }>();
  const { data: teacher, isLoading } = useTeacher(id);

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!teacher) return null;

  const initials = teacher.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('teacherDetails')}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/teachers"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>
            <Link href={`/dashboard/teachers/${id}/edit`}><Button className="gap-2 min-h-[44px]"><Pencil className="h-4 w-4" />{tc('edit')}</Button></Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4"><AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback></Avatar>
            <h2 className="text-xl font-semibold">{teacher.full_name}</h2>
            <p className="text-sm font-mono text-muted-foreground mt-1">{teacher.employee_id || '—'}</p>
            <div className="mt-3"><StatusBadge status={teacher.status || 'active'} /></div>
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
