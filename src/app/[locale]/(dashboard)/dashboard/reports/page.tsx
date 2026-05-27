"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  Users, 
  DollarSign, 
  Calendar,
  BookOpen,
  GraduationCap,
  FileText,
  Loader2
} from "lucide-react";
import { useAcademicYears } from "@/features/academics/api/useAcademicYears";
import { reportsService } from "@/lib/api/reports.service";
import { useReportsData } from "@/hooks/useReportsData";
import { toast } from "sonner";

export default function ReportsPage() {
  const t = useTranslations("reports");

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [reportType, setReportType] = useState<string>("overview");
  const [isExporting, setIsExporting] = useState<string | null>(null);
  
  const { data: academicYearsData } = useAcademicYears(1, 100);
  const academicYears = academicYearsData?.items || [];

  // Use optimized data fetching hook
  const {
    stats,
    isInitialLoading,
    gradeDistribution,
    attendanceTrend,
  } = useReportsData({ selectedYear, reportType });

  // Memoize computed values
  const presentToday = useMemo(() => {
    if (!stats?.total_students || !stats?.attendance_rate) return 0;
    return Math.round(stats.total_students * stats.attendance_rate / 100);
  }, [stats?.total_students, stats?.attendance_rate]);

  const handleExport = async (type: string) => {
    setIsExporting(type);
    try {
      let blob: Blob;
      
      switch (type) {
        case "students":
          blob = await reportsService.exportStudents();
          break;
        case "teachers":
          blob = await reportsService.exportTeachers();
          break;
        case "users":
          blob = await reportsService.exportUsers();
          break;
        case "guardians":
          blob = await reportsService.exportGuardians();
          break;
        default:
          return;
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      toast.success("Export successful", {
        description: `${type} data has been exported successfully.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: `Failed to export ${type} data. Please try again.`,
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("selectYear")} />
            </SelectTrigger>
            <SelectContent>
              {academicYears?.map((year: { id: string; name: string }) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalStudents")}</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_students?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.active_enrollments || 0} active enrollments
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeTeachers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_teachers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.total_classes || 0} classes
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pendingPayments")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pending_payments || 0}</div>
                <p className="text-xs text-muted-foreground">Pending fee payments</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("attendanceRate")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.attendance_rate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {(stats?.attendance_rate || 0) >= 90 ? 'Above target (90%)' : 'Below target (90%)'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="financial">{t("financial")}</TabsTrigger>
          <TabsTrigger value="academic">{t("academic")}</TabsTrigger>
          <TabsTrigger value="attendance">{t("attendance")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("schoolOverview")}</CardTitle>
              <CardDescription>{t("overviewDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("enrollmentTrend")}</span>
                    <Badge variant="outline" className="border-success/20 bg-success/10 text-success">+12%</Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("teacherStudentRatio")}</span>
                    <span className="text-sm text-muted-foreground">1:15</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-1/2 rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleExport("students")}
                  disabled={isExporting === "students"}
                >
                  {isExporting === "students" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {t("exportStudents")}
                </Button>
                <Button 
                  onClick={() => handleExport("users")} 
                  variant="outline"
                  disabled={isExporting === "users"}
                >
                  {isExporting === "users" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {t("exportStaff")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("financialReport")}</CardTitle>
              <CardDescription>{t("financialDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">{t("collected")}</div>
                  <div className="mt-2 text-2xl font-bold text-green-600">
                    {isInitialLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      `${stats?.total_students || 0} students`
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">{t("pending")}</div>
                  <div className="mt-2 text-2xl font-bold text-orange-600">
                    {isInitialLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      `${stats?.pending_payments || 0}`
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">{t("collectionRate")}</div>
                  <div className="mt-2 text-2xl font-bold text-blue-600">
                    {isInitialLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      `${stats?.attendance_rate?.toFixed(1) || 0}%`
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => handleExport("guardians")} 
                className="w-full sm:w-auto"
                disabled={isExporting === "guardians"}
              >
                {isExporting === "guardians" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t("exportPayments")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("academicPerformance")}</CardTitle>
              <CardDescription>{t("academicDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{t("averageGrade")}</div>
                      <div className="text-sm text-muted-foreground">{t("allSubjects")}</div>
                    </div>
                  </div>
                  {isInitialLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.average_grade?.toFixed(1) || 0}%</div>
                  )}
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium">{t("gradeDistribution")}</div>
                  <div className="space-y-2">
                    {gradeDistribution?.data?.map((item) => (
                      <div key={item.grade} className="flex items-center gap-2">
                        <span className="w-8 text-sm">{item.grade}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted">
                          <div 
                            className="h-2 rounded-full bg-primary" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-right">{item.percentage.toFixed(0)}%</span>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-sm">A</span>
                          <div className="flex-1 h-2 rounded-full bg-muted">
                            <Skeleton className="h-2 w-1/4" />
                          </div>
                          <Skeleton className="w-12 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-sm">B</span>
                          <div className="flex-1 h-2 rounded-full bg-muted">
                            <Skeleton className="h-2 w-1/3" />
                          </div>
                          <Skeleton className="w-12 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-sm">C</span>
                          <div className="flex-1 h-2 rounded-full bg-muted">
                            <Skeleton className="h-2 w-1/5" />
                          </div>
                          <Skeleton className="w-12 h-4" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("attendanceReport")}</CardTitle>
              <CardDescription>{t("attendanceDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">{t("overallAttendance")}</div>
                    {isInitialLoading ? (
                      <Skeleton className="h-10 w-24 mt-2" />
                    ) : (
                      <>
                        <div className="mt-2 text-3xl font-bold">{stats?.attendance_rate?.toFixed(1) || 0}%</div>
                        <div className="mt-1 text-xs text-green-600">Last 30 days</div>
                      </>
                    )}
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">{t("presentToday")}</div>
                    {isInitialLoading ? (
                      <Skeleton className="h-10 w-24 mt-2" />
                    ) : (
                      <>
                        <div className="mt-2 text-3xl font-bold">{presentToday}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          of {stats?.total_students || 0} students
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-medium">{t("attendanceByGrade")}</div>
                  {attendanceTrend?.data && attendanceTrend.data.length > 0 ? (
                    <div className="space-y-3">
                      {attendanceTrend.data.slice(-4).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-20 text-sm">{item.date}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted">
                            <div 
                              className="h-2 rounded-full bg-primary" 
                              style={{ width: `${item.attendance_percentage}%` }}
                            />
                          </div>
                          <span className="w-12 text-sm text-right">{item.attendance_percentage.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="w-20 h-4" />
                          <div className="flex-1 h-2 rounded-full bg-muted">
                            <Skeleton className="h-2 w-3/4" />
                          </div>
                          <Skeleton className="w-12 h-4" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
