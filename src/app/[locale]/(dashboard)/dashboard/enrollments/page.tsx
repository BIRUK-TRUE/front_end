'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useEnrollments, useTransferStudent, useWithdrawStudent } from '@/features/enrollments/api/useEnrollments';
import { type Enrollment } from '@/features/enrollments/types';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  History, 
  MoreHorizontal, 
  ArrowRightLeft, 
  UserMinus,
  Loader2,
  FilterX
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';
import { EmptyState } from '@/components/shared/empty-state';
import { TransferModal } from '@/features/enrollments/components/TransferModal';
import { WithdrawModal } from '@/features/enrollments/components/WithdrawModal';

export default function EnrollmentsPage() {
  const t = useTranslations('enrollments');
  const tc = useTranslations('common');
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: yearsData } = useAcademicYears(1, 50);
  
  const enrollmentFilters = {
    page,
    search: search || undefined,
    academic_year_id: yearFilter !== 'all' ? yearFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { data: enrollmentsData, isLoading } = useEnrollments(enrollmentFilters);
  
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const transferStudent = useTransferStudent(selectedEnrollment?.id || '');
  const withdrawStudent = useWithdrawStudent(selectedEnrollment?.id || '');

  const handleResetFilters = () => {
    setSearch('');
    setYearFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description="Manage school-wide student enrollments, transfers, and withdrawals."
        actions={
          <Button className="gap-2" asChild>
            <Link href="/dashboard/students">
              <Plus className="h-4 w-4" />
              {t('enrollStudent')}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchEnrollments')}
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-56 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Academic Year</label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Academic Years</SelectItem>
              {yearsData?.items?.map((year) => (
                <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(search || yearFilter !== 'all' || statusFilter !== 'all') && (
          <Button 
            variant="ghost" 
            onClick={handleResetFilters}
            className="h-11 px-3 text-muted-foreground hover:text-foreground"
          >
            <FilterX className="h-4 w-4 mr-2" />
            {tc('reset')}
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Loading Enrollments...</p>
          </div>
        ) : !enrollmentsData?.items?.length ? (
          <EmptyState
            icon={History}
            title={t('noEnrollments')}
            description="No student enrollments found matching your filters."
            action={
              <Button variant="outline" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold py-4">Student</TableHead>
                  <TableHead className="font-bold py-4">Academic Year</TableHead>
                  <TableHead className="font-bold py-4">Class & Section</TableHead>
                  <TableHead className="font-bold py-4">Enrollment Date</TableHead>
                  <TableHead className="font-bold py-4">Status</TableHead>
                  <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollmentsData.items.map((enrollment) => (
                  <TableRow key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-base">
                          {enrollment.student_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {enrollment.id.split('-')[0].toUpperCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                        {enrollment.academic_year_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{enrollment.class_name}</span>
                        <span className="text-sm text-muted-foreground">Section: {enrollment.section_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {format(new Date(enrollment.enrollment_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        className="capitalize"
                        variant={
                          enrollment.status === 'active' ? 'default' : 
                          enrollment.status === 'withdrawn' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/${enrollment.student_id}`} className="flex items-center gap-2">
                              <History className="h-4 w-4" />
                              Student History
                            </Link>
                          </DropdownMenuItem>
                          {enrollment.status === 'active' && (
                            <>
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setIsTransferModalOpen(true);
                                }}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                                {t('transferStudent')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

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
