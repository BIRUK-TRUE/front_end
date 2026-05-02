'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useCreateStudent } from '@/hooks/use-students';
import { useGuardians } from '@/hooks/use-guardians';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

function CreateStudentForm() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');
  const router = useRouter();
  const createStudent = useCreateStudent();
  const { data: guardians } = useGuardians();
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const studentSchema = z.object({
    email: z.string().min(1, tv('emailRequired')).email(tv('invalidEmail')),
    full_name: z.string().min(2, tv('nameMinLength')),
    phone_number: z.string().optional().refine((val) => !val || /^\+251\d{9}$/.test(val), { message: t('phoneInvalid') }),
    address: z.string().optional(),
    password: z.string().optional(),
    admission_date: z.string().min(1, tv('admissionDateRequired')),
    date_of_birth: z.string().refine((val) => {
      if (!val) return false;
      const date = new Date(val);
      const now = new Date();
      const minAge = new Date(now.getFullYear() - 60, now.getMonth(), now.getDate());
      const maxAge = new Date(now.getFullYear() - 4, now.getMonth(), now.getDate());
      return date >= minAge && date <= maxAge;
    }, { message: t('dateOfBirthInvalid') }),
    sex: z.enum(['M', 'F'], { message: tv('sexRequired') }),
    nationality: z.string().optional(),
    previous_school: z.string().optional(),
    ministry_exam_result: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().min(0).max(100).optional()),
    guardian_id: z.string().optional(),
    relationship_type: z.string().optional(),
    profile_image_url: z.string().optional(),
  });

  type StudentForm = z.infer<typeof studentSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setValue('profile_image_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setValue('profile_image_url' as any, '');
  };

  const goToStep2 = async () => {
    const valid = await trigger(['email', 'full_name', 'phone_number', 'address']);
    if (valid) setStep(2);
  };

  const onSubmit = (data: StudentForm) => {
    createStudent.mutate(data as any, {
      onSuccess: (result) => router.push(`/dashboard/students/${result.id}`),
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
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>{t('photo')}</Label>
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
                      <p className="text-xs text-muted-foreground mt-1">{t('uploadPhoto')}</p>
                    </div>
                  </div>
                </div>

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
                    <Input id="phone_number" placeholder="+2519XXXXXXXX" {...register('phone_number')} aria-invalid={!!errors.phone_number} className="h-11" />
                    {errors.phone_number && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.phone_number.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{tc('address')}</Label>
                    <Input id="address" {...register('address')} className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_id">{t('guardian')} ({tc('optional')})</Label>
                  <Select onValueChange={(v) => setValue('guardian_id', v === 'none' ? undefined : v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t('selectGuardian')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{tc('none')}</SelectItem>
                      {guardians?.items?.map((g: { id: string; full_name: string; email: string }) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.full_name} <span className="text-muted-foreground text-xs ml-1">({g.email})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship_type">{t('relationshipType')} ({tc('optional')})</Label>
                  <Select onValueChange={(v) => setValue('relationship_type', v === 'none' ? undefined : v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t('selectRelationship')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{tc('none')}</SelectItem>
                      <SelectItem value="father">{t('father')}</SelectItem>
                      <SelectItem value="mother">{t('mother')}</SelectItem>
                      <SelectItem value="guardian">{t('guardian')}</SelectItem>
                      <SelectItem value="uncle">{t('uncle')}</SelectItem>
                      <SelectItem value="aunt">{t('aunt')}</SelectItem>
                      <SelectItem value="grandparent">{t('grandparent')}</SelectItem>
                      <SelectItem value="sibling">{t('sibling')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
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

export default function CreateStudentPage() {
  return (
    <ProtectedRoute requireRoles={['admin', 'registrar']}>
      <CreateStudentForm />
    </ProtectedRoute>
  );
}
