'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import type { TeacherQualification, QualificationCreate } from '../api/useQualifications';

const qualificationSchema = z.object({
  subject_id: z.string().uuid('Please select a subject'),
  min_grade_level: z.number().min(0).max(12),
  max_grade_level: z.number().min(0).max(12),
  allowed_streams: z.array(z.string()).optional(),
  competency_level: z.enum(['beginner', 'proficient', 'expert']).default('proficient'),
  years_experience: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
}).refine((data) => {
  if (data.max_grade_level < data.min_grade_level) {
    return {
      message: 'Maximum grade level must be greater than or equal to minimum grade level',
      path: ['max_grade_level'],
    };
  }
  return true;
});

type QualificationForm = z.infer<typeof qualificationSchema>;

interface QualificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  qualification?: TeacherQualification | null;
  subjects: Array<{ id: string; name: string; code: string }>;
  onSubmit: (data: QualificationCreate) => void;
  isLoading: boolean;
}

export function QualificationModal({
  open,
  onOpenChange,
  teacherId,
  qualification,
  subjects,
  onSubmit,
  isLoading,
}: QualificationModalProps) {
  const form = useForm<QualificationForm>({
    resolver: zodResolver(qualificationSchema) as any,
    defaultValues: {
      subject_id: '',
      min_grade_level: 0,
      max_grade_level: 12,
      allowed_streams: [],
      competency_level: 'proficient',
      years_experience: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    if (qualification) {
      form.reset({
        subject_id: qualification.subject_id,
        min_grade_level: qualification.min_grade_level,
        max_grade_level: qualification.max_grade_level,
        allowed_streams: qualification.allowed_streams || [],
        competency_level: qualification.competency_level,
        years_experience: qualification.years_experience || undefined,
        notes: qualification.notes || '',
      });
    } else {
      form.reset({
        subject_id: '',
        min_grade_level: 0,
        max_grade_level: 12,
        allowed_streams: [],
        competency_level: 'proficient',
        years_experience: undefined,
        notes: '',
      });
    }
  }, [qualification, form]);

  const handleSubmit = (values: QualificationForm) => {
    onSubmit(values);
  };

  const isNaturalScienceSelected = form.watch('allowed_streams')?.includes('natural_science');
  const isSocialScienceSelected = form.watch('allowed_streams')?.includes('social_science');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {qualification ? 'Edit Qualification' : 'Add Teacher Qualification'}
          </DialogTitle>
          <DialogDescription>
            Define what subjects and grade levels this teacher is qualified to teach.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Subject Selection */}
            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grade Level Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_grade_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Grade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={12}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_grade_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Grade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={12}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stream Selection */}
            <FormField
              control={form.control}
              name="allowed_streams"
              render={() => (
                <FormItem>
                  <FormLabel>Allowed Streams (Optional)</FormLabel>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="natural_science"
                        checked={isNaturalScienceSelected}
                        onCheckedChange={(checked) => {
                          const current = form.getValues('allowed_streams') || [];
                          const updated = checked
                            ? [...current, 'natural_science']
                            : current.filter((s) => s !== 'natural_science');
                          form.setValue('allowed_streams', updated);
                        }}
                      />
                      <label htmlFor="natural_science" className="text-sm">
                        Natural Science (Grades 11-12)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="social_science"
                        checked={isSocialScienceSelected}
                        onCheckedChange={(checked) => {
                          const current = form.getValues('allowed_streams') || [];
                          const updated = checked
                            ? [...current, 'social_science']
                            : current.filter((s) => s !== 'social_science');
                          form.setValue('allowed_streams', updated);
                        }}
                      />
                      <label htmlFor="social_science" className="text-sm">
                        Social Science (Grades 11-12)
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty for all streams
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Competency Level */}
            <FormField
              control={form.control}
              name="competency_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competency Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select competency level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="proficient">Proficient</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Years of Experience */}
            <FormField
              control={form.control}
              name="years_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g., 5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this qualification..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : qualification ? 'Update' : 'Add Qualification'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
