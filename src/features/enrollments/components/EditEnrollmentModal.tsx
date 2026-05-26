'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { type Enrollment } from '../types';

const editEnrollmentSchema = z.object({
  remarks: z.string().max(500, 'Maximum 500 characters').optional(),
});

type EditEnrollmentForm = z.infer<typeof editEnrollmentSchema>;

interface EditEnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: Enrollment | null;
  onSubmit: (data: EditEnrollmentForm) => void;
  isLoading: boolean;
}

export function EditEnrollmentModal({
  open,
  onOpenChange,
  enrollment,
  onSubmit,
  isLoading,
}: EditEnrollmentModalProps) {
  const t = useTranslations('enrollments');
  const tc = useTranslations('common');

  const form = useForm<EditEnrollmentForm>({
    resolver: zodResolver(editEnrollmentSchema),
    defaultValues: { remarks: '' },
  });

  useEffect(() => {
    if (enrollment) {
      form.reset({ remarks: enrollment.remarks ?? '' });
    }
  }, [enrollment, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editEnrollment')}</DialogTitle>
          <DialogDescription>
            {t('editEnrollmentDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tc('remarks')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('remarksPlaceholder')}
                      className="resize-none h-28"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground">
              {t('editEnrollmentHint')}
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tc('loading')}
                  </>
                ) : (
                  tc('save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
