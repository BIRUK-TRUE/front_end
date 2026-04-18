'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useStudent, useUpdateStudent } from '@/hooks/use-students';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const editStudentSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  previous_school: z.string().optional(),
  ministry_exam_result: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  status: z.string().optional(),
  is_active: z.boolean().optional(),
});

type EditStudentForm = z.infer<typeof editStudentSchema>;

export default function EditStudentPage() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id);
  const updateStudent = useUpdateStudent();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditStudentForm>({
    resolver: zodResolver(editStudentSchema) as any,
  });

  useEffect(() => {
    if (student) {
      reset({
        full_name: student.full_name || '',
        phone_number: student.phone_number || '',
        address: student.address || '',
        nationality: student.nationality || '',
        previous_school: student.previous_school || '',
        ministry_exam_result: student.ministry_exam_result ?? '',
        status: student.status || 'active',
        is_active: student.is_active ?? true,
      });
    }
  }, [student, reset]);

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!student) return null;

  const onSubmit = (data: EditStudentForm) => {
    const payload: any = { ...data };
    if (payload.ministry_exam_result === '' || payload.ministry_exam_result === undefined) {
      delete payload.ministry_exam_result;
    }
    updateStudent.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/dashboard/students/${id}`) }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('editStudent')}
        actions={
          <Link href={`/dashboard/students/${id}`}>
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
            1. {t('personalInfo')}
          </span>
          <span className={step >= 2 ? 'font-semibold text-primary' : 'text-muted-foreground'}>
            2. {t('academicInfo')}
          </span>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-2" />
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {step === 1 && (
              <>
                <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
                  Editing <strong>{student.full_name}</strong> — Email: {student.email}
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
                <div className="flex justify-end pt-2">
                  <Button type="button" onClick={() => setStep(2)} className="gap-2 min-h-[44px]">
                    {tc('next')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
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
                  <Button type="submit" className="min-h-[44px]" disabled={updateStudent.isPending || !isDirty}>
                    {updateStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tc('loading')}</> : tc('save')}
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
