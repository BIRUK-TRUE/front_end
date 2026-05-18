'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '@/features/academics/api/useSubjects';
import { type SubjectForm } from '@/features/academics/types/schemas';
import { type Subject } from '@/features/academics/types';
import { SubjectModal } from '@/features/academics/components/SubjectModal';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, BookOpen, Edit, Trash2 } from 'lucide-react';
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

export default function SubjectsPage() {
  const tc = useTranslations('common');
  const t = useTranslations('subjectsPage');
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useSubjects({
    page,
    size: 20,
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
  });

  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: SubjectForm) => {
    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({ id: editingSubject.id, data: formData });
      } else {
        await createSubject.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by toast in hook
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSubject.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'core': return 'bg-primary/10 text-primary border-primary/20';
      case 'elective': return 'bg-info/10 text-info border-info/20';
      case 'vocational': return 'bg-warning/10 text-warning border-warning/20';
      case 'extracurricular': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            {t('addSubject')}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchSubjects')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
              />
            </form>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['all', 'core', 'elective', 'vocational', 'extracurricular'].map(cat => (
                <Button
                  key={cat}
                  variant={category === cat ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full h-9 capitalize"
                  onClick={() => setCategory(cat)}
                >
                  {t(cat)}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="relative overflow-x-auto">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : !data?.items?.length ? (
              <EmptyState
                icon={BookOpen}
                title={t('noSubjectsTitle')}
                description={t('noSubjectsDescription')}
                    action={
                      <Button onClick={openCreateModal}>{t('addSubject')}</Button>
                    }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('code')}</TableHead>
                    <TableHead>{t('subjectNameLabel')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('descriptionLabel')}</TableHead>
                    <TableHead className="text-right">{tc('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-xs">
                        <Badge variant="outline" className="font-mono bg-muted/50">
                          {subject.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getCategoryColor(subject.category)}`}>
                          {subject.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate hidden md:table-cell">
                        {subject.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEditModal(subject)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(subject.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <SubjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        subject={editingSubject}
        onSubmit={handleModalSubmit}
        isLoading={createSubject.isPending || updateSubject.isPending}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        title={t('deleteSubjectTitle')}
        description={t('deleteSubjectDescription')}
        isLoading={deleteSubject.isPending}
      />
    </div>
  );
}
