'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useStudents, useDeleteStudent, useRestoreStudent } from '@/hooks/use-students';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentsPage() {
  const t = useTranslations('students');
  const tc = useTranslations('common');
  const { canManageStudents } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = {
    page, size: 20,
    search: search || undefined,
    status: (statusFilter || undefined) as any,
    sex: (sexFilter || undefined) as any,
  };

  const { data, isLoading } = useStudents(filters);
  const deleteStudent = useDeleteStudent();
  const restoreStudent = useRestoreStudent();

  const handleDelete = () => {
    if (deleteId) {
      deleteStudent.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        actions={
          canManageStudents ? (
            <Link href="/dashboard/students/create">
              <Button className="gap-2 min-h-[44px]">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('createStudent')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t('searchStudents')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-11"
                aria-label={tc('search')}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px] h-11">
                <SelectValue placeholder={tc('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                {['active', 'graduated', 'transferred', 'expelled', 'withdrawn'].map((s) => (
                  <SelectItem key={s} value={s}>{t(`status${s.charAt(0).toUpperCase() + s.slice(1)}` as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sexFilter} onValueChange={(v) => { setSexFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[120px] h-11">
                <SelectValue placeholder={t('sex')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('all')}</SelectItem>
                <SelectItem value="M">{t('male')}</SelectItem>
                <SelectItem value="F">{t('female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16"><LoadingSpinner text={tc('loading')} /></div>
          ) : !data?.items?.length ? (
            <EmptyState
              icon={GraduationCap}
              title={t('noStudents')}
              action={canManageStudents ? (
                <Link href="/dashboard/students/create">
                  <Button className="gap-2"><Plus className="h-4 w-4" aria-hidden="true" />{t('createStudent')}</Button>
                </Link>
              ) : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('registrationNumber')}</TableHead>
                      <TableHead>{tc('name')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('sex')}</TableHead>
                      <TableHead>{tc('status')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('admissionDate')}</TableHead>
                      <TableHead className="w-[60px]"><span className="sr-only">{tc('actions')}</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{student.registration_number}</TableCell>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{student.sex === 'M' ? t('male') : t('female')}</TableCell>
                        <TableCell><StatusBadge status={student.status || 'active'} /></TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {student.admission_date ? format(new Date(student.admission_date), 'MMM d, yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label={`${tc('actions')} for ${student.full_name}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" aria-hidden="true" />{tc('view')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/students/${student.id}/edit`} className="flex items-center gap-2">
                                  <Pencil className="h-4 w-4" aria-hidden="true" />{tc('edit')}
                                </Link>
                              </DropdownMenuItem>
                              {student.status === 'inactive' && (
                                <DropdownMenuItem onClick={() => restoreStudent.mutate(student.id)} className="flex items-center gap-2">
                                  <RotateCcw className="h-4 w-4" aria-hidden="true" />{tc('restore')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => setDeleteId(student.id)} className="text-destructive focus:text-destructive flex items-center gap-2">
                                <Trash2 className="h-4 w-4" aria-hidden="true" />{tc('delete')}
                              </DropdownMenuItem>
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
                  <p className="text-sm text-muted-foreground">{tc('showing')} {(data.page - 1) * data.size + 1}–{Math.min(data.page * data.size, data.total)} {tc('of')} {data.total}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="min-h-[44px]">{tc('previous')}</Button>
                    <span className="text-sm">{tc('page')} {data.page} {tc('of')} {data.pages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.pages} className="min-h-[44px]">{tc('next')}</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} onConfirm={handleDelete} isLoading={deleteStudent.isPending} />
    </div>
  );
}
