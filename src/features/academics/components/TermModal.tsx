'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { termSchema, type TermForm } from '@/features/academics/types/schemas';
import { type Term } from '@/features/academics/types';
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
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface TermModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  term?: Term | null;
  onSubmit: (data: TermForm) => void;
  isLoading?: boolean;
}

export function TermModal({
  open,
  onOpenChange,
  term,
  onSubmit,
  isLoading,
}: TermModalProps) {
  const t = useTranslations('common');
  const ta = useTranslations('academics');

  const form = useForm<TermForm>({
    resolver: zodResolver(termSchema) as any,
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
    },
  });

  // Reset form when modal opens/closes or term changes
  useEffect(() => {
    if (open) {
      if (term) {
        form.reset({
          name: term.name,
          start_date: term.start_date.split('T')[0],
          end_date: term.end_date.split('T')[0],
        });
      } else {
        form.reset({
          name: '',
          start_date: '',
          end_date: '',
        });
      }
    }
  }, [open, term, form]);

  const handleSubmit = (data: TermForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {term ? ta('editTerm') : ta('addNewTerm')}
          </DialogTitle>
          <DialogDescription>
            {term
              ? ta('termModalEditDesc')
              : ta('termModalDesc')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{ta('termName')} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder={ta('termNamePlaceholder')} {...field} />
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
                    <FormLabel>{ta('startDate')} <span className="text-destructive">*</span></FormLabel>
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
                    <FormLabel>{ta('endDate')} <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {term ? t('save') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
