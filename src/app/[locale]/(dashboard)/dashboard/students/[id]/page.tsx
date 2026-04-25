'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useStudent } from '@/hooks/use-students';
import { useGuardiansForStudent } from '@/hooks/use-guardians';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge, RoleBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, BookOpen, User, Hash, History, UserPlus, MoreHorizontal, ArrowRightLeft, UserMinus } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarCheck, GraduationCap } from 'lucide-react';
import { useStudentEnrollmentHistory, useEnrollStudent, useTransferStudent, useWithdrawStudent } from '@/features/enrollments/api/useEnrollments';
import { type Enrollment } from '@/features/enrollments/types';
import { EnrollmentWizard } from '@/features/enrollments/components/EnrollmentWizard';
import { TransferModal } from '@/features/enrollments/components/TransferModal';
import { WithdrawModal } from '@/features/enrollments/components/WithdrawModal';
import { useStudentAttendance, useStudentAttendanceStats } from '@/features/attendance/api/useAttendance';
import { useTerms } from '@/features/academics/api/useTerms';
import { useReportCard } from '@/features/grades/api/useGrades';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/empty-state';

export default function StudentDetailPage() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const tg = useTranslations('guardians');
  const te = useTranslations('enrollments');
  const { id } = useParams<{ id: string }>();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [attendancePage, setAttendancePage] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState<string>('');

  const { data: student, isLoading } = useStudent(id);
  const { data: guardians } = useGuardiansForStudent(id);
  const { data: enrollments, isLoading: isLoadingEnrollments } = useStudentEnrollmentHistory(id);
  
  const activeEnrollment = enrollments?.find(e => e.status === 'active');
  const { data: attendanceData, isLoading: isLoadingAttendance } = useStudentAttendance(id, attendancePage, 20);
  const { data: attendanceStats, isLoading: isLoadingStats } = useStudentAttendanceStats(id);
  const { data: terms } = useTerms(activeEnrollment?.academic_year_id || '');
  const { data: reportCard, isLoading: isLoadingReportCard } = useReportCard(id, selectedTerm);

  const enrollStudent = useEnrollStudent();
  const transferStudent = useTransferStudent(selectedEnrollment?.id || '');
  const withdrawStudent = useWithdrawStudent(selectedEnrollment?.id || '');

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!student) return null;

  const initials = student.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('studentDetails')}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/students"><Button variant="outline" className="gap-2 min-h-[44px]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{tc('back')}</Button></Link>
            
            <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
              <DialogTrigger asChild>
              {!activeEnrollment && (
                <Button className="gap-2 min-h-[44px] bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4" />
                  {t('enrollStudent')}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t('enrollStudent')}</DialogTitle>
                <DialogDescription>
                  {t('academicTrackRecord')}
                </DialogDescription>
              </DialogHeader>
                <EnrollmentWizard 
                  studentId={id} 
                  studentName={student.full_name} 
                  onSubmit={async (data) => {
                    await enrollStudent.mutateAsync(data);
                    setIsEnrollModalOpen(false);
                  }}
                  isLoading={enrollStudent.isPending}
                />
              </DialogContent>
            </Dialog>

            <Link href={`/dashboard/students/${id}/edit`}><Button className="gap-2 min-h-[44px]" variant="secondary"><Pencil className="h-4 w-4" aria-hidden="true" />{tc('edit')}</Button></Link>
          </div>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{tc('profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="enrollment" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{te('enrollmentHistory')}</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{tc('attendance')}</span>
          </TabsTrigger>
          <TabsTrigger value="grades" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">{tc('grades')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 outline-none">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile card */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{student.full_name}</h2>
                <p className="text-sm font-mono text-muted-foreground mt-1">{student.registration_number}</p>
                <div className="mt-3">
                  <StatusBadge status={student.status || 'active'} />
                </div>
                {activeEnrollment && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-xs text-muted-foreground uppercase mb-1">{te('currentEnrollment')}</div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {activeEnrollment.class_name} — {activeEnrollment.section_name}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{t('personalInfo')}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={Mail} label={tc('email')} value={student.email} />
                  <InfoRow icon={Phone} label={tc('phone')} value={student.phone_number || '—'} />
                  <InfoRow icon={MapPin} label={tc('address')} value={student.address || '—'} />
                  <InfoRow icon={User} label={t('sex')} value={student.sex === 'M' ? t('male') : t('female')} />
                  <InfoRow icon={Calendar} label={t('dateOfBirth')} value={student.date_of_birth ? format(new Date(student.date_of_birth), 'MMM d, yyyy') : '—'} />
                  <InfoRow icon={Calendar} label={t('admissionDate')} value={student.admission_date ? format(new Date(student.admission_date), 'MMM d, yyyy') : '—'} />
                </div>
              </CardContent>
            </Card>

            {/* Academic Info */}
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle>{t('academicInfo')}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoRow icon={BookOpen} label={t('nationality')} value={student.nationality || '—'} />
                  <InfoRow icon={BookOpen} label={t('previousSchool')} value={student.previous_school || '—'} />
                  <InfoRow icon={Hash} label={t('ministryExamResult')} value={student.ministry_exam_result != null ? String(student.ministry_exam_result) : '—'} />
                </div>
              </CardContent>
            </Card>

            {/* Guardians */}
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle>{t('guardianInfo')}</CardTitle></CardHeader>
              <CardContent>
                {!guardians?.length ? (
                  <p className="text-sm text-muted-foreground">{tg('noLinkedStudents')}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {guardians.map((g: any) => (
                      <Link key={g.id || g.guardian_id} href={`/dashboard/guardians/${g.id || g.guardian_id}`}>
                        <div className="rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer">
                          <p className="font-medium">{g.full_name || g.guardian_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{g.relationship_type}</p>
                          {g.is_primary && <RoleBadge role="admin" label={tg('isPrimary')} />}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-6 outline-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{te('enrollmentHistory')}</CardTitle>
                <CardDescription>{t('academicTrackRecord')}</CardDescription>
              </div>
              {!activeEnrollment && (
                <Button onClick={() => setIsEnrollModalOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t('newEnrollment')}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingEnrollments ? (
                <div className="flex h-48 items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : !enrollments?.length ? (
                <EmptyState
                  icon={History}
                  title={t('noEnrollmentHistory')}
                  description={t('enrollmentPrompt')}
                  action={
                    <Button onClick={() => setIsEnrollModalOpen(true)}>{t('enrollStudent')}</Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tc('academicYear')}</TableHead>
                      <TableHead>{tc('class')}</TableHead>
                      <TableHead>{tc('section')}</TableHead>
                      <TableHead>{tc('date')}</TableHead>
                      <TableHead>{tc('status')}</TableHead>
                      <TableHead className="text-right">{tc('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{enrollment.academic_year_name}</TableCell>
                        <TableCell>{enrollment.class_name}</TableCell>
                        <TableCell>{enrollment.section_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(enrollment.enrollment_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              enrollment.status === 'active' ? 'default' : 
                              enrollment.status === 'withdrawn' ? 'destructive' : 
                              'outline'
                            }
                            className="capitalize"
                          >
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {enrollment.status === 'active' && (
                                <>
                                  <DropdownMenuItem 
                                    className="gap-2"
                                    onClick={() => {
                                      setSelectedEnrollment(enrollment);
                                      setIsTransferModalOpen(true);
                                    }}
                                  >
                                    <ArrowRightLeft className="h-4 w-4" />
                                    {t('transferSection')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="gap-2 text-destructive"
                                    onClick={() => {
                                      setSelectedEnrollment(enrollment);
                                      setIsWithdrawModalOpen(true);
                                    }}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                    {t('withdrawStudent')}
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem className="gap-2">
                                <History className="h-4 w-4" />
                                {t('viewDetails')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6 outline-none">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">{t('presentRate')}</div>
                {isLoadingStats ? <LoadingSpinner /> : (
                  <div className="text-3xl font-bold text-primary">
                    {attendanceStats ? Math.round(attendanceStats.attendance_rate * 100) || 0 : 0}%
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">{t('totalAbsences')}</div>
                {isLoadingStats ? <LoadingSpinner /> : (
                  <div className="text-3xl font-bold text-destructive">
                    {attendanceStats?.absent || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">{t('lateArrivals')}</div>
                {isLoadingStats ? <LoadingSpinner /> : (
                  <div className="text-3xl font-bold text-amber-500">
                    {attendanceStats?.late || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">{t('excused')}</div>
                {isLoadingStats ? <LoadingSpinner /> : (
                  <div className="text-3xl font-bold text-blue-500">
                    {attendanceStats?.excused || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('attendanceHistory')}</CardTitle>
              <CardDescription>{t('attendanceHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAttendance ? (
                <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div>
              ) : !attendanceData?.items?.length ? (
                <EmptyState icon={CalendarCheck} title={t('noData')} description={t('noAttendanceData')} />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tc('date')}</TableHead>
                        <TableHead>{tc('status')}</TableHead>
                        <TableHead>{tc('notes')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceData.items.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : 'outline'} className="capitalize">
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{record.notes || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {Math.ceil((attendanceData.total || 0) / 20) > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAttendancePage(p => Math.max(1, p-1))} disabled={attendancePage === 1}>{tc('previous')}</Button>
                        <span className="text-sm text-muted-foreground">{tc('page')} {attendancePage} {tc('of')} {Math.ceil((attendanceData.total || 0) / 20)}</span>
                        <Button variant="outline" size="sm" onClick={() => setAttendancePage(p => p+1)} disabled={attendancePage >= Math.ceil((attendanceData.total || 0) / 20)}>{tc('next')}</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-6 outline-none">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>{t('reportCard')}</CardTitle>
                <CardDescription>Academic performance records.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="">{t('selectTerm')}</option>
                  {terms?.items?.map((term: any) => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingReportCard ? (
                <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div>
              ) : !reportCard?.subjects?.length ? (
                <EmptyState icon={GraduationCap} title={t('noGradesAvailable')} description={t('noGradesPublished')} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('subject')}</TableHead>
                      <TableHead className="text-center">{t('totalScore')}</TableHead>
                      <TableHead className="text-center">{t('letterGrade')}</TableHead>
                      <TableHead>{t('teacherRemarks')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCard.subjects.map((sub: any) => (
                      <TableRow key={sub.subject_id}>
                        <TableCell className="font-medium">{sub.subject_name}</TableCell>
                        <TableCell className="text-center font-mono">{sub.total_score}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {sub.letter_grade || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{sub.remarks || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

      <TransferModal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        enrollment={selectedEnrollment}
        onSubmit={async (data) => {
          await transferStudent.mutateAsync(data);
          setIsTransferModalOpen(false);
        }}
        isLoading={transferStudent.isPending}
      />

      <WithdrawModal
        open={isWithdrawModalOpen}
        onOpenChange={setIsWithdrawModalOpen}
        enrollment={selectedEnrollment}
        onSubmit={async (data) => {
          await withdrawStudent.mutateAsync(data);
          setIsWithdrawModalOpen(false);
        }}
        isLoading={withdrawStudent.isPending}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
