'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertTriangle, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { usePromotionPreview, useExecutePromotion } from '@/features/promotions/hooks/usePromotions';
import type { PromotionPreviewResponse, StudentAssignmentItem } from '@/features/promotions/types';
import { StudentAssignmentTable } from './StudentAssignmentTable';
import { SectionDistributionPreview } from './SectionDistributionPreview';

export function PromotionWizard() {
  const t = useTranslations('promotions');
  
  // State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [academicYearId, setAcademicYearId] = useState('');
  const [sourceGrade, setSourceGrade] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<string>('');
  const [preserveClassmates, setPreserveClassmates] = useState(false);
  const [preview, setPreview] = useState<PromotionPreviewResponse | null>(null);
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // Hooks
  const { data: academicYears } = useAcademicYears(1, 50);
  const previewMutation = usePromotionPreview();
  const executeMutation = useExecutePromotion();

  // Handlers
  const handleGeneratePreview = () => {
    if (!academicYearId || !sourceGrade || !targetGrade) return;

    previewMutation.mutate(
      {
        academic_year_id: academicYearId,
        source_grade_level: parseInt(sourceGrade),
        target_grade_level: parseInt(targetGrade),
        preserve_classmates: preserveClassmates,
      },
      {
        onSuccess: (data) => {
          setPreview(data);
          
          // Initialize assignments from preview
          const allStudents = [...data.promoted_students, ...data.failed_students];
          const initialAssignments: StudentAssignmentItem[] = allStudents.map(student => ({
            student_id: student.student_id,
            section_id: student.proposed_section_id || '',
            enrollment_type: student.enrollment_type,
          }));
          setAssignments(initialAssignments);
          
          setStep(2);
        },
      }
    );
  };

  const handleExecutePromotion = () => {
    if (!preview || !confirmed) return;

    executeMutation.mutate(
      {
        source_academic_year_id: preview.source_academic_year_id,
        target_academic_year_id: preview.target_academic_year_id,
        source_grade_level: preview.source_grade_level,
        target_grade_level: preview.target_grade_level,
        assignments: assignments,
      },
      {
        onSuccess: () => {
          setStep(4);
        },
      }
    );
  };

  const handleAssignmentChange = (studentId: string, sectionId: string) => {
    setAssignments(prev =>
      prev.map(a =>
        a.student_id === studentId ? { ...a, section_id: sectionId } : a
      )
    );
  };

  const canProceedToStep2 = academicYearId && sourceGrade && targetGrade;
  const canProceedToStep3 = preview && assignments.every(a => a.section_id);
  const canExecute = confirmed && canProceedToStep3;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-4">
        {[
          { num: 1, label: 'Configuration' },
          { num: 2, label: 'Preview & Review' },
          { num: 3, label: 'Confirmation' },
          { num: 4, label: 'Results' },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= s.num
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-muted-foreground text-muted-foreground'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {idx < 3 && (
              <div className={`w-16 h-0.5 mx-4 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Configuration */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Promotion Configuration</CardTitle>
            <CardDescription>Select the academic year and grades for promotion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="academic-year">Academic Year</Label>
                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                  <SelectTrigger id="academic-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.items?.map((year: any) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.is_current && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-grade">Source Grade (From)</Label>
                <Select value={sourceGrade} onValueChange={setSourceGrade}>
                  <SelectTrigger id="source-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[9, 10, 11].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-grade">Target Grade (To)</Label>
                <Select value={targetGrade} onValueChange={setTargetGrade}>
                  <SelectTrigger id="target-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 11, 12].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserve-classmates"
                checked={preserveClassmates}
                onCheckedChange={(checked) => setPreserveClassmates(checked as boolean)}
              />
              <Label htmlFor="preserve-classmates" className="text-sm">
                Preserve classmates (keep students from same section together)
              </Label>
            </div>

            <Button
              onClick={handleGeneratePreview}
              disabled={!canProceedToStep2 || previewMutation.isPending}
              className="w-full"
            >
              {previewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  Generate Preview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview & Review */}
      {step === 2 && preview && (
        <div className="space-y-6">
          {/* Warnings */}
          {preview.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {preview.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{preview.total_students}</div>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {preview.promoted_students.length}
                </div>
                <p className="text-xs text-muted-foreground">Passed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {preview.failed_students.length}
                </div>
                <p className="text-xs text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{preview.section_distribution.length}</div>
                <p className="text-xs text-muted-foreground">Sections</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="promoted" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="promoted">
                Promoted Students ({preview.promoted_students.length})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed Students ({preview.failed_students.length})
              </TabsTrigger>
              <TabsTrigger value="distribution">
                Section Distribution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="promoted" className="mt-4">
              <StudentAssignmentTable
                students={preview.promoted_students}
                assignments={assignments.filter(a =>
                  preview.promoted_students.some(s => s.student_id === a.student_id)
                )}
                onAssignmentChange={handleAssignmentChange}
                sections={preview.section_distribution}
              />
            </TabsContent>

            <TabsContent value="failed" className="mt-4">
              <StudentAssignmentTable
                students={preview.failed_students}
                assignments={assignments.filter(a =>
                  preview.failed_students.some(s => s.student_id === a.student_id)
                )}
                onAssignmentChange={handleAssignmentChange}
                sections={preview.section_distribution}
                showRepeatBadge
              />
            </TabsContent>

            <TabsContent value="distribution" className="mt-4">
              <SectionDistributionPreview
                distribution={preview.section_distribution}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceedToStep3}
            >
              Continue to Confirmation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm Promotion
            </CardTitle>
            <CardDescription>
              Review the summary and confirm to execute the promotion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Academic Year:</span>
                <span className="font-medium">{preview.source_academic_year_name} → {preview.target_academic_year_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Grade Transition:</span>
                <span className="font-medium">Grade {preview.source_grade_level} → Grade {preview.target_grade_level}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Students to Promote:</span>
                <span className="font-medium text-green-600">{preview.promoted_students.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Students to Repeat:</span>
                <span className="font-medium text-orange-600">{preview.failed_students.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sections Affected:</span>
                <span className="font-medium">{preview.section_distribution.length}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <Label htmlFor="confirm" className="text-sm leading-relaxed">
                I understand that this action will create new enrollments and update existing ones.
                This action cannot be easily undone. I have reviewed all assignments and confirm they are correct.
              </Label>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Review
              </Button>
              <Button
                onClick={handleExecutePromotion}
                disabled={!canExecute || executeMutation.isPending}
                variant="destructive"
              >
                {executeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Execute Promotion
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === 4 && executeMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {executeMutation.data.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              Promotion Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant={executeMutation.data.success ? 'default' : 'destructive'}>
              <AlertDescription>{executeMutation.data.message}</AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600">
                    {executeMutation.data.successful_promotions}
                  </div>
                  <p className="text-sm text-muted-foreground">Successfully Promoted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600">
                    {executeMutation.data.successful_repetitions}
                  </div>
                  <p className="text-sm text-muted-foreground">Repeated Grade</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-600">
                    {executeMutation.data.failed_count}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed to Process</p>
                </CardContent>
              </Card>
            </div>

            {executeMutation.data.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Errors:</Label>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  {executeMutation.data.errors.map((error, idx) => (
                    <div key={idx} className="text-sm text-red-700 dark:text-red-400">
                      <strong>{error.student_name}:</strong> {error.error_message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => window.location.reload()} className="w-full">
              Start New Promotion
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
