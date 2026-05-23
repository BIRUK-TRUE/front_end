'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { StudentPromotionPreview, SectionDistributionItem, StudentAssignmentItem } from '../types';

interface StudentAssignmentTableProps {
  students: StudentPromotionPreview[];
  assignments: StudentAssignmentItem[];
  onAssignmentChange: (studentId: string, sectionId: string) => void;
  sections: SectionDistributionItem[];
  showRepeatBadge?: boolean;
}

export function StudentAssignmentTable({
  students,
  assignments,
  onAssignmentChange,
  sections,
  showRepeatBadge = false,
}: StudentAssignmentTableProps) {
  // Create a map for quick lookup
  const assignmentMap = useMemo(() => {
    const map = new Map<string, string>();
    assignments.forEach(a => map.set(a.student_id, a.section_id));
    return map;
  }, [assignments]);

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No students in this category
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Reg. Number</TableHead>
            <TableHead>Current Section</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Avg. Score</TableHead>
            <TableHead>Assigned Section</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const assignedSectionId = assignmentMap.get(student.student_id);
            const assignedSection = sections.find(s => s.section_id === assignedSectionId);
            
            // Calculate overall average
            const avgScore = student.subject_averages.length > 0
              ? student.subject_averages.reduce((sum, s) => sum + s.average_percentage, 0) / student.subject_averages.length
              : 0;

            return (
              <TableRow key={student.student_id}>
                <TableCell className="font-medium">
                  {student.student_name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {student.registration_number}
                </TableCell>
                <TableCell>{student.current_section_name}</TableCell>
                <TableCell>
                  {student.passed ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      {showRepeatBadge ? 'Repeating' : 'Failed'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${avgScore >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgScore.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <Select
                    value={assignedSectionId}
                    onValueChange={(value) => onAssignmentChange(student.student_id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.section_id} value={section.section_id}>
                          {section.full_name} ({section.available_slots - (section.proposed_count || 0)} slots)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
