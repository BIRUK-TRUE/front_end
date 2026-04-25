'use client';

import { useTranslations } from 'next-intl';
import { AlertRulesManager } from '@/features/notifications/components/AlertRulesManager';
import { 
  Settings, 
  ShieldCheck,
  Info 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AlertRulesPage() {
  const t = useTranslations('notifications.alertRules');
  const tc = useTranslations('common');

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Settings className="h-6 w-6" />
             </div>
             {t('title')}
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
      </header>

      <Alert className="bg-primary/5 border-primary/20 rounded-3xl p-6">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-bold ml-2">{tc('privacyPolicy') || 'Privacy & Policy'}</AlertTitle>
        <AlertDescription className="text-primary/70 text-sm italic ml-2 mt-1">
          Automated SMS and Email alerts are sent according to the defined rules. Each alert is logged for compliance and audit purposes.
        </AlertDescription>
      </Alert>

      <AlertRulesManager />

      <footer className="pt-12 border-t mt-12 flex items-start gap-4">
         <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
            <Info className="h-5 w-5" />
         </div>
         <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
           {t('templateHelp')}
         </p>
      </footer>
    </div>
  );
}
