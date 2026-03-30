'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useGuardian } from '@/hooks/use-guardians';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge, RoleBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Briefcase, Building, CheckCircle, XCircle, GraduationCap } from 'lucide-react';

export default function GuardianDetailPage() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const { id } = useParams<{ id: string }>();
  const { data: guardian, isLoading } = useGuardian(id);

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!guardian) return null;

  const initials = guardian.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('guardianDetails')}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/guardians"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>
            <Link href={`/dashboard/guardians/${id}/edit`}><Button className="gap-2 min-h-[44px]"><Pencil className="h-4 w-4" />{tc('edit')}</Button></Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4"><AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback></Avatar>
            <h2 className="text-xl font-semibold">{guardian.full_name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{guardian.email}</p>
            <div className="mt-3"><StatusBadge status={guardian.is_active ? 'active' : 'inactive'} label={guardian.is_active ? tc('active') : tc('inactive')} /></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{tc('details')}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={Mail} label={tc('email')} value={guardian.email} />
              <InfoRow icon={Phone} label={tc('phone')} value={guardian.phone_number || '—'} />
              <InfoRow icon={MapPin} label={tc('address')} value={guardian.address || '—'} />
              <InfoRow icon={Briefcase} label={t('occupation')} value={guardian.occupation || '—'} />
              <InfoRow icon={Building} label={t('workplace')} value={guardian.workplace || '—'} />
            </div>
          </CardContent>
        </Card>

        {/* Linked Students */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>{t('linkedStudents')}</CardTitle></CardHeader>
          <CardContent>
            {!guardian.student_links?.length ? (
              <p className="text-sm text-muted-foreground">{t('noLinkedStudents')}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {guardian.student_links.map((link: any) => (
                  <Link key={link.student_id} href={`/dashboard/students/${link.student_id}`}>
                    <div className="rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                        <p className="font-medium">{link.student_name}</p>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">{link.student_registration_number}</p>
                      <p className="text-sm text-muted-foreground capitalize">{t(link.relationship_type as any) || link.relationship_type}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {link.is_primary && <Badge variant="outline" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />{t('isPrimary')}</Badge>}
                        {link.is_emergency_contact && <Badge variant="outline" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />{t('isEmergencyContact')}</Badge>}
                        {link.can_pickup && <Badge variant="outline" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />{t('canPickup')}</Badge>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
