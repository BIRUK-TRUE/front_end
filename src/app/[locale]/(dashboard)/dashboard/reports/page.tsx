"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Users, 
  DollarSign, 
  Calendar,
  BookOpen,
  GraduationCap,
  FileText
} from "lucide-react";
import { useAcademicYears } from "@/features/academics/api/useAcademicYears";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [reportType, setReportType] = useState<string>("overview");
  
  const { data: academicYearsData } = useAcademicYears(1, 100);
  const academicYears = academicYearsData?.items || [];

  // Mock data - replace with actual API calls
  const stats = {
    totalStudents: 1250,
    activeTeachers: 85,
    totalRevenue: 450000,
    pendingPayments: 32000,
    attendanceRate: 94.5,
    averageGrade: 82.3,
  };

  const handleExport = async (type: string) => {
    try {
      let url = "";
      switch (type) {
        case "students":
          url = "/api/v1/students/export/csv";
          break;
        case "users":
          url = "/api/v1/users/export/csv";
          break;
        case "payments":
          url = "/api/v1/payments/export/csv";
          break;
        default:
          return;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
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
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeTeachers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTeachers}</div>
            <p className="text-xs text-muted-foreground">+5 new this semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("attendanceRate")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Above target (90%)</p>
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
                <Button onClick={() => handleExport("students")}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("exportStudents")}
                </Button>
                <Button onClick={() => handleExport("users")} variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
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
                    ${(stats.totalRevenue - stats.pendingPayments).toLocaleString()}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">{t("pending")}</div>
                  <div className="mt-2 text-2xl font-bold text-orange-600">
                    ${stats.pendingPayments.toLocaleString()}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">{t("collectionRate")}</div>
                  <div className="mt-2 text-2xl font-bold text-blue-600">
                    {((stats.totalRevenue - stats.pendingPayments) / stats.totalRevenue * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <Button onClick={() => handleExport("payments")} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
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
                  <div className="text-2xl font-bold">{stats.averageGrade}%</div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium">{t("gradeDistribution")}</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-sm">A</span>
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-2 w-1/4 rounded-full bg-green-500" />
                      </div>
                      <span className="w-12 text-sm text-right">25%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-sm">B</span>
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-2 w-1/3 rounded-full bg-blue-500" />
                      </div>
                      <span className="w-12 text-sm text-right">35%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-sm">C</span>
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-2 w-1/5 rounded-full bg-yellow-500" />
                      </div>
                      <span className="w-12 text-sm text-right">28%</span>
                    </div>
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
                    <div className="mt-2 text-3xl font-bold">{stats.attendanceRate}%</div>
                    <div className="mt-1 text-xs text-green-600">↑ 2.3% from last month</div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">{t("presentToday")}</div>
                    <div className="mt-2 text-3xl font-bold">1,180</div>
                    <div className="mt-1 text-xs text-muted-foreground">of 1,250 students</div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-medium">{t("attendanceByGrade")}</div>
                  <div className="space-y-3">
                    {[
                      { grade: "Grade 9", rate: 96 },
                      { grade: "Grade 10", rate: 94 },
                      { grade: "Grade 11", rate: 92 },
                      { grade: "Grade 12", rate: 95 },
                    ].map((item) => (
                      <div key={item.grade} className="flex items-center gap-3">
                        <span className="w-20 text-sm">{item.grade}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted">
                          <div 
                            className="h-2 rounded-full bg-primary" 
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-right">{item.rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
