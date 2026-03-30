'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGuardians, useDeleteGuardian } from '@/hooks/use-guardians';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, UserCheck } from 'lucide-react';

export default function GuardiansPage() {
  const t = useTranslations('guardians');
  const tc = useTranslations('common');
  const { canManageGuardians } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = { page, size: 20, search: search || undefined };
  const { data, isLoading } = useGuardians(filters);
  const deleteGuardian = useDeleteGuardian();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        actions={canManageGuardians ? (
          <Link href="/dashboard/guardians/create">
            <Button className="gap-2 min-h-[44px]"><Plus className="h-4 w-4" />{t('createGuardian')}</Button>
          </Link>
        ) : undefined}
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('searchGuardians')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-11" aria-label={tc('search')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16"><LoadingSpinner text={tc('loading')} /></div>
          ) : !data?.items?.length ? (
            <EmptyState icon={UserCheck} title={t('noGuardians')} action={canManageGuardians ? (
              <Link href="/dashboard/guardians/create"><Button className="gap-2"><Plus className="h-4 w-4" />{t('createGuardian')}</Button></Link>
            ) : undefined} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tc('name')}</TableHead>
                      <TableHead>{tc('email')}</TableHead>
                      <TableHead className="hidden md:table-cell">{tc('phone')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('occupation')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('linkedStudents')}</TableHead>
                      <TableHead className="w-[60px]"><span className="sr-only">{tc('actions')}</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((guardian: any) => (
                      <TableRow key={guardian.id}>
                        <TableCell className="font-medium">{guardian.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{guardian.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{guardian.phone_number || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{guardian.occupation || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{guardian.student_links?.length || 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-9 w-9 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/dashboard/guardians/${guardian.id}`} className="flex items-center gap-2"><Eye className="h-4 w-4" />{tc('view')}</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href={`/dashboard/guardians/${guardian.id}/edit`} className="flex items-center gap-2"><Pencil className="h-4 w-4" />{tc('edit')}</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeleteId(guardian.id)} className="text-destructive focus:text-destructive flex items-center gap-2"><Trash2 className="h-4 w-4" />{tc('delete')}</DropdownMenuItem>
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
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={() => { if(deleteId) deleteGuardian.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} isLoading={deleteGuardian.isPending} />
    </div>
  );
}
