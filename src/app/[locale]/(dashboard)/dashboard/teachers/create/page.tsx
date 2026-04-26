'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useCreateTeacher } from '@/hooks/use-teachers';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const SPECIALIZATION_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Amharic', 'History', 'Geography', 'Civics', 'Economics',
  'Physical Education', 'Art', 'Music', 'ICT', 'Other'
];

const QUALIFICATION_OPTIONS = ['PhD', 'MSc', 'BSc', 'MA', 'BA', 'Diploma', 'Certificate', 'Other'];

function CreateTeacherForm() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const ts = useTranslations('students');
  const tv = useTranslations('validation');
  const router = useRouter();
  const createTeacher = useCreateTeacher();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const teacherSchema = z.object({
    email: z.string().min(1, tv('required')).email(tv('invalidEmail')),
    full_name: z.string().min(2, tv('nameMinLength')),
    phone_number: z.string().regex(/^\+251\d{9}$/, { message: t('phoneInvalid') }),
    address: z.string().optional(),
    password: z.string().optional(),
    hire_date: z.string().refine((val) => {
      const date = new Date(val);
      const now = new Date();
      return date <= now;
    }, { message: t('hireDateInvalid') }),
    date_of_birth: z.string().min(1, tv('required')),
    sex: z.enum(['M', 'F'], { message: tv('required') }),
    qualification: z.string().min(1, t('qualificationRequired')),
    specialization: z.string().min(1, t('specializationRequired')),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    office_location: z.string().optional(),
  });

  type TeacherForm = z.infer<typeof teacherSchema>;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema) as any,
  });

  const sex = watch('sex');

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

  const onSubmit = (data: TeacherForm) => {
    createTeacher.mutate(data as any, { onSuccess: (result) => router.push(`/dashboard/teachers/${result.id}`) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t('createTeacher')} actions={<Link href="/dashboard/teachers"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>} />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                  <p className="text-xs text-muted-foreground mt-1">{ts('uploadPhoto')}</p>
                </div>
              </div>
            </div>

            {/* User details */}
            <CardTitle className="text-base">{t('userDetails')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">{tc('email')} *</Label>
                <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} className="h-11" />
                {errors.email && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">{tc('name')} *</Label>
                <Input id="full_name" {...register('full_name')} aria-invalid={!!errors.full_name} className="h-11" />
                {errors.full_name && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.full_name.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">{tc('phone')} *</Label>
                <Input id="phone_number" placeholder="+2519XXXXXXXX" {...register('phone_number')} aria-invalid={!!errors.phone_number} className="h-11" />
                {errors.phone_number && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.phone_number.message}</p>}
              </div>
              <div className="space-y-2"><Label htmlFor="address">{tc('address')}</Label><Input id="address" {...register('address')} className="h-11" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(auto-generated if empty)</span></Label><Input id="password" type="password" {...register('password')} className="h-11" /></div>

            {/* Teacher details */}
            <CardTitle className="text-base pt-4">{t('teacherDetails')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hire_date">{t('hireDate')} *</Label>
                <Input id="hire_date" type="date" {...register('hire_date')} aria-invalid={!!errors.hire_date} className="h-11" />
                {errors.hire_date && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.hire_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">{ts('dateOfBirth')} *</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} aria-invalid={!!errors.date_of_birth} className="h-11" />
                {errors.date_of_birth && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.date_of_birth.message}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <Label>{ts('sex')} *</Label>
              <RadioGroup value={sex} onValueChange={(v) => setValue('sex', v as 'M' | 'F', { shouldValidate: true })} className="flex gap-4">
                <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px] flex-1"><RadioGroupItem value="M" /><span className="text-sm font-medium">{ts('male')}</span></label>
                <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px] flex-1"><RadioGroupItem value="F" /><span className="text-sm font-medium">{ts('female')}</span></label>
              </RadioGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qualification">{t('qualification')} *</Label>
                <Select onValueChange={(v) => setValue('qualification', v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={t('selectQualification')} /></SelectTrigger>
                  <SelectContent>
                    {QUALIFICATION_OPTIONS.map((q) => (
                      <SelectItem key={q} value={q}>{t(`qualification${q}` as any) || q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.qualification && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.qualification.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">{t('specialization')} *</Label>
                <Select onValueChange={(v) => setValue('specialization', v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={t('selectSpecialization')} /></SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATION_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{t(`specialization${s.replace(/\s/g, '')}` as any) || s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialization && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.specialization.message}</p>}
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="office_location">{t('officeLocation')}</Label><Input id="office_location" {...register('office_location')} className="h-11" /></div>

            <CardTitle className="text-base pt-4">Emergency Contact</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="emergency_contact_name">{t('emergencyContactName')}</Label><Input id="emergency_contact_name" {...register('emergency_contact_name')} className="h-11" /></div>
              <div className="space-y-2"><Label htmlFor="emergency_contact_phone">{t('emergencyContactPhone')}</Label><Input id="emergency_contact_phone" {...register('emergency_contact_phone')} className="h-11" /></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="min-h-[44px]" disabled={createTeacher.isPending}>
                {createTeacher.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tc('loading')}</> : tc('save')}
              </Button>
              <Link href="/dashboard/teachers"><Button variant="outline" type="button" className="min-h-[44px]">{tc('cancel')}</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateTeacherPage() {
  return <ProtectedRoute requireRoles={['admin', 'registrar']}><CreateTeacherForm /></ProtectedRoute>;
}
