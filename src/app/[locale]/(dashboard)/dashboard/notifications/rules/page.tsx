'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Mail,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useAlertRules, useDeleteAlertRule, useUpdateAlertRule } from '@/features/notifications/api/useNotifications';
import { AlertRuleFormModal } from '@/features/notifications/components/AlertRuleFormModal';
import type { AlertRule } from '@/features/notifications/types';
import { formatDistanceToNow } from 'date-fns';

export default function AlertRulesPage() {
  const t = useTranslations('notifications.alertRules');
  const tc = useTranslations('common');

  const { data: rules, isLoading } = useAlertRules();
  const deleteMutation = useDeleteAlertRule();
  const updateMutation = useUpdateAlertRule();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const handleToggleActive = (rule: AlertRule) => {
    updateMutation.mutate({
      id: rule.id,
      payload: { enabled: !rule.enabled },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'consecutive_absence': return <AlertTriangle className="h-5 w-5" />;
      case 'low_attendance_rate': return <TrendingDown className="h-5 w-5" />;
      case 'low_grade': return <TrendingDown className="h-5 w-5" />;
      case 'fee_overdue': return <Calendar className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'consecutive_absence': return t('triggers.consecutiveAbsence');
      case 'low_attendance_rate': return t('triggers.lowAttendanceRate');
      case 'low_grade': return t('triggers.lowGrade');
      case 'fee_overdue': return t('triggers.feeOverdue');
      default: return trigger;
    }
  };

  const getThresholdDisplay = (rule: AlertRule) => {
    const config = rule.config || {};
    switch (rule.trigger) {
      case 'consecutive_absence': return t('threshold.absence', { days: config.days || 3 });
      case 'low_attendance_rate': return t('threshold.attendance', { percent: config.percentage || 75 });
      case 'low_grade': return t('threshold.grade', { percent: config.percentage || 60 });
      case 'fee_overdue': return t('threshold.fee', { days: config.days || 30 });
      default: return '-';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button className="gap-2" onClick={() => { setEditingRule(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            {t('addRule')}
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-r-transparent" />
        </div>
      ) : rules && rules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => (
            <Card key={rule.id} className={`overflow-hidden ${rule.enabled ? 'border-primary/50' : 'opacity-60'}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      {getTriggerIcon(rule.trigger)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {getTriggerLabel(rule.trigger)}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => handleToggleActive(rule)}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{getThresholdDisplay(rule)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rule.channels.map((channel) => (
                    <Badge key={channel} variant="outline" className="gap-1">
                      {channel === 'in_app' && <Bell className="h-3 w-3" />}
                      {channel === 'sms' && <MessageSquare className="h-3 w-3" />}
                      {channel === 'email' && <Mail className="h-3 w-3" />}
                      {t(`channelTypes.${channel}`)}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {rule.recipients.map((recipient) => (
                    <Badge key={recipient} variant="secondary" className="text-xs">
                      {t(`recipients.${recipient}`)}
                    </Badge>
                  ))}
                </div>

                {rule.config?.lastTriggered && (
                  <div className="text-xs text-muted-foreground">
                    {t('lastTriggered')}: {formatDistanceToNow(new Date(rule.config.lastTriggered as string), { addSuffix: true })}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/20 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {tc('edit')}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(rule.id)}
                  disabled={deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tc('delete')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noRules')}</h3>
            <p className="text-muted-foreground mb-4">{t('noRulesDescription')}</p>
            <Button onClick={() => { setEditingRule(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addRule')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alert Rule Form Modal */}
      <AlertRuleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingRule={editingRule}
      />
    </div>
  );
}
