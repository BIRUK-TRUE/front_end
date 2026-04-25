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
      <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 px-6 py-6 border-b border-primary/10">
          <DialogTitle className="text-xl font-bold">{t(`rules.${rule.id}`)}</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            {t('editRule')} — {rule.trigger}
          </DialogDescription>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('messageTemplate')}</Label>
            <Textarea 
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              className="min-h-[100px] rounded-xl resize-none border-muted-foreground/20 focus:ring-primary/20"
              placeholder={t('templatePlaceholder')}
            />
            <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 italic text-[10px] text-blue-800">
               <AlertCircle className="h-3 w-3 mt-0.5" />
               <p>{t('templateHelp')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('channels')}</Label>
              <div className="space-y-3">
                {['in_app', 'sms', 'email'].map((c) => (
                  <div key={c} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`channel-${c}`} 
                      checked={formData.channels?.includes(c as any)} 
                      onCheckedChange={() => handleChannelToggle(c as any)}
                      disabled={c === 'in_app'}
                    />
                    <label 
                      htmlFor={`channel-${c}`} 
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {t(`channelTypes.${c}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('recipients')}</Label>
               <div className="space-y-3">
                {['guardian', 'teacher', 'director', 'admin'].map((r) => (
                  <div key={r} className="flex items-center space-x-3">
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
                    />
                    <label 
                      htmlFor={`recipient-${r}`} 
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {t(`recipientTypes.${r}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t">
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-11 px-6">{t('saveRule')}</Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20"
          >
            {isPending ? t('saving') : t('saveRule')}
            {!isPending && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
