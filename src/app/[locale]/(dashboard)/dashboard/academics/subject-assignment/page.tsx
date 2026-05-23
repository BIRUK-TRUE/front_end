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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Plus, X } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  grade_level: number;
  stream: string | null;
  sections: Array<{ id: string; name: string }>;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

export default function SubjectAssignmentPage() {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/academic-years');
      return data.items || [];
    },
  });

  // Fetch classes for selected year
  const { data: classes } = useQuery({
    queryKey: ['classes', selectedYear],
    queryFn: async () => {
      if (!selectedYear) return [];
      const { data } = await axiosInstance.get(`/academics/classes?academic_year_id=${selectedYear}`);
      return data.items || [];
    },
    enabled: !!selectedYear,
  });

  // Fetch available subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/subjects');
      return data.items || [];
    },
  });

  // Get current class details
  const currentClass = classes?.find((c: Class) => c.id === selectedClass);

  // Assign subjects mutation
  const assignSubjectsMutation = useMutation({
    mutationFn: async ({ classId, subjectIds }: { classId: string; subjectIds: string[] }) => {
      const promises = subjectIds.map((subjectId) =>
        axiosInstance.post('/academics/class-subjects', {
          class_id: classId,
          subject_id: subjectId,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success(`Successfully assigned ${selectedSubjects.length} subjects`);
      setSelectedSubjects([]);
      queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to assign subjects');
    },
  });

  const handleAssign = () => {
    if (!selectedClass || selectedSubjects.length === 0) {
      toast.error('Please select a class and at least one subject');
      return;
    }

    setIsAssigning(true);
    assignSubjectsMutation.mutate(
      { classId: selectedClass, subjectIds: selectedSubjects },
      {
        onSettled: () => setIsAssigning(false),
      }
    );
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const selectedClassInfo = classes?.find((c: Class) => c.id === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subject Assignment</h1>
        <p className="text-muted-foreground">
          Assign subjects to grades and apply them to all sections automatically
        </p>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Grade and Subjects</CardTitle>
          <CardDescription>
            Choose an academic year, grade level, and subjects to assign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academic Year */}
          <div className="grid gap-2">
            <Label>Academic Year *</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((year: AcademicYear) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name} {year.is_current && '(Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class/Grade */}
          <div className="grid gap-2">
            <Label>Grade/Class *</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade/class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((cls: Class) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    Grade {cls.grade_level} - {cls.name}
                    {cls.stream && ` (${cls.stream.replace('_', ' ')})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Class Info */}
          {selectedClassInfo && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Selected:</strong> Grade {selectedClassInfo.grade_level} -{' '}
                {selectedClassInfo.name}
                {selectedClassInfo.stream && ` (${selectedClassInfo.stream.replace('_', ' ')})`}
                <br />
                <strong>Sections:</strong> {selectedClassInfo.sections?.length || 0} sections will
                receive these subjects
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Subject Selection */}
          <div className="space-y-3">
            <Label>Subjects to Assign *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2 border rounded-lg">
              {subjects?.map((subject: Subject) => (
                <div
                  key={subject.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSubjects.includes(subject.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleSubject(subject.id)}
                >
                  <Checkbox
                    checked={selectedSubjects.includes(subject.id)}
                    onCheckedChange={() => toggleSubject(subject.id)}
                    id={subject.id}
                  />
                  <Label htmlFor={subject.id} className="cursor-pointer flex-1">
                    <span className="font-medium">{subject.code}</span> - {subject.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Count */}
          {selectedSubjects.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">
                {selectedSubjects.length} subject(s) selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubjects([])}
                className="h-6 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={handleAssign}
              disabled={
                !selectedClass ||
                selectedSubjects.length === 0 ||
                isAssigning ||
                assignSubjectsMutation.isPending
              }
              className="w-full sm:w-auto"
            >
              {(isAssigning || assignSubjectsMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Plus className="mr-2 h-4 w-4" />
              Assign {selectedSubjects.length} Subject(s) to All Sections
            </Button>
          </div>

          {/* Warning */}
          {selectedSubjects.length > 0 && selectedClassInfo && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This will assign the selected subjects to all {selectedClassInfo.sections?.length || 0}{' '}
                sections under this grade. You can then assign teachers to each subject-section
                combination.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Step 1:</strong> Select an academic year and grade/class
          </p>
          <p>
            <strong>Step 2:</strong> Choose the subjects to assign to this grade
          </p>
          <p>
            <strong>Step 3:</strong> Click "Assign" to apply subjects to all sections
          </p>
          <p>
            <strong>Step 4:</strong> Go to Teacher Assignment to assign teachers to each
            subject-section combination
          </p>
          <Separator className="my-2" />
          <p className="text-muted-foreground">
            <strong>Note:</strong> Subjects are assigned at the class level and automatically apply
            to all sections. For example, assigning Math to Grade 9 will make Math available in
            Grade 9A, 9B, 9C, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
