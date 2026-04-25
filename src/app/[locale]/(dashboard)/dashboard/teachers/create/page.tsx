'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import { useCreateTeacher } from '@/hooks/use-teachers';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function CreateTeacherPage() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const ts = useTranslations('students');
  const tv = useTranslations('validation');
  const router = useRouter();
  const createTeacher = useCreateTeacher();

  const teacherSchema = z.object({
    email: z.string().min(1, tv('required')).email(tv('invalidEmail')),
    full_name: z.string().min(2, tv('nameMinLength')),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    password: z.string().optional(),
    hire_date: z.string().min(1, tv('required')),
    date_of_birth: z.string().min(1, tv('required')),
    sex: z.enum(['M', 'F'], { message: tv('required') }),
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    office_location: z.string().optional(),
  });

  type TeacherForm = z.infer<typeof teacherSchema>;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
  });

  const sex = watch('sex');

  const onSubmit = (data: TeacherForm) => {
    createTeacher.mutate(data, { onSuccess: () => router.push('/dashboard/teachers') });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t('createTeacher')} actions={<Link href="/dashboard/teachers"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>} />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
              <div className="space-y-2"><Label htmlFor="phone_number">{tc('phone')}</Label><Input id="phone_number" {...register('phone_number')} className="h-11" /></div>
              <div className="space-y-2"><Label htmlFor="address">{tc('address')}</Label><Input id="address" {...register('address')} className="h-11" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(auto-generated if empty)</span></Label><Input id="password" type="password" {...register('password')} className="h-11" /></div>

            {/* Teacher details */}
            <CardTitle className="text-base pt-4">{t('teacherDetails')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hire_date">{t('hireDate')} *</Label>
                <Input id="hire_date" type="date" {...register('hire_date')} className="h-11" />
                {errors.hire_date && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.hire_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">{ts('dateOfBirth')} *</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} className="h-11" />
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
              <div className="space-y-2"><Label htmlFor="qualification">{t('qualification')}</Label><Input id="qualification" {...register('qualification')} className="h-11" placeholder={t('qualificationPlaceholder')} /></div>
              <div className="space-y-2"><Label htmlFor="specialization">{t('specialization')}</Label><Input id="specialization" {...register('specialization')} className="h-11" placeholder={t('specializationPlaceholder')} /></div>
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
