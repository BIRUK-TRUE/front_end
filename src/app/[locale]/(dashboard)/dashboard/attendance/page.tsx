'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses, useClass } from '@/features/academics/api/useClasses';
import { useAttendanceBySection, useSubmitAttendance } from '@/features/attendance/api/useAttendance';
import { AttendanceStatus, type AttendanceEntry } from '@/features/attendance/types';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Loader2,
  Users,
  ClipboardCheck,
  UserX,
  Clock,
  ShieldCheck,
  ScanFace,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function AttendancePage() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [date, setDate] = useState(today);
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: classesData } = useClasses(selectedYearId, 1, 100);
  const { data: classDetail } = useClass(selectedClassId);
  const { data: existingRecords, isLoading: isLoadingRecords } = useAttendanceBySection(
    selectedSectionId,
    date
  );
  const submitAttendance = useSubmitAttendance();

  // Auto-select the current academic year on load
  useEffect(() => {
    if (yearsData?.items?.length && !selectedYearId) {
      const current = yearsData.items.find((y: any) => y.is_current);
      if (current) setSelectedYearId(current.id);
    }
  }, [yearsData, selectedYearId]);

  // Auto-select section if only one exists
  useEffect(() => {
    if (classDetail?.sections?.length === 1 && !selectedSectionId) {
      setSelectedSectionId(classDetail.sections[0].id);
    }
  }, [classDetail, selectedSectionId]);

  // Reset downstream when year changes
  useEffect(() => {
    setSelectedClassId('');
    setSelectedSectionId('');
  }, [selectedYearId]);

  useEffect(() => {
    setSelectedSectionId('');
  }, [selectedClassId]);

  // Populate entries from existing records — default everyone to PRESENT for new sessions
  useEffect(() => {
    if (existingRecords && existingRecords.length > 0) {
      const map: Record<string, AttendanceEntry> = {};
      existingRecords.forEach((r) => {
        // If the record already has a saved status, use it.
        // If it's a fresh roster (status is null/undefined), default to PRESENT.
        map[r.student_id] = {
          student_id: r.student_id,
          status: r.status ?? AttendanceStatus.PRESENT,
          note: r.note,
        };
      });
      setEntries(map);
      setSubmitted(false);
    }
  }, [existingRecords]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], student_id: studentId, status },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    if (!existingRecords) return;
    const map: Record<string, AttendanceEntry> = {};
    existingRecords.forEach((r) => {
      map[r.student_id] = { student_id: r.student_id, status };
    });
    setEntries(map);
  };

  const handleSubmit = () => {
    const entryList = Object.values(entries);
    if (entryList.length === 0) return;
    submitAttendance.mutate(
      { section_id: selectedSectionId, date, entries: entryList },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  // Stats
  const entryList = Object.values(entries);
  const presentCount = entryList.filter((e) => e.status === AttendanceStatus.PRESENT).length;
  const absentCount = entryList.filter((e) => e.status === AttendanceStatus.ABSENT).length;
  const lateCount = entryList.filter((e) => e.status === AttendanceStatus.LATE).length;
  const excusedCount = entryList.filter((e) => e.status === AttendanceStatus.EXCUSED).length;
  // "Unmarked" = students in the roster who have no entry yet (only possible before records load)
  const unmarkedCount = existingRecords
    ? existingRecords.filter((r) => !entries[r.student_id]).length
    : 0;
  // Students not present (absent + late + excused) — useful summary for the teacher
  const notPresentCount = absentCount + lateCount + excusedCount;

  const statusConfig: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
    [AttendanceStatus.PRESENT]: {
      label: 'Present',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    [AttendanceStatus.ABSENT]: {
      label: 'Absent',
      color: 'bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20',
      icon: <UserX className="h-3.5 w-3.5" />,
    },
    [AttendanceStatus.LATE]: {
      label: 'Late',
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20',
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    [AttendanceStatus.EXCUSED]: {
      label: 'Excused',
      color: 'bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20',
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
  };

  const isReady = !!selectedSectionId;
  const hasUnsaved = entryList.length > 0 && !submitted;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Take Attendance"
        description="Mark attendance for a class section. Today's date is pre-selected."
        actions={
          <Link href="/dashboard/attendance/face-scan">
            <Button variant="outline" className="gap-2 min-h-[44px]">
              <ScanFace className="h-4 w-4" />
              Use Face Scan
            </Button>
          </Link>
        }
      />

      {/* ── Filters ── */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Academic Year */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Academic Year
              </Label>
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select year…" />
                </SelectTrigger>
                <SelectContent>
                  {yearsData?.items?.map((year: any) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                      {year.is_current && (
                        <Badge variant="secondary" className="ml-2 text-[10px] h-4">Current</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Class
              </Label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
                disabled={!selectedYearId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue
                    placeholder={!selectedYearId ? 'Select year first' : 'Select class…'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {classesData?.items?.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} — Grade {cls.grade_level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Section
              </Label>
              <Select
                value={selectedSectionId}
                onValueChange={setSelectedSectionId}
                disabled={!selectedClassId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue
                    placeholder={!selectedClassId ? 'Select class first' : 'Select section…'}
                  />
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

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </Label>
              <Input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Empty state ── */}
      {!isReady ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Select a class section to begin"
          description="Choose the academic year, class, and section above. Today's date is already set."
        />
      ) : isLoadingRecords ? (
        <LoadingSpinner fullPage text="Loading students…" />
      ) : (
        <>
          {/* ── Default-to-present tip ── */}
          {existingRecords && existingRecords.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                All <strong>{existingRecords.length} students</strong> are defaulted to{' '}
                <strong>Present</strong>. Only mark students who are absent, late, or excused.
              </span>
            </div>
          )}
          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Present', count: presentCount, color: 'emerald', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
              { label: 'Absent', count: absentCount, color: 'red', icon: <UserX className="h-5 w-5 text-red-600" /> },
              { label: 'Late', count: lateCount, color: 'amber', icon: <Clock className="h-5 w-5 text-amber-600" /> },
              { label: 'Excused', count: excusedCount, color: 'blue', icon: <ShieldCheck className="h-5 w-5 text-blue-600" /> },
            ].map(({ label, count, color, icon }) => (
              <Card key={label} className={`border-${color}-500/30 bg-${color}-500/5`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-${color}-500/10 flex items-center justify-center shrink-0`}>
                    {icon}
                  </div>
                  <div>
                    <div className={`text-2xl font-bold text-${color}-600`}>{count}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Attendance grid ── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Student Attendance
                    {notPresentCount > 0 && (
                      <Badge variant="outline" className="ml-2 text-red-600 border-red-500/30 bg-red-500/10">
                        {notPresentCount} not present
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAll(AttendanceStatus.PRESENT)}
                    className="gap-1.5 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark All Present
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitAttendance.isPending || entryList.length === 0}
                    className="gap-1.5"
                  >
                    {submitAttendance.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : submitted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : null}
                    {submitted ? 'Saved ✓' : 'Save Attendance'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {existingRecords && existingRecords.length > 0 ? (
                <div className="space-y-2">
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
                        className={cn(
                          'flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors',
                          entry?.status === AttendanceStatus.ABSENT
                            ? 'border-red-500/30 bg-red-500/5'
                            : entry?.status === AttendanceStatus.LATE
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : entry?.status === AttendanceStatus.EXCUSED
                            ? 'border-blue-500/30 bg-blue-500/5'
                            : 'hover:bg-muted/30'
                        )}
                      >
                        {/* Student info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{record.student_name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {record.registration_number}
                            </div>
                          </div>
                        </div>

                        {/* Status buttons */}
                        <div className="flex flex-wrap gap-1.5">
                          {Object.values(AttendanceStatus).map((status) => {
                            const cfg = statusConfig[status];
                            const isSelected = entry?.status === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setStudentStatus(record.student_id, status)}
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-150',
                                  isSelected
                                    ? cfg.color + ' ring-1 ring-offset-1 ring-current'
                                    : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60'
                                )}
                                aria-pressed={isSelected}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Bottom save bar */}
                  <div className="flex justify-between items-center pt-3 border-t mt-4">
                    <p className="text-sm text-muted-foreground">
                      {presentCount} present · {notPresentCount > 0 ? `${notPresentCount} not present` : 'all present'}
                    </p>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitAttendance.isPending || entryList.length === 0}
                      className="gap-2"
                    >
                      {submitAttendance.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitted ? 'Attendance Saved ✓' : 'Save Attendance'}
                    </Button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No students found"
                  description="This section has no enrolled students, or the roster hasn't been set up yet."
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
