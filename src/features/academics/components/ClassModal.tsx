'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { classSchema, type ClassForm } from '@/features/academics/types/schemas';
import { type Class } from '@/features/academics/types';
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

interface ClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem?: Class | null;
  onSubmit: (data: ClassForm) => void;
  isLoading?: boolean;
}

export function ClassModal({
  open,
  onOpenChange,
  classItem,
  onSubmit,
  isLoading,
}: ClassModalProps) {
  const t = useTranslations('common');

  const form = useForm<ClassForm>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      name: '',
      grade_level: 1,
      capacity: undefined,
      description: '',
    },
  });

  // Reset form when modal opens/closes or class changes
  useEffect(() => {
    if (open) {
      if (classItem) {
        form.reset({
          name: classItem.name,
          grade_level: classItem.grade_level,
          capacity: classItem.capacity || undefined,
          description: classItem.description || '',
        });
      } else {
        form.reset({
          name: '',
          grade_level: 1,
          capacity: undefined,
          description: '',
        });
      }
    }
  }, [open, classItem, form]);

  const handleSubmit = (data: ClassForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {classItem ? 'Edit Class' : 'Add New Class'}
          </DialogTitle>
          <DialogDescription>
            {classItem
              ? 'Update details for this class offering.'
              : 'Add a new class (e.g. Grade 9, Advanced Math) for the academic year.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Class Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grade 9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grade_level"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Grade/Year Level <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Total Capacity (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        placeholder="e.g. 150" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                          field.onChange(val);
                        }} 
                      />
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
                      placeholder="Optional notes about this class..."
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
                {classItem ? t('save') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
