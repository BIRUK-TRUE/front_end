'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type ScheduleEntry } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TimetableGridProps {
  entries: ScheduleEntry[];
  isLoading?: boolean;
  isEditable?: boolean;
  sectionId?: string;
  termId?: string;
  onAddPeriod?: (day: number, time: string) => void;
  onEditPeriod?: (entry: ScheduleEntry) => void;
  onDeletePeriod?: (entry: ScheduleEntry) => void;
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

export function TimetableGrid({ 
  entries, 
  isLoading, 
  isEditable = false,
  onAddPeriod,
  onEditPeriod,
  onDeletePeriod 
}: TimetableGridProps) {
  const t = useTranslations('common.days');
  const tc = useTranslations('common');
  const ts = useTranslations('schedule.grid');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ScheduleEntry | null>(null);

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

  const handleDeleteClick = (entry: ScheduleEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete && onDeletePeriod) {
      onDeletePeriod(entryToDelete);
    }
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 border-b bg-muted/50">
            <div className="p-4 font-semibold text-center border-r text-muted-foreground">{tc('time')}</div>
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
                        <div className="relative group h-full">
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
                          {isEditable && (
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-6 w-6 p-0"
                                onClick={() => onEditPeriod?.(entry)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeleteClick(entry)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className={`w-full h-full rounded border border-dashed border-muted flex items-center justify-center bg-muted/5 transition-colors ${
                            isEditable ? 'cursor-pointer hover:bg-muted/20 hover:border-primary/50' : ''
                          }`}
                          onClick={() => isEditable && onAddPeriod?.(day.value, time)}
                        >
                          {isEditable && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Plus className="h-3 w-3" />
                              <span>{tc('add')}</span>
                            </div>
                          )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts('deleteTitle')}</DialogTitle>
            <DialogDescription>
              {entryToDelete && ts('deleteDescription', {
                subject: entryToDelete.subject_name,
                day: t(DAYS.find(d => d.value === entryToDelete.day_of_week)?.key || 'monday'),
                time: entryToDelete.start_time.substring(0, 5)
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {ts('deleteConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
