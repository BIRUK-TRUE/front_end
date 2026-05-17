'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from '@/features/academics/api/useAcademicYears';
import { type AcademicYearForm } from '@/features/academics/types/schemas';import { type AcademicYear, AcademicYearStatus } from '@/features/academics/types';
import { AcademicYearModal } from '@/features/academics/components/AcademicYearModal';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Calendar,
  MoreHorizontal,
  Edit,
  CheckCircle,
  ChevronRight,
  Trash2,
  BookOpen,
  School,
  ListChecks,
  X,
  ArrowRight,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';

// ── Setup checklist shown after a new year is created ────────────────────────

function SetupChecklist({
  yearId,
  yearName,
  onDismiss,
}: {
  yearId: string;
  yearName: string;
  onDismiss: () => void;
}) {
  const steps = [
    {
      icon: <Calendar className="h-4 w-4 text-primary" />,
      label: 'Add terms (e.g. Term 1, Term 2)',
      href: `/dashboard/academics/years/${yearId}`,
      done: false,
    },
    {
      icon: <School className="h-4 w-4 text-primary" />,
      label: 'Set up classes and sections',
      href: `/dashboard/academics/classes`,
      done: false,
    },
    {
      icon: <BookOpen className="h-4 w-4 text-primary" />,
      label: 'Assign subjects to classes',
      href: `/dashboard/academics/subjects`,
      done: false,
    },
  ];

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-sm">
              "{yearName}" was created — complete the setup
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Follow these steps to get the academic year ready for use.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <Link key={i} href={step.href}>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer group">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <span className="text-sm flex-1">{step.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-end">
        <Link href={`/dashboard/academics/years/${yearId}`}>
          <Button size="sm" className="gap-2">
            Open Year Setup <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, isCurrent }: { status: AcademicYearStatus; isCurrent: boolean }) {
  if (isCurrent) {
    return (
      <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
        ✦ Current Year
      </Badge>
    );
  }
  const map: Record<AcademicYearStatus, { label: string; className: string }> = {
    [AcademicYearStatus.PLANNING]: {
      label: 'Planning',
      className: 'bg-muted text-muted-foreground border-muted-foreground/30',
    },
    [AcademicYearStatus.ACTIVE]: {
      label: 'Active',
      className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    },
    [AcademicYearStatus.COMPLETED]: {
      label: 'Completed',
      className: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    },
    [AcademicYearStatus.ARCHIVED]: {
      label: 'Archived',
      className: 'bg-destructive/10 text-destructive border-destructive/30',
    },
  };
  const cfg = map[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AcademicYearsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deleteYearId, setDeleteYearId] = useState<string | null>(null);
  const [newlyCreated, setNewlyCreated] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useAcademicYears(page, 20);
  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();
  const deleteYear = useDeleteAcademicYear();

  const openCreateModal = () => {
    setEditingYear(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: AcademicYearForm & { clone_from_year_id?: string }) => {
    try {
      if (editingYear) {
        await updateYear.mutateAsync({ id: editingYear.id, data: formData });
      } else {
        const result = await createYear.mutateAsync(formData);
        // Show setup checklist after creation
        setNewlyCreated({ id: result.id, name: result.name });
      }
      setIsModalOpen(false);
    } catch {
      // Error handled by hook toast
    }
  };

  const handleActivate = async (id: string) => {
    await updateYear.mutateAsync({
      id,
      data: { status: AcademicYearStatus.ACTIVE, is_current: true } as any,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Academic Years"
        description="Manage your school's academic years, terms, and class structure."
        actions={
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            New Academic Year
          </Button>
        }
      />

      {/* Setup checklist — shown right after a new year is created */}
      {newlyCreated && (
        <SetupChecklist
          yearId={newlyCreated.id}
          yearName={newlyCreated.name}
          onDismiss={() => setNewlyCreated(null)}
        />
      )}

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : !data?.items?.length ? (
              <EmptyState
                icon={Calendar}
                title="No academic years yet"
                description="Create your first academic year to start setting up terms, classes, and subjects."
                action={
                  <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Academic Year
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year Name</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Terms</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((year) => (
                    <TableRow
                      key={year.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/academics/years/${year.id}`)}
                    >
                      <TableCell className="font-semibold">
                        {year.name}
                        {year.is_current && (
                          <span className="ml-2 text-[10px] font-normal text-primary">● current</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(year.start_date).toLocaleDateString()} –{' '}
                        {new Date(year.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {year.term_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {year.class_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={year.status} isCurrent={year.is_current} />
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8"
                            onClick={() => router.push(`/dashboard/academics/years/${year.id}`)}
                          >
                            Manage
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DropdownMenuItem onClick={() => { setEditingYear(year); setIsModalOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Details
                              </DropdownMenuItem>

                              {!year.is_current &&
                                year.status !== AcademicYearStatus.COMPLETED &&
                                year.status !== AcademicYearStatus.ARCHIVED && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleActivate(year.id)}>
                                      <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                      Set as Current Year
                                    </DropdownMenuItem>
                                  </>
                                )}

                              {year.status === AcademicYearStatus.COMPLETED && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteYearId(year.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Year
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <AcademicYearModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        year={editingYear}
        existingYears={data?.items ?? []}
        onSubmit={handleModalSubmit}
        isLoading={createYear.isPending || updateYear.isPending}
      />

      <ConfirmDialog
        open={!!deleteYearId}
        onOpenChange={(open) => { if (!open) setDeleteYearId(null); }}
        onConfirm={async () => {
          if (deleteYearId) {
            await deleteYear.mutateAsync(deleteYearId);
            setDeleteYearId(null);
          }
        }}
        title="Delete Academic Year?"
        description="This will permanently delete the academic year and all its data. This cannot be undone."
        isLoading={deleteYear.isPending}
      />
    </div>
  );
}
