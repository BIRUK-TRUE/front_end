'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
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
  MoreHorizontal, 
  Edit, 
  Trash2,
  Loader2,
  FilterX
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useFees, useCreateFee, useUpdateFee, useDeleteFee } from '@/features/payments/api/useFees';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useTerms } from '@/features/academics/api/useTerms';
import { type FeeConfig, FeeType } from '@/features/payments/types';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { FeeModal } from '@/features/payments/components/FeeModal';
import { ProtectedRoute } from '@/components/auth/protected-route';

function FeesPageContent() {
  const t = useTranslations('fees');
  const tc = useTranslations('common');
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: yearsData } = useAcademicYears(1, 50);
  const { data: termsData } = useTerms(yearFilter);
  
  const feeFilters = {
    page,
    search: search || undefined,
    academic_year_id: yearFilter !== 'all' ? yearFilter : undefined,
    term_id: termFilter !== 'all' ? termFilter : undefined,
    is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
  };

  const { data: feesData, isLoading } = useFees(feeFilters);
  
  const [selectedFee, setSelectedFee] = useState<FeeConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteFeeId, setDeleteFeeId] = useState<string | null>(null);

  const createFee = useCreateFee();
  const updateFee = useUpdateFee();
  const deleteFee = useDeleteFee();

  const handleResetFilters = () => {
    setSearch('');
    setYearFilter('all');
    setTermFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const columns: ColumnDef<FeeConfig>[] = [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: t('type'),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: t('amount'),
      cell: ({ row }) => (
        <span className="font-mono">{row.original.amount.toLocaleString()} ETB</span>
      ),
    },
    {
      accessorKey: 'grade_level',
      header: t('gradeLevel'),
      cell: ({ row }) => (
        <span>{row.original.grade_level || t('allGrades')}</span>
      ),
    },
    {
      accessorKey: 'due_date',
      header: t('dueDate'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.due_date ? new Date(row.original.due_date).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: tc('status'),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const fee = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedFee(fee);
                  setIsModalOpen(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tc('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteFeeId(fee.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {tc('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button className="gap-2" onClick={() => { setSelectedFee(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4" />
            {t('createFee')}
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{t('search')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{t('academicYear')}</label>
          <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setTermFilter('all'); }}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('allYears')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allYears')}</SelectItem>
              {yearsData?.items?.map((year) => (
                <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{t('term')}</label>
          <Select value={termFilter} onValueChange={setTermFilter} disabled={!yearFilter || yearFilter === 'all'}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('allTerms')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTerms')}</SelectItem>
              {termsData?.items?.map((term) => (
                <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{tc('status')}</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(search || yearFilter !== 'all' || termFilter !== 'all' || statusFilter !== 'all') && (
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
        <DataTable
          columns={columns}
          data={feesData?.items || []}
          isLoading={isLoading}
          manualPagination
          pageCount={feesData?.pages || 1}
          pagination={{ pageIndex: page - 1, pageSize: 20 }}
          onPaginationChange={(updater) => {
            if (typeof updater === 'function') {
              const newState = updater({ pageIndex: page - 1, pageSize: 20 });
              setPage(newState.pageIndex + 1);
            } else {
              setPage(updater.pageIndex + 1);
            }
          }}
          emptyState={
            <EmptyState
              icon={Search}
              title={t('noFees')}
              description={t('noFeesForFilters')}
              action={
                <Button variant="outline" onClick={handleResetFilters}>
                  {t('clearAllFilters')}
                </Button>
              }
            />
          }
        />
      </div>

      <FeeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        fee={selectedFee}
        years={yearsData?.items || []}
        terms={termsData?.items || []}
        onSubmit={async (data) => {
          if (selectedFee) {
            await updateFee.mutateAsync({ id: selectedFee.id, data });
          } else {
            await createFee.mutateAsync(data);
          }
          setIsModalOpen(false);
        }}
        isLoading={createFee.isPending || updateFee.isPending}
      />

      <ConfirmDialog
        open={!!deleteFeeId}
        onOpenChange={(open) => { if (!open) setDeleteFeeId(null); }}
        onConfirm={async () => {
          if (deleteFeeId) {
            await deleteFee.mutateAsync(deleteFeeId);
            setDeleteFeeId(null);
          }
        }}
        title={t('deleteFeeTitle')}
        description={t('deleteFeeDescription')}
        isLoading={deleteFee.isPending}
      />
    </div>
  );
}

export default function FeesPage() {
  return (
    <ProtectedRoute requireRoles={['admin', 'registrar']}>
      <FeesPageContent />
    </ProtectedRoute>
  );
}
