'use client';

import { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { authService } from '@/lib/api/auth.service';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Link2Off,
} from 'lucide-react';
import { PasswordStrength } from '@/components/auth/password-strength';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const t = useTranslations('auth');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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
      setServerError(t('invalidResetLink'));
      return;
    }

    setIsLoading(true);
    setServerError('');
    try {
      await authService.resetPassword(
        token,
        data.newPassword,
        data.confirmPassword,
      );
      toast.success(t('passwordChanged'));
      router.push('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      setServerError(err.response?.data?.detail || t('resetPasswordFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthPageShell
        title={t('resetPasswordTitle')}
        description={t('invalidResetLink')}
        icon={<Link2Off className="h-7 w-7" aria-hidden="true" />}
      >
        <div className="space-y-5 text-center">
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{t('invalidResetLink')}</AlertDescription>
          </Alert>
          <Link href="/forgot-password">
            <Button className="h-11 w-full text-base font-medium">
              {t('requestNewLink')}
            </Button>
          </Link>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title={t('resetPasswordTitle')}
      description={t('resetPasswordDescription')}
      icon={<KeyRound className="h-7 w-7" aria-hidden="true" />}
      formId="reset-password-form"
    >
      <form
        id="reset-password-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {serverError && (
          <Alert variant="destructive" role="alert" className="animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2.5">
          <Label htmlFor="newPassword" className="text-sm font-medium">
            {t('newPassword')}
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              aria-invalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? 'new-pw-error' : undefined}
              {...register('newPassword')}
              className="h-11 pr-11"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? tc('hidePassword') : tc('showPassword')}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          {errors.newPassword && (
            <p
              id="new-pw-error"
              className="flex items-center gap-1.5 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <PasswordStrength password={password} />

        <div className="space-y-2.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            {t('confirmPassword')}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-pw-error' : undefined}
            {...register('confirmPassword')}
            className="h-11"
          />
          {errors.confirmPassword && (
            <p
              id="confirm-pw-error"
              className="flex items-center gap-1.5 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full text-base font-medium shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {t('resetting')}
            </>
          ) : (
            <>
              {t('resetPassword')}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </div>
      </form>
    </AuthPageShell>
  );
}

function ResetPasswordFallback() {
  const tc = useTranslations('common');

  return (
    <AuthPageShell title={tc('loading')} icon={<Loader2 className="h-7 w-7 animate-spin" />}>
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
