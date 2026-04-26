'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useGuardian, useUpdateGuardian } from '@/hooks/use-guardians';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';

const editGuardianSchema = z.object({
  full_name: z.string().min(2, 'Min 2 characters'),
  phone_number: z.string().regex(/^\+251\d{9}$/, { message: 'Invalid phone format' }).optional().or(z.literal('')),
  address: z.string().optional(),
  occupation: z.string().optional(),
  workplace: z.string().optional(),
});

type EditGuardianForm = z.infer<typeof editGuardianSchema>;

function EditGuardianForm() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: guardian, isLoading } = useGuardian(id);
  const updateGuardian = useUpdateGuardian();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditGuardianForm>({
    resolver: zodResolver(editGuardianSchema) as any,
  });

  useEffect(() => {
    if (guardian) {
      reset({
        full_name: guardian.full_name || '',
        phone_number: guardian.phone_number || '',
        address: guardian.address || '',
        occupation: guardian.occupation || '',
        workplace: guardian.workplace || '',
      });
    }
  }, [guardian, reset]);

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!guardian) return null;

  const onSubmit = (data: EditGuardianForm) => {
    const payload: any = { ...data };
    if (payload.phone_number === '') {
      delete payload.phone_number;
    }
    updateGuardian.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/dashboard/guardians/${id}`) }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard/guardians" className="hover:text-foreground">
          {t('title')}
        </Link>
        <span>/</span>
        <Link href={`/dashboard/guardians/${id}`} className="hover:text-foreground">
          {guardian.full_name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t('editGuardian')}</span>
      </nav>

      <PageHeader
        title={t('editGuardian')}
        actions={
          <Link href={`/dashboard/guardians/${id}`}>
            <Button variant="outline" className="gap-2 min-h-[44px]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {tc('back')}
            </Button>
          </Link>
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
              Editing <strong>{guardian.full_name}</strong> — Email: {guardian.email}
            </div>

            <CardTitle className="text-base">{t('personalDetails')}</CardTitle>
            <div className="space-y-2">
              <Label htmlFor="full_name">{tc('name')} *</Label>
              <Input id="full_name" {...register('full_name')} aria-invalid={!!errors.full_name} className="h-11" />
              {errors.full_name && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.full_name.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">{tc('phone')}</Label>
                <Input id="phone_number" placeholder="+2519XXXXXXXX" {...register('phone_number')} aria-invalid={!!errors.phone_number} className="h-11" />
                {errors.phone_number && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.phone_number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{tc('address')}</Label>
                <Input id="address" {...register('address')} className="h-11" />
              </div>
            </div>

            <CardTitle className="text-base pt-4">{t('guardianDetails')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occupation">{t('occupation')}</Label>
                <Input id="occupation" {...register('occupation')} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workplace">{t('workplace')}</Label>
                <Input id="workplace" {...register('workplace')} className="h-11" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="min-h-[44px]" disabled={updateGuardian.isPending || !isDirty}>
                {updateGuardian.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tc('loading')}</> : tc('save')}
              </Button>
              <Link href={`/dashboard/guardians/${id}`}>
                <Button variant="outline" type="button" className="min-h-[44px]">{tc('cancel')}</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Linked Students (Read-only) */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('linkedStudentsReadOnly')}</CardTitle>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditGuardianPage() {
  return <ProtectedRoute><EditGuardianForm /></ProtectedRoute>;
}
