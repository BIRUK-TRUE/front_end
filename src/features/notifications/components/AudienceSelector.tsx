'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useClasses } from '@/features/academics/api/useClasses';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { Badge } from '@/components/ui/badge';
import { Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudienceSelectorProps {
  onTypeChange: (type: string) => void;
  onTargetChange: (ids: string[]) => void;
  selectedType: string;
  selectedIds: string[];
}

export function AudienceSelector({ onTypeChange, onTargetChange, selectedType, selectedIds }: AudienceSelectorProps) {
  const t = useTranslations('notifications.compose');
  const { data: yearsData } = useAcademicYears(1, 50);
  const currentYearId = yearsData?.items?.find(y => y.is_current)?.id || '';
  const { data: classes } = useClasses(currentYearId);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const audienceTypes = [
    { id: 'all_students', label: t('audienceTypes.all_students') },
    { id: 'all_guardians', label: t('audienceTypes.all_guardians') },
    { id: 'all_teachers', label: t('audienceTypes.all_teachers') },
    { id: 'class', label: t('audienceTypes.class') },
    { id: 'section', label: t('audienceTypes.section') },
    { id: 'individual', label: t('audienceTypes.individual') },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('audience')}</Label>
        <Select 
          value={selectedType} 
          onValueChange={(val) => {
            onTypeChange(val);
            onTargetChange([]); // Reset targets when type changes
          }}
        >
          <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20">
            <SelectValue placeholder={t('selectAudience')} />
          </SelectTrigger>
          <SelectContent>
            {audienceTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(selectedType === 'class' || selectedType === 'section') && (
        <div className="grid gap-2 animate-in slide-in-from-top-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {selectedType === 'class' ? t('selectClass') : t('selectSection')}
          </Label>
          <Select 
            value={selectedClassId} 
            onValueChange={(val) => {
              setSelectedClassId(val);
              onTargetChange([val]);
            }}
          >
            <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20">
              <SelectValue placeholder={t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {classes?.items?.filter(cls => !!cls.id).map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  <span className="truncate max-w-[200px] block">{cls.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedType === 'individual' && (
        <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center space-y-2">
           <Users className="h-8 w-8 text-muted-foreground opacity-20" />
           <p className="text-sm font-medium text-muted-foreground">{t('searchStudents')}</p>
           <p className="text-[10px] text-muted-foreground opacity-70 italic">{t('searchPending')}</p>
        </div>
      )}
    </div>
  );
}
