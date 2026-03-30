'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { academicYearSchema, type AcademicYearForm } from '@/features/academics/types/schemas';
import { type AcademicYear } from '@/features/academics/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { format } from 'date-fns';

interface AcademicYearModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year?: AcademicYear | null;
  onSubmit: (data: AcademicYearForm) => void;
  isLoading?: boolean;
}

export function AcademicYearModal({
  open,
  onOpenChange,
  year,
  onSubmit,
  isLoading,
}: AcademicYearModalProps) {
  const t = useTranslations('common');

  const form = useForm<AcademicYearForm>({
    resolver: zodResolver(academicYearSchema) as any,
    defaultValues: {
      name: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
      description: '',
    },
  });

  // Reset form when modal opens/closes or year changes
  useEffect(() => {
    if (open) {
      if (year) {
        form.reset({
          name: year.name,
          start_date: year.start_date.split('T')[0],
          end_date: year.end_date.split('T')[0],
          description: year.description || '',
        });
      } else {
        form.reset({
          name: '',
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
          description: '',
        });
      }
    }
  }, [open, year, form]);

  const handleSubmit = (data: AcademicYearForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {year ? 'Edit Academic Year' : 'Create Academic Year'}
          </DialogTitle>
          <DialogDescription>
            {year
              ? 'Update details for this academic year.'
              : 'Add a new academic year to start planning terms and classes. e.g. "2024-2025"'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Year Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>End Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this academic year..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {year ? t('save') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
