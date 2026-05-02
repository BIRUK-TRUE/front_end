'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Save, X } from 'lucide-react';
import type { AlertRule } from '../types';

interface AlertRuleEditModalProps {
  rule: AlertRule | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AlertRule>) => void;
  isPending: boolean;
}

export function AlertRuleEditModal({ rule, isOpen, onClose, onSave, isPending }: AlertRuleEditModalProps) {
  const t = useTranslations('notifications.alertRules');
  const tc = useTranslations('common');
  const [formData, setFormData] = useState<Partial<AlertRule>>({});

  useMemo(() => {
    if (rule) {
      setFormData({
        template: rule.template,
        channels: rule.channels,
        recipients: rule.recipients,
        config: rule.config,
      });
    }
  }, [rule]);

  const handleChannelToggle = (channel: 'in_app' | 'sms' | 'email') => {
    const current = formData.channels || [];
    if (current.includes(channel)) {
      if (channel === 'in_app') return; // Cannot uncheck in-app
      setFormData({ ...formData, channels: current.filter(c => c !== channel) });
    } else {
      setFormData({ ...formData, channels: [...current, channel] });
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!rule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="bg-primary/5 px-8 py-8 border-b border-primary/10 shrink-0">
          <DialogTitle className="text-2xl font-black italic tracking-tight">{t(`rules.${rule.id}`)}</DialogTitle>
          <DialogDescription className="text-xs font-bold mt-2 uppercase tracking-widest opacity-70 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            {t('editRule')} — {rule.trigger}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 min-h-0">
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">{t('messageTemplate')}</Label>
            <div className="space-y-3">
              <Textarea 
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-primary/20 shadow-sm p-5 text-sm leading-relaxed font-medium"
                placeholder={t('templatePlaceholder')}
              />
              <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 italic text-[11px] text-blue-800 leading-relaxed shadow-sm">
                 <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                 <p>{t('templateHelp')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">{t('channels')}</Label>
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                {['in_app', 'sms', 'email'].map((c) => (
                  <div key={c} className="flex items-center space-x-3 group">
                    <Checkbox 
                      id={`channel-${c}`} 
                      checked={formData.channels?.includes(c as any)} 
                      onCheckedChange={() => handleChannelToggle(c as any)}
                      disabled={c === 'in_app'}
                      className="rounded-md"
                    />
                    <label 
                      htmlFor={`channel-${c}`} 
                      className="text-xs font-bold text-slate-600 leading-none cursor-pointer select-none group-hover:text-primary transition-colors"
                    >
                      {t(`channelTypes.${c}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">{t('recipients')}</Label>
               <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                {['guardian', 'teacher', 'director', 'admin'].map((r) => (
                  <div key={r} className="flex items-center space-x-3 group">
                    <Checkbox 
                      id={`recipient-${r}`} 
                      checked={formData.recipients?.includes(r as any)} 
                      onCheckedChange={(checked) => {
                        const current = formData.recipients || [];
                        setFormData({ 
                          ...formData, 
                          recipients: checked 
                            ? [...current, r as any] 
                            : current.filter(item => item !== r)
                        });
                      }}
                      className="rounded-md"
                    />
                    <label 
                      htmlFor={`recipient-${r}`} 
                      className="text-xs font-bold text-slate-600 leading-none cursor-pointer select-none group-hover:text-primary transition-colors"
                    >
                      {t(`recipientTypes.${r}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-white border-t shrink-0 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-11 px-6 font-bold">{tc('cancel')}</Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="rounded-xl h-11 px-8 font-black shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {isPending ? t('saving') : t('saveRule')}
            {!isPending && <Save className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
