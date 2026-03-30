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
import { useStudentEnrollmentHistory, useEnrollStudent, useTransferStudent, useWithdrawStudent } from '@/features/enrollments/api/useEnrollments';
import { type Enrollment } from '@/features/enrollments/types';
import { EnrollmentWizard } from '@/features/enrollments/components/EnrollmentWizard';
import { TransferModal } from '@/features/enrollments/components/TransferModal';
import { WithdrawModal } from '@/features/enrollments/components/WithdrawModal';
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
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id);
  const { data: guardians } = useGuardiansForStudent(id);
  const { data: enrollments, isLoading: isLoadingEnrollments } = useStudentEnrollmentHistory(id);
  
  const enrollStudent = useEnrollStudent();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const transferStudent = useTransferStudent(selectedEnrollment?.id || '');
  const withdrawStudent = useWithdrawStudent(selectedEnrollment?.id || '');

  if (isLoading) return <LoadingSpinner fullPage text={tc('loading')} />;
  if (!student) return null;

  const initials = student.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const activeEnrollment = enrollments?.find(e => e.status === 'active');

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
                    Enroll Student
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Enroll Student</DialogTitle>
                  <DialogDescription>
                    Assign {student.full_name} to a class and section for an academic year.
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
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="enrollment" className="gap-2">
            <History className="h-4 w-4" />
            Enrollment History
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
                    <div className="text-xs text-muted-foreground uppercase mb-1">Current Enrollment</div>
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
                <CardTitle>Enrollment History</CardTitle>
                <CardDescription>Academic track record for this student.</CardDescription>
              </div>
              {!activeEnrollment && (
                <Button onClick={() => setIsEnrollModalOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  New Enrollment
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
                  title="No Enrollment History"
                  description="This student hasn't been enrolled in any academic years yet."
                  action={
                    <Button onClick={() => setIsEnrollModalOpen(true)}>Enroll Student Now</Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                                    Transfer Section
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="gap-2 text-destructive"
                                    onClick={() => {
                                      setSelectedEnrollment(enrollment);
                                      setIsWithdrawModalOpen(true);
                                    }}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                    Withdraw Student
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem className="gap-2">
                                <History className="h-4 w-4" />
                                View Details
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
