'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertRuleCard } from './AlertRuleCard';
import { AlertRuleEditModal } from './AlertRuleEditModal';
import { useAlertRules, useUpdateAlertRule, useToggleAlertRule } from '../api/useAlertRules';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Bell, Loader2 } from 'lucide-react';
import type { AlertRule } from '../types';

export function AlertRulesManager() {
  const t = useTranslations('notifications.alertRules');
  const { data: rules, isLoading } = useAlertRules();
  const updateRule = useUpdateAlertRule();
  const toggleRule = useToggleAlertRule();

  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!rules?.length) {
    return (
      <EmptyState 
        icon={Bell}
        title={t('title')}
        description={t('noRulesFound')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <AlertRuleCard 
            key={rule.id}
            rule={rule}
            onToggle={(enabled) => toggleRule.mutate({ ruleId: rule.id, enabled })}
            onEdit={() => setEditingRule(rule)}
          />
        ))}
      </div>

      <AlertRuleEditModal 
        rule={editingRule}
        isOpen={!!editingRule}
        onClose={() => setEditingRule(null)}
        isPending={updateRule.isPending}
        onSave={(data) => {
          if (editingRule) {
            updateRule.mutate({ ruleId: editingRule.id, ...data }, {
              onSuccess: () => setEditingRule(null)
            });
          }
        }}
      />
    </div>
  );
}
