'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ViewMode } from '../types';

interface TimetableViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedId?: string;
  onSelectedIdChange: (id: string) => void;
  termId: string;
  onTermIdChange: (termId: string) => void;
  sections?: Array<{ id: string; name: string }>;
  teachers?: Array<{ id: string; name: string }>;
  classrooms?: Array<{ id: string; name: string }>;
  terms?: Array<{ id: string; name: string }>;
}

export function TimetableViewSwitcher({
  viewMode,
  onViewModeChange,
  selectedId,
  onSelectedIdChange,
  termId,
  onTermIdChange,
  sections = [],
  teachers = [],
  classrooms = [],
  terms = [],
}: TimetableViewSwitcherProps) {
  const t = useTranslations('schedule');

  const getOptions = () => {
    switch (viewMode) {
      case 'section':
        return sections;
      case 'teacher':
        return teachers;
      case 'classroom':
        return classrooms;
      default:
        return [];
    }
  };

  const getPlaceholder = () => {
    switch (viewMode) {
      case 'section':
        return t('selectSection');
      case 'teacher':
        return t('selectTeacher');
      case 'classroom':
        return t('selectClassroom');
      default:
        return t('select');
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="section">{t('sectionView')}</TabsTrigger>
          <TabsTrigger value="teacher">{t('teacherView')}</TabsTrigger>
          <TabsTrigger value="classroom">{t('classroomView')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Entity Selector */}
      <Select value={selectedId} onValueChange={onSelectedIdChange}>
        <SelectTrigger className="w-full sm:w-[250px]">
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>
        <SelectContent>
          {getOptions().map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Term Selector */}
      <Select value={termId} onValueChange={onTermIdChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder={t('selectTerm')} />
        </SelectTrigger>
        <SelectContent>
          {terms.map((term) => (
            <SelectItem key={term.id} value={term.id}>
              {term.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
