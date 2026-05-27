'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { SubjectMultiSelect } from '@/features/academics/components/SubjectMultiSelect';
import { GradeAssignmentsView } from '@/features/academics/components/GradeAssignmentsView';
import { Subject } from '@/features/academics/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

interface AssignmentResult {
  success: boolean;
  message: string;
  classes_affected: number;
  sections_affected: number;
  subjects_assigned: number;
}

interface SubjectWithPeriods extends Subject {
  periods_per_week: number;
  is_mandatory: boolean;
}

export default function SubjectAssignmentPage() {
  const t = useTranslations('bulkAssignment');
  const tc = useTranslations('common');
  
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [stream, setStream] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectWithPeriods[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'replace' | 'merge'>('replace');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: academicYears, isLoading: isLoadingYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/years', { params: { size: 100 } });
      return data.items as AcademicYear[];
    },
  });

  useEffect(() => {
    if (academicYears && !academicYearId) {
      const currentYear = academicYears.find((year: AcademicYear) => year.is_current);
      if (currentYear) {
        setAcademicYearId(currentYear.id);
      }
    }
  }, [academicYears, academicYearId]);

  const bulkAssignMutation = useMutation({
    mutationFn: async (payload: {
      academic_year_id: string;
      grade_level: number;
      stream?: string;
      subjects: Array<{
        subject_id: string;
        periods_per_week: number;
        is_mandatory: boolean;
      }>;
      mode: string;
    }) => {
      console.log('Sending bulk assignment payload:', JSON.stringify(payload, null, 2));
      console.log('Making API request...');
      const { data } = await axiosInstance.post('/academics/bulk-assign-subjects', payload);
      console.log('API request completed, response:', data);
      return data as AssignmentResult;
    },
    onSuccess: (result) => {
      console.log('onSuccess callback triggered:', result);
      toast.success(result.message || t('assignmentSuccess'));
      queryClient.invalidateQueries({ queryKey: ['grade-assignments'] });
      setSelectedSubjects([]);
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      console.error('onError callback triggered');
      console.error('Bulk assignment error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      const errorMessage = error?.response?.data?.detail || error?.message || t('assignmentFailed');
      toast.error(errorMessage);
      setShowConfirmDialog(false);
    },
    onMutate: () => {
      console.log('onMutate callback - mutation starting');
    },
    onSettled: (data, error) => {
      console.log('onSettled callback - mutation finished');
      console.log('Data:', data);
      console.log('Error:', error);
    },
  });

  const handleAssign = () => {
    if (!academicYearId || !gradeLevel || selectedSubjects.length === 0) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmAssignment = () => {
    console.log('confirmAssignment called');
    console.log('Current mutation status:', {
      isPending: bulkAssignMutation.isPending,
      isError: bulkAssignMutation.isError,
      isSuccess: bulkAssignMutation.isSuccess,
    });
    
    bulkAssignMutation.mutate({
      academic_year_id: academicYearId,
      grade_level: parseInt(gradeLevel),
      stream: stream || undefined,
      subjects: selectedSubjects.map(s => ({
        subject_id: s.id,
        periods_per_week: s.periods_per_week,
        is_mandatory: s.is_mandatory,
      })),
      mode: assignmentMode,
    });
    console.log('mutate() called successfully');
  };

  const updateSubjectPeriods = (subjectId: string, periods: number) => {
    setSelectedSubjects(prev => 
      prev.map(s => 
        s.id === subjectId ? { ...s, periods_per_week: Math.max(1, Math.min(10, periods)) } : s
      )
    );
  };

  const removeSubject = (subjectId: string) => {
    setSelectedSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  const showStreamSelector = gradeLevel === '11' || gradeLevel === '12';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {t('assignSubjectsToGrade')}
          </CardTitle>
          <CardDescription>
            {t('assignSubjectsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="academic-year">{t('academicYear')}</Label>
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger id="academic-year">
                  <SelectValue placeholder={t('selectAcademicYear')} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingYears ? (
                    <div className="flex items-center justify-center p-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    academicYears?.map((year: AcademicYear) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.is_current && `(${t('current')})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-level">{t('gradeLevel')}</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger id="grade-level">
                  <SelectValue placeholder={t('selectGrade')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showStreamSelector && (
              <div className="space-y-2">
                <Label htmlFor="stream">{t('stream')}</Label>
                <Select value={stream} onValueChange={setStream}>
                  <SelectTrigger id="stream">
                    <SelectValue placeholder={t('selectStream')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural_science">{t('naturalScience')}</SelectItem>
                    <SelectItem value="social_science">{t('socialScience')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('selectSubjects')}</Label>
            <SubjectMultiSelect
              selectedSubjects={selectedSubjects as Subject[]}
              onSubjectsChange={(subjects: Subject[]) => {
                // Add default periods when subjects are selected
                const subjectsWithDefaults = subjects.map(s => ({
                  ...s,
                  periods_per_week: 5,
                  is_mandatory: true,
                }));
                setSelectedSubjects(subjectsWithDefaults);
              }}
              academicYearId={academicYearId}
            />
          </div>

          {selectedSubjects.length > 0 && (
            <div className="space-y-3">
              <Label>{t('selectedSubjects')} ({selectedSubjects.length})</Label>
              <div className="border rounded-lg divide-y">
                {selectedSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {subject.code} - {subject.name}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`periods-${subject.id}`} className="text-sm whitespace-nowrap">
                          {t('periodsPerWeek')}:
                        </Label>
                        <Input
                          id={`periods-${subject.id}`}
                          type="number"
                          min={1}
                          max={10}
                          value={subject.periods_per_week}
                          onChange={(e) => updateSubjectPeriods(subject.id, parseInt(e.target.value) || 1)}
                          className="w-20 h-8"
                        />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubject(subject.id)}
                        className="h-8 w-8 p-0 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mode">{t('assignmentMode')}</Label>
            <Select value={assignmentMode} onValueChange={(v: 'replace' | 'merge') => setAssignmentMode(v)}>
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">{t('replaceExisting')}</SelectItem>
                <SelectItem value="merge">{t('mergeWithExisting')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {assignmentMode === 'replace' ? t('replaceDescription') : t('mergeDescription')}
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleAssign}
              disabled={!academicYearId || !gradeLevel || selectedSubjects.length === 0 || bulkAssignMutation.isPending}
              className="gap-2"
            >
              {bulkAssignMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('assignSubjects')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {academicYearId && gradeLevel && (
        <GradeAssignmentsView
          academicYearId={academicYearId}
          gradeLevel={parseInt(gradeLevel)}
        />
      )}

      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        // Prevent closing dialog while mutation is pending
        if (!bulkAssignMutation.isPending) {
          setShowConfirmDialog(open);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {t('confirmAssignment')}
            </DialogTitle>
            <DialogDescription>
              {assignmentMode === 'replace' ? (
                <span className="text-destructive font-medium">
                  {t('replaceWarning')}
                </span>
              ) : (
                t('mergeWarning')
              )}
              <div className="mt-4 space-y-2">
                <p><strong>{t('gradeLevel')}:</strong> Grade {gradeLevel}</p>
                {showStreamSelector && stream && (
                  <p><strong>{t('stream')}:</strong> {stream === 'natural_science' ? t('naturalScience') : t('socialScience')}</p>
                )}
                <p><strong>{t('subjectsCount')}:</strong> {selectedSubjects.length}</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('periodsPerWeek')}:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    {selectedSubjects.map((subject) => (
                      <li key={subject.id}>
                        {subject.code}: {subject.periods_per_week} {t('periodsPerWeekLabel')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={bulkAssignMutation.isPending}
            >
              {tc('cancel')}
            </Button>
            <Button 
              onClick={confirmAssignment} 
              disabled={bulkAssignMutation.isPending}
              className="gap-2"
            >
              {bulkAssignMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{tc('loading')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {tc('confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
