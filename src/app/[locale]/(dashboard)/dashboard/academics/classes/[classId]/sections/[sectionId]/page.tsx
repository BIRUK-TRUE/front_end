'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useSection, useClass } from '@/features/academics/api/useClasses';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  GraduationCap,
  Calendar,
  School
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SectionRosterPage() {
  const t = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const sectionId = params.sectionId as string;
  const classId = params.classId as string;

  const { data: section, isLoading: isSectionLoading } = useSection(sectionId);
  const { data: classData, isLoading: isClassLoading } = useClass(classId);

  // Mock students for now until Phase 9: Enrollments
  const students: any[] = [];
  const isLoadingStudents = false;

  if (isSectionLoading || isClassLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!section || !classData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Section Not Found</h2>
        <p className="text-muted-foreground">The section you are looking for does not exist.</p>
        <Button asChild>
          <Link href={`/dashboard/academics/classes/${classId}`}>Back to Class</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href={`/dashboard/academics/classes/${classId}`} className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to {classData.name}
        </Link>
      </div>

      <PageHeader
        title={section.full_name || `${classData.name} — ${section.name}`}
        description={`Section Roster & Management`}
        actions={
          <div className="flex items-center gap-2">
            <Button className="gap-2" asChild>
               <Link href="/dashboard/enrollments">
                 <UserPlus className="h-4 w-4" />
                 Enroll Student
               </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Section Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-1 border-b text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Capacity
              </span>
              <span className="font-medium">{section.capacity}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Students
              </span>
              <span className="font-medium">{section.student_count}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <School className="h-4 w-4" /> Room
              </span>
              <span className="font-medium">{section.room_number || 'N/A'}</span>
            </div>
            <div className="pt-2">
               {section.is_full ? (
                 <Badge variant="destructive" className="w-full justify-center">Full Capacity</Badge>
               ) : (
                 <Badge variant="outline" className="w-full justify-center bg-success/10 text-success border-success/30">
                   {section.available_slots} Slots Available
                 </Badge>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Student Roster</CardTitle>
            <CardDescription>
              List of all students currently enrolled in this section.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Students Enrolled"
                description="Use the Enrollemnts module to assign students to this section."
                action={
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/enrollments">Go to Enrollments</Link>
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {/* Student rows will go here in Phase 9 */}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
