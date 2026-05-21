'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertTriangle, MinusCircle, Shield, CircleDollarSign } from 'lucide-react';

type StatusVariant =
  | 'active'
  | 'inactive'
  | 'graduated'
  | 'transferred'
  | 'expelled'
  | 'withdrawn'
  | 'on_leave'
  | 'suspended'
  | 'resigned'
  | 'retired'
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'unpaid';

const statusConfig: Record<
  StatusVariant,
  { icon: React.ElementType; className: string }
> = {
  active: { icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' },
  inactive: { icon: XCircle, className: 'bg-muted text-muted-foreground border-muted' },
  graduated: { icon: CheckCircle, className: 'bg-info/10 text-info border-info/20' },
  transferred: { icon: MinusCircle, className: 'bg-warning/10 text-warning border-warning/20' },
  expelled: { icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  withdrawn: { icon: MinusCircle, className: 'bg-muted text-muted-foreground border-muted' },
  on_leave: { icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
  suspended: { icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  resigned: { icon: MinusCircle, className: 'bg-muted text-muted-foreground border-muted' },
  retired: { icon: Shield, className: 'bg-info/10 text-info border-info/20' },
  present: { icon: CheckCircle, className: 'bg-status-present/10 text-status-present border-status-present/20' },
  absent: { icon: XCircle, className: 'bg-status-absent/10 text-status-absent border-status-absent/20' },
  late: { icon: Clock, className: 'bg-status-late/10 text-status-late border-status-late/20' },
  excused: { icon: Shield, className: 'bg-status-excused/10 text-status-excused border-status-excused/20' },
  paid: { icon: CheckCircle, className: 'bg-status-present/10 text-status-present border-status-present/20' },
  partial: { icon: CircleDollarSign, className: 'bg-status-late/10 text-status-late border-status-late/20' },
  overdue: { icon: AlertTriangle, className: 'bg-status-absent/10 text-status-absent border-status-absent/20' },
  unpaid: { icon: XCircle, className: 'bg-muted text-muted-foreground border-muted' },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status as StatusVariant] || statusConfig.inactive;
  const Icon = config.icon;
  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 rounded-full capitalize font-medium', config.className)}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {displayLabel}
    </Badge>
  );
}

interface RoleBadgeProps {
  role: string;
  label?: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  director: 'bg-info/10 text-info border-info/20',
  registrar: 'bg-success/10 text-success border-success/20',
  teacher: 'bg-warning/10 text-warning border-warning/20',
  student: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  guardian: 'bg-muted text-muted-foreground border-muted',
};

export function RoleBadge({ role, label }: RoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize font-medium',
        roleColors[role] || roleColors.guardian
      )}
    >
      {label || role}
    </Badge>
  );
}
