'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { enrollmentSchema, type EnrollmentForm } from '../types/schemas';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses, useClass } from '@/features/academics/api/useClasses';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calendar, BookOpen, Users, UserPlus, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

interface EnrollmentWizardProps {
  studentId: string;
  studentName: string;
  studentRegistrationNumber?: string;
  onSubmit: (data: EnrollmentForm) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function EnrollmentWizard({
  studentId,
  studentName,
  studentRegistrationNumber,
  onSubmit,
  onCancel,
  isLoading,
}: EnrollmentWizardProps) {
  const t = useTranslations('enrollments');
  const tc = useTranslations('common');
  
  const form = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema) as any,
    defaultValues: {
      student_id: studentId,
      academic_year_id: '',
      class_id: '',
      section_id: '',
      enrollment_date: format(new Date(), 'yyyy-MM-dd'),
      enrollment_type: 'new',
      status: 'active',
      remarks: '',
    },
  });

  const academicYearId = form.watch('academic_year_id') ?? '';
  const classId = form.watch('class_id') ?? '';
  const enrollmentType = form.watch('enrollment_type');

  const { data: yearsData, isLoading: isLoadingYears } = useAcademicYears(1, 50);
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(academicYearId, 1, 100);
  const { data: classDetail, isLoading: isLoadingClassDetail } = useClass(classId);

  // Auto-select current academic year
  useEffect(() => {
    if (yearsData?.items && !academicYearId) {
      const currentYear = yearsData.items.find(y => y.is_current);
      if (currentYear) {
        form.setValue('academic_year_id', currentYear.id);
      }
    }
  }, [yearsData, academicYearId, form]);

  // Reset class when year changes
  useEffect(() => {
    form.setValue('class_id', '');
    form.setValue('section_id', '');
  }, [academicYearId, form]);

  // Reset section when class changes
  useEffect(() => {
    form.setValue('section_id', '');
  }, [classId, form]);

  const handleSubmit = (data: EnrollmentForm) => {
    onSubmit(data);
  };

  const selectedSection = classDetail?.sections?.find(s => s.id === form.watch('section_id'));
  const hasAvailableSlots = selectedSection && !selectedSection.is_full;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
        {/* Student Info Card */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Enrolling Student
                  </span>
                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-lg font-bold text-foreground">{studentName}</div>
                {studentRegistrationNumber && (
                  <div className="text-sm text-muted-foreground font-mono">
                    {studentRegistrationNumber}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Year & Enrollment Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="academic_year_id"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Academic Year
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingYears}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearsData?.items?.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        <div className="flex items-center gap-2">
                          {year.name}
                          {year.is_current && (
                            <Badge variant="default" className="text-[10px] h-4 px-1.5">
                              Current
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  The academic year for this enrollment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enrollment_date"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Enrollment Date
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="h-11"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Default: Today ({format(new Date(), 'MMM d, yyyy')})
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Class & Section Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            Class & Section Assignment
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="class_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Class / Grade
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!academicYearId || isLoadingClasses}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue 
                          placeholder={
                            !academicYearId 
                              ? "Select academic year first" 
                              : "Select class/grade"
                          } 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classesData?.items?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} (Grade {cls.grade_level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Choose the grade level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="section_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Section
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!classId || isLoadingClassDetail}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue 
                          placeholder={
                            !classId 
                              ? "Select class first" 
                              : "Select section"
                          } 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classDetail?.sections?.map((section) => (
                        <SelectItem 
                          key={section.id} 
                          value={section.id}
                          disabled={section.is_full}
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium">{section.name}</span>
                            <div className="flex items-center gap-2">
                              {section.is_full ? (
                                <Badge variant="destructive" className="text-[10px] h-4">
                                  Full
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {section.available_slots} slots left
                                </span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Sections are grouped by class
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section Availability Alert */}
          {selectedSection && (
            <Alert className={hasAvailableSlots ? "border-green-500/50 bg-green-50 dark:bg-green-950/20" : "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"}>
              {hasAvailableSlots ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              <AlertDescription className="text-sm">
                {hasAvailableSlots ? (
                  <span className="text-green-700 dark:text-green-400">
                    <strong>{selectedSection.available_slots}</strong> slots available in {selectedSection.name}
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400">
                    Section {selectedSection.name} is currently full
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Enrollment Type & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="enrollment_type"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Enrollment Type
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select enrollment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">New</span>
                        <span className="text-xs text-muted-foreground">First-time enrollment</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Transfer</span>
                        <span className="text-xs text-muted-foreground">From another school</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="promoted">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Promoted</span>
                        <span className="text-xs text-muted-foreground">Advanced to next grade</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="repeated">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Repeated</span>
                        <span className="text-xs text-muted-foreground">Repeating current grade</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  How the student is joining this class
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Status
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">
                      <Badge variant="default" className="capitalize">Active</Badge>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <Badge variant="secondary" className="capitalize">Inactive</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Default: Active
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Remarks */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Remarks
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Add any additional notes about this enrollment..."
                  className="min-h-[80px] resize-none"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Optional notes or comments about this enrollment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Info Alert */}
        <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Example:</strong> Student: {studentName} → Section: Grade 9 - A → 
            Enrollment Date: {format(new Date(), 'yyyy-MM-dd')} → Type: {enrollmentType || 'New'} → Status: Active
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 h-11 text-base"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            className="flex-1 h-11 text-base font-semibold bg-primary hover:bg-primary/90" 
            disabled={isLoading || !hasAvailableSlots}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Enrolling...' : 'Enroll Student'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
