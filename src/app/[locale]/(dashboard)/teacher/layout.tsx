'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.must_change_password) {
      router.push('/change-password');
      return;
    }

    // Check if user has teacher role
    if (!user.roles.includes('teacher')) {
      router.push('/unauthorized');
    }
  }, [user, isHydrated, router, locale]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (!user) return null;
  if (user.must_change_password) return null;
  if (!user.roles.includes('teacher')) return null;

  return <>{children}</>;
}
