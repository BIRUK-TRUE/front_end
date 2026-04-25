'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { NotificationHistory } from '@/features/notifications/components/NotificationHistory';
import { NotificationHistoryDetail } from '@/features/notifications/components/NotificationHistoryDetail';
import { History } from 'lucide-react';

export default function NotificationHistoryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const t = useTranslations('notifications.history');

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8 space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <History className="h-6 w-6" />
             </div>
             {t('title')}
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
      </header>

      <NotificationHistory onViewDetails={setSelectedId} />

      <NotificationHistoryDetail 
        notificationId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
