'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useGuardian, useUpdateGuardian } from '@/hooks/use-guardians';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const editGuardianSchema = z.object({
  full_name: z.string().min(2, 'Min 2 characters'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  workplace: z.string().optional(),
});

type EditGuardianForm = z.infer<typeof editGuardianSchema>;

export default function EditGuardianPage() {
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
    updateGuardian.mutate(
      { id, data },
      { onSuccess: () => router.push(`/dashboard/guardians/${id}`) }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
                <Input id="phone_number" {...register('phone_number')} className="h-11" />
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
    </div>
  );
}
