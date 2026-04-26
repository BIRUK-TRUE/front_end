'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useGuardian, useDeleteGuardian, useLinkStudent, useUnlinkStudent } from '@/hooks/use-guardians';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Briefcase, Building, CheckCircle, GraduationCap, Star, Trash2, UserPlus, Search } from 'lucide-react';
import { useStudents } from '@/hooks/use-students';

function GuardianDetailPage() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const { id } = useParams<{ id: string }>();
  const { data: guardian, isLoading } = useGuardian(id);
  const { canManageGuardians, canDeleteGuardian } = usePermissions();
  const deleteGuardian = useDeleteGuardian();
  const linkStudent = useLinkStudent();
  const unlinkStudent = useUnlinkStudent();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unlinkId, setUnlinkId] = useState<string | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { data: students } = useStudents({ search: searchTerm, size: 20 });

  const handleDelete = () => {
    if (deleteId) {
      deleteGuardian.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        }
      });
    }
  };

  const handleUnlink = () => {
    if (unlinkId) {
      unlinkStudent.mutate(
        { guardianId: id, studentId: unlinkId },
        { onSuccess: () => setUnlinkId(null) }
      );
    }
  };

  const handleLinkStudent = () => {
    if (selectedStudentId) {
      linkStudent.mutate(
        {
          guardianId: id,
          payload: {
            student_id: selectedStudentId,
            relationship_type: 'guardian' as any,
          }
        },
        { onSuccess: () => {
          setIsLinkModalOpen(false);
          setSelectedStudentId(null);
          setSearchTerm('');
        } }
      );
    }
  };

  const getRelationshipBadgeColor = (relationship: string) => {
    if (relationship === 'father' || relationship === 'mother') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (relationship === 'grandparent') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (relationship === 'legal_guardian') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!guardian) return null;

  const initials = guardian.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const linkedStudentCount = guardian.student_links?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard/guardians" className="hover:text-foreground">
          {t('title')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{guardian.full_name}</span>
      </nav>

      <PageHeader
        title={t('guardianDetails')}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/guardians"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>
            {canManageGuardians && (
              <Link href={`/dashboard/guardians/${id}/edit`}><Button className="gap-2 min-h-[44px]"><Pencil className="h-4 w-4" />{tc('edit')}</Button></Link>
            )}
            {canDeleteGuardian && (
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4"><AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback></Avatar>
            <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
              {guardian.full_name}
              {guardian.is_primary && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{guardian.email}</p>
            <div className="mt-3">
              <Badge className={getRelationshipBadgeColor(guardian.relationship_type || 'other')}>
                {t(guardian.relationship_type as any) || guardian.relationship_type}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
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
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>{t('linkedStudents')}</CardTitle>
            {canManageGuardians && (
              <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 min-h-[44px]"><UserPlus className="h-4 w-4" />{t('linkStudent')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('linkStudentModal')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t('searchStudent')}</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder={t('searchStudent')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 h-11 mt-2"
                        />
                      </div>
                    </div>

                    {students?.items && students.items.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                        {students.items.map((student: any) => (
                          <div
                            key={student.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                              selectedStudentId === student.id ? 'bg-accent' : 'hover:bg-accent'
                            }`}
                            onClick={() => setSelectedStudentId(student.id)}
                          >
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground">{student.registration_number || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchTerm && students?.items?.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">{t('noStudentsFound')}</p>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleLinkStudent}
                        disabled={!selectedStudentId || linkStudent.isPending}
                        className="flex-1"
                      >
                        {linkStudent.isPending ? tc('loading') : tc('link')}
                      </Button>
                      <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                        {tc('cancel')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {!guardian.student_links?.length ? (
              <p className="text-sm text-muted-foreground">{t('noLinkedStudents')}</p>
            ) : (
              <div className="space-y-2">
                {guardian.student_links.map((link: any) => (
                  <div key={link.student_id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="font-medium">{link.student_name}</p>
                      <p className="text-sm text-muted-foreground">{link.student_registration_number}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{t(link.relationship_type as any) || link.relationship_type}</Badge>
                    {canManageGuardians && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUnlinkId(link.student_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteGuardian.isPending}
        message={linkedStudentCount > 0 ? t('deleteWarning').replace('{count}', linkedStudentCount.toString()) : undefined}
      />

      {/* Unlink confirmation */}
      <ConfirmDialog
        open={!!unlinkId}
        onOpenChange={(open) => !open && setUnlinkId(null)}
        onConfirm={handleUnlink}
        isLoading={unlinkStudent.isPending}
        message={t('unlinkConfirm')}
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

export default function GuardianDetailPageWrapper() {
  return <ProtectedRoute><GuardianDetailPage /></ProtectedRoute>;
}
