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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';
import { useSubjects } from '@/features/academics/api/useSubjects';
import { useTeachers } from '@/features/teachers/api/useTeachers';
import { useCreateScheduleEntry } from '../api/useSchedule';
import type { ScheduleEntry } from '../types';

interface AddPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  termId: string;
  existingEntries: ScheduleEntry[];
  prefillDay?: number;
  prefillTime?: string;
}

const DAYS = [
  { value: 1, label: 'Monday', key: 'monday' },
  { value: 2, label: 'Tuesday', key: 'tuesday' },
  { value: 3, label: 'Wednesday', key: 'wednesday' },
  { value: 4, label: 'Thursday', key: 'thursday' },
  { value: 5, label: 'Friday', key: 'friday' },
];

// Ethiopian school period times
const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '08:00', end: '08:50' },
  2: { start: '08:55', end: '09:45' },
  3: { start: '09:50', end: '10:40' },
  4: { start: '11:00', end: '11:50' },
  5: { start: '11:55', end: '12:45' },
  6: { start: '13:30', end: '14:20' },
  7: { start: '14:25', end: '15:15' },
  8: { start: '15:20', end: '16:00' },
};

export function AddPeriodModal({
  isOpen,
  onClose,
  sectionId,
  termId,
  existingEntries,
  prefillDay,
  prefillTime,
}: AddPeriodModalProps) {
  const t = useTranslations('schedule.modal');
  const td = useTranslations('common.days');

  const [dayOfWeek, setDayOfWeek] = useState<number>(prefillDay || 1);
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>(prefillTime || '08:00');
  const [endTime, setEndTime] = useState<string>('08:50');
  const [subjectId, setSubjectId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [conflict, setConflict] = useState<string | null>(null);
  const [overrideConflict, setOverrideConflict] = useState(false);

  const { data: subjectsData } = useSubjects({ page: 1, size: 100 });
  const { data: teachersData } = useTeachers({ is_active: true, page: 1, size: 100 });
  const createMutation = useCreateScheduleEntry();

  // Auto-fill times when period number changes
  useEffect(() => {
    if (PERIOD_TIMES[periodNumber]) {
      setStartTime(PERIOD_TIMES[periodNumber].start);
      setEndTime(PERIOD_TIMES[periodNumber].end);
    }
  }, [periodNumber]);

  // Conflict detection
  useEffect(() => {
    if (overrideConflict) {
      setConflict(null);
      return;
    }

    const newStart = startTime;
    const newEnd = endTime;

    // Check section conflict (same day, same time slot)
    const sectionConflict = existingEntries.find(
      (e) =>
        e.day_of_week === dayOfWeek &&
        timesOverlap(e.start_time, e.end_time, newStart, newEnd)
    );

    if (sectionConflict) {
      setConflict(
        t('conflict.sectionSlot', {
          subject: sectionConflict.subject_name,
          day: td(DAYS.find((d) => d.value === dayOfWeek)?.key || 'monday'),
        })
      );
      return;
    }

    // Check teacher conflict (same day, overlapping time)
    if (teacherId) {
      const teacherConflict = existingEntries.find(
        (e) =>
          e.teacher_id === teacherId &&
          e.day_of_week === dayOfWeek &&
          timesOverlap(e.start_time, e.end_time, newStart, newEnd)
      );

      if (teacherConflict) {
        setConflict(
          t('conflict.teacherTime', {
            teacher: teacherConflict.teacher_name,
            subject: teacherConflict.subject_name,
            section: teacherConflict.section_name,
          })
        );
        return;
      }
    }

    setConflict(null);
  }, [dayOfWeek, startTime, endTime, teacherId, existingEntries, overrideConflict, t, td]);

  const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return s1 < e2 && e1 > s2;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId || !teacherId) {
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setConflict(t('conflict.invalidTime'));
      return;
    }

    if (conflict && !overrideConflict) {
      setOverrideConflict(true);
      return;
    }

    try {
      await createMutation.mutateAsync({
        section_id: sectionId,
        subject_id: subjectId,
        teacher_id: teacherId,
        term_id: termId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        room_number: room || undefined,
      });
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setDayOfWeek(prefillDay || 1);
    setPeriodNumber(1);
    setStartTime(prefillTime || '08:00');
    setEndTime('08:50');
    setSubjectId('');
    setTeacherId('');
    setRoom('');
    setConflict(null);
    setOverrideConflict(false);
    onClose();
  };

  const selectedTeacher = teachersData?.items?.find((t: any) => t.id === teacherId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addTitle')}</DialogTitle>
          <DialogDescription>{t('addDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {conflict && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conflict}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">{t('dayOfWeek')}</Label>
              <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger id="day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {td(day.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">{t('periodNumber')}</Label>
              <Select value={periodNumber.toString()} onValueChange={(v) => setPeriodNumber(Number(v))}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">{t('startTime')}</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">{t('endTime')}</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{t('periodTimeHint')}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">{t('subject')}</Label>
            <Select value={subjectId} onValueChange={setSubjectId} required>
              <SelectTrigger id="subject">
                <SelectValue placeholder={t('selectSubject')} />
              </SelectTrigger>
              <SelectContent>
                {subjectsData?.items?.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">{t('teacher')}</Label>
            <Select value={teacherId} onValueChange={setTeacherId} required>
              <SelectTrigger id="teacher">
                <SelectValue placeholder={t('selectTeacher')} />
              </SelectTrigger>
              <SelectContent>
                {teachersData?.items?.map((teacher: any) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex flex-col">
                      <span>{teacher.full_name}</span>
                      {teacher.specialization && (
                        <span className="text-xs text-muted-foreground">
                          {teacher.specialization}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTeacher?.specialization && (
              <p className="text-xs text-muted-foreground">
                {t('specialization')}: {selectedTeacher.specialization}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">{t('room')} ({t('optional')})</Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder={t('roomPlaceholder')}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
