/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useSchoolInfo } from '@/hooks/use-settings';
import { LanguageSwitcher } from '@/components/auth/language-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock } from 'lucide-react';

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'SM'
  );
}

type AuthPageShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  formId?: string;
  skipLabel?: string;
};

export function AuthPageShell({
  children,
  title,
  description,
  icon,
  footer,
  formId,
  skipLabel = 'Skip to form',
}: AuthPageShellProps) {
  const { data: schoolInfo, isLoading: isLoadingSchool } = useSchoolInfo();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const schoolName = schoolInfo?.school_name || 'School Management System';
  const schoolLogo = schoolInfo?.school_logo || schoolInfo?.logo_url || undefined;
  const primaryColor = schoolInfo?.primary_color || '#2563EB';

  if (!mounted) return null;

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-muted/40 p-4 lg:p-8"
      style={{ ['--brand-primary' as string]: primaryColor }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] h-[60%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {formId ? (
        <a
          href={`#${formId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipLabel}
        </a>
      ) : null}

      <div className="absolute right-4 top-4 z-50">
        <LanguageSwitcher />
      </div>

      <Card className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 border-muted shadow-lg duration-500">
        <CardHeader className="flex flex-col items-center space-y-4 pb-6 text-center">
          {isLoadingSchool ? (
            <div className="flex w-full flex-col items-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/20 shadow-sm ring-1 ring-border">
                  <AvatarImage src={schoolLogo} alt={`${schoolName} logo`} className="object-cover" />
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                    {initials(schoolName)}
                  </AvatarFallback>
                </Avatar>
                {icon ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {icon}
                  </div>
                ) : null}
              </div>

              <div className="w-full space-y-1.5">
                <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
                {description ? (
                  <CardDescription className="text-base">{description}</CardDescription>
                ) : null}
              </div>
            </>
          )}
        </CardHeader>

        <CardContent>{children}</CardContent>

        {footer ?? (
          <CardFooter className="flex justify-center border-t border-border/40 bg-muted/20 px-6 py-4">
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Secure access · {schoolName}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
