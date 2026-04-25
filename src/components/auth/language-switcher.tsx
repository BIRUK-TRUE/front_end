'use client';

import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get locale from URL params directly
  const locale = (params?.locale as string) || 'en';

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'am' : 'en';

    // Strip the current locale prefix from pathname
    const pathnameWithoutLocale = pathname.replace(/^\/(en|am)/, '') || '/';

    // Navigate to the new locale
    router.push(pathnameWithoutLocale, { locale: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="gap-2 min-h-[44px] min-w-[44px]"
      aria-label={`Switch to ${locale === 'en' ? 'Amharic' : 'English'}`}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium">
        {locale === 'en' ? 'አማ' : 'EN'}
      </span>
    </Button>
  );
}
