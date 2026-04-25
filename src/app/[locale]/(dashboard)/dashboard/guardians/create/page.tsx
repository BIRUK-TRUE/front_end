'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import { useCreateGuardian } from '@/hooks/use-guardians';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function CreateGuardianPage() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');
  const router = useRouter();
  const createGuardian = useCreateGuardian();

  const guardianSchema = z.object({
    email: z.string().min(1, tv('required')).email(tv('invalidEmail')),
    full_name: z.string().min(2, tv('nameMinLength')),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    password: z.string().optional(),
    occupation: z.string().optional(),
    workplace: z.string().optional(),
  });

  type GuardianForm = z.infer<typeof guardianSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<GuardianForm>({
    resolver: zodResolver(guardianSchema),
  });

  const onSubmit = (data: GuardianForm) => {
    createGuardian.mutate(data, { onSuccess: () => router.push('/dashboard/guardians') });
  };

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
              <div className="space-y-2"><Label htmlFor="phone_number">{tc('phone')}</Label><Input id="phone_number" {...register('phone_number')} className="h-11" /></div>
              <div className="space-y-2"><Label htmlFor="address">{tc('address')}</Label><Input id="address" {...register('address')} className="h-11" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(auto-generated if empty)</span></Label><Input id="password" type="password" {...register('password')} className="h-11" /></div>

            <CardTitle className="text-base pt-4">{t('guardianDetails')}</CardTitle>
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
