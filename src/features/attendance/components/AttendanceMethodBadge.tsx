'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, ScanFace, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceMethodBadgeProps {
  method: 'face' | 'barcode' | 'manual';
  className?: string;
}

export function AttendanceMethodBadge({ method, className }: AttendanceMethodBadgeProps) {
  const t = useTranslations('attendancePage');
  const configs = {
    face: {
      label: t('methodFace'),
      icon: ScanFace,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    barcode: {
      label: t('methodBarcode'),
      icon: ScanLine,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    manual: {
      label: t('methodManual'),
      icon: ClipboardCheck,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
  };

  const config = configs[method];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1 font-medium select-none capitalize", config.color, className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
