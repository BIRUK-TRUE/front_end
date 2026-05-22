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
  Search, 
  AlertTriangle,
  CheckCircle2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { SubjectMultiSelect } from '@/features/academics/components/SubjectMultiSelect';
import { GradeAssignmentsView } from '@/features/academics/components/GradeAssignmentsView';
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

interface Subject {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface AssignmentResult {
  success: boolean;
  message: string;
  classes_affected: number;
  sections_affected: number;
  subjects_assigned: number;
}

export default function BulkSubjectAssignmentPage() {
  const t = useTranslations('bulkAssignment');
  const tc = useTranslations('common');
  
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [stream, setStream] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(5);
  const [assignmentMode, setAssignmentMode] = useState<'replace' | 'merge'>('replace');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  // Fetch academic years
  const { data: academicYears, isLoading: isLoadingYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/years', { params: { size: 100 } });
      return data.items as AcademicYear[];
    },
  });

  // Auto-select current academic year
  useEffect(() => {
    if (academicYears && !academicYearId) {
      const currentYear = academicYears.find((year: AcademicYear) => year.is_current);
      if (currentYear) {
        setAcademicYearId(currentYear.id);
      }
    }
  }, [academicYears, academicYearId]);

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: async (payload: {
      academic_year_id: string;
      grade_level: number;
      stream?: string;
      subject_ids: string[];
      periods_per_week: number;
      is_mandatory: boolean;
      mode: string;
    }) => {
      const { data } = await axiosInstance.post('/academics/bulk-assign-subjects', payload);
      return data as AssignmentResult;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ['grade-assignments'] });
      setSelectedSubjects([]);
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || t('assignmentFailed'));
      setShowConfirmDialog(false);
    },
  });

  const handleAssign = () => {
    if (!academicYearId || !gradeLevel || selectedSubjects.length === 0) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmAssignment = () => {
    bulkAssignMutation.mutate({
      academic_year_id: academicYearId,
      grade_level: parseInt(gradeLevel),
      stream: stream || undefined,
      subject_ids: selectedSubjects.map(s => s.id),
      periods_per_week: periodsPerWeek,
      is_mandatory: true,
      mode: assignmentMode,
    });
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

      {/* Assignment Form */}
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
          {/* Academic Year and Grade Selection */}
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

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>{t('selectSubjects')}</Label>
            <SubjectMultiSelect
              selectedSubjects={selectedSubjects}
              onSubjectsChange={setSelectedSubjects}
              academicYearId={academicYearId}
            />
          </div>

          {/* Selected Subjects Display */}
          {selectedSubjects.length > 0 && (
            <div className="space-y-2">
              <Label>{t('selectedSubjects')} ({selectedSubjects.length})</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30 min-h-[80px]">
                {selectedSubjects.map((subject) => (
                  <Badge
                    key={subject.id}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 text-sm"
                  >
                    <BookOpen className="h-3 w-3" />
                    {subject.code} - {subject.name}
                    <button
                      onClick={() => removeSubject(subject.id)}
                      className="ml-1 hover:text-destructive"
                      aria-label={`Remove ${subject.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="periods">{t('periodsPerWeek')}</Label>
              <Input
                id="periods"
                type="number"
                min={1}
                max={10}
                value={periodsPerWeek}
                onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value))}
              />
            </div>

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
          </div>

          {/* Action Button */}
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

      {/* View Existing Assignments */}
      {academicYearId && gradeLevel && (
        <GradeAssignmentsView
          academicYearId={academicYearId}
          gradeLevel={parseInt(gradeLevel)}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
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
                <p><strong>{t('periodsPerWeek')}:</strong> {periodsPerWeek}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {tc('cancel')}
            </Button>
            <Button onClick={confirmAssignment} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {tc('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
