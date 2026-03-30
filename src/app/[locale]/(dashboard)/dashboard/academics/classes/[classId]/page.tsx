'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useClass, useCreateSection, useUpdateSection } from '@/features/academics/api/useClasses';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Plus, Users, Edit, BookOpen, Trash2, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { SectionModal } from '@/features/academics/components/SectionModal';
import { ClassSubjectModal } from '@/features/academics/components/ClassSubjectModal';
import { useClassSubjects, useAssignSubject, useRemoveSubject } from '@/features/academics/api/useClasses';
import { useSubjects } from '@/features/academics/api/useSubjects';
import { type SectionForm } from '@/features/academics/types/schemas';
import { type Section } from '@/features/academics/types';
import { EmptyState } from '@/components/shared/empty-state';

export default function ClassDetailPage() {
  const t = useTranslations('common');
  const params = useParams();
  const classId = params.classId as string;

  const { data: classData, isLoading } = useClass(classId);

  const createSection = useCreateSection(classId);
  const updateSection = useUpdateSection(classId);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  const openCreateSectionModal = () => {
    setEditingSection(null);
    setIsSectionModalOpen(true);
  };

  const openEditSectionModal = (section: Section) => {
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };

  const handleSectionSubmit = async (formData: SectionForm) => {
    try {
      if (editingSection) {
        await updateSection.mutateAsync({ id: editingSection.id, data: formData });
      } else {
        await createSection.mutateAsync(formData);
      }
      setIsSectionModalOpen(false);
    } catch (error) {
    }
  };

  const { data: assignedSubjects, isLoading: isSubjectsLoading } = useClassSubjects(classId);
  const assignSubject = useAssignSubject(classId);
  const removeSubject = useRemoveSubject(classId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Class Not Found</h2>
        <p className="text-muted-foreground">The class you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href={`/dashboard/academics/years`}>Back to Academic Years</Link>
        </Button>
      </div>
    );
  }

  // Assuming sections are nested in the class response. 
  // If not, we would need a useSections hook. 
  const sections = classData.sections || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link 
          href={`/dashboard/academics/years/${classData.academic_year_id}`} 
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Academic Year
        </Link>
      </div>

      <PageHeader
        title={classData.name}
        description={classData.description || `Grade ${classData.grade_level}`}
        actions={
          <div className="flex items-center gap-4">
             <Badge variant="outline" className="bg-muted text-muted-foreground">Grade {classData.grade_level}</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sections</p>
              <h4 className="text-2xl font-bold">{classData.section_count || sections.length}</h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Enrolled</p>
              <h4 className="text-2xl font-bold">{classData.total_students || 0}</h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
             <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Users className="h-6 w-6 opacity-60" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Max Capacity</p>
              <h4 className="text-2xl font-bold">{classData.capacity || 'Unlimited'}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="sections" className="gap-2">
            <Users className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Sections</h3>
              <p className="text-sm text-muted-foreground">Manage the sub-sections available for this class.</p>
            </div>
             <Button onClick={openCreateSectionModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
               <div className="relative overflow-x-auto min-h-[200px]">
                  {!sections.length ? (
                    <EmptyState
                      icon={Users}
                      title="No Sections Configured"
                      description="Create a section to start assigning students and homeroom teachers."
                      action={
                        <Button onClick={openCreateSectionModal}>Add Section</Button>
                      }
                    />
                  ) : (
                    <div className="divide-y">
                       {sections.map((section) => (
                         <div key={section.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-lg">{section.full_name || `${classData.name} ${section.name}`}</span>
                                {section.is_full && (
                                  <Badge variant="destructive" className="font-normal">Full Capacity</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-4">
                                 <span>
                                   Room: {section.room_number || 'N/A'}
                                 </span>
                                 <span>
                                   Capacity: {section.capacity}
                                 </span>
                                 <span>
                                   Available Slots: {section.available_slots}
                                 </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEditSectionModal(section)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Settings
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                   <Link href={`/dashboard/academics/classes/${classId}/sections/${section.id}`}>
                                      View Roster
                                   </Link>
                                </Button>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4 outline-none">
           <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Class Subjects</h3>
              <p className="text-sm text-muted-foreground">Assign subjects that are taught in this class.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsSubjectModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Assign Subjects
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
               <div className="relative overflow-x-auto min-h-[200px]">
                  {isSubjectsLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !assignedSubjects?.length ? (
                    <EmptyState
                      icon={BookOpen}
                      title="No Subjects Assigned"
                      description="Assign subjects to this class to manage curriculum and grading."
                    />
                  ) : (
                    <div className="divide-y">
                       {assignedSubjects.map((subject) => (
                         <div key={subject.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{subject.code} • {subject.category}</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => removeSubject.mutate(subject.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SectionModal
        open={isSectionModalOpen}
        onOpenChange={setIsSectionModalOpen}
        section={editingSection}
        onSubmit={handleSectionSubmit}
        isLoading={createSection.isPending || updateSection.isPending}
      />

      <ClassSubjectModal
        open={isSubjectModalOpen}
        onOpenChange={setIsSubjectModalOpen}
        assignedSubjectIds={assignedSubjects?.map(s => s.id) || []}
        onAssign={async (id) => { await assignSubject.mutateAsync(id); }}
        onRemove={async (id) => { await removeSubject.mutateAsync(id); }}
        isLoading={assignSubject.isPending || removeSubject.isPending}
      />
    </div>
  );
}
