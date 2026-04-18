'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Printer } from 'lucide-react';
import { useClasses } from '@/features/academics/api/useClasses';
import { useTerms } from '@/features/academics/api/useTerms';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useSectionSchedule } from '@/features/schedule/api/useSchedule';
import { TimetableGrid } from '@/features/schedule/components/TimetableGrid';
import { EmptyState } from '@/components/shared/empty-state';
import { CalendarDays } from 'lucide-react';

export default function SchedulePage() {
  const t = useTranslations('schedule');
  const tc = useTranslations('common');

  const [yearId, setYearId] = useState<string>('');
  const [termId, setTermId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');

  const { data: years } = useAcademicYears(1, 50);
  const { data: terms } = useTerms(yearId);
  const { data: classesData } = useClasses(yearId, 1, 50);
  
  const selectedClass = classesData?.items?.find((c: any) => c.id === classId);

  const { data: scheduleData, isLoading } = useSectionSchedule(sectionId, termId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Class Timetables"
        description="Manage and view the weekly schedule for specific classes and sections."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Period
            </Button>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl border shadow-sm">
        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">Academic Year</label>
          <Select value={yearId} onValueChange={(v) => { setYearId(v); setTermId(''); }}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years?.items?.map((y: any) => (
                <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">Term</label>
          <Select value={termId} onValueChange={setTermId} disabled={!yearId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              {terms?.items?.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">Class</label>
          <Select value={classId} onValueChange={(v) => { setClassId(v); setSectionId(''); }}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classesData?.items?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">Section</label>
          <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {selectedClass?.sections?.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!sectionId || !termId ? (
        <EmptyState
          icon={CalendarDays}
          title="Select a Section and Term"
          description="Use the filters above to view the timetable for a specific class section."
        />
      ) : (
        <TimetableGrid entries={scheduleData || []} isLoading={isLoading} />
      )}
    </div>
  );
}
