'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardCheck, 
  ScanFace, 
  ScanLine,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceMethodSelectorProps {
  onSelect: (method: 'manual' | 'face' | 'barcode') => void;
  className?: string;
}

export function AttendanceMethodSelector({ onSelect, className }: AttendanceMethodSelectorProps) {
  const t = useTranslations('faceAttendance.methodSelector');

  const methods = [
    {
      id: 'manual' as const,
      title: t('manual'),
      description: t('manualDesc'),
      icon: ClipboardCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'face' as const,
      title: t('faceScan'),
      description: t('faceScanDesc'),
      icon: ScanFace,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'barcode' as const,
      title: t('barcode'),
      description: t('barcodeDesc'),
      icon: ScanLine,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {methods.map((method) => {
        const Icon = method.icon;
        return (
          <Card 
            key={method.id}
            className="group cursor-pointer hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => onSelect(method.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className={cn("p-4 rounded-2xl transition-colors group-hover:scale-110", method.bgColor)}>
                <Icon className={cn("h-8 w-8", method.color)} />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{method.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {method.description}
                </p>
              </div>
              <Button variant="ghost" className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground">
                <span>Select Method</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
