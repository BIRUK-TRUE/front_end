'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useRouter, Link } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService } from '@/lib/api/auth.service';
import { useSchoolInfo } from '@/hooks/use-settings';
import { LanguageSwitcher } from '@/components/auth/language-switcher';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SM';
}

export default function LoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { data: schoolInfo, isLoading: isLoadingSchool } = useSchoolInfo();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const schoolName = schoolInfo?.school_name || 'School Management System';
  const schoolLogo = schoolInfo?.school_logo || schoolInfo?.logo_url || undefined;
  const primaryColor = schoolInfo?.primary_color || '#2563EB';

  const loginSchema = useMemo(() => z.object({
    email: z.string().trim().min(1, t('emailRequired')).email(t('invalidEmail')),
    password: z.string().min(1, t('passwordRequired')),
    remember: z.boolean().optional(),
  }), [t]);

  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '', remember: false },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const prevLocaleRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (prevLocaleRef.current === undefined) {
      prevLocaleRef.current = locale;
    } else if (prevLocaleRef.current !== locale) {
      form.reset();
      form.clearErrors();
      prevLocaleRef.current = locale;
    }
  }, [form, locale]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError('');

    try {
      const response = await authService.login(data.email, data.password);
      setAuth(
        response.user,
        response.tokens.access_token,
        response.tokens.refresh_token,
      );

      if (response.user.must_change_password) {
        router.push('/change-password');
        return;
      }

      const primaryRole = response.user.roles[0];
      switch (primaryRole) {
        case 'teacher':
          router.push('/dashboard/teacher');
          break;
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'guardian':
          router.push('/dashboard/guardian');
          break;
        default:
          router.push('/dashboard');
          break;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; errors?: { message: string }[] } } };
      const msg = !err.response
        ? 'Unable to connect to the server. Please try again later.'
        : err.response.data?.errors?.map((e) => e.message).join(', ') ||
          err.response.data?.detail ||
          t('invalidCredentials');
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-muted/40 p-4 lg:p-8"
      style={{ ['--brand-primary' as string]: primaryColor }}
    >
      {/* Background decoration - optional, subtle modern touch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <a href="#login-form" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
        Skip to sign in
      </a>

      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md shadow-lg border-muted relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-6">
          {isLoadingSchool ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20 shadow-sm ring-1 ring-border">
                <AvatarImage src={schoolLogo} alt={`${schoolName} logo`} className="object-cover" />
                <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-xl">
                  {initials(schoolName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1.5 w-full">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Welcome to <br/>
                  <span className="text-primary break-words">{schoolName}</span>
                </CardTitle>
                {schoolInfo?.school_tagline && (
                  <p className="text-sm font-medium italic text-muted-foreground px-2">
                    "{schoolInfo.school_tagline}"
                  </p>
                )}
                <CardDescription className="text-base pt-1">
                  Sign in to your account to continue
                </CardDescription>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent>
          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {serverError && (
              <Alert variant="destructive" role="alert" className="animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="name@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                  className="pl-10 h-11"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="flex items-center gap-1.5 text-sm text-destructive" aria-live="polite">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors">
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                  className="pl-10 pr-11 h-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? tc('hidePassword') : tc('showPassword')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" className="flex items-center gap-1.5 text-sm text-destructive" aria-live="polite">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="remember"
                checked={watch('remember')}
                onCheckedChange={(checked) => setValue('remember', checked === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium shadow-sm transition-all" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  {tc('loading')}
                </>
              ) : (
                <>
                  {t('login')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 bg-muted/20 px-6 py-4">
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
             <Lock className="h-3 w-3" /> Secure access · All roles auto-detected
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
