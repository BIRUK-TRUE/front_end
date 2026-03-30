'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import { useUser, useUpdateUser } from '@/hooks/use-users';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';

const editUserSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean(),
});

type EditUserForm = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user, isLoading: loadingUser } = useUser(id);
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { is_active: true },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        phone_number: user.phone_number || '',
        address: user.address || '',
        is_active: user.is_active,
      });
    }
  }, [user, reset]);

  const isActive = watch('is_active');

  const onSubmit = (data: EditUserForm) => {
    updateUser.mutate(
      { id, data },
      { onSuccess: () => router.push(`/dashboard/users/${id}`) }
    );
  };

  if (loadingUser) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('editUser')}
        actions={
          <Link href={`/dashboard/users/${id}`}>
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

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is_active" className="text-sm font-medium">
                  {tc('active')}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isActive ? 'User can access the system' : 'User is deactivated'}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="min-h-[44px]"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    {tc('loading')}
                  </>
                ) : (
                  tc('save')
                )}
              </Button>
              <Link href={`/dashboard/users/${id}`}>
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
