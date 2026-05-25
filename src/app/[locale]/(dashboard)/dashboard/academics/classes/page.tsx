'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Users, BookOpen, ChevronRight, Sparkles, Edit, Trash2 } from 'lucide-react';
import { useAcademicYears } from '@/features/academics/api/useAcademicYears';
import { useClasses, useDeleteClass, useCreateClass, useCreateSection } from '@/features/academics/api/useClasses';
import { ClassModal } from '@/features/academics/components/ClassModal';
import { SectionModal } from '@/features/academics/components/SectionModal';
import { type ClassForm, type SectionForm } from '@/features/academics/types/schemas';
import { toast } from 'sonner';
import { axiosInstance } from '@/lib/api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';

export default function ClassesPage() {
  const t = useTranslations('common');
  const ta = useTranslations('academics');
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [generateSectionsOpen, setGenerateSectionsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedClassForSection, setSelectedClassForSection] = useState<string>('');
  const [generationData, setGenerationData] = useState({ count: 2, prefix: '', capacity: 40 });

  const queryClient = useQueryClient();

  // Fetch academic years
  const { data: yearsData } = useAcademicYears(1, 50);

  // Auto-select current year
  useState(() => {
    if (yearsData?.items && !selectedYearId) {
      const currentYear = yearsData.items.find((y: any) => y.is_current);
      if (currentYear) setSelectedYearId(currentYear.id);
    }
  });

  // Fetch classes for selected year
  const { data: classesData, isLoading } = useClasses(selectedYearId, 1, 100);

  // Delete class mutation
  const deleteClassMutation = useDeleteClass(selectedYearId || '');

  // Create class mutation
  const createClassMutation = useCreateClass(selectedYearId || '');

  // Create section mutation
  const createSectionMutation = useCreateSection(selectedClassForSection || '');

  // Generate sections mutation
  const generateSectionsMutation = useMutation({
    mutationFn: async ({ classId, data }: { classId: string; data: any }) => {
      const { data: response } = await axiosInstance.post(
        `/academics/classes/${classId}/generate-sections`,
        data
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Sections generated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setGenerateSectionsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to generate sections');
    },
  });

  const handleCreateClass = (data: ClassForm) => {
    if (!selectedYearId) {
      toast.error('Please select an academic year first');
      return;
    }
    createClassMutation.mutate(data, {
      onSuccess: () => {
        setClassModalOpen(false);
        setSelectedClass(null);
        toast.success('Class created successfully');
      },
    });
  };

  const handleCreateSection = (data: SectionForm) => {
    if (!selectedClassForSection) {
      toast.error('No class selected for section creation');
      return;
    }
    createSectionMutation.mutate(data, {
      onSuccess: () => {
        setSectionModalOpen(false);
        setSelectedClassForSection('');
        setSelectedClass(null);
        toast.success('Section created successfully');
      },
    });
  };

  const handleGenerateSections = () => {
    if (!selectedClassForSection) return;
    generateSectionsMutation.mutate({
      classId: selectedClassForSection,
      data: generationData,
    });
  };

  const filteredClasses = classesData?.items?.filter((cls: any) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={ta('classes')}
        description={ta('manageClassesDesc')}
        actions={
          <Button onClick={() => setClassModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {ta('addClass')}
          </Button>
        }
      />

      {/* Year Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">{ta('academicYear')}</label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">{ta('selectYear')}</option>
              {yearsData?.items?.map((year: any) => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_current && '(Current)'}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={ta('searchClasses')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Classes Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ta('className')}</TableHead>
              <TableHead>{ta('gradeLevel')}</TableHead>
              <TableHead>{ta('stream')}</TableHead>
              <TableHead>{ta('sections')}</TableHead>
              <TableHead>{ta('students')}</TableHead>
              <TableHead>{ta('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {ta('noClassesFound')}
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((cls: any) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.grade_level}</TableCell>
                  <TableCell>
                    {cls.stream ? (
                      <Badge variant="outline">
                        {cls.stream === 'natural_science' ? 'Natural Science' : 'Social Science'}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {cls.section_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {cls.total_students || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClassForSection(cls.id);
                          setGenerateSectionsOpen(true);
                        }}
                        className="gap-1"
                      >
                        <Sparkles className="h-4 w-4" />
                        Auto-Generate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClassForSection(cls.id);
                          setSectionModalOpen(true);
                        }}
                        title="Add Section"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedClass(cls);
                          setClassModalOpen(true);
                        }}
                        title="Edit Class"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteClassMutation.mutate(cls.id)}
                        title="Delete Class"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/academics/classes/${cls.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Class Modal */}
      <ClassModal
        open={classModalOpen}
        onOpenChange={setClassModalOpen}
        classItem={selectedClass}
        onSubmit={handleCreateClass}
        isLoading={createClassMutation.isPending}
      />

      {/* Section Modal */}
      <SectionModal
        open={sectionModalOpen}
        onOpenChange={setSectionModalOpen}
        onSubmit={handleCreateSection}
        isLoading={createSectionMutation.isPending}
      />

      {/* Generate Sections Dialog */}
      <Dialog open={generateSectionsOpen} onOpenChange={setGenerateSectionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ta('autoGenerateSections')}</DialogTitle>
            <DialogDescription>
              Automatically create sections for this class
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Number of Sections</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={generationData.count}
                onChange={(e) =>
                  setGenerationData({ ...generationData, count: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prefix (Optional)</label>
              <Input
                placeholder="e.g., A, B, C or 1, 2, 3"
                value={generationData.prefix}
                onChange={(e) =>
                  setGenerationData({ ...generationData, prefix: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity per Section</label>
              <Input
                type="number"
                min={1}
                value={generationData.capacity}
                onChange={(e) =>
                  setGenerationData({ ...generationData, capacity: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateSectionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateSections} disabled={generateSectionsMutation.isPending}>
              {generateSectionsMutation.isPending ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
