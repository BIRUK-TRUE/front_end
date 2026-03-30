'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
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
import { ArrowLeft, Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    <Card className="w-full max-w-md shadow-xl border-0 shadow-primary/5">
      <CardHeader className="space-y-3 text-center pb-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Mail className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">
            {t('forgotPasswordTitle')}
          </CardTitle>
          <CardDescription className="mt-1.5">
            {t('forgotPasswordDescription')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('resetEmailSent')}
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-2 h-11 w-full">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('backToLogin')}
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
                className="h-11"
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.email.message}
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
                  Sending...
                </>
              ) : (
                t('sendResetLink')
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {t('backToLogin')}
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
