'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useStudent, useUpdateStudent } from '@/hooks/use-students';
import { useGuardiansForStudent, useLinkStudent, useUnlinkStudent, useGuardians } from '@/hooks/use-guardians';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Upload, X, UserPlus, UserMinus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const editStudentSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  previous_school: z.string().optional(),
  ministry_exam_result: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  status: z.string().optional(),
  is_active: z.boolean().optional(),
  profile_image_url: z.string().optional(),
});

type EditStudentForm = z.infer<typeof editStudentSchema>;

function EditStudentForm() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id);
  const { data: guardians } = useGuardiansForStudent(id);
  const { data: availableGuardians } = useGuardians({ is_active: true });
  const updateStudent = useUpdateStudent();
  const linkStudent = useLinkStudent();
  const unlinkStudent = useUnlinkStudent();
  const { canManageStudents, isAdmin, isRegistrar } = usePermissions();
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [selectedGuardianId, setSelectedGuardianId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<string>('guardian');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      if (student.profile_image_url) {
        setPhotoPreview(student.profile_image_url);
      }
    }
  }, [student, reset]);

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!student) return null;

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
    setValue('profile_image_url' as keyof EditStudentForm, '');
  };

  const onSubmit = (data: EditStudentForm) => {
    const payload: Partial<EditStudentForm> = { ...data };
    if (payload.ministry_exam_result === '' || payload.ministry_exam_result === undefined) {
      delete payload.ministry_exam_result;
    }
    if (payload.phone_number === '') {
      delete payload.phone_number;
    }
    updateStudent.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/dashboard/students/${id}`) }
    );
  };

  const handleLinkGuardian = () => {
    if (!selectedGuardianId) return;
    linkStudent.mutate(
      {
        guardianId: selectedGuardianId,
        payload: {
          student_id: id,
          relationship_type: relationshipType as any,
          is_primary: guardians?.length === 0,
        },
      },
      {
        onSuccess: () => {
          setIsGuardianModalOpen(false);
          setSelectedGuardianId('');
          setRelationshipType('guardian');
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard/students" className="hover:text-foreground">
          {t('title')}
        </Link>
        <span>/</span>
        <Link href={`/dashboard/students/${id}`} className="hover:text-foreground">
          {student.full_name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t('editStudent')}</span>
      </nav>

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
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5" noValidate>
            {step === 1 && (
              <>
                {/* Read-only Registration Number */}
                <div className="space-y-2">
                  <Label htmlFor="registration_number">{t('registrationNumber')}</Label>
                  <Input id="registration_number" value={student.registration_number} disabled className="h-11 bg-muted" />
                </div>

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
                      <p className="text-xs text-muted-foreground mt-1">{t('changePhoto')}</p>
                    </div>
                  </div>
                </div>

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
                    <Select onValueChange={(v) => setValue('status', v)} defaultValue={student.status}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t('statusActive')}</SelectItem>
                        <SelectItem value="graduated">{t('statusGraduated')}</SelectItem>
                        <SelectItem value="transferred">{t('statusTransferred')}</SelectItem>
                        <SelectItem value="expelled">{t('statusExpelled')}</SelectItem>
                        <SelectItem value="withdrawn">{t('statusWithdrawn')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

      {/* Guardian Link/Unlink Section */}
      {(isAdmin || isRegistrar) && (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('guardianInfo')}</h3>
            {!guardians?.length ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">{t('noGuardianSelected')}</p>
                <Dialog open={isGuardianModalOpen} onOpenChange={setIsGuardianModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      {t('linkGuardian')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('linkGuardian')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="guardian-select">{tc('guardian')}</Label>
                        <Select value={selectedGuardianId} onValueChange={setSelectedGuardianId}>
                          <SelectTrigger id="guardian-select">
                            <SelectValue placeholder={t('selectGuardian')} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableGuardians?.items?.map((g: { id: string; full_name: string }) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.full_name} ({g.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="relationship-type">{t('relationshipType')}</Label>
                        <Select value={relationshipType} onValueChange={setRelationshipType}>
                          <SelectTrigger id="relationship-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={handleLinkGuardian}
                          disabled={!selectedGuardianId || linkStudent.isPending}
                          className="flex-1"
                        >
                          {linkStudent.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {tc('loading')}
                            </>
                          ) : (
                            t('linkGuardian')
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsGuardianModalOpen(false)}
                          className="flex-1"
                        >
                          {tc('cancel')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-3">
                {guardians.map((g: { id: string; full_name: string; relationship_type: string; is_primary: boolean }) => (
                  <div key={g.id || g.guardian_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{g.full_name || g.guardian_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{g.relationship_type}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => unlinkStudent.mutate({ guardianId: g.id || g.guardian_id, studentId: id })}
                      className="gap-2"
                    >
                      <UserMinus className="h-4 w-4" />
                      {t('unlinkGuardian')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EditStudentPage() {
  return <ProtectedRoute><EditStudentForm /></ProtectedRoute>;
}
