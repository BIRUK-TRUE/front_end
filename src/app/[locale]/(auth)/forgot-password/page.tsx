'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { authService } from '@/lib/api/auth.service';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotSchema = z.object({
    email: z.string().min(1, t('emailRequired')).email(t('invalidEmail')),
  });

  type ForgotForm = z.infer<typeof forgotSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
    } catch {
      // Don't reveal whether email exists
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  return (
    <AuthPageShell
      title={t('forgotPasswordTitle')}
      description={t('forgotPasswordDescription')}
      icon={<Mail className="h-7 w-7" aria-hidden="true" />}
      formId="forgot-password-form"
    >
      {isSubmitted ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-7 w-7 text-success" aria-hidden="true" />
          </div>
          <Alert className="border-success/30 bg-success/5 text-left">
            <Mail className="h-4 w-4 text-success" aria-hidden="true" />
            <AlertDescription className="text-sm text-foreground">
              {t('resetEmailSent')}
            </AlertDescription>
          </Alert>
          <Link href="/login">
            <Button variant="outline" className="h-11 w-full">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('backToLogin')}
            </Button>
          </Link>
        </div>
      ) : (
        <form
          id="forgot-password-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
                className="h-11 pl-10"
              />
            </div>
            {errors.email && (
              <p
                id="email-error"
                className="flex items-center gap-1.5 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.email.message}
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
                {tc('loading')}
              </>
            ) : (
              <>
                {t('sendResetLink')}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {t('backToLogin')}
            </Link>
          </div>
        </form>
      )}
    </AuthPageShell>
  );
}
