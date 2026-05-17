'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses, useClass } from '@/features/academics/api/useClasses';
import { useSubjects } from '@/features/academics/api/useSubjects';
import { useAssessments, useGradesByAssessment, useSubmitGrades, useCreateAssessment } from '@/features/grades/api/useGrades';
import { AssessmentType, type GradeEntry }  from '@/features/grades/types';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Award, Plus, Loader2, Save, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function GradesPage() {
  const tc = useTranslations('common');
  const t = useTranslations('gradesPage');

  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: AssessmentType.QUIZ,
    max_score: 100,
    weight: 10,
  });

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const { data: subjectsData } = useSubjects({ page: 1, size: 100 });
  const { data: assessments, isLoading: isLoadingAssessments } = useAssessments(selectedClassId, selectedSubjectId);
  const { data: gradeRecords, isLoading: isLoadingGrades } = useGradesByAssessment(selectedAssessmentId);

  const submitGrades = useSubmitGrades();
  const createAssessment = useCreateAssessment();

  // Auto-select current academic year
  useEffect(() => {
    if (yearsData?.items?.length && !selectedYearId) {
      const current = yearsData.items.find((y: any) => y.is_current);
      if (current) setSelectedYearId(current.id);
    }
  }, [yearsData, selectedYearId]);

  // We will just use all subjects available
  const subjects = subjectsData?.items || [];

  const handleScoreChange = (studentId: string, score: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        student_id: studentId,
        score: score === '' ? null : Number(score),
      },
    }));
  };

  const handleSubmitGrades = () => {
    const entries = Object.values(grades);
    if (entries.length === 0 || !selectedAssessmentId) return;
    submitGrades.mutate({
      assessment_id: selectedAssessmentId,
      entries,
    });
  };

  const handleCreateAssessment = () => {
    createAssessment.mutate(
      {
        ...newAssessment,
        subject_id: selectedSubjectId,
        class_id: selectedClassId,
        term_id: '', // to be filled from current term
      } as any,
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewAssessment({ name: '', type: AssessmentType.QUIZ, max_score: 100, weight: 10 });
        },
      }
    );
  };

  // Initialize grades from fetched records
  if (gradeRecords && Object.keys(grades).length === 0) {
    const map: Record<string, GradeEntry> = {};
    gradeRecords.forEach((g) => {
      map[g.student_id] = {
        student_id: g.student_id,
        score: g.score,
        comment: g.comment,
      };
    });
    if (Object.keys(map).length > 0) {
      setGrades(map);
    }
  }

  const getAssessmentTypeBadge = (type: AssessmentType) => {
    const colors: Record<string, string> = {
      [AssessmentType.QUIZ]: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      [AssessmentType.TEST]: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      [AssessmentType.MIDTERM]: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      [AssessmentType.FINAL]: 'bg-red-500/10 text-red-600 border-red-500/30',
      [AssessmentType.ASSIGNMENT]: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      [AssessmentType.PROJECT]: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
    };
    return <Badge variant="outline" className={colors[type] + ' capitalize'}>{type}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('academicYear')}</Label>
              <Select value={selectedYearId} onValueChange={(v) => { setSelectedYearId(v); setSelectedClassId(''); setSelectedSubjectId(''); setSelectedAssessmentId(''); }}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t('selectYear')} />
                </SelectTrigger>
                <SelectContent>
                  {yearsData?.items?.map((year: any) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name} {year.is_current ? `(${tc('current')})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('class')}</Label>
              <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(''); setSelectedAssessmentId(''); }} disabled={!selectedYearId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={!selectedYearId ? t('selectYearFirst') : t('selectClass')} />
                </SelectTrigger>
                <SelectContent>
                  {classesData?.items?.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('subject')}</Label>
              <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setSelectedAssessmentId(''); }} disabled={!selectedClassId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={!selectedClassId ? t('selectClassFirst') : t('selectSubject')} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj: any) => (
                    <SelectItem key={subj.id} value={subj.id}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('assessment')}</Label>
              <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId} disabled={!selectedSubjectId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={!selectedSubjectId ? t('selectSubjectFirst') : t('selectAssessment')} />
                </SelectTrigger>
                <SelectContent>
                  {assessments?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.max_score} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Management */}
      {selectedSubjectId && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {assessments?.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAssessmentId(a.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all
                  ${selectedAssessmentId === a.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:bg-muted/50'}
                `}
              >
                {a.name}
                <span className="text-[10px] opacity-70">({a.max_score})</span>
              </button>
            ))}
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('newAssessment')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('createAssessmentTitle')}</DialogTitle>
                <DialogDescription>{t('createAssessmentDescription')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('assessmentName')}</Label>
                  <Input value={newAssessment.name} onChange={(e) => setNewAssessment((p) => ({ ...p, name: e.target.value }))} placeholder={t('assessmentNamePlaceholder')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('type')}</Label>
                    <Select value={newAssessment.type} onValueChange={(v) => setNewAssessment((p) => ({ ...p, type: v as AssessmentType }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.values(AssessmentType).map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('maxScore')}</Label>
                    <Input type="number" value={newAssessment.max_score} onChange={(e) => setNewAssessment((p) => ({ ...p, max_score: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('weightPercent')}</Label>
                  <Input type="number" value={newAssessment.weight} min={1} max={100} onChange={(e) => setNewAssessment((p) => ({ ...p, weight: Number(e.target.value) }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{tc('cancel')}</Button>
                <Button onClick={handleCreateAssessment} disabled={!newAssessment.name || createAssessment.isPending}>
                  {createAssessment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {tc('create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Grade Entry Grid */}
      {!selectedAssessmentId ? (
        <EmptyState
          icon={Award}
          title={selectedSubjectId ? 'No assessment selected' : 'Select a class and subject to begin'}
          description={
            !selectedYearId
              ? 'Start by selecting an academic year above.'
              : !selectedClassId
              ? 'Now select a class.'
              : !selectedSubjectId
              ? 'Now select a subject.'
              : assessments && assessments.length === 0
              ? 'No assessments yet for this subject. Create one using the button above.'
              : 'Select an assessment from the list above to enter grades.'
          }
        />
      ) : isLoadingGrades ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('gradeEntry')}</CardTitle>
                <CardDescription>
                  {assessments?.find((a) => a.id === selectedAssessmentId)?.name} - {t('maxScore')}: {assessments?.find((a) => a.id === selectedAssessmentId)?.max_score}
                </CardDescription>
              </div>
              <Button onClick={handleSubmitGrades} disabled={submitGrades.isPending || Object.keys(grades).length === 0} className="gap-2">
                {submitGrades.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('saveGrades')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {gradeRecords && gradeRecords.length > 0 ? (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[1fr,120px,120px] sm:grid-cols-[1fr,120px,120px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                  <span>{t('student')}</span>
                  <span>{t('score')}</span>
                  <span>{t('grade')}</span>
                </div>
                {gradeRecords.map((record) => {
                  const entry = grades[record.student_id];
                  const maxScore = assessments?.find((a) => a.id === selectedAssessmentId)?.max_score || 100;
                  const score = entry?.score ?? record.score;
                  const pct = score !== null ? Math.round((score / maxScore) * 100) : null;
                  const letterGrade = pct !== null
                    ? pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'
                    : '—';

                  const initials = record.student_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={record.student_id}
                      className="grid grid-cols-[1fr,120px,120px] gap-4 px-4 py-3 rounded-lg border hover:bg-muted/30 transition-colors items-center"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{record.student_name}</div>
                          <div className="text-xs text-muted-foreground">{record.registration_number}</div>
                        </div>
                      </div>
                      <div>
                        <Input
                          type="number"
                          min={0}
                          max={maxScore}
                          className="h-9 w-24"
                          value={entry?.score ?? record.score ?? ''}
                          onChange={(e) => handleScoreChange(record.student_id, e.target.value)}
                          placeholder={`/ ${maxScore}`}
                        />
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold ${
                            letterGrade === 'A' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                            letterGrade === 'B' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                            letterGrade === 'C' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                            letterGrade === 'D' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                            letterGrade === 'F' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                            'bg-muted text-muted-foreground'
                          }`}
                        >
                          {letterGrade} {pct !== null && `(${pct}%)`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title={t('noStudentsFoundTitle')}
                description={t('noStudentsFoundDescription')}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
