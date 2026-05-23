'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGenerateTimetable } from '../api/useSchedule';
import { toast } from 'sonner';

interface TimetableGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termId: string;
  onSuccess?: () => void;
}

export function TimetableGeneratorDialog({
  open,
  onOpenChange,
  termId,
  onSuccess,
}: TimetableGeneratorDialogProps) {
  const t = useTranslations('schedule');
  const tc = useTranslations('common');
  
  const [clearExisting, setClearExisting] = useState(true);
  const generateMutation = useGenerateTimetable();

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({
        term_id: termId,
        strategy: 'greedy',
      });
      
      toast.success(t('generationSuccess'), {
        description: `${generateMutation.data?.periods_created || 0} periods created`,
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(t('generationFailed'), {
        description: error.response?.data?.detail || t('generationError'),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('generateTimetable')}</DialogTitle>
          <DialogDescription>
            {t('generateDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('generateWarning')}
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="clear-existing"
              checked={clearExisting}
              onCheckedChange={(checked) => setClearExisting(checked as boolean)}
            />
            <Label htmlFor="clear-existing" className="text-sm">
              {t('clearExistingTimetable')}
            </Label>
          </div>

          {generateMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">
                {t('generating')}
              </span>
            </div>
          )}

          {generateMutation.isSuccess && generateMutation.data && (
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{t('generationComplete')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('periodsCreated')}:</span>
                  <span className="ml-2 font-medium">{generateMutation.data.periods_created}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('conflictsAvoided')}:</span>
                  <span className="ml-2 font-medium">{generateMutation.data.conflicts_avoided}</span>
                </div>
              </div>

              {generateMutation.data.warnings.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('warnings')}:</Label>
                  <ul className="list-inside list-disc space-y-1 text-xs text-amber-600">
                    {generateMutation.data.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('cancel')}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('generating')}
              </>
            ) : (
              t('generate')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
