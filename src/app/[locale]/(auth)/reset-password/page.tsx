'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { authService } from '@/lib/api/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { KeyRound, Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { PasswordStrength } from '@/components/auth/password-strength';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, tv('passwordMinLength'))
        .max(128, t('passwordMaxLength')),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  type ResetForm = z.infer<typeof resetSchema>;
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const password = watch('newPassword', '');

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setServerError(t('tokenRequired'));
      return;
    }
    setIsLoading(true);
    setServerError('');
    try {
      await authService.resetPassword(token, data.newPassword, data.confirmPassword);
      toast.success(t('passwordChanged'));
      router.push('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      setServerError(err.response?.data?.detail || t('resetPasswordFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 shadow-primary/5">
      <CardHeader className="space-y-3 text-center pb-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">
            {t('resetPasswordTitle')}
          </CardTitle>
          <CardDescription className="mt-1.5">
            {t('resetPasswordDescription')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {serverError && (
            <div
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? 'new-pw-error' : undefined}
                {...register('newPassword')}
                className="h-11 pr-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 w-11 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? tc('hidePassword') : tc('showPassword')}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p id="new-pw-error" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <PasswordStrength password={password} />

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-pw-error' : undefined}
              {...register('confirmPassword')}
              className="h-11"
            />
            {errors.confirmPassword && (
              <p id="confirm-pw-error" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {t('resetting')}
              </>
            ) : (
              t('resetPassword')
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
