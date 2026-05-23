'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Wand2 } from 'lucide-react';
import { TimetableGrid } from '@/features/schedule/components/TimetableGrid';
import { TimetableGeneratorDialog } from '@/features/schedule/components/TimetableGeneratorDialog';
import { PeriodEditorModal } from '@/features/schedule/components/PeriodEditorModal';
import { TimetableViewSwitcher } from '@/features/schedule/components/TimetableViewSwitcher';
import { TimetableStats } from '@/features/schedule/components/TimetableStats';
import {
  useSectionTimetable,
  useTeacherTimetable,
  useClassroomTimetable,
  useDeleteSchedulePeriod,
} from '@/features/schedule/api/useSchedule';
import type { ViewMode, SchedulePeriod } from '@/features/schedule/types';
import { toast } from 'sonner';

export default function TimetablePage() {
  const t = useTranslations('schedule');
  const tc = useTranslations('common');
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('section');
  const [selectedId, setSelectedId] = useState<string>('');
  const [termId, setTermId] = useState<string>('');
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<SchedulePeriod | null>(null);

  // Fetch data based on view mode
  const { data: sectionPeriods, isLoading: sectionLoading } = useSectionTimetable(
    viewMode === 'section' ? selectedId : '',
    termId
  );
  
  const { data: teacherPeriods, isLoading: teacherLoading } = useTeacherTimetable(
    viewMode === 'teacher' ? selectedId : '',
    termId
  );
  
  const { data: classroomPeriods, isLoading: classroomLoading } = useClassroomTimetable(
    viewMode === 'classroom' ? selectedId : '',
    termId
  );

  const deleteMutation = useDeleteSchedulePeriod();

  // Get current periods based on view
  const currentPeriods = viewMode === 'section' 
    ? sectionPeriods 
    : viewMode === 'teacher'
    ? teacherPeriods
    : classroomPeriods;

  const isLoading = viewMode === 'section'
    ? sectionLoading
    : viewMode === 'teacher'
    ? teacherLoading
    : classroomLoading;

  // Calculate stats
  const stats = {
    totalPeriods: currentPeriods?.length || 0,
    totalTeachers: new Set(currentPeriods?.map(p => p.teacher_subject_id) || []).size,
    totalClassrooms: new Set(currentPeriods?.filter(p => p.classroom_id).map(p => p.classroom_id) || []).size,
    conflictsCount: 0, // Would need backend endpoint to calculate
  };

  // Handlers
  const handleAddPeriod = (day: number, time: string) => {
    setEditingPeriod(null);
    setEditorOpen(true);
  };

  const handleEditPeriod = (entry: any) => {
    // Convert ScheduleEntry to SchedulePeriod for editing
    // In production, you'd fetch the full period by ID
    setEditingPeriod(null);
    setEditorOpen(true);
  };

  const handleDeletePeriod = async (entry: any) => {
    try {
      await deleteMutation.mutateAsync(entry.id);
      toast.success(t('periodDeleted'));
    } catch (error) {
      toast.error(t('deleteFailed'), {
        description: tc('unknownError'),
      });
    }
  };

  const handleGenerationSuccess = () => {
    // Data will be refetched automatically by React Query
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('timetableManagement')}
        description={t('timetableDescription')}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setGeneratorOpen(true)}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              {t('autoGenerate')}
            </Button>
            <Button
              onClick={() => {
                setEditingPeriod(null);
                setEditorOpen(true);
              }}
              className="gap-2"
              disabled={!selectedId || !termId}
            >
              <Plus className="h-4 w-4" />
              {t('addPeriod')}
            </Button>
          </div>
        }
      />

      {/* Statistics */}
      <TimetableStats {...stats} />

      {/* View Switcher and Filters */}
      <TimetableViewSwitcher
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        termId={termId}
        onTermIdChange={setTermId}
        sections={[
          { id: '1', name: 'Grade 9-A' },
          { id: '2', name: 'Grade 9-B' },
          { id: '3', name: 'Grade 10-A' },
        ]}
        teachers={[
          { id: '1', name: 'John Smith' },
          { id: '2', name: 'Jane Doe' },
        ]}
        classrooms={[
          { id: '1', name: 'Room 101' },
          { id: '2', name: 'Lab 1' },
        ]}
        terms={[
          { id: '1', name: 'Term 1 - 2024/2025' },
          { id: '2', name: 'Term 2 - 2024/2025' },
        ]}
      />

      {/* Timetable Grid */}
      {!selectedId || !termId ? (
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
          <p className="text-muted-foreground">{t('selectEntityAndTerm')}</p>
        </div>
      ) : (
        <TimetableGrid
          entries={(currentPeriods || []).map((period) => ({
            id: period.id,
            section_id: '',
            section_name: period.section_name,
            subject_id: '',
            subject_name: period.subject_name,
            teacher_id: '',
            teacher_name: period.teacher_name,
            day_of_week: period.day_of_week,
            start_time: period.start_time,
            end_time: period.end_time,
            room_number: period.classroom_number,
            term_id: period.term_id,
          }))}
          isLoading={isLoading}
          isEditable={true}
          onAddPeriod={handleAddPeriod}
          onEditPeriod={handleEditPeriod}
          onDeletePeriod={handleDeletePeriod}
        />
      )}

      {/* Dialogs */}
      <TimetableGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        termId={termId}
        onSuccess={handleGenerationSuccess}
      />

      <PeriodEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        period={editingPeriod}
        termId={termId}
        onSuccess={() => {
          // Data will be refetched automatically
        }}
      />
    </div>
  );
}
