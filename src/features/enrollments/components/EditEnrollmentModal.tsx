'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { type Enrollment } from '../types';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses } from '@/features/academics/api/useClasses';
import { useSectionStudents } from '@/features/academics/api/useSectionStudents';

const editEnrollmentSchema = z.object({
  class_id: z.string().optional(),
  section_id: z.string().optional(),
  status: z.enum(['active', 'withdrawn', 'transferred', 'completed']).optional(),
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

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(enrollment?.academic_year_id || '', 1, 50);
  const { data: sectionsData } = useSectionStudents(enrollment?.section_id || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditEnrollmentForm>({
    resolver: zodResolver(editEnrollmentSchema),
    defaultValues: {
      status: enrollment?.status || 'active',
      class_id: enrollment?.class_id || '',
      section_id: enrollment?.section_id || '',
    },
  });

  const selectedClassId = watch('class_id');

  useEffect(() => {
    if (enrollment) {
      setValue('status', enrollment.status);
      setValue('class_id', enrollment.class_id || '');
      setValue('section_id', enrollment.section_id || '');
    }
  }, [enrollment, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editEnrollment')}</DialogTitle>
          <DialogDescription>
            {t('editEnrollmentDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">{tc('status')}</Label>
            <Select
              defaultValue={enrollment?.status || 'active'}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={tc('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('statusActive')}</SelectItem>
                <SelectItem value="withdrawn">{t('statusWithdrawn')}</SelectItem>
                <SelectItem value="transferred">{t('statusTransferred')}</SelectItem>
                <SelectItem value="completed">{t('statusCompleted')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_id">{t('class')}</Label>
            <Select
              value={watch('class_id')}
              onValueChange={(value) => {
                setValue('class_id', value);
                setValue('section_id', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectClass')} />
              </SelectTrigger>
              <SelectContent>
                {classesData?.items?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClassId && (
            <div className="space-y-2">
              <Label htmlFor="section_id">{t('section')}</Label>
              <Select
                value={watch('section_id')}
                onValueChange={(value) => setValue('section_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSection')} />
                </SelectTrigger>
                <SelectContent>
                  {classesData?.items?.find(c => c.id === selectedClassId)?.sections?.map((section) => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
      </DialogContent>
    </Dialog>
  );
}
