'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Edit2, 
  Users, 
  Zap,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck
} from 'lucide-react';
import type { AlertRule } from '../types';
import { cn } from '@/lib/utils';

interface AlertRuleCardProps {
  rule: AlertRule;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
}

const triggerIcons: Record<string, any> = {
  absenceAlert: AlertTriangle,
  lateArrival: Clock,
  lowGrade: Zap,
  consecutiveAbsence: Users,
  lowAttendance: Bell,
  feeDueReminder: FileText,
  feeOverdue: UserCheck,
};

export function AlertRuleCard({ rule, onToggle, onEdit }: AlertRuleCardProps) {
  const t = useTranslations('notifications.alertRules');
  const Icon = triggerIcons[rule.id] || Bell;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      !rule.enabled && "opacity-75 grayscale-[0.5]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl",
            rule.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{t(`rules.${rule.id}`)}</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider font-semibold opacity-70">
              {t('trigger')}: {rule.trigger}
            </CardDescription>
          </div>
        </div>
        <Switch 
          checked={rule.enabled} 
          onCheckedChange={onToggle}
          aria-label={t(rule.enabled ? 'enabled' : 'disabled')}
        />
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('recipients')}</p>
          <div className="flex flex-wrap gap-2">
            {rule.recipients.map(recipient => (
              <Badge key={recipient} variant="secondary" className="px-2 py-0.5 rounded-md text-[10px]">
                {t(`recipientTypes.${recipient}`)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('channels')}</p>
          <div className="flex items-center gap-4">
            <div className={cn("flex items-center gap-1.5 text-xs", rule.channels.includes('in_app') ? "text-primary" : "text-muted-foreground/40")}>
              <Bell className="h-4 w-4" />
              <span>{t('channelTypes.in_app')}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 text-xs", rule.channels.includes('sms') ? "text-primary" : "text-muted-foreground/40")}>
              <MessageSquare className="h-4 w-4" />
              <span>{t('channelTypes.sms')}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 text-xs", rule.channels.includes('email') ? "text-primary" : "text-muted-foreground/40")}>
              <Mail className="h-4 w-4" />
              <span>{t('channelTypes.email')}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg border border-muted-foreground/10 text-sm italic text-muted-foreground">
          "{rule.template}"
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/10 px-6 py-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2 rounded-xl h-9 text-xs font-bold"
          onClick={onEdit}
        >
          <Edit2 className="h-3.5 w-3.5" />
          {t('editRule')}
        </Button>
      </CardFooter>
    </Card>
  );
}
