'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'am' : 'en';
    router.replace(pathname, { locale: newLocale });
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
