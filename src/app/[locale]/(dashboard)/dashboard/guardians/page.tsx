'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useGuardians, useDeleteGuardian, useGuardianStats } from '@/hooks/use-guardians';
import type { GuardianFilters } from '@/lib/api/guardians.service';
import { usePermissions } from '@/hooks/use-permissions';
import { ActionsDropdown } from '@/components/shared/actions-dropdown';
import { DataTableToolbar } from '@/components/shared/data-table-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { StatsRow } from '@/components/shared/stats-row';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DataTable } from '@/components/shared/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Download, Eye, Pencil, Plus, Trash2, UserCheck, UserRoundCheck, UserRoundX, Users } from 'lucide-react';

type GuardianRow = {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  occupation?: string | null;
  is_active?: boolean;
  student_links?: unknown[];
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GU';
}

export default function GuardiansPage() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const { canManageGuardians } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = {
    page,
    size: 20,
    search: search || undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  };
  const { data, isLoading } = useGuardians(filters satisfies GuardianFilters);
  const { data: guardianStats, isLoading: statsLoading } = useGuardianStats();
  const deleteGuardian = useDeleteGuardian();
  const guardians = useMemo<GuardianRow[]>(() => data?.items || [], [data?.items]);

  const stats = useMemo(() => {
    // Use actual stats from API, not filtered page data
    const totalGuardians = guardianStats?.total || 0;
    const activeGuardians = guardianStats?.active || 0;
    const inactiveGuardians = totalGuardians - activeGuardians;
    const linked = guardians.reduce((sum, guardian) => sum + (guardian.student_links?.length || 0), 0);
    
    return [
      { title: 'Total', value: totalGuardians, icon: UserCheck, description: 'All guardians in the system' },
      { title: 'Active', value: activeGuardians, icon: UserRoundCheck, description: 'Can receive messages and portal updates', trend: { label: 'Reachable contacts', tone: 'positive' as const } },
      { title: 'Inactive', value: inactiveGuardians, icon: UserRoundX, description: 'Archived or disabled accounts' },
      { title: 'Linked Students', value: linked, icon: Activity, description: 'Student relationships in current view' },
    ];
  }, [guardianStats, guardians]);

  const columns: ColumnDef<GuardianRow>[] = [
    {
      id: 'select',
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all guardians" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={`Select ${row.original.full_name}`} />,
    },
    {
      accessorKey: 'full_name',
      header: tc('name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(row.original.full_name)}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'email', header: tc('email'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span> },
    { accessorKey: 'phone_number', header: tc('phone'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone_number || '-'}</span> },
    { accessorKey: 'occupation', header: t('occupation'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.occupation || '-'}</span> },
    { accessorKey: 'student_links', header: t('linkedStudents'), cell: ({ row }) => <span>{row.original.student_links?.length || 0}</span> },
    { accessorKey: 'is_active', header: tc('status'), cell: ({ row }) => <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} label={row.original.is_active ? tc('active') : tc('inactive')} /> },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('actions')}</span>,
      cell: ({ row }) => {
        const guardian = row.original;
        return (
          <ActionsDropdown
            label={`${tc('actions')} for ${guardian.full_name}`}
            items={[
              { label: tc('view'), icon: Eye, href: <Link href={`/dashboard/guardians/${guardian.id}`} className="flex items-center gap-2"><Eye className="h-4 w-4" />{tc('view')}</Link> },
              { label: tc('edit'), icon: Pencil, href: <Link href={`/dashboard/guardians/${guardian.id}/edit`} className="flex items-center gap-2"><Pencil className="h-4 w-4" />{tc('edit')}</Link> },
              ...(guardian.is_active ? [{ label: tc('delete'), icon: Trash2, destructive: true, onSelect: () => setDeleteId(guardian.id) }] : []),
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        icon={Users}
        breadcrumb={['Admin', 'People', 'Guardians']}
        action={canManageGuardians ? (
          <Link href="/dashboard/guardians/create">
            <Button className="min-h-11 gap-2"><Plus className="h-4 w-4" aria-hidden="true" />{t('createGuardian')}</Button>
          </Link>
        ) : undefined}
      />

      <StatsRow items={stats} isLoading={statsLoading} />

      <DataTableToolbar search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchPlaceholder={t('searchGuardians')}>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
          <SelectTrigger className="h-11 w-full sm:w-[160px]"><SelectValue placeholder={tc('status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tc('all')}</SelectItem>
            <SelectItem value="active">{tc('active')}</SelectItem>
            <SelectItem value="inactive">{tc('inactive')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-11 gap-2"><Download className="h-4 w-4" aria-hidden="true" />Export</Button>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={guardians}
        isLoading={isLoading}
        manualPagination
        pageCount={data?.pages || 1}
        pagination={{ pageIndex: page - 1, pageSize: 20 }}
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: 20 }) : updater;
          setPage(next.pageIndex + 1);
        }}
        emptyState={<EmptyState icon={UserCheck} title={t('noGuardians')} />}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteGuardian.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        isLoading={deleteGuardian.isPending}
      />
    </div>
  );
}
