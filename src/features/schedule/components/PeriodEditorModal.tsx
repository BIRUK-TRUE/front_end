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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useCreateSchedulePeriod,
  useUpdateSchedulePeriod,
  useValidateSchedulePeriod,
} from '../api/useSchedule';
import type { SchedulePeriod, CreateSchedulePeriodPayload } from '../types';
import { toast } from 'sonner';

interface PeriodEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period?: SchedulePeriod | null;
  termId: string;
  onSuccess?: () => void;
}

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

export function PeriodEditorModal({
  open,
  onOpenChange,
  period,
  termId,
  onSuccess,
}: PeriodEditorModalProps) {
  const t = useTranslations('schedule');
  const tc = useTranslations('common');
  
  const isEditing = !!period;
  
  const [formData, setFormData] = useState<Partial<CreateSchedulePeriodPayload>>({
    teacher_subject_id: '',
    classroom_id: undefined,
    day_of_week: 1,
    period_number: 1,
    start_time: '08:00:00',
    end_time: '09:00:00',
  });
  
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  const createMutation = useCreateSchedulePeriod();
  const updateMutation = useUpdateSchedulePeriod();
  const validateMutation = useValidateSchedulePeriod();

  // Initialize form when editing
  useEffect(() => {
    if (period) {
      setFormData({
        teacher_subject_id: period.teacher_subject_id,
        classroom_id: period.classroom_id,
        day_of_week: period.day_of_week,
        period_number: period.period_number,
        start_time: period.start_time,
        end_time: period.end_time,
      });
    } else {
      setFormData({
        teacher_subject_id: '',
        classroom_id: undefined,
        day_of_week: 1,
        period_number: 1,
        start_time: '08:00:00',
        end_time: '09:00:00',
      });
    }
    setConflicts([]);
  }, [period, open]);

  const handleValidate = async () => {
    if (!formData.teacher_subject_id || !formData.day_of_week || !formData.start_time || !formData.end_time) {
      return;
    }

    try {
      const result = await validateMutation.mutateAsync({
        teacher_subject_id: formData.teacher_subject_id,
        day_of_week: formData.day_of_week!,
        start_time: formData.start_time,
        end_time: formData.end_time,
        classroom_id: formData.classroom_id,
      });
      
      setConflicts(result.conflicts);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.teacher_subject_id) {
      toast.error(tc('validationError'), {
        description: 'Teacher-subject assignment is required',
      });
      return;
    }

    try {
      const payload: CreateSchedulePeriodPayload = {
        teacher_subject_id: formData.teacher_subject_id!,
        classroom_id: formData.classroom_id,
        term_id: termId,
        day_of_week: formData.day_of_week!,
        period_number: formData.period_number!,
        start_time: formData.start_time!,
        end_time: formData.end_time!,
      };

      if (isEditing && period) {
        await updateMutation.mutateAsync({
          id: period.id,
          payload: {
            classroom_id: formData.classroom_id,
            day_of_week: formData.day_of_week,
            period_number: formData.period_number,
            start_time: formData.start_time,
            end_time: formData.end_time,
          },
        });
        toast.success(t('periodUpdated'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('periodCreated'));
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const conflicts = error.response?.data?.detail?.conflicts;
      if (conflicts) {
        setConflicts(conflicts);
        toast.error(t('hasConflicts'));
      } else {
        toast.error(isEditing ? t('updateFailed') : t('createFailed'), {
          description: error.response?.data?.detail || tc('unknownError'),
        });
      }
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || validateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editPeriod') : t('addPeriod')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('editPeriodDescription') : t('addPeriodDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Teacher-Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher-subject">{t('teacherSubject')}</Label>
            <Input
              id="teacher-subject"
              placeholder="Enter teacher-subject ID"
              value={formData.teacher_subject_id || ''}
              onChange={(e) => setFormData({ ...formData, teacher_subject_id: e.target.value })}
              onBlur={handleValidate}
            />
            <p className="text-xs text-muted-foreground">
              Note: In production, this would be a dropdown of available assignments
            </p>
          </div>

          {/* Classroom Selection */}
          <div className="space-y-2">
            <Label htmlFor="classroom">{t('classroom')} ({tc('optional')})</Label>
            <Input
              id="classroom"
              placeholder="Enter classroom ID"
              value={formData.classroom_id || ''}
              onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value || undefined })}
              onBlur={handleValidate}
            />
          </div>

          {/* Day and Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">{t('dayOfWeek')}</Label>
              <Select
                value={formData.day_of_week?.toString()}
                onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period-number">{t('periodNumber')}</Label>
              <Select
                value={formData.period_number?.toString()}
                onValueChange={(value) => setFormData({ ...formData, period_number: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Period {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">{t('startTime')}</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.start_time?.substring(0, 5) || ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value + ':00' })}
                onBlur={handleValidate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">{t('endTime')}</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.end_time?.substring(0, 5) || ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value + ':00' })}
                onBlur={handleValidate}
              />
            </div>
          </div>

          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">{t('schedulingConflicts')}:</p>
                  <ul className="list-inside list-disc text-sm">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx}>{conflict}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tc('saving')}
              </>
            ) : (
              isEditing ? tc('save') : tc('create')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
