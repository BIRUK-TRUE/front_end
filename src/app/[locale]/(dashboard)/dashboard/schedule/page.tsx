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
import { useDeleteScheduleEntry } from '@/features/schedule/api/useSchedule';
import { TimetableGrid } from '@/features/schedule/components/TimetableGrid';
import { AddPeriodModal } from '@/features/schedule/components/AddPeriodModal';
import { EditPeriodModal } from '@/features/schedule/components/EditPeriodModal';
import { EmptyState } from '@/components/shared/empty-state';
import { CalendarDays } from 'lucide-react';
import type { ScheduleEntry } from '@/features/schedule/types';
import { ProtectedRoute } from '@/components/auth/protected-route';

function SchedulePageContent() {
  const t = useTranslations('schedule');
  const ts = useTranslations('schedulePage');

  const [yearId, setYearId] = useState<string>('');
  const [termId, setTermId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [prefillDay, setPrefillDay] = useState<number | undefined>();
  const [prefillTime, setPrefillTime] = useState<string | undefined>();

  const { data: years } = useAcademicYears(1, 50);
  const { data: terms } = useTerms(yearId);
  const { data: classesData } = useClasses(yearId, 1, 50);
  
  const selectedClass = classesData?.items?.find((c: any) => c.id === classId);

  const { data: scheduleData, isLoading } = useSectionSchedule(sectionId, termId);
  const deleteMutation = useDeleteScheduleEntry();

  const handleAddPeriod = (day: number, time: string) => {
    setPrefillDay(day);
    setPrefillTime(time);
    setIsAddModalOpen(true);
  };

  const handleEditPeriod = (entry: ScheduleEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDeletePeriod = (entry: ScheduleEntry) => {
    deleteMutation.mutate(entry.id);
  };

  const handleAddPeriodClick = () => {
    setPrefillDay(undefined);
    setPrefillTime(undefined);
    setIsAddModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={ts('title')}
        description={ts('description')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              {ts('print')}
            </Button>
            <Button className="gap-2" onClick={handleAddPeriodClick}>
              <Plus className="h-4 w-4" />
              {ts('addPeriod')}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl border shadow-sm">
        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">{ts('academicYear')}</label>
          <Select value={yearId} onValueChange={(v) => { setYearId(v); setTermId(''); }}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={ts('selectYear')} />
            </SelectTrigger>
            <SelectContent>
              {years?.items?.map((y: any) => (
                <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">{ts('term')}</label>
          <Select value={termId} onValueChange={setTermId} disabled={!yearId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={ts('selectTerm')} />
            </SelectTrigger>
            <SelectContent>
              {terms?.items?.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">{ts('class')}</label>
          <Select value={classId} onValueChange={(v) => { setClassId(v); setSectionId(''); }}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={ts('selectClass')} />
            </SelectTrigger>
            <SelectContent>
              {classesData?.items?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase ml-1">{ts('section')}</label>
          <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={ts('selectSection')} />
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
          title={ts('selectSectionAndTermTitle')}
          description={ts('selectSectionAndTermDescription')}
        />
      ) : (
        <TimetableGrid
          entries={scheduleData || []}
          isLoading={isLoading}
          isEditable={true}
          sectionId={sectionId}
          termId={termId}
          onAddPeriod={handleAddPeriod}
          onEditPeriod={handleEditPeriod}
          onDeletePeriod={handleDeletePeriod}
        />
      )}

      {/* Add Period Modal */}
      {sectionId && termId && (
        <AddPeriodModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          sectionId={sectionId}
          termId={termId}
          existingEntries={scheduleData || []}
          prefillDay={prefillDay}
          prefillTime={prefillTime}
        />
      )}

      {/* Edit Period Modal */}
      {sectionId && termId && (
        <EditPeriodModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          entry={selectedEntry}
          sectionId={sectionId}
          termId={termId}
          existingEntries={scheduleData || []}
        />
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <ProtectedRoute requireRoles={['admin', 'registrar']}>
      <SchedulePageContent />
    </ProtectedRoute>
  );
}
