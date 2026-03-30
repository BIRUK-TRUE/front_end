'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useCreateStudent } from '@/hooks/use-students';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const studentSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional(),
  admission_date: z.string().min(1, 'Admission date is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  sex: z.enum(['M', 'F'], { message: 'Sex is required' }),
  nationality: z.string().optional(),
  previous_school: z.string().optional(),
  ministry_exam_result: z.coerce.number().min(0).max(100).optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

export default function CreateStudentPage() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const router = useRouter();
  const createStudent = useCreateStudent();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: {
      email: '',
      full_name: '',
      phone_number: '',
      address: '',
      password: '',
      admission_date: '',
      date_of_birth: '',
      sex: 'M',
      nationality: 'Ethiopian',
      previous_school: '',
    },
  });

  const sex = watch('sex');

  const goToStep2 = async () => {
    const valid = await trigger(['email', 'full_name', 'phone_number', 'address']);
    if (valid) setStep(2);
  };

  const onSubmit = (data: StudentForm) => {
    createStudent.mutate(data as any, {
      onSuccess: () => router.push('/dashboard/students'),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('createStudent')}
        actions={
          <Link href="/dashboard/students">
            <Button variant="outline" className="gap-2 min-h-[44px]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {tc('back')}
            </Button>
          </Link>
        }
      />

      {/* Step indicator */}
      <div className="max-w-2xl space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={step >= 1 ? 'font-semibold text-primary' : 'text-muted-foreground'}>
            1. {t('stepUserDetails')}
          </span>
          <span className={step >= 2 ? 'font-semibold text-primary' : 'text-muted-foreground'}>
            2. {t('stepStudentDetails')}
          </span>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-2" />
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {step === 1 && (
              <>
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-muted-foreground text-xs">(auto-generated if empty)</span></Label>
                  <Input id="password" type="password" {...register('password')} className="h-11" />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="button" onClick={goToStep2} className="gap-2 min-h-[44px]">
                    {tc('next')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="admission_date">{t('admissionDate')} *</Label>
                    <Input id="admission_date" type="date" {...register('admission_date')} aria-invalid={!!errors.admission_date} className="h-11" />
                    {errors.admission_date && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.admission_date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">{t('dateOfBirth')} *</Label>
                    <Input id="date_of_birth" type="date" {...register('date_of_birth')} aria-invalid={!!errors.date_of_birth} className="h-11" />
                    {errors.date_of_birth && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.date_of_birth.message}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>{t('sex')} *</Label>
                  <RadioGroup value={sex} onValueChange={(v) => setValue('sex', v as 'M' | 'F', { shouldValidate: true })} className="flex gap-4">
                    <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px] flex-1">
                      <RadioGroupItem value="M" /><span className="text-sm font-medium">{t('male')}</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px] flex-1">
                      <RadioGroupItem value="F" /><span className="text-sm font-medium">{t('female')}</span>
                    </label>
                  </RadioGroup>
                  {errors.sex && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.sex.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t('nationality')}</Label>
                    <Input id="nationality" {...register('nationality')} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previous_school">{t('previousSchool')}</Label>
                    <Input id="previous_school" {...register('previous_school')} className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ministry_exam_result">{t('ministryExamResult')} <span className="text-muted-foreground text-xs">(0–100)</span></Label>
                  <Input id="ministry_exam_result" type="number" min={0} max={100} {...register('ministry_exam_result')} className="h-11" />
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2 min-h-[44px]">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {tc('previous')}
                  </Button>
                  <Button type="submit" className="min-h-[44px]" disabled={createStudent.isPending}>
                    {createStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tc('loading')}</> : tc('save')}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
