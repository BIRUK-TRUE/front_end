import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
          <FileQuestion className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('notFoundDescription')}
        </p>
        <Link href="/dashboard">
          <Button className="mt-6 min-h-[44px] gap-2">{t('goHome')}</Button>
        </Link>
      </div>
    </div>
  );
}
