'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAdminLogs, useActionTypes, useResourceTypes } from '@/hooks/use-admin-logs';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Shield } from 'lucide-react';

export default function AdminLogsPage() {
  const t = useTranslations('adminLogs');
  const tc = useTranslations('common');
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filters = {
    page,
    size: 50,
    action: actionFilter || undefined,
    resource_type: resourceTypeFilter || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading } = useAdminLogs(filters);
  const { data: actionTypes } = useActionTypes();
  const { data: resourceTypes } = useResourceTypes();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'created_at',
      header: tc('date'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.created_at), 'MMM d, yyyy HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'actor_name',
      header: tc('user'),
      cell: ({ row }) => <span className="font-medium">{row.original.actor_name}</span>,
    },
    {
      accessorKey: 'action',
      header: tc('action'),
      cell: ({ row }) => {
        const action = row.original.action;
        const variant = 
          action === 'CREATE' ? 'default' :
          action === 'UPDATE' ? 'secondary' :
          action === 'DELETE' ? 'destructive' :
          'outline';
        return <Badge variant={variant}>{action}</Badge>;
      },
    },
    {
      accessorKey: 'resource_type',
      header: tc('resource'),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.resource_type}</Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: tc('description'),
      cell: ({ row }) => (
        <span className="max-w-md truncate" title={row.original.description}>
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: tc('status'),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'success' ? 'default' : 'destructive'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchLogs')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-11">
                <SelectValue placeholder={tc('action')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                {actionTypes?.actions?.map((action: string) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-11">
                <SelectValue placeholder={tc('resource')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                {resourceTypes?.resource_types?.map((type: string) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-11">
                <SelectValue placeholder={tc('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                <SelectItem value="success">{tc('success')}</SelectItem>
                <SelectItem value="failed">{tc('failed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        manualPagination
        pageCount={data?.pages || 1}
        pagination={{ pageIndex: page - 1, pageSize: 50 }}
        onPaginationChange={(updater) => {
          if (typeof updater === 'function') {
            const newState = updater({ pageIndex: page - 1, pageSize: 50 });
            setPage(newState.pageIndex + 1);
          } else {
            setPage(updater.pageIndex + 1);
          }
        }}
      />
    </div>
  );
}
