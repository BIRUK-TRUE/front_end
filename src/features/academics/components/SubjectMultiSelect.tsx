'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Search, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Subject {
  id: string;
  code: string;
  name: string;
  category: string;
  is_active: boolean;
}

interface SubjectMultiSelectProps {
  selectedSubjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  academicYearId?: string;
}

export function SubjectMultiSelect({
  selectedSubjects,
  onSubjectsChange,
  academicYearId,
}: SubjectMultiSelectProps) {
  const t = useTranslations('common');
  const ta = useTranslations('academics');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all active subjects
  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ['subjects', 'active', search],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/subjects', {
        params: {
          is_active: true,
          search: search || undefined,
          size: 100,
        },
      });
      return data.items as Subject[];
    },
    enabled: open,
  });

  const availableSubjects = subjectsData?.filter(
    (subject) => !selectedSubjects.find((s) => s.id === subject.id)
  ) || [];

  const handleSelectSubject = (subject: Subject) => {
    onSubjectsChange([...selectedSubjects, subject]);
    setSearch('');
  };

  const handleRemoveSubject = (subjectId: string) => {
    onSubjectsChange(selectedSubjects.filter((s) => s.id !== subjectId));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'elective':
        return 'bg-info/10 text-info border-info/20';
      case 'vocational':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'extracurricular':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Subjects Badges */}
      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSubjects.map((subject) => (
            <Badge
              key={subject.id}
              variant="outline"
              className={cn(
                'flex items-center gap-1 px-2 py-1',
                getCategoryColor(subject.category)
              )}
            >
              <BookOpen className="h-3 w-3" />
              <span className="font-mono text-xs">{subject.code}</span>
              <span className="max-w-[150px] truncate">{subject.name}</span>
              <button
                onClick={() => handleRemoveSubject(subject.id)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Remove ${subject.name}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Subject Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            <span className="text-muted-foreground">
              {selectedSubjects.length > 0
                ? `${selectedSubjects.length} ${t('subjectsSelected')}`
                : t('selectSubjects')}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={ta('filterSubjects')}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <LoadingSpinner />
                  </div>
                ) : availableSubjects.length === 0 ? (
                  <CommandEmpty>
                    {search ? ta('noSubjectsFound') : t('noAvailableSubjects')}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {availableSubjects.map((subject) => (
                      <CommandItem
                        key={subject.id}
                        value={`${subject.code} ${subject.name}`}
                        onSelect={() => handleSelectSubject(subject)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {subject.code}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs capitalize',
                            getCategoryColor(subject.category)
                          )}
                        >
                          {subject.category}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
