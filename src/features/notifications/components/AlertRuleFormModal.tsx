'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, TrendingDown, Calendar, Bell } from 'lucide-react';
import { useCreateAlertRule, useUpdateAlertRule } from '../api/useNotifications';
import type { AlertRule } from '../types';

interface AlertRuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRule: AlertRule | null;
}

export function AlertRuleFormModal({ isOpen, onClose, editingRule }: AlertRuleFormModalProps) {
  const t = useTranslations('notifications.alertRules.form');
  const tc = useTranslations('common');

  const TRIGGER_TYPES = [
    { value: 'consecutive_absence', label: t('triggerConsecutiveAbsence'), icon: AlertTriangle },
    { value: 'low_attendance_rate', label: t('triggerLowAttendanceRate'), icon: TrendingDown },
    { value: 'low_grade', label: t('triggerLowGrade'), icon: TrendingDown },
    { value: 'fee_overdue', label: t('triggerFeeOverdue'), icon: Calendar },
  ];

  const [formData, setFormData] = useState({
    name: '',
    trigger: 'consecutive_absence' as string,
    threshold: { days: 3, percentage: 75 },
    channels: ['in_app'] as ('in_app' | 'sms' | 'email')[],
    recipients: ['guardian'] as ('guardian' | 'teacher' | 'director' | 'admin')[],
    enabled: true,
    template: '',
  });

  const createMutation = useCreateAlertRule();
  const updateMutation = useUpdateAlertRule();

  useEffect(() => {
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        trigger: editingRule.trigger,
        threshold: {
          days: (editingRule.config?.days as number) || 3,
          percentage: (editingRule.config?.percentage as number) || 75,
        },
        channels: editingRule.channels,
        recipients: editingRule.recipients,
        enabled: editingRule.enabled,
        template: editingRule.template,
      });
    } else {
      setFormData({
        name: '',
        trigger: 'consecutive_absence',
        threshold: { days: 3, percentage: 75 },
        channels: ['in_app'],
        recipients: ['guardian'],
        enabled: true,
        template: '',
      });
    }
  }, [editingRule, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      trigger: formData.trigger,
      recipients: formData.recipients,
      channels: formData.channels,
      enabled: formData.enabled,
      template: formData.template,
      config: formData.threshold,
    };

    if (editingRule) {
      updateMutation.mutate(
        { id: editingRule.id, payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(payload as any, { onSuccess: () => onClose() });
    }
  };

  const getThresholdInput = () => {
    switch (formData.trigger) {
      case 'consecutive_absence':
        return (
          <div className="space-y-2">
            <Label htmlFor="threshold-days">{t('thresholdDays')}</Label>
            <Input
              id="threshold-days"
              type="number"
              min="1"
              max="30"
              value={formData.threshold.days}
              onChange={(e) => setFormData({
                ...formData,
                threshold: { ...formData.threshold, days: Number(e.target.value) },
              })}
            />
          </div>
        );
      case 'low_attendance_rate':
      case 'low_grade':
        return (
          <div className="space-y-2">
            <Label htmlFor="threshold-percent">{t('thresholdPercent')}</Label>
            <Input
              id="threshold-percent"
              type="number"
              min="0"
              max="100"
              value={formData.threshold.percentage}
              onChange={(e) => setFormData({
                ...formData,
                threshold: { ...formData.threshold, percentage: Number(e.target.value) },
              })}
            />
          </div>
        );
      case 'fee_overdue':
        return (
          <div className="space-y-2">
            <Label htmlFor="threshold-fee-days">{t('thresholdFeeDays')}</Label>
            <Input
              id="threshold-fee-days"
              type="number"
              min="0"
              max="90"
              value={formData.threshold.days}
              onChange={(e) => setFormData({
                ...formData,
                threshold: { ...formData.threshold, days: Number(e.target.value) },
              })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const TriggerIcon = TRIGGER_TYPES.find((t) => t.value === formData.trigger)?.icon || Bell;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="bg-primary/5 px-8 pt-8 pb-6 border-b border-primary/10 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-black italic">
            <div className="bg-primary/10 p-2 rounded-xl">
              <TriggerIcon className="h-5 w-5 text-primary" />
            </div>
            {editingRule ? t('editTitle') : t('addTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest opacity-70">
            {editingRule ? t('editDescription') : t('addDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 min-h-0 bg-slate-50/30">
          <form id="alert-rule-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('ruleName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('ruleNamePlaceholder')}
                required
                className="h-12 rounded-xl border-slate-200 focus:ring-primary/20 shadow-sm"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="trigger" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('triggerType')}</Label>
              <Select value={formData.trigger} onValueChange={(v) => setFormData({ ...formData, trigger: v })}>
                <SelectTrigger id="trigger" className="h-12 rounded-xl border-slate-200 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TRIGGER_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value} className="rounded-lg">
                        <div className="flex items-center gap-2 font-medium">
                          <Icon className="h-4 w-4 text-primary/70" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {getThresholdInput()}

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('channels')}</Label>
              <div className="flex flex-wrap gap-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                {['in_app', 'sms', 'email'].map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel}`}
                      checked={formData.channels.includes(channel as any)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          channels: checked
                            ? [...formData.channels, channel as any]
                            : formData.channels.filter((c) => c !== channel),
                        });
                      }}
                      className="rounded-md"
                    />
                    <label htmlFor={`channel-${channel}`} className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      {t(`channelTypes.${channel}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('recipients')}</Label>
              <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                {['guardian', 'teacher', 'director', 'admin'].map((recipient) => (
                  <div key={recipient} className="flex items-center space-x-2">
                    <Checkbox
                      id={`recipient-${recipient}`}
                      checked={formData.recipients.includes(recipient as any)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          recipients: checked
                            ? [...formData.recipients, recipient as any]
                            : formData.recipients.filter((r) => r !== recipient),
                        });
                      }}
                      className="rounded-md"
                    />
                    <label htmlFor={`recipient-${recipient}`} className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      {t(`recipients.${recipient}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="template" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('messageTemplate')}</Label>
              <Input
                id="template"
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                placeholder={t('templatePlaceholder')}
                className="h-12 rounded-xl border-slate-200 focus:ring-primary/20 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Label htmlFor="enabled" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('enabled')}</Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>
          </form>
        </div>

        <DialogFooter className="px-8 py-6 bg-white border-t shrink-0 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl h-11 px-6 font-bold">
            {tc('cancel')}
          </Button>
          <Button type="submit" form="alert-rule-form" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl h-11 px-8 font-black shadow-lg shadow-primary/20">
            {createMutation.isPending || updateMutation.isPending ? t('saving') : tc('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
