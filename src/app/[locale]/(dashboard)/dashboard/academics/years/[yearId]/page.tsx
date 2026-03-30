'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAcademicYear } from '@/features/academics/api/useAcademicYears';
import { AcademicYearStatus } from '@/features/academics/types';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, BookOpen, GraduationCap, ArrowLeft, Loader2, Plus, Edit, Archive, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTerms, useCreateTerm, useUpdateTerm, useDeleteTerm } from '@/features/academics/api/useTerms';
import { TermModal } from '@/features/academics/components/TermModal';
import { type TermForm, type ClassForm } from '@/features/academics/types/schemas';
import { type Term, type Class } from '@/features/academics/types';
import { useClasses, useCreateClass, useUpdateClass } from '@/features/academics/api/useClasses';
import { ClassModal } from '@/features/academics/components/ClassModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/empty-state';

export default function AcademicYearDetailPage() {
  const t = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const yearId = params.yearId as string;

  const { data: year, isLoading: isYearLoading } = useAcademicYear(yearId);
  const { data: termsData, isLoading: isTermsLoading } = useTerms(yearId);
  const { data: classesData, isLoading: isClassesLoading } = useClasses(yearId);

  const createTerm = useCreateTerm(yearId);
  const updateTerm = useUpdateTerm(yearId);
  
  const createClass = useCreateClass(yearId);
  const updateClass = useUpdateClass(yearId);

  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  const openCreateTermModal = () => {
    setEditingTerm(null);
    setIsTermModalOpen(true);
  };

  const openEditTermModal = (term: Term) => {
    setEditingTerm(term);
    setIsTermModalOpen(true);
  };

  const handleTermSubmit = async (formData: TermForm) => {
    try {
      if (editingTerm) {
        await updateTerm.mutateAsync({ id: editingTerm.id, data: formData });
      } else {
        await createTerm.mutateAsync(formData);
      }
      setIsTermModalOpen(false);
    } catch (error) {
    }
  };

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const openCreateClassModal = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (classItem: Class) => {
    setEditingClass(classItem);
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = async (formData: ClassForm) => {
    try {
      if (editingClass) {
        await updateClass.mutateAsync({ id: editingClass.id, data: formData });
      } else {
        await createClass.mutateAsync(formData);
      }
      setIsClassModalOpen(false);
    } catch (error) {
    }
  };

  const handleActivateTerm = async (id: string) => {
    await updateTerm.mutateAsync({
      id,
      data: { status: 'active' } as any
    });
  };

  const getStatusBadge = (status?: AcademicYearStatus, isCurrent?: boolean) => {
    if (isCurrent) {
      return <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">Current Active Year</Badge>;
    }
    
    switch (status) {
      case AcademicYearStatus.PLANNING:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30">Planning</Badge>;
      case AcademicYearStatus.ACTIVE:
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Active</Badge>;
      case AcademicYearStatus.COMPLETED:
        return <Badge variant="outline" className="bg-info/10 text-info border-info/30">Completed</Badge>;
      case AcademicYearStatus.ARCHIVED:
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Archived</Badge>;
      default:
        return null;
    }
  };

  if (isYearLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!year) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Academic Year Not Found</h2>
        <p className="text-muted-foreground">The year you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/dashboard/academics/years">Back to Academic Years</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/academics/years" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
      </div>

      <PageHeader
        title={year.name}
        description={`${new Date(year.start_date).toLocaleDateString()} — ${new Date(year.end_date).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-4">
            {getStatusBadge(year.status, year.is_current)}
            {/* We will add global year actions here later if needed */}
          </div>
        }
      />

      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="terms" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Terms</span>
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Classes</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="space-y-4 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Terms</h3>
              <p className="text-sm text-muted-foreground">Manage the grading terms (e.g., Semester 1, Semester 2) for this year.</p>
            </div>
            <Button size="sm" onClick={openCreateTermModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Term
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto min-h-[200px]">
                 {isTermsLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !termsData?.items?.length ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="No Terms Configured"
                    description="Create a term to start assigning classes."
                    action={
                      <Button onClick={openCreateTermModal}>Add Term</Button>
                    }
                  />
                ) : (
                  <div className="divide-y">
                     {termsData.items.map((term) => (
                       <div key={term.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-base">{term.name}</span>
                              {term.status === 'active' && (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30 font-normal shadow-none">Active Term</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                               <CalendarDays className="h-3 w-3" />
                               {new Date(term.start_date).toLocaleDateString()} — {new Date(term.end_date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => openEditTermModal(term)}>
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Details
                              </DropdownMenuItem>
                              
                              {term.status !== 'active' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleActivateTerm(term.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                    Set as Active
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Classes</h3>
              <p className="text-sm text-muted-foreground">Manage the classes and their sections offered this year.</p>
            </div>
            <Button size="sm" onClick={openCreateClassModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
               <div className="relative overflow-x-auto min-h-[200px]">
                 {isClassesLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !classesData?.items?.length ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No Classes Configured"
                    description="Create a class (e.g. Grade 9) to start managing sections and students."
                    action={
                      <Button onClick={openCreateClassModal}>Add Class</Button>
                    }
                  />
                ) : (
                  <div className="divide-y">
                     {classesData.items.map((classItem) => (
                       <div key={classItem.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Link 
                                href={`/dashboard/academics/classes/${classItem.id}`}
                                className="font-medium text-base hover:underline"
                              >
                                {classItem.name}
                              </Link>
                              <Badge variant="outline" className="font-normal text-xs bg-muted/50">
                                Grade {classItem.grade_level}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                               <span className="flex items-center gap-1">
                                 <BookOpen className="h-3 w-3" />
                                 {classItem.section_count || 0} Sections
                               </span>
                               <span>
                                 Capacity: {classItem.capacity ? classItem.capacity : 'Unlimited'}
                               </span>
                               <span>
                                 Enrolled: {classItem.total_students || 0}
                               </span>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/academics/classes/${classItem.id}` as any)}>
                                <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                Manage Sections
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditClassModal(classItem)}>
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                     ))}
                  </div>
                )}
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Year Overview</CardTitle>
              <CardDescription>Enrollment and structure statistics for the year.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
               <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-muted-foreground text-sm">
                 <div>
                   <div className="text-2xl font-bold text-foreground mb-1">{year.term_count || 0}</div>
                   <div>Total Terms</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-foreground mb-1">{year.class_count || 0}</div>
                   <div>Total Classes</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-foreground mb-1">—</div>
                   <div>Total Enrolled Students</div>
                 </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>

      <TermModal
        open={isTermModalOpen}
        onOpenChange={setIsTermModalOpen}
        term={editingTerm}
        onSubmit={handleTermSubmit}
        isLoading={createTerm.isPending || updateTerm.isPending}
      />

      <ClassModal
        open={isClassModalOpen}
        onOpenChange={setIsClassModalOpen}
        classItem={editingClass}
        onSubmit={handleClassSubmit}
        isLoading={createClass.isPending || updateClass.isPending}
      />
    </div>
  );
}
