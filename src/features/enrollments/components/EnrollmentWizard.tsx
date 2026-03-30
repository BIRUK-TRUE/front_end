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
import { Loader2, Calendar, BookOpen, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface EnrollmentWizardProps {
  studentId: string;
  studentName: string;
  onSubmit: (data: EnrollmentForm) => void;
  isLoading?: boolean;
}

export function EnrollmentWizard({
  studentId,
  studentName,
  onSubmit,
  isLoading,
}: EnrollmentWizardProps) {
  const t = useTranslations('common');
  
  const form = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema) as any,
    defaultValues: {
      student_id: studentId,
      academic_year_id: '',
      class_id: '',
      section_id: '',
      enrollment_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const academicYearId = form.watch('academic_year_id');
  const classId = form.watch('class_id');

  const { data: yearsData, isLoading: isLoadingYears } = useAcademicYears(1, 50);
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(academicYearId, 1, 100);
  const { data: classDetail, isLoading: isLoadingClassDetail } = useClass(classId);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg border flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {studentName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Student</div>
            <div className="text-lg font-bold">{studentName}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="academic_year_id"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Academic Year</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingYears}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearsData?.items?.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.is_current ? '(Current)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enrollment_date"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Enrollment Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="class_id"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Class / Grade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!academicYearId || isLoadingClasses}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!academicYearId ? "Select Year First" : "Select Class"} />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="section_id"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!classId || isLoadingClassDetail}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!classId ? "Select Class First" : "Select Section"} />
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
                          <span>{section.name}</span>
                          <div className="flex items-center gap-2">
                            {section.is_full ? (
                              <Badge variant="destructive" className="text-[10px] h-4">Full</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">{section.available_slots} slots left</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Enrollment
        </Button>
      </form>
    </Form>
  );
}
