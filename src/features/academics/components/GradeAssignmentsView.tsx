'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { BookOpen, GraduationCap, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SubjectAssignment {
  id: string;
  class_id: string;
  subject_id: string;
  class_name: string;
  subject_code: string;
  subject_name: string;
  periods_per_week: number;
  is_mandatory: boolean;
  created_at: string;
}

interface GradeAssignment {
  academic_year_id: string;
  academic_year_name: string;
  grade_level: number;
  class_name: string;
  stream: string | null;
  subject_count: number;
  section_count: number;
  subjects: SubjectAssignment[];
}

// Separate component for each assignment card to use useState properly
function AssignmentCard({ assignment }: { assignment: GradeAssignment }) {
  const t = useTranslations('bulkAssignment');
  const tc = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        className="w-full justify-between p-4 hover:bg-accent/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <div className="text-left">
            <div className="font-medium">{assignment.class_name}</div>
            <div className="text-sm text-muted-foreground">
              {assignment.section_count} {tc('sections')} • {assignment.subject_count} {tc('subjects')}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="p-4 pt-0 pl-11 border-t bg-muted/20">
          {assignment.subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              {t('noSubjectsAssigned')}
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 py-4">
              {assignment.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {subject.subject_name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {subject.subject_code}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {subject.periods_per_week} {t('periodsPerWeekLabel')}
                      </span>
                    </div>
                    {subject.is_mandatory && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {t('mandatory')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface GradeAssignmentsViewProps {
  academicYearId: string;
  gradeLevel: number;
}

export function GradeAssignmentsView({
  academicYearId,
  gradeLevel,
}: GradeAssignmentsViewProps) {
  const t = useTranslations('bulkAssignment');
  const tc = useTranslations('common');

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['grade-assignments', academicYearId, gradeLevel],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/grade-subject-assignments', {
        params: {
          academic_year_id: academicYearId,
          grade_level: gradeLevel,
        },
      });
      return data as GradeAssignment[];
    },
    enabled: !!academicYearId && !!gradeLevel,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={BookOpen}
            title={t('noAssignmentsTitle')}
            description={t('noAssignmentsDescription')}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          {t('existingAssignments')}
        </CardTitle>
        <CardDescription>
          {t('existingAssignmentsDescription', { grade: gradeLevel })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <AssignmentCard key={`${assignment.class_name}-${index}`} assignment={assignment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
