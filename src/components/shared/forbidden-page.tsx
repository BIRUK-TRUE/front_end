'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

interface ForbiddenPageProps {
  message?: string;
}

export function ForbiddenPage({ message }: ForbiddenPageProps) {
  const t = useTranslations('errors');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-[120px] font-black text-destructive/10 leading-none select-none">
            403
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-10 w-10 text-destructive" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{t('forbidden')}</h2>
          <p className="text-muted-foreground">
            {message || t('forbiddenDescription')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="gap-2 min-h-[44px] px-8">
              <Home className="h-4 w-4" />
              {t('goHome')}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2 min-h-[44px] px-8"
            onClick={() => typeof window !== 'undefined' && window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('goBack')}
          </Button>
        </div>
      </div>
    </div>
  );
}
