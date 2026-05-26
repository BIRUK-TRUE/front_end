'use client';

import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get locale from URL params directly, fallback to pathname
  const localeFromParams = (params?.locale as string);
  const localeFromPathname = pathname.split('/')[1];
  const locale = localeFromParams || (localeFromPathname === 'am' || localeFromPathname === 'en' ? localeFromPathname : 'en');

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'am' : 'en';

    // Strip the current locale prefix from pathname
    // More robust regex that handles various pathname formats
    const pathnameWithoutLocale = pathname.replace(/^\/(en|am)(\/|$)/, '$2') || '/';

    try {
      router.push(pathnameWithoutLocale, { locale: newLocale });
    } catch {
      const newPath = `/${newLocale}${pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale}`;
      window.location.href = newPath;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        toggleLocale();
      }}
      className="gap-2 min-h-[44px] min-w-[44px]"
      aria-label={`Switch to ${locale === 'en' ? 'Amharic' : 'English'}`}
      type="button"
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium">
        {locale === 'en' ? 'አማ' : 'EN'}
      </span>
    </Button>
  );
}
