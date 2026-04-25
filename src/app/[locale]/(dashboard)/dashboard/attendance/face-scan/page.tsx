'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses, useClass } from '@/features/academics/api/useClasses';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScanFace, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { FaceAttendanceStation } from '@/features/attendance/components/FaceAttendanceStation';
import { useSectionStudents } from '@/features/attendance/hooks/useSectionStudents';

export default function FaceScanPage() {
  const t = useTranslations('faceAttendance.station');
  const tc = useTranslations('common');
  
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [isStationActive, setIsStationActive] = useState(false);

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const { data: sectionStudents } = useSectionStudents(selectedSectionId);

  const selectedSectionName = classDetail?.sections?.find(s => s.id === selectedSectionId)?.name || '';

  if (isStationActive && selectedSectionId) {
    return (
      <FaceAttendanceStation 
        sectionId={selectedSectionId}
        sectionName={selectedSectionName}
        students={sectionStudents || []}
        onClose={() => setIsStationActive(false)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <PageHeader title={t('title')} description={t('subtitle')} />
        <Link href="/dashboard/attendance">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Attendance
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-primary/10 rounded-2xl w-fit mb-4">
              <ScanFace className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black">{t('selectSection')}</CardTitle>
            <CardDescription>{t('selectSectionPrompt')}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>{tc('academicYear')}</Label>
                <Select
                  value={selectedYearId}
                  onValueChange={(val) => {
                    setSelectedYearId(val);
                    setSelectedClassId('');
                    setSelectedSectionId('');
                  }}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder={tc('selectYear')} />
                  </SelectTrigger>
                  <SelectContent>
                    {yearsData?.items?.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{tc('class')}</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(val) => {
                    setSelectedClassId(val);
                    setSelectedSectionId('');
                  }}
                  disabled={!selectedYearId}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder={!selectedYearId ? tc('selectYearFirst') : tc('selectClass')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classesData?.items?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{tc('section')}</Label>
                <Select
                  value={selectedSectionId}
                  onValueChange={setSelectedSectionId}
                  disabled={!selectedClassId}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder={!selectedClassId ? tc('selectClassFirst') : tc('selectSection')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classDetail?.sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 mt-4" 
              disabled={!selectedSectionId}
              onClick={() => setIsStationActive(true)}
            >
              <LayoutGrid className="mr-2 h-5 w-5" />
              {t('startSession')}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Card className="bg-slate-50 border-none">
             <CardContent className="p-4 flex gap-3 italic text-xs text-muted-foreground">
                <div className="p-2 bg-white rounded-lg h-fit">💡</div>
                Ensure the station is in a well-lit area near the entrance for maximum accuracy.
             </CardContent>
           </Card>
           <Card className="bg-slate-50 border-none">
             <CardContent className="p-4 flex gap-3 italic text-xs text-muted-foreground">
                <div className="p-2 bg-white rounded-lg h-fit">🔒</div>
                All face scanning data is processed locally on this device. No face images leave the facility.
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
