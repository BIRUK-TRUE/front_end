'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateUser } from '@/hooks/use-users';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';

const allRoles = ['admin', 'director', 'registrar', 'teacher', 'student', 'guardian'];

function CreateUserForm() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const tr = useTranslations('roles');
  const tv = useTranslations('validation');
  const router = useRouter();
  const searchParams = useSearchParams();
  const createUser = useCreateUser();

  const createUserSchema = z
    .object({
      email: z.string().min(1, tv('emailRequired')).email(tv('invalidEmail')),
      full_name: z.string().min(2, tv('nameMinLength')),
      phone_number: z.string().optional(),
      address: z.string().optional(),
      password: z.string().min(8, tv('passwordMinLength')),
      confirm_password: z.string(),
      role_names: z.array(z.string()).min(1, tv('atLeastOneRole')),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: tv('passwordsDoNotMatch'),
      path: ['confirm_password'],
    });

  type CreateUserForm = z.infer<typeof createUserSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role_names: [] },
  });

  const selectedRoles = watch('role_names');

  // Preselect role from URL parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && allRoles.includes(roleParam)) {
      setValue('role_names', [roleParam], { shouldValidate: true });
    }
  }, [searchParams, setValue]);

  const toggleRole = (role: string) => {
    const current = selectedRoles || [];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    setValue('role_names', updated, { shouldValidate: true });
  };

  const onSubmit = (data: CreateUserForm) => {
    const { confirm_password, ...payload } = data;
    createUser.mutate(payload, {
      onSuccess: () => router.push('/dashboard/users'),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('createUser')}
        actions={
          <Link href="/dashboard/users">
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
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{tc('email')} *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-err' : undefined}
                className="h-11"
              />
              {errors.email && (
                <p id="email-err" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">{tc('name')} *</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                aria-invalid={!!errors.full_name}
                aria-describedby={errors.full_name ? 'name-err' : undefined}
                className="h-11"
              />
              {errors.full_name && (
                <p id="name-err" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Phone & Address */}
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')} *</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-err' : undefined}
                className="h-11"
              />
              {errors.password && (
                <p id="password-err" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('confirmPassword')} *</Label>
              <Input
                id="confirm_password"
                type="password"
                {...register('confirm_password')}
                aria-invalid={!!errors.confirm_password}
                aria-describedby={errors.confirm_password ? 'confirm-password-err' : undefined}
                className="h-11"
              />
              {errors.confirm_password && (
                <p id="confirm-password-err" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Roles */}
            <div className="space-y-3">
              <Label>{t('roleSelect')} *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allRoles.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px]"
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                      aria-label={tr(role as any)}
                    />
                    <span className="text-sm font-medium capitalize">
                      {tr(role as any)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.role_names && (
                <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.role_names.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="min-h-[44px]"
                disabled={createUser.isPending}
              >
                {createUser.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    {tc('loading')}
                  </>
                ) : (
                  tc('save')
                )}
              </Button>
              <Link href="/dashboard/users">
                <Button variant="outline" type="button" className="min-h-[44px]">
                  {tc('cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateUserPage() {
  return (
    <ProtectedRoute requireRoles={['admin', 'director']}>
      <CreateUserForm />
    </ProtectedRoute>
  );
}
