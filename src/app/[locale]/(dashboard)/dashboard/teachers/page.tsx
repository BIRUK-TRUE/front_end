'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useTeachers, useDeleteTeacher, useRestoreTeacher } from '@/hooks/use-teachers';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function TeachersPage() {
  const t = useTranslations('teachers');
  const tc = useTranslations('common');
  const { canManageTeachers } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = { page, size: 20, search: search || undefined, status: (statusFilter || undefined) as any };
  const { data, isLoading } = useTeachers(filters);
  const deleteTeacher = useDeleteTeacher();
  const restoreTeacher = useRestoreTeacher();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        actions={canManageTeachers ? (
          <Link href="/dashboard/teachers/create">
            <Button className="gap-2 min-h-[44px]"><Plus className="h-4 w-4" aria-hidden="true" />{t('createTeacher')}</Button>
          </Link>
        ) : undefined}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input placeholder={t('searchTeachers')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-11" aria-label={tc('search')} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px] h-11"><SelectValue placeholder={tc('status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                {['active', 'on_leave', 'suspended', 'resigned', 'retired'].map((s) => (
                  <SelectItem key={s} value={s}>{t(`status${s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}` as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16"><LoadingSpinner text={tc('loading')} /></div>
          ) : !data?.items?.length ? (
            <EmptyState icon={BookOpen} title={t('noTeachers')} action={canManageTeachers ? (
              <Link href="/dashboard/teachers/create"><Button className="gap-2"><Plus className="h-4 w-4" />{t('createTeacher')}</Button></Link>
            ) : undefined} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('employeeId')}</TableHead>
                      <TableHead>{tc('name')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('specialization')}</TableHead>
                      <TableHead>{tc('status')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('hireDate')}</TableHead>
                      <TableHead className="w-[60px]"><span className="sr-only">{tc('actions')}</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((teacher: any) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-mono text-sm">{teacher.employee_id || '—'}</TableCell>
                        <TableCell className="font-medium">{teacher.full_name}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{teacher.specialization || '—'}</TableCell>
                        <TableCell><StatusBadge status={teacher.status || 'active'} /></TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{teacher.hire_date ? format(new Date(teacher.hire_date), 'MMM d, yyyy') : '—'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label={`${tc('actions')} for ${teacher.full_name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/dashboard/teachers/${teacher.id}`} className="flex items-center gap-2"><Eye className="h-4 w-4" />{tc('view')}</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href={`/dashboard/teachers/${teacher.id}/edit`} className="flex items-center gap-2"><Pencil className="h-4 w-4" />{tc('edit')}</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeleteId(teacher.id)} className="text-destructive focus:text-destructive flex items-center gap-2"><Trash2 className="h-4 w-4" />{tc('delete')}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {data.pages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">{tc('showing')} {(data.page-1)*data.size+1}–{Math.min(data.page*data.size, data.total)} {tc('of')} {data.total}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="min-h-[44px]">{tc('previous')}</Button>
                    <span className="text-sm">{tc('page')} {data.page} {tc('of')} {data.pages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p+1)} disabled={page>=data.pages} className="min-h-[44px]">{tc('next')}</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={() => { if(deleteId) deleteTeacher.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} isLoading={deleteTeacher.isPending} />
    </div>
  );
}
