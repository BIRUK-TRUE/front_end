'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import { useCreateUser } from '@/hooks/use-users';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const createUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional(),
  role_names: z.array(z.string()).min(1, 'At least one role is required'),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

const allRoles = ['admin', 'director', 'registrar', 'teacher', 'student', 'guardian'];

export default function CreateUserPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const tr = useTranslations('roles');
  const router = useRouter();
  const createUser = useCreateUser();

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

  const toggleRole = (role: string) => {
    const current = selectedRoles || [];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    setValue('role_names', updated, { shouldValidate: true });
  };

  const onSubmit = (data: CreateUserForm) => {
    createUser.mutate(data, {
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

            {/* Password (optional) */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {tc('password') || 'Password'}{' '}
                <span className="text-muted-foreground text-xs">(auto-generated if empty)</span>
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="h-11"
              />
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
