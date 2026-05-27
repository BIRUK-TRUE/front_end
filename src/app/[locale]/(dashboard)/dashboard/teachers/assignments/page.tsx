'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, UserPlus, X, Loader2, Info } from 'lucide-react';
import { useQualifiedTeachers } from '@/features/teachers/api/useQualifications';
import { useTeacherWorkload } from '@/features/teachers/api/useWorkload';
import { Subject } from '@/features/academics/types';

interface Section {
  id: string;
  name: string;
  class_id: string;
  capacity: number;
}

interface Teacher {
  id: string;
  user: {
    full_name: string;
    email: string;
  };
}

interface TeacherAssignment {
  id: string;
  teacher_id: string;
  teacher_name: string;
  section_id: string;
  section_name: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
}

// Fallback component: show all active teachers when no qualifications are set up
function AllTeachersFallback({
  selectedTeacher,
  setSelectedTeacher,
}: {
  selectedTeacher: string;
  setSelectedTeacher: (id: string) => void;
}) {
  const { data: allTeachers, isLoading } = useQuery({
    queryKey: ['all-active-teachers'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/teachers?page=1&size=100&status=active');
      return data.items || [];
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading all teachers...
      </div>
    );
  }

  return (
    <>
      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border-b">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              No qualifications set up
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
              Showing all active teachers. Set up teacher qualifications for better filtering.
            </p>
          </div>
        </div>
      </div>
      {allTeachers && allTeachers.length > 0 ? (
        allTeachers.map((teacher: any) => {
          const isSelected = selectedTeacher === teacher.id;
          return (
            <div
              key={teacher.id}
              className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                isSelected ? 'bg-primary/10' : ''
              }`}
              onClick={() => setSelectedTeacher(teacher.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{teacher.user?.full_name || teacher.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.employee_id}
                    {teacher.specialization && ` • ${teacher.specialization}`}
                  </p>
                </div>
                {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No active teachers found
        </div>
      )}
    </>
  );
}

export default function TeacherAssignmentPage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  // Fetch classes
  const { data: classes, isLoading: isLoadingClasses, error: classesError } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/academics/classes');
        console.log('Classes response:', data);
        return data.items || [];
      } catch (error) {
        console.error('Error fetching classes:', error);
        throw error;
      }
    },
  });

  // Fetch sections for selected class
  const { data: sections, isLoading: isLoadingSections, error: sectionsError } = useQuery({
    queryKey: ['sections', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      try {
        const { data } = await axiosInstance.get(`/academics/classes/${selectedClass}/sections`);
        console.log('Sections response:', data);
        return data || [];  // Returns array directly, not wrapped in items
      } catch (error) {
        console.error('Error fetching sections:', error);
        throw error;
      }
    },
    enabled: !!selectedClass,
  });

  // Fetch subjects for selected class
  const { data: classSubjects, isLoading: isLoadingSubjects, error: subjectsError } = useQuery({
    queryKey: ['class-subjects', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      try {
        const { data } = await axiosInstance.get(`/academics/classes/${selectedClass}/subjects`);
        console.log('Class subjects response:', data);
        // Transform ClassSubjectResponse to Subject-like structure for display
        return (data || []).map((cs: any) => ({
          ...cs,  // Spread first so explicit overrides below take precedence
          id: cs.subject_id,
          code: cs.subject_code,
          name: cs.subject_name,
        }));
      } catch (error) {
        console.error('Error fetching class subjects:', error);
        throw error;
      }
    },
    enabled: !!selectedClass,
  });

  // Fetch current assignments for selected section
  const { data: assignments } = useQuery({
    queryKey: ['section-assignments', selectedSection],
    queryFn: async () => {
      if (!selectedSection) return [];
      const { data } = await axiosInstance.get(`/teachers/sections/${selectedSection}/teacher-subject`);
      return data || [];
    },
    enabled: !!selectedSection,
  });

  // Get qualified teachers for selected subject and grade
  const currentClass = classes?.find((c: any) => c.id === selectedClass);
  const currentSubject = classSubjects?.find((s: Subject) => s.id === selectedSubject);

  const { data: qualifiedTeachers, isLoading: isLoadingTeachers, error: teachersError } = useQualifiedTeachers(
    selectedSubject || '',
    currentClass?.grade_level || 0,
    currentClass?.stream || undefined
  );

  // Get workload for selected teacher
  const { data: teacherWorkload } = useTeacherWorkload(selectedTeacher);

  // Assign teacher mutation
  const assignMutation = useMutation({
    mutationFn: async ({ teacherId, sectionId, subjectId }: { teacherId: string; sectionId: string; subjectId: string }) => {
      const { data } = await axiosInstance.post('/teachers/teacher-subject', {
        teacher_id: teacherId,
        section_id: sectionId,
        subject_id: subjectId,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Teacher assigned successfully');
      setAssignmentDialogOpen(false);
      setSelectedTeacher('');
      queryClient.invalidateQueries({ queryKey: ['section-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-workload'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to assign teacher');
    },
  });

  // Remove assignment mutation
  const removeMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await axiosInstance.delete(`/teachers/teacher-subject/${assignmentId}`);
    },
    onSuccess: () => {
      toast.success('Assignment removed');
      queryClient.invalidateQueries({ queryKey: ['section-assignments'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove assignment');
    },
  });

  const handleAssign = () => {
    if (!selectedTeacher || !selectedSection || !selectedSubject) {
      toast.error('Please select a teacher, section, and subject');
      return;
    }

    assignMutation.mutate({
      teacherId: selectedTeacher,
      sectionId: selectedSection,
      subjectId: selectedSubject,
    });
  };

  const handleRemove = (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      removeMutation.mutate(assignmentId);
    }
  };

  const openAssignmentDialog = (subjectId: string) => {
    console.log('Opening assignment dialog for subject:', subjectId);
    console.log('Current class:', currentClass);
    console.log('Current subject:', classSubjects?.find((s: Subject) => s.id === subjectId));
    setSelectedSubject(subjectId);
    setAssignmentDialogOpen(true);
  };

  // Get assigned teacher for a subject
  const getAssignedTeacher = (subjectId: string) => {
    return assignments?.find((a: TeacherAssignment) => a.subject_id === subjectId);
  };

  const selectedSectionInfo = sections?.find((s: Section) => s.id === selectedSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Assignment Matrix</h1>
        <p className="text-muted-foreground">
          Assign qualified teachers to subjects and sections with workload validation
        </p>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class and Section</CardTitle>
          <CardDescription>
            Choose a class and section to view and manage teacher assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Class Selection */}
            <div className="grid gap-2">
              <Label>Class/Grade *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoadingClasses}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingClasses 
                      ? "Loading classes..." 
                      : classesError 
                        ? "Error loading classes" 
                        : "Select class"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {classes && classes.length > 0 ? (
                    classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        Grade {cls.grade_level} - {cls.name}
                        {cls.stream && ` (${cls.stream.replace('_', ' ')})`}
                      </SelectItem>
                    ))
                  ) : (
                    !isLoadingClasses && !classesError && (
                      <SelectItem value="no-classes" disabled>
                        No classes available
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {classesError && (
                <p className="text-sm text-destructive">Failed to load classes</p>
              )}
            </div>

            {/* Section Selection */}
            <div className="grid gap-2">
              <Label>Section *</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass || isLoadingSections}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedClass 
                      ? "Select class first" 
                      : isLoadingSections 
                        ? "Loading sections..." 
                        : sectionsError 
                          ? "Error loading sections" 
                          : "Select section"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sections && sections.length > 0 ? (
                    sections.map((section: Section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name} (Capacity: {section.capacity})
                      </SelectItem>
                    ))
                  ) : (
                    !isLoadingSections && !sectionsError && selectedClass && (
                      <SelectItem value="no-sections" disabled>
                        No sections available for this class
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {sectionsError && (
                <p className="text-sm text-destructive">Failed to load sections</p>
              )}
            </div>
          </div>

          {selectedSectionInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Selected:</strong> {selectedSectionInfo.name}
                {currentClass && ` - Grade ${currentClass.grade_level}`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Assignment Matrix */}
      {selectedSection && (
        <Card>
          <CardHeader>
            <CardTitle>Teacher Assignments</CardTitle>
            <CardDescription>
              Current teacher assignments for {selectedSectionInfo?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSubjects ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading subjects...</p>
              </div>
            ) : subjectsError ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-destructive">Failed to load subjects</p>
              </div>
            ) : classSubjects && classSubjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assigned Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classSubjects.map((subject: Subject) => {
                  const assignment = getAssignedTeacher(subject.id);
                  return (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{subject.code}</span>
                          <span className="text-muted-foreground ml-2">{subject.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment ? (
                          <div>
                            <p className="font-medium">{assignment.teacher_name}</p>
                            {teacherWorkload && assignment.teacher_id === selectedTeacher && (
                              <Badge
                                variant={
                                  teacherWorkload.status === 'overloaded'
                                    ? 'destructive'
                                    : teacherWorkload.status === 'underutilized'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="mt-1"
                              >
                                {teacherWorkload.total_weekly_periods} periods/week
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignmentDialog(subject.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            {assignment ? 'Reassign' : 'Assign'}
                          </Button>
                          {assignment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(assignment.id)}
                              disabled={removeMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No subjects assigned to this class</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Teacher</DialogTitle>
            <DialogDescription>
              Select a qualified teacher for {currentSubject?.code} - {currentSubject?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Qualified Teachers List */}
            <div className="space-y-2">
              <Label>Qualified Teachers</Label>
              <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                {isLoadingTeachers ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading qualified teachers...
                  </div>
                ) : teachersError ? (
                  <div className="p-4 text-center">
                    <p className="text-destructive font-medium">Failed to load qualified teachers</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {(teachersError as any)?.response?.data?.detail || 'Unknown error occurred'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check browser console for more details
                    </p>
                  </div>
                ) : !selectedSubject ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Please select a subject first
                  </div>
                ) : qualifiedTeachers && qualifiedTeachers.length > 0 ? (
                  qualifiedTeachers.map((qual: any) => {
                    const isSelected = selectedTeacher === qual.teacher_id;
                    return (
                      <div
                        key={qual.teacher_id}
                        className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                          isSelected ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => setSelectedTeacher(qual.teacher_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{qual.teacher_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Competency: {qual.competency_level}
                              {qual.years_experience && ` • ${qual.years_experience} years exp.`}
                            </p>
                          </div>
                          {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <AllTeachersFallback
                    selectedTeacher={selectedTeacher}
                    setSelectedTeacher={setSelectedTeacher}
                  />
                )}
              </div>
            </div>

            {/* Workload Warning */}
            {selectedTeacher && teacherWorkload && (
              <Alert
                variant={
                  teacherWorkload.status === 'overloaded' ? 'destructive' : 'default'
                }
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current Workload:</strong> {teacherWorkload.total_weekly_periods}{' '}
                  periods/week ({teacherWorkload.utilization_percentage.toFixed(0)}% utilization)
                  <br />
                  <strong>Status:</strong>{' '}
                  {teacherWorkload.status === 'overloaded'
                    ? 'Overloaded - Consider another teacher'
                    : teacherWorkload.status === 'underutilized'
                    ? 'Underutilized - Good candidate'
                    : 'Balanced'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedTeacher || assignMutation.isPending}
            >
              {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {!selectedSection && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Section Selected</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Please select a class and section above to view and manage teacher assignments
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
