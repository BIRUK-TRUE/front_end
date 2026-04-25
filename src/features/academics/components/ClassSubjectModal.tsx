'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSubjects } from '@/features/academics/api/useSubjects';
import { type Subject } from '@/features/academics/types';
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
import { Badge } from '@/components/ui/badge';
import { Search, Check, Loader2, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface ClassSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedSubjectIds: string[];
  onAssign: (subjectId: string) => Promise<void>;
  onRemove: (subjectId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ClassSubjectModal({
  open,
  onOpenChange,
  assignedSubjectIds,
  onAssign,
  onRemove,
  isLoading,
}: ClassSubjectModalProps) {
  const t = useTranslations('common');
  const ta = useTranslations('academics');
  const [search, setSearch] = useState('');
  
  const { data: globalSubjects, isLoading: isGlobasLoading } = useSubjects({
    size: 100, // Fetch a large batch for selection
    search: search || undefined,
  });

  const filteredSubjects = useMemo(() => {
    if (!globalSubjects?.items) return [];
    return globalSubjects.items;
  }, [globalSubjects]);

  const handleToggle = async (subjectId: string, isAssigned: boolean) => {
    if (isAssigned) {
      await onRemove(subjectId);
    } else {
      await onAssign(subjectId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{ta('manageClassSubjects')}</DialogTitle>
          <DialogDescription>{ta('manageClassSubjectsDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={ta('filterSubjects')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-2">
            {isGlobasLoading ? (
              <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {ta('noSubjectsFound')}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSubjects.map((subject) => {
                  const isAssigned = assignedSubjectIds.includes(subject.id);
                  return (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={`subject-${subject.id}`}
                          checked={isAssigned}
                          onCheckedChange={() => handleToggle(subject.id, isAssigned)}
                          disabled={isLoading}
                        />
                        <label 
                          htmlFor={`subject-${subject.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          <div>{subject.name}</div>
                          <div className="text-xs text-muted-foreground font-mono uppercase">{subject.code}</div>
                        </label>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-normal">
                        {subject.category}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
