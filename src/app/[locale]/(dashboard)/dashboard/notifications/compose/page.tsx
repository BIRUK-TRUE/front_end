'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { NotificationComposer } from '@/features/notifications/components/NotificationComposer';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ComposeNotificationPage() {
  const t = useTranslations('notifications.compose');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      />

      <NotificationComposer />
    </div>
  );
}
