'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useCreateGuardian, useLinkStudent } from '@/hooks/use-guardians';
import { usePermissions } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useStudents } from '@/hooks/use-students';

const RELATIONSHIP_OPTIONS = [
  'father', 'mother', 'uncle', 'aunt', 'grandparent', 'sibling', 'legal_guardian', 'other'
];

function CreateGuardianForm() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');
  const router = useRouter();
  const createGuardian = useCreateGuardian();
  const linkStudent = useLinkStudent();
  const [createdGuardianId, setCreatedGuardianId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: students } = useStudents({ search: searchTerm, size: 20 });

  const guardianSchema = z.object({
    email: z.string().min(1, tv('required')).email(tv('invalidEmail')),
    full_name: z.string().min(2, tv('nameMinLength')),
    phone_number: z.string().regex(/^\+251\d{9}$/, { message: t('phoneInvalid') }),
    address: z.string().optional(),
    password: z.string().optional(),
    occupation: z.string().optional(),
    workplace: z.string().optional(),
    relationship_type: z.string().min(1, t('relationshipRequired')),
    is_primary: z.boolean().optional(),
  });

  type GuardianForm = z.infer<typeof guardianSchema>;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GuardianForm>({
    resolver: zodResolver(guardianSchema) as any,
    defaultValues: { is_primary: false },
  });

  const isPrimary = watch('is_primary');

  const onSubmit = (data: GuardianForm) => {
    createGuardian.mutate(data as any, {
      onSuccess: (result) => {
        setCreatedGuardianId(result.id);
      }
    });
  };

  const handleLinkStudents = () => {
    if (!createdGuardianId || selectedStudentIds.length === 0) return;

    const linkPromises = selectedStudentIds.map(studentId =>
      linkStudent.mutateAsync({
        guardianId: createdGuardianId,
        payload: {
          student_id: studentId,
          relationship_type: watch('relationship_type') as any,
          is_primary: isPrimary,
        }
      })
    );

    Promise.all(linkPromises).then(() => {
      router.push(`/dashboard/guardians/${createdGuardianId}`);
    });
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  if (createdGuardianId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title={t('linkStudentsAfterCreation')} actions={<Link href="/dashboard/guardians"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>} />

        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label>{t('searchStudent')}</Label>
                <Input
                  placeholder={t('searchStudent')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 mt-2"
                />
              </div>

              {students?.items && students.items.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                  {students.items.map((student: any) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer" onClick={() => toggleStudentSelection(student.id)}>
                      <Checkbox
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => {}}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.registration_number || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && students?.items?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('noStudentsFound')}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleLinkStudents}
                  disabled={selectedStudentIds.length === 0 || linkStudent.isPending}
                  className="min-h-[44px] gap-2"
                >
                  {linkStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tc('loading')}</> : <><UserPlus className="h-4 w-4" />{t('linkSelectedStudents')}</>}
                </Button>
                <Link href={`/dashboard/guardians/${createdGuardianId}`}>
                  <Button variant="outline" type="button" className="min-h-[44px]">{tc('skip')}</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t('createGuardian')} actions={<Link href="/dashboard/guardians"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" />{tc('back')}</Button></Link>} />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
              <div className="space-y-2">
                <Label htmlFor="address">{tc('address')}</Label>
                <Input id="address" {...register('address')} className="h-11" />
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(auto-generated if empty)</span></Label><Input id="password" type="password" {...register('password')} className="h-11" /></div>

            <CardTitle className="text-base pt-4">{t('guardianDetails')}</CardTitle>
            <div className="space-y-2">
              <Label htmlFor="relationship_type">{t('relationshipType')} *</Label>
              <Select onValueChange={(v) => setValue('relationship_type', v)}>
                <SelectTrigger className="h-11"><SelectValue placeholder={t('relationshipType')} /></SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{t(r as any)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.relationship_type && <p className="text-sm text-destructive flex items-center gap-1.5" role="alert"><AlertCircle className="h-3.5 w-3.5" />{errors.relationship_type.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="is_primary" checked={isPrimary} onCheckedChange={(checked) => setValue('is_primary', checked as boolean)} />
              <Label htmlFor="is_primary" className="cursor-pointer">{t('isPrimaryCheckbox')}</Label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="occupation">{t('occupation')}</Label><Input id="occupation" {...register('occupation')} className="h-11" /></div>
              <div className="space-y-2"><Label htmlFor="workplace">{t('workplace')}</Label><Input id="workplace" {...register('workplace')} className="h-11" /></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="min-h-[44px]" disabled={createGuardian.isPending}>
                {createGuardian.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tc('loading')}</> : tc('save')}
              </Button>
              <Link href="/dashboard/guardians"><Button variant="outline" type="button" className="min-h-[44px]">{tc('cancel')}</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateGuardianPage() {
  return <ProtectedRoute requireRoles={['admin', 'registrar']}><CreateGuardianForm /></ProtectedRoute>;
}
