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

  console.log('[LanguageSwitcher] Locale from params:', localeFromParams);
  console.log('[LanguageSwitcher] Locale from pathname:', localeFromPathname);
  console.log('[LanguageSwitcher] Final locale:', locale);

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'am' : 'en';

    // Strip the current locale prefix from pathname
    // More robust regex that handles various pathname formats
    const pathnameWithoutLocale = pathname.replace(/^\/(en|am)(\/|$)/, '$2') || '/';

    console.log('[LanguageSwitcher] Current locale:', locale);
    console.log('[LanguageSwitcher] New locale:', newLocale);
    console.log('[LanguageSwitcher] Current pathname:', pathname);
    console.log('[LanguageSwitcher] Pathname without locale:', pathnameWithoutLocale);

    // Navigate to the new locale
    try {
      // Use next-intl's router.push with locale option
      router.push(pathnameWithoutLocale, { locale: newLocale });
    } catch (error) {
      console.error('[LanguageSwitcher] Error with router.push:', error);
      // Fallback: manually construct the URL and navigate
      const newPath = `/${newLocale}${pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale}`;
      console.log('[LanguageSwitcher] Falling back to window.location:', newPath);
      window.location.href = newPath;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        console.log('[LanguageSwitcher] Button clicked');
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
