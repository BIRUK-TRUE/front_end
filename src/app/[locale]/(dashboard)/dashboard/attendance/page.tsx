'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses } from '@/features/academics/api/useClasses';
import { useClass } from '@/features/academics/api/useClasses';
import { useAttendanceBySection, useSubmitAttendance } from '@/features/attendance/api/useAttendance';
import { AttendanceStatus, type AttendanceEntry } from '@/features/attendance/types';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Link } from '@/i18n/navigation';
import { CalendarDays, Check, CheckCircle2, Loader2, Users, ClipboardCheck, UserX, Clock, ShieldCheck, ScanFace, QrCode } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

export default function AttendancePage() {
  const tc = useTranslations('common');
  const t = useTranslations('attendancePage');
  const ta = useTranslations('teacher.attendance');

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [date, setDate] = useState(today);

  // Entries: studentId -> { status, note }
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({});

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const { data: existingRecords, isLoading: isLoadingRecords } = useAttendanceBySection(selectedSectionId, date);

  const submitAttendance = useSubmitAttendance();

  // Reset downstream when year changes
  useEffect(() => {
    setSelectedClassId('');
    setSelectedSectionId('');
  }, [selectedYearId]);

  useEffect(() => {
    setSelectedSectionId('');
  }, [selectedClassId]);

  // Initialize entries from existing records or section roster
  useEffect(() => {
    if (existingRecords && existingRecords.length > 0) {
      const map: Record<string, AttendanceEntry> = {};
      existingRecords.forEach((r) => {
        map[r.student_id] = {
          student_id: r.student_id,
          status: r.status,
          note: r.note,
        };
      });
      setEntries(map);
    }
  }, [existingRecords]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        status,
      },
    }));
  };

  const markAllPresent = () => {
    if (!existingRecords) return;
    const map: Record<string, AttendanceEntry> = {};
    existingRecords.forEach((r) => {
      map[r.student_id] = {
        student_id: r.student_id,
        status: AttendanceStatus.PRESENT,
      };
    });
    setEntries(map);
  };

  const handleSubmit = () => {
    const entryList = Object.values(entries);
    if (entryList.length === 0) return;

    submitAttendance.mutate({
      section_id: selectedSectionId,
      date,
      entries: entryList,
    });
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20';
      case AttendanceStatus.ABSENT:
        return 'bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20';
      case AttendanceStatus.LATE:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20';
      case AttendanceStatus.EXCUSED:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle2 className="h-4 w-4" />;
      case AttendanceStatus.ABSENT:
        return <UserX className="h-4 w-4" />;
      case AttendanceStatus.LATE:
        return <Clock className="h-4 w-4" />;
      case AttendanceStatus.EXCUSED:
        return <ShieldCheck className="h-4 w-4" />;
    }
  };

  // Count stats
  const entryList = Object.values(entries);
  const presentCount = entryList.filter((e) => e.status === AttendanceStatus.PRESENT).length;
  const absentCount = entryList.filter((e) => e.status === AttendanceStatus.ABSENT).length;
  const lateCount = entryList.filter((e) => e.status === AttendanceStatus.LATE).length;
  const excusedCount = entryList.filter((e) => e.status === AttendanceStatus.EXCUSED).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {/* Attendance Method Selector */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium mb-4">{t('selectMethod')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="default"
              className="w-full h-16 justify-start gap-3"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{t('manualEntry')}</div>
                <div className="text-xs opacity-80">{t('manualEntryDesc')}</div>
              </div>
            </Button>
            <Link href="/dashboard/attendance/face-scan" className="w-full">
              <Button
                variant="outline"
                className="w-full h-16 justify-start gap-3 hover:border-primary/50"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ScanFace className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{t('faceScan')}</div>
                  <div className="text-xs text-muted-foreground">{t('faceScanDesc')}</div>
                </div>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full h-16 justify-start gap-3 hover:border-primary/50"
              disabled
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{t('barcodeId')}</div>
                <div className="text-xs text-muted-foreground">{t('barcodeIdDesc')}</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('academicYear')}</Label>
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t('selectYear')} />
                </SelectTrigger>
                <SelectContent>
                  {yearsData?.items?.map((year: any) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name} {year.is_current ? `(${tc('current')})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{tc('class')}</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={!selectedYearId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={!selectedYearId ? t('selectYearFirst') : t('selectClass')} />
                </SelectTrigger>
                <SelectContent>
                  {classesData?.items?.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} (Grade {cls.grade_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('selectSection')}</Label>
              <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={!selectedClassId ? t('selectClassFirst') : t('selectSection')} />
                </SelectTrigger>
                <SelectContent>
                  {classDetail?.sections?.map((section: any) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('date')}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedSectionId ? (
        <EmptyState
          icon={ClipboardCheck}
          title={t('selectSection')}
          description={t('selectSectionPrompt')}
        />
      ) : isLoadingRecords ? (
        <LoadingSpinner fullPage text={tc('loading')} />
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{presentCount}</div>
                  <div className="text-xs text-muted-foreground">{t('present')}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                  <div className="text-xs text-muted-foreground">{t('absent')}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{lateCount}</div>
                  <div className="text-xs text-muted-foreground">{t('late')}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{excusedCount}</div>
                  <div className="text-xs text-muted-foreground">{t('excused')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Grid */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{t('studentAttendance')}</CardTitle>
                  <CardDescription>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent} className="gap-2">
                    <Check className="h-4 w-4" />
                    {t('markAllPresent')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitAttendance.isPending || entryList.length === 0}
                    className="gap-2"
                  >
                    {submitAttendance.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t('submitAttendance')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {existingRecords && existingRecords.length > 0 ? (
                <div className="space-y-3">
                  {existingRecords.map((record) => {
                    const entry = entries[record.student_id];
                    const initials = record.student_name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <div
                        key={record.student_id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{record.student_name}</div>
                            <div className="text-xs text-muted-foreground">{record.registration_number}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {Object.values(AttendanceStatus).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setStudentStatus(record.student_id, status)}
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium capitalize
                                transition-all duration-150
                                ${entry?.status === status ? getStatusColor(status) + ' ring-1 ring-offset-1' : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'}
                              `}
                            >
                              {getStatusIcon(status)}
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title={t('noStudentsFound')}
                  description={t('noStudentsDesc')}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
