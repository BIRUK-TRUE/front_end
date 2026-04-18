'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTeacher, useUpdateTeacher } from '@/hooks/use-teachers';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const editTeacherSchema = z.object({
  full_name: z.string().min(2, 'Min 2 characters'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  office_location: z.string().optional(),
});

type EditTeacherForm = z.infer<typeof editTeacherSchema>;

export default function EditTeacherPage() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: teacher, isLoading } = useTeacher(id);
  const updateTeacher = useUpdateTeacher();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditTeacherForm>({
    resolver: zodResolver(editTeacherSchema) as any,
  });

  useEffect(() => {
    if (teacher) {
      reset({
        full_name: teacher.full_name || '',
        phone_number: teacher.phone_number || '',
        address: teacher.address || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        emergency_contact_name: teacher.emergency_contact_name || '',
        emergency_contact_phone: teacher.emergency_contact_phone || '',
        office_location: teacher.office_location || '',
      });
    }
  }, [teacher, reset]);

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!teacher) return null;

  const onSubmit = (data: EditTeacherForm) => {
    updateTeacher.mutate(
      { id, data },
      { onSuccess: () => router.push(`/dashboard/teachers/${id}`) }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('editTeacher')}
        actions={
          <Link href={`/dashboard/teachers/${id}`}>
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
              Editing <strong>{teacher.full_name}</strong> — Email: {teacher.email}
            </div>

            <CardTitle className="text-base">Personal Details</CardTitle>
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

            <CardTitle className="text-base pt-4">{t('teacherDetails')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qualification">{t('qualification')}</Label>
                <Input id="qualification" {...register('qualification')} className="h-11" placeholder="e.g., BSc, MEd" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">{t('specialization')}</Label>
                <Input id="specialization" {...register('specialization')} className="h-11" placeholder="e.g., Math, Science" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="office_location">{t('officeLocation')}</Label>
              <Input id="office_location" {...register('office_location')} className="h-11" />
            </div>

            <CardTitle className="text-base pt-4">Emergency Contact</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">{t('emergencyContactName')}</Label>
                <Input id="emergency_contact_name" {...register('emergency_contact_name')} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">{t('emergencyContactPhone')}</Label>
                <Input id="emergency_contact_phone" {...register('emergency_contact_phone')} className="h-11" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="min-h-[44px]" disabled={updateTeacher.isPending || !isDirty}>
                {updateTeacher.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tc('loading')}</> : tc('save')}
              </Button>
              <Link href={`/dashboard/teachers/${id}`}>
                <Button variant="outline" type="button" className="min-h-[44px]">{tc('cancel')}</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
