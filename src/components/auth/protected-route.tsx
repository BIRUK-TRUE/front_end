'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRoles?: string[];
}

export function ProtectedRoute({ children, requireRoles }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.must_change_password) {
      router.push('/change-password');
      return;
    }

    if (requireRoles && !requireRoles.some((r) => user.roles.includes(r))) {
      router.push('/dashboard');
    }
  }, [user, isMounted, requireRoles, router, locale]);

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }


  if (!user) return null;
  if (user.must_change_password) return null;
  if (requireRoles && !requireRoles.some((r) => user.roles.includes(r))) return null;

  return <>{children}</>;
}
