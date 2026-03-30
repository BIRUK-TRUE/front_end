'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { sectionSchema, type SectionForm } from '@/features/academics/types/schemas';
import { type Section } from '@/features/academics/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTeachers } from '@/features/teachers/api/useTeachers';

interface SectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: Section | null;
  onSubmit: (data: SectionForm) => void;
  isLoading?: boolean;
}

export function SectionModal({
  open,
  onOpenChange,
  section,
  onSubmit,
  isLoading,
}: SectionModalProps) {
  const t = useTranslations('common');

  const form = useForm<SectionForm>({
    resolver: zodResolver(sectionSchema) as any,
    defaultValues: {
      name: '',
      capacity: 40,
      room_number: '',
      homeroom_teacher_id: null,
    },
  });

  const { data: teachersData, isLoading: isTeachersLoading } = useTeachers({
    is_active: true,
    size: 50,
  });

  // Reset form when modal opens/closes or section changes
  useEffect(() => {
    if (open) {
      if (section) {
        form.reset({
          name: section.name,
          capacity: section.capacity || 40,
          room_number: section.room_number || '',
          homeroom_teacher_id: section.homeroom_teacher_id || null,
        });
      } else {
        form.reset({
          name: '',
          capacity: 40,
          room_number: '',
          homeroom_teacher_id: null,
        });
      }
    }
  }, [open, section, form]);

  const handleSubmit = (data: SectionForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {section ? 'Edit Section' : 'Add New Section'}
          </DialogTitle>
          <DialogDescription>
            {section
              ? 'Update details for this class section.'
              : 'Add a new section (e.g. A, B, Blue) for the selected class.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Section Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Capacity <span className="text-destructive">*</span></FormLabel>
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
                name="room_number"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Room (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 101" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="homeroom_teacher_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Homeroom Teacher (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || "none"}
                    disabled={isTeachersLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Homeroom Teacher</SelectItem>
                      {teachersData?.items?.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {section ? t('save') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
