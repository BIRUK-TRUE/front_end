'use client';

// Teacher Workload Dashboard Page
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWorkloadSummary } from '@/features/teachers/api/useWorkload';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function WorkloadDashboardPage() {
  const { data: summary, isLoading } = useWorkloadSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading workload data...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No workload data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Workload Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor teacher assignments and ensure balanced workload distribution
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_teachers}</div>
            <p className="text-xs text-muted-foreground">
              {summary.teachers_with_assignments} with assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Workload</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.average_workload.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">periods per week</p>
          </CardContent>
        </Card>

        <Card className={summary.overloaded_teachers > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded Teachers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overloaded_teachers}</div>
            <p className="text-xs text-muted-foreground">&gt;25 periods/week</p>
          </CardContent>
        </Card>

        <Card className={summary.underutilized_teachers > 0 ? 'border-yellow-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Underutilized</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.underutilized_teachers}
            </div>
            <p className="text-xs text-muted-foreground">&lt;10 periods/week</p>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Workload Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Workload Details</CardTitle>
          <CardDescription>
            Detailed breakdown of each teacher's current assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Weekly Periods</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.teacher_stats.map((teacher) => (
                <TableRow key={teacher.teacher_id}>
                  <TableCell className="font-medium">{teacher.teacher_name}</TableCell>
                  <TableCell>{teacher.total_sections}</TableCell>
                  <TableCell>{teacher.total_subjects}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{teacher.total_weekly_periods}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={teacher.utilization_percentage}
                        className="w-[100px]"
                      />
                      <span className="text-xs text-muted-foreground">
                        {teacher.utilization_percentage.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        teacher.status === 'overloaded'
                          ? 'destructive'
                          : teacher.status === 'underutilized'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {teacher.status === 'overloaded'
                        ? 'Overloaded'
                        : teacher.status === 'underutilized'
                        ? 'Underutilized'
                        : 'Balanced'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {summary.teacher_stats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No teacher workload data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {(summary.overloaded_teachers > 0 || summary.underutilized_teachers > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.overloaded_teachers > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">High Workload Alert</p>
                  <p className="text-sm text-red-700">
                    {summary.overloaded_teachers} teacher(s) are overloaded. Consider redistributing
                    their assignments to underutilized teachers.
                  </p>
                </div>
              </div>
            )}

            {summary.underutilized_teachers > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Capacity Available</p>
                  <p className="text-sm text-yellow-700">
                    {summary.underutilized_teachers} teacher(s) have capacity for more assignments.
                    Consider assigning them additional sections.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
