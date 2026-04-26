'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTeacher, useUpdateTeacher } from '@/hooks/use-teachers';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const SPECIALIZATION_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Amharic', 'History', 'Geography', 'Civics', 'Economics',
  'Physical Education', 'Art', 'Music', 'ICT', 'Other'
];

const QUALIFICATION_OPTIONS = ['PhD', 'MSc', 'BSc', 'MA', 'BA', 'Diploma', 'Certificate', 'Other'];

const editTeacherSchema = z.object({
  full_name: z.string().min(2, 'Min 2 characters'),
  phone_number: z.string().regex(/^\+251\d{9}$/, { message: 'Invalid phone format' }).optional().or(z.literal('')),
  address: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  office_location: z.string().optional(),
  status: z.string().optional(),
});

type EditTeacherForm = z.infer<typeof editTeacherSchema>;

function EditTeacherForm() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: teacher, isLoading } = useTeacher(id);
  const updateTeacher = useUpdateTeacher();
  const { isAdmin, isRegistrar } = usePermissions();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
        status: teacher.status || 'active',
      });
      if (teacher.profile_image_url) {
        setPhotoPreview(teacher.profile_image_url);
      }
    }
  }, [teacher, reset]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setValue('profile_image_url' as any, '');
  };

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!teacher) return null;

  const onSubmit = (data: EditTeacherForm) => {
    const payload: any = { ...data };
    if (payload.phone_number === '') {
      delete payload.phone_number;
    }
    updateTeacher.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/dashboard/teachers/${id}`) }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard/teachers" className="hover:text-foreground">
          {t('title')}
        </Link>
        <span>/</span>
        <Link href={`/dashboard/teachers/${id}`} className="hover:text-foreground">
          {teacher.full_name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t('editTeacher')}</span>
      </nav>

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
            {/* Read-only Employee ID */}
            <div className="space-y-2">
              <Label htmlFor="employee_id">{t('employeeId')}</Label>
              <Input id="employee_id" value={teacher.employee_id || '—'} disabled className="h-11 bg-muted" />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>{ts('photo')}</Label>
              <div className="flex items-start gap-4">
                {photoPreview ? (
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{ts('changePhoto')}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
              Editing <strong>{teacher.full_name}</strong> — Email: {teacher.email}
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

            {/* Status field for admin/registrar */}
            {(isAdmin || isRegistrar) && (
              <div className="space-y-2">
                <Label htmlFor="status">{tc('status')}</Label>
                <Select onValueChange={(v) => setValue('status', v)} defaultValue={teacher.status}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('statusActive')}</SelectItem>
                    <SelectItem value="on_leave">{t('statusOnLeave')}</SelectItem>
                    <SelectItem value="suspended">{t('statusSuspended')}</SelectItem>
                    <SelectItem value="resigned">{t('statusResigned')}</SelectItem>
                    <SelectItem value="retired">{t('statusRetired')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <CardTitle className="text-base pt-4">{t('teacherDetails')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qualification">{t('qualification')}</Label>
                <Select onValueChange={(v) => setValue('qualification', v)} defaultValue={teacher.qualification}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={t('selectQualification')} /></SelectTrigger>
                  <SelectContent>
                    {QUALIFICATION_OPTIONS.map((q) => (
                      <SelectItem key={q} value={q}>{t(`qualification${q}` as any) || q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">{t('specialization')}</Label>
                <Select onValueChange={(v) => setValue('specialization', v)} defaultValue={teacher.specialization}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={t('selectSpecialization')} /></SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATION_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{t(`specialization${s.replace(/\s/g, '')}` as any) || s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* User Account Linking Section */}
      {(isAdmin || isRegistrar) && (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('userAccount')}</h3>
            {teacher.user_id ? (
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{teacher.email}</p>
                  <p className="text-sm text-muted-foreground">User ID: {teacher.user_id}</p>
                </div>
                <Button variant="destructive" size="sm" className="gap-2">
                  <X className="h-4 w-4" />
                  {t('unlinkUser')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">{t('noUserLinked')}</p>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  {t('linkUser')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EditTeacherPage() {
  return <ProtectedRoute><EditTeacherForm /></ProtectedRoute>;
}
