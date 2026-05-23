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

interface Section {
  id: string;
  name: string;
  class_id: string;
  capacity: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
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

export default function TeacherAssignmentPage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/classes');
      return data.items || [];
    },
  });

  // Fetch sections for selected class
  const { data: sections } = useQuery({
    queryKey: ['sections', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data } = await axiosInstance.get(`/academics/classes/${selectedClass}/sections`);
      return data.items || [];
    },
    enabled: !!selectedClass,
  });

  // Fetch subjects for selected class
  const { data: classSubjects } = useQuery({
    queryKey: ['class-subjects', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data } = await axiosInstance.get(`/academics/classes/${selectedClass}/subjects`);
      return data || [];
    },
    enabled: !!selectedClass,
  });

  // Fetch current assignments for selected section
  const { data: assignments } = useQuery({
    queryKey: ['section-assignments', selectedSection],
    queryFn: async () => {
      if (!selectedSection) return [];
      const { data } = await axiosInstance.get(`/teachers/section/${selectedSection}/teacher-subject`);
      return data || [];
    },
    enabled: !!selectedSection,
  });

  // Get qualified teachers for selected subject and grade
  const currentClass = classes?.find((c: any) => c.id === selectedClass);
  const currentSubject = classSubjects?.find((s: Subject) => s.id === selectedSubject);

  const { data: qualifiedTeachers } = useQualifiedTeachers(
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
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      Grade {cls.grade_level} - {cls.name}
                      {cls.stream && ` (${cls.stream.replace('_', ' ')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Selection */}
            <div className="grid gap-2">
              <Label>Section *</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((section: Section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name} (Capacity: {section.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      {selectedSection && classSubjects && classSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teacher Assignments</CardTitle>
            <CardDescription>
              Current teacher assignments for {selectedSectionInfo?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          <Badge variant="success" className="bg-green-100 text-green-800">
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
                {qualifiedTeachers?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No qualified teachers found for this subject and grade level
                  </div>
                ) : (
                  qualifiedTeachers?.map((qual: any) => {
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
