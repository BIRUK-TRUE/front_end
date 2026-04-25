'use client';

import { useTranslations } from 'next-intl';
import { NotificationComposer } from '@/features/notifications/components/NotificationComposer';
import { Send, Info } from 'lucide-react';

export default function ComposeNotificationPage() {
  const t = useTranslations('notifications.compose');

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8 space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Send className="h-6 w-6" />
           </div>
           {t('title')}
        </h1>
        <p className="text-slate-500 mt-2 font-medium max-w-2xl">
          {t('subtitle')}
        </p>
      </header>

      <NotificationComposer />

      <div className="pt-8 border-t flex items-start gap-4">
         <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
            <Info className="h-5 w-5" />
         </div>
         <p className="text-[10px] text-slate-400 leading-relaxed font-semibold uppercase tracking-widest">
           {t('sendSuccess', { count: 0 })}
         </p>
      </div>
    </div>
  );
}
