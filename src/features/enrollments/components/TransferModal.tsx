'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { transferSchema, type TransferForm } from '../types/schemas';
import { type Enrollment } from '../types';
import { useClass } from '@/features/academics/api/useClasses';
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
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: Enrollment | null;
  onSubmit: (data: TransferForm) => void;
  isLoading?: boolean;
}

export function TransferModal({
  open,
  onOpenChange,
  enrollment,
  onSubmit,
  isLoading,
}: TransferModalProps) {
  const t = useTranslations('enrollments');
  
  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      new_section_id: '',
      transfer_date: format(new Date(), 'yyyy-MM-dd'),
      reason: '',
    },
  });

  const { data: classDetail, isLoading: isLoadingClass } = useClass(enrollment?.class_id || '');

  useEffect(() => {
    if (open) {
      form.reset({
        new_section_id: '',
        transfer_date: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
      });
    }
  }, [open, form]);

  const handleSubmit = (data: TransferForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Section</DialogTitle>
          <DialogDescription>
            Move student from <strong>{enrollment?.section_name}</strong> to a different section in <strong>{enrollment?.class_name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <FormField
              control={form.control}
              name="new_section_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>New Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingClass}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectTargetSection')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classDetail?.sections
                        ?.filter(s => s.id !== enrollment?.section_id)
                        .map((section) => (
                          <SelectItem 
                            key={section.id} 
                            value={section.id}
                            disabled={section.is_full}
                          >
                            <div className="flex items-center justify-between w-full gap-8">
                              <span>{section.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {section.is_full ? 'Full' : `${section.available_slots} slots`}
                              </span>
                            </div>
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
              name="transfer_date"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Transfer Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t('reasonOptional')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('transferReasonPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('transferStudent')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
