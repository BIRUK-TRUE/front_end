'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { BookOpen, Plus, Trash2, Edit, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface Subject {
  id: string;
  code: string;
  name: string;
}

interface Qualification {
  id: string;
  teacher_id: string;
  subject_id: string;
  subject_code?: string;
  subject_name?: string;
  min_grade_level: number;
  max_grade_level: number;
  allowed_streams: string[] | null;
  competency_level: 'beginner' | 'proficient' | 'expert';
  years_experience: number | null;
  notes: string | null;
}

interface TeacherQualificationsProps {
  teacherId: string;
}

export function TeacherQualifications({ teacherId }: TeacherQualificationsProps) {
  const t = useTranslations('common');
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQual, setEditingQual] = useState<Qualification | null>(null);
  
  // Form state
  const [subjectId, setSubjectId] = useState('');
  const [minGrade, setMinGrade] = useState(9);
  const [maxGrade, setMaxGrade] = useState(12);
  const [competency, setCompetency] = useState<'beginner' | 'proficient' | 'expert'>('proficient');
  const [streams, setStreams] = useState<string>('');
  const [experience, setExperience] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch qualifications
  const { data: qualifications, isLoading } = useQuery({
    queryKey: ['teacher-qualifications', teacherId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/teachers/${teacherId}/qualifications`);
      return data as Qualification[];
    },
  });

  // Fetch subjects for dropdown
  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: async () => {
      console.log('Fetching subjects...');
      const { data } = await axiosInstance.get('/academics/subjects?page=1&size=100');
      console.log('Subjects response:', data);
      console.log('Subjects items:', data.items);
      return data.items as Subject[];
    },
  });

  // Add qualification mutation
  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      console.log('Making API call to add qualification...');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      try {
        const { data } = await axiosInstance.post(
          `/teachers/qualifications?teacher_id=${teacherId}`,
          payload
        );
        console.log('API response:', data);
        return data;
      } catch (error: any) {
        console.error('API Error:', error);
        console.error('Error Response:', error.response);
        console.error('Error Data:', error.response?.data);
        console.error('Error Detail:', error.response?.data?.detail);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Qualification added successfully');
      queryClient.invalidateQueries({ queryKey: ['teacher-qualifications', teacherId] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Mutation onError:', error);
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to add qualification';
      
      if (Array.isArray(detail)) {
        // Pydantic validation errors
        errorMessage = detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      }
      
      toast.error(errorMessage);
    },
  });

  // Update qualification mutation
  const updateMutation = useMutation({
    mutationFn: async ({ qualId, payload }: { qualId: string; payload: any }) => {
      const { data } = await axiosInstance.patch(
        `/teachers/qualifications/${qualId}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      toast.success('Qualification updated successfully');
      queryClient.invalidateQueries({ queryKey: ['teacher-qualifications', teacherId] });
      setDialogOpen(false);
      setEditingQual(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update qualification');
    },
  });

  // Delete qualification mutation
  const deleteMutation = useMutation({
    mutationFn: async (qualId: string) => {
      await axiosInstance.delete(`/teachers/qualifications/${qualId}`);
    },
    onSuccess: () => {
      toast.success('Qualification deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teacher-qualifications', teacherId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete qualification');
    },
  });

  const resetForm = () => {
    setSubjectId('');
    setMinGrade(9);
    setMaxGrade(12);
    setCompetency('proficient');
    setStreams('');
    setExperience('');
    setNotes('');
  };

  const handleEdit = (qual: Qualification) => {
    setEditingQual(qual);
    setSubjectId(qual.subject_id);
    setMinGrade(qual.min_grade_level);
    setMaxGrade(qual.max_grade_level);
    setCompetency(qual.competency_level);
    setStreams(qual.allowed_streams?.join(',') || '');
    setExperience(qual.years_experience?.toString() || '');
    setNotes(qual.notes || '');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    console.log('=== SUBMIT START ===');
    console.log('subjectId:', subjectId);
    console.log('subjectId type:', typeof subjectId);
    console.log('minGrade:', minGrade);
    console.log('maxGrade:', maxGrade);
    console.log('competency:', competency);
    
    if (!subjectId) {
      console.error('ERROR: No subject selected');
      toast.error('Please select a subject');
      return;
    }

    // Validate subject_id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(subjectId)) {
      console.error('ERROR: Invalid UUID format:', subjectId);
      toast.error('Invalid subject ID format. Please select a subject from the dropdown.');
      return;
    }

    // Validate grade levels
    if (minGrade > maxGrade) {
      console.error('ERROR: Min grade > Max grade');
      toast.error('Min grade level cannot be greater than max grade level');
      return;
    }

    if (minGrade < 0 || minGrade > 12 || maxGrade < 0 || maxGrade > 12) {
      console.error('ERROR: Grade level out of range');
      toast.error('Grade levels must be between 0 and 12');
      return;
    }

    const payload = {
      subject_id: subjectId,
      min_grade_level: Number(minGrade),
      max_grade_level: Number(maxGrade),
      competency_level: competency,
      allowed_streams: streams ? streams.split(',').map(s => s.trim()).filter(s => s.length > 0) : null,
      years_experience: experience ? Number(experience) : null,
      notes: notes || null,
    };

    console.log('Final payload:', JSON.stringify(payload, null, 2));
    console.log('Teacher ID:', teacherId);

    if (editingQual) {
      console.log('Mode: UPDATE');
      updateMutation.mutate({ qualId: editingQual.id, payload });
    } else {
      console.log('Mode: CREATE');
      addMutation.mutate(payload);
    }
    console.log('=== SUBMIT END ===');
  };

  const handleDelete = (qualId: string) => {
    if (confirm('Are you sure you want to delete this qualification?')) {
      deleteMutation.mutate(qualId);
    }
  };

  const openAddDialog = () => {
    setEditingQual(null);
    resetForm();
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Subject Qualifications</h3>
          <p className="text-sm text-muted-foreground">
            Subjects this teacher is qualified to teach
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Qualification
        </Button>
      </div>

      {!qualifications || qualifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={GraduationCap}
              title="No qualifications yet"
              description="Add subjects this teacher is qualified to teach"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {qualifications.map((qual) => {
            const subject = subjects?.find((s) => s.id === qual.subject_id);
            return (
              <Card key={qual.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {subject?.code || qual.subject_code}: {subject?.name || qual.subject_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          Grades {qual.min_grade_level}-{qual.max_grade_level}
                        </Badge>
                        <Badge variant="outline">{qual.competency_level}</Badge>
                        {qual.allowed_streams && (
                          <Badge variant="outline">
                            {qual.allowed_streams.join(', ')}
                          </Badge>
                        )}
                        {qual.years_experience && (
                          <span>{qual.years_experience} years exp.</span>
                        )}
                      </div>
                      {qual.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{qual.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(qual)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(qual.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingQual ? 'Edit Qualification' : 'Add Qualification'}
            </DialogTitle>
            <DialogDescription>
              Specify which subjects and grade levels this teacher can teach
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select 
                value={subjectId || undefined} 
                onValueChange={(value) => {
                  console.log('Subject selected:', value);
                  setSubjectId(value);
                }}
                disabled={subjectsLoading || !subjects || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    subjectsLoading 
                      ? "Loading subjects..." 
                      : subjectsError 
                        ? "Error loading subjects" 
                        : !subjects || subjects.length === 0
                          ? "No subjects available"
                          : "Select a subject"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {subjects && subjects.length > 0 ? (
                    subjects.map((subj) => {
                      console.log('Rendering subject option:', subj.id, subj.code, subj.name);
                      return (
                        <SelectItem key={subj.id} value={subj.id}>
                          {subj.code} - {subj.name}
                        </SelectItem>
                      );
                    })
                  ) : (
                    !subjectsLoading && !subjectsError && (
                      <SelectItem value="no-subjects" disabled>
                        No subjects available
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {subjectsError && (
                <p className="text-sm text-destructive">Failed to load subjects</p>
              )}
              {!subjectsLoading && (!subjects || subjects.length === 0) && !subjectsError && (
                <p className="text-sm text-muted-foreground">No subjects found in the system</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Grade Level</Label>
                <Input
                  type="number"
                  min={0}
                  max={12}
                  value={minGrade}
                  onChange={(e) => setMinGrade(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Grade Level</Label>
                <Input
                  type="number"
                  min={0}
                  max={12}
                  value={maxGrade}
                  onChange={(e) => setMaxGrade(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Competency Level</Label>
              <Select value={competency} onValueChange={(v: any) => setCompetency(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="proficient">Proficient</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Allowed Streams (optional, comma-separated)</Label>
              <Input
                placeholder="e.g., natural_science, social_science"
                value={streams}
                onChange={(e) => setStreams(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for all streams. Use for grades 11-12.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Years of Experience (optional)</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g., 5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Additional information about this qualification..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {editingQual ? 'Update' : 'Add'} Qualification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
