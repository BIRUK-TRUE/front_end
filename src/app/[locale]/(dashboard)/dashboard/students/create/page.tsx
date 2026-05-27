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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Upload,
  X,
  User,
  GraduationCap,
  Users,
  Search,
  Plus,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// ─── Schema ──────────────────────────────────────────────────────────────────

const studentSchema = z.object({
  // Step 1 – Basic info
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Optional field
      // Remove spaces, dashes, parentheses for validation
      const cleaned = val.replace(/[\s\-\(\)]/g, '');
      // Allow + for country code, then 9-15 digits
      return /^\+?\d{9,15}$/.test(cleaned);
    }, { message: 'Invalid phone number format. Use format like: +251912345678 or 0912345678' }),
  address: z.string().optional(),
  password: z.string().optional(),

  // Step 2 – Academic details
  admission_date: z.string().min(1, 'Admission date is required'),
  date_of_birth: z
    .string()
    .refine(
      (val) => {
        if (!val) return false;
        const date = new Date(val);
        const now = new Date();
        const minAge = new Date(now.getFullYear() - 60, now.getMonth(), now.getDate());
        const maxAge = new Date(now.getFullYear() - 4, now.getMonth(), now.getDate());
        return date >= minAge && date <= maxAge;
      },
      { message: 'Date of birth must be between 4 and 60 years ago' }
    ),
  sex: z.enum(['M', 'F'], { message: 'Please select a gender' }),
  nationality: z.string().optional(),
  previous_school: z.string().optional(),
  ministry_exam_result: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.coerce.number().min(0).max(100).optional()
  ),

  // Step 3 – Guardian
  guardian_id: z.string().optional(),
  relationship_type: z.string().optional(),
  profile_image_url: z.string().optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Academic Details', icon: GraduationCap },
  { id: 3, label: 'Parent / Guardian', icon: Users },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = current > step.id;
          const active = current === step.id;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all',
                    done
                      ? 'bg-primary border-primary text-primary-foreground'
                      : active
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-muted-foreground/30 text-muted-foreground bg-muted/30'
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    active ? 'text-primary' : done ? 'text-primary/70' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mb-5 transition-all',
                    current > step.id ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function CreateStudentForm() {
  const router = useRouter();
  const createStudent = useCreateStudent();
  const { data: guardiansData } = useGuardians();
  const guardians = guardiansData?.items ?? [];

  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [guardianSearch, setGuardianSearch] = useState('');
  const [guardianMode, setGuardianMode] = useState<'search' | 'skip'>('search');

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
      admission_date: new Date().toISOString().split('T')[0],
      date_of_birth: '',
      sex: 'M',
      nationality: 'Ethiopian',
      previous_school: '',
    },
  });

  const sex = watch('sex');
  const guardianId = watch('guardian_id');

  // ── Photo upload ──
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue('profile_image_url', result);
    };
    reader.readAsDataURL(file);
  };

  // ── Navigation ──
  const goNext = async () => {
    const fieldsPerStep: Record<number, (keyof StudentForm)[]> = {
      1: ['email', 'full_name', 'phone_number'],
      2: ['admission_date', 'date_of_birth', 'sex'],
    };
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  // ── Submit ──
  const onSubmit = (data: StudentForm) => {
    // Clean up the data - convert empty strings to undefined for optional fields
    const payload = {
      ...data,
      phone_number: data.phone_number?.trim() || undefined,
      address: data.address?.trim() || undefined,
      password: data.password?.trim() || undefined,
      nationality: data.nationality?.trim() || undefined,
      previous_school: data.previous_school?.trim() || undefined,
      guardian_id: data.guardian_id || undefined,
      relationship_type: data.relationship_type?.trim() || undefined,
      profile_image_url: data.profile_image_url?.trim() || undefined,
    };
    
    console.log('Submitting student data:', payload);
    
    createStudent.mutate(payload as any, {
      onSuccess: (result) => router.push(`/dashboard/students/${result.id}`),
      onError: (error: any) => {
        console.error('Student creation error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
      }
    });
  };

  // ── Guardian search filter ──
  const filteredGuardians = guardians.filter(
    (g: any) =>
      g.full_name.toLowerCase().includes(guardianSearch.toLowerCase()) ||
      g.email.toLowerCase().includes(guardianSearch.toLowerCase())
  );

  const selectedGuardian = guardians.find((g: any) => g.id === guardianId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Register New Student"
        description="Fill in the student's details across 3 simple steps."
        actions={
          <Link href="/dashboard/students">
            <Button variant="outline" className="gap-2 min-h-[44px]">
              <ArrowLeft className="h-4 w-4" />
              Back to Students
            </Button>
          </Link>
        }
      />

      <StepIndicator current={step} />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <>
                <div className="space-y-1 mb-4">
                  <h2 className="text-base font-semibold">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Basic contact details for the student's account.
                  </p>
                </div>

                {/* Photo */}
                <div className="space-y-2">
                  <Label>Profile Photo <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <div className="flex items-start gap-4">
                    {photoPreview ? (
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setPhotoPreview(null); setValue('profile_image_url', ''); }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                          aria-label="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center bg-muted shrink-0">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="h-11" />
                      <p className="text-xs text-muted-foreground">JPG, PNG or WEBP · Max 2 MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="full_name" placeholder="e.g. Abebe Kebede" {...register('full_name')} aria-invalid={!!errors.full_name} className="h-11" />
                  {errors.full_name && (
                    <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                      <AlertCircle className="h-3.5 w-3.5" />{errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" placeholder="student@school.edu.et" {...register('email')} aria-invalid={!!errors.email} className="h-11" />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                      <AlertCircle className="h-3.5 w-3.5" />{errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="phone_number" placeholder="+2519XXXXXXXX" {...register('phone_number')} aria-invalid={!!errors.phone_number} className="h-11" />
                    {errors.phone_number && (
                      <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                        <AlertCircle className="h-3.5 w-3.5" />{errors.phone_number.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="address" placeholder="e.g. Addis Ababa, Bole" {...register('address')} className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Login Password{' '}
                    <span className="text-muted-foreground text-xs">(leave blank to auto-generate)</span>
                  </Label>
                  <Input id="password" type="password" placeholder="Auto-generated if left blank" {...register('password')} className="h-11" />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" onClick={goNext} className="gap-2 min-h-[44px]">
                    Next: Academic Details <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {/* ── STEP 2: Academic Details ── */}
            {step === 2 && (
              <>
                <div className="space-y-1 mb-4">
                  <h2 className="text-base font-semibold">Academic Details</h2>
                  <p className="text-sm text-muted-foreground">
                    School-specific information about this student.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="admission_date">Admission Date <span className="text-destructive">*</span></Label>
                    <Input id="admission_date" type="date" {...register('admission_date')} aria-invalid={!!errors.admission_date} className="h-11" />
                    {errors.admission_date && (
                      <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                        <AlertCircle className="h-3.5 w-3.5" />{errors.admission_date.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth <span className="text-destructive">*</span></Label>
                    <Input id="date_of_birth" type="date" {...register('date_of_birth')} aria-invalid={!!errors.date_of_birth} className="h-11" />
                    {errors.date_of_birth && (
                      <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                        <AlertCircle className="h-3.5 w-3.5" />{errors.date_of_birth.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Gender <span className="text-destructive">*</span></Label>
                  <RadioGroup
                    value={sex}
                    onValueChange={(v) => setValue('sex', v as 'M' | 'F', { shouldValidate: true })}
                    className="flex gap-4"
                  >
                    <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px] flex-1">
                      <RadioGroupItem value="M" />
                      <span className="text-sm font-medium">Male</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px] flex-1">
                      <RadioGroupItem value="F" />
                      <span className="text-sm font-medium">Female</span>
                    </label>
                  </RadioGroup>
                  {errors.sex && (
                    <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                      <AlertCircle className="h-3.5 w-3.5" />{errors.sex.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" {...register('nationality')} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previous_school">Previous School <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="previous_school" placeholder="e.g. ABC Primary School" {...register('previous_school')} className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ministry_exam_result">
                    Ministry Exam Result{' '}
                    <span className="text-muted-foreground text-xs">(0–100, optional)</span>
                  </Label>
                  <Input
                    id="ministry_exam_result"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 85"
                    {...register('ministry_exam_result')}
                    className="h-11 max-w-[160px]"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack} className="gap-2 min-h-[44px]">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button type="button" onClick={goNext} className="gap-2 min-h-[44px]">
                    Next: Parent / Guardian <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {/* ── STEP 3: Guardian ── */}
            {step === 3 && (
              <>
                <div className="space-y-1 mb-4">
                  <h2 className="text-base font-semibold">Parent / Guardian</h2>
                  <p className="text-sm text-muted-foreground">
                    Link this student to an existing parent or guardian. You can also skip this and add one later.
                  </p>
                </div>

                {/* Mode toggle */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGuardianMode('search')}
                    className={cn(
                      'flex-1 flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                      guardianMode === 'search'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <Search className="h-4 w-4" />
                    Link existing guardian
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGuardianMode('skip');
                      setValue('guardian_id', undefined);
                      setValue('relationship_type', undefined);
                    }}
                    className={cn(
                      'flex-1 flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                      guardianMode === 'skip'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <X className="h-4 w-4" />
                    Skip for now
                  </button>
                </div>

                {guardianMode === 'search' && (
                  <div className="space-y-3">
                    {/* Search box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email…"
                        value={guardianSearch}
                        onChange={(e) => setGuardianSearch(e.target.value)}
                        className="pl-9 h-11"
                      />
                    </div>

                    {/* Guardian list */}
                    <div className="max-h-52 overflow-y-auto rounded-lg border divide-y">
                      {filteredGuardians.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground space-y-2">
                          <p>No guardians found.</p>
                          <Link href="/dashboard/guardians/create" target="_blank">
                            <Button type="button" variant="outline" size="sm" className="gap-2">
                              <UserPlus className="h-4 w-4" />
                              Create new guardian
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        filteredGuardians.map((g: any) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setValue('guardian_id', g.id)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors',
                              guardianId === g.id && 'bg-primary/5'
                            )}
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              {g.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{g.full_name}</div>
                              <div className="text-xs text-muted-foreground truncate">{g.email}</div>
                            </div>
                            {guardianId === g.id && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Selected guardian confirmation */}
                    {selectedGuardian && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium text-primary">
                          Selected: {(selectedGuardian as any).full_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setValue('guardian_id', undefined)}
                          className="ml-auto text-muted-foreground hover:text-foreground"
                          aria-label="Remove selection"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Relationship type — only shown when a guardian is selected */}
                    {guardianId && (
                      <div className="space-y-2">
                        <Label htmlFor="relationship_type">Relationship to Student</Label>
                        <Select onValueChange={(v) => setValue('relationship_type', v === 'none' ? undefined : v)}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select relationship…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="guardian">Legal Guardian</SelectItem>
                            <SelectItem value="uncle">Uncle</SelectItem>
                            <SelectItem value="aunt">Aunt</SelectItem>
                            <SelectItem value="grandparent">Grandparent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {guardianMode === 'skip' && (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No guardian will be linked right now. You can add one later from the student's profile.
                  </div>
                )}

                <Separator />

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={goBack} className="gap-2 min-h-[44px]">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="min-h-[44px] px-6" disabled={createStudent.isPending}>
                    {createStudent.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering…
                      </>
                    ) : (
                      'Register Student'
                    )}
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
