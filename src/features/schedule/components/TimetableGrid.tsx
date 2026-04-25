'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type ScheduleEntry } from '../types';

interface TimetableGridProps {
  entries: ScheduleEntry[];
  isLoading?: boolean;
}

const DAYS = [
  { value: 1, key: 'monday' },
  { value: 2, key: 'tuesday' },
  { value: 3, key: 'wednesday' },
  { value: 4, key: 'thursday' },
  { value: 5, key: 'friday' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'
];

export function TimetableGrid({ entries, isLoading }: TimetableGridProps) {
  const t = useTranslations('common.days');
  const tc = useTranslations('common');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  // Group entries by day and then by start time matching a slot roughly
  const getEntryForSlot = (dayValue: number, timeSlot: string) => {
    return entries.find(e => e.day_of_week === dayValue && e.start_time.startsWith(timeSlot));
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-6 border-b bg-muted/50">
          <div className="p-4 font-semibold text-center border-r text-muted-foreground">Time</div>
          {DAYS.map(day => (
            <div key={day.value} className="p-4 font-semibold text-center border-r last:border-0">
              {t(day.key)}
            </div>
          ))}
        </div>

        {/* Timetable Body */}
        <div className="flex flex-col">
          {TIME_SLOTS.map((time, idx) => (
            <div key={time} className="grid grid-cols-6 border-b last:border-0 hover:bg-muted/10 transition-colors">
              <div className="p-4 font-medium text-center border-r text-muted-foreground flex items-center justify-center bg-muted/20">
                {time}
                {idx < TIME_SLOTS.length - 1 && (
                  <span className="text-xs ml-1 opacity-50">- {TIME_SLOTS[idx+1]}</span>
                )}
              </div>
              
              {DAYS.map(day => {
                const entry = getEntryForSlot(day.value, time);
                return (
                  <div key={`${day.value}-${time}`} className="p-3 border-r last:border-0 relative min-h-[100px]">
                    {entry ? (
                      <Card className="h-full bg-primary/5 border-primary/20 shadow-none hover:shadow-md transition-shadow cursor-default overflow-hidden">
                        <CardContent className="p-3 flex flex-col items-start gap-1">
                          <Badge className="bg-primary hover:bg-primary text-xs">
                            {entry.subject_name}
                          </Badge>
                          <div className="text-sm font-medium mt-1 line-clamp-1">
                            {entry.teacher_name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-auto">
                            {tc('room')} {entry.room_number || tc('tba')}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="w-full h-full rounded border border-dashed border-muted flex items-center justify-center bg-muted/5 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-xs text-muted-foreground">{tc('add')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
