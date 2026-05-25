"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  useAcademicYear,
  useDeleteAcademicYear,
  useUpdateAcademicYear,
} from "@/features/academics/api/useAcademicYears";
import { AcademicYearStatus } from "@/features/academics/types";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Loader2,
  Plus,
  Edit,
  CheckCircle,
  MoreHorizontal,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AcademicYearModal } from "@/features/academics/components/AcademicYearModal";
import {
  useTerms,
  useCreateTerm,
  useUpdateTerm,
  useDeleteTerm,
} from "@/features/academics/api/useTerms";
import { TermModal } from "@/features/academics/components/TermModal";
import {
  type TermForm,
  type ClassForm,
} from "@/features/academics/types/schemas";
import { type Term, type Class } from "@/features/academics/types";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/features/academics/api/useClasses";
import { ClassModal } from "@/features/academics/components/ClassModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Progress } from "@/components/ui/progress";

export default function AcademicYearDetailPage() {
  const t = useTranslations("common");
  const ta = useTranslations("academics");
  const params = useParams();
  const router = useRouter();
  const yearId = params.yearId as string;

  const { data: year, isLoading: isYearLoading } = useAcademicYear(yearId);
  const { data: termsData, isLoading: isTermsLoading } = useTerms(yearId);
  const { data: classesData, isLoading: isClassesLoading } = useClasses(yearId);

  const createTerm = useCreateTerm(yearId);
  const updateTerm = useUpdateTerm(yearId);
  const deleteTerm = useDeleteTerm(yearId);

  const createClass = useCreateClass(yearId);
  const updateClass = useUpdateClass(yearId);
  const deleteClass = useDeleteClass(yearId);
  const deleteYear = useDeleteAcademicYear();
  const updateYear = useUpdateAcademicYear();

  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [deleteTermId, setDeleteTermId] = useState<string | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [deleteYearDialogOpen, setDeleteYearDialogOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  const [classSearch, setClassSearch] = useState("");
  const [classGradeFilter, setClassGradeFilter] = useState("all");
  const [classPage, setClassPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const openCreateTermModal = () => {
    setEditingTerm(null);
    setIsTermModalOpen(true);
  };

  const openEditTermModal = (term: Term) => {
    setEditingTerm(term);
    setIsTermModalOpen(true);
  };

  const handleTermSubmit = async (formData: TermForm) => {
    try {
      if (editingTerm) {
        await updateTerm.mutateAsync({ id: editingTerm.id, data: formData });
        toast.success("Term updated successfully");
      } else {
        await createTerm.mutateAsync(formData);
        toast.success("Term created successfully");
      }
      setIsTermModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("error"));
    }
  };

  const openCreateClassModal = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (classItem: Class) => {
    setEditingClass(classItem);
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = async (formData: ClassForm) => {
    try {
      if (editingClass) {
        await updateClass.mutateAsync({ id: editingClass.id, data: formData });
        toast.success("Class updated successfully");
      } else {
        await createClass.mutateAsync(formData);
        toast.success("Class created successfully");
      }
      setIsClassModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("error"));
    }
  };

  const openEditYearModal = () => {
    setIsYearModalOpen(true);
  };

  const handleYearSubmit = async (formData: any) => {
    try {
      await updateYear.mutateAsync({ id: yearId, data: formData });
      toast.success("Academic year updated successfully");
      setIsYearModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("error"));
    }
  };

  const handleActivateTerm = async (id: string) => {
    await updateTerm.mutateAsync({
      id,
      data: { is_active: true },
    });
  };

  const filteredClasses =
    classesData?.items?.filter((c) => {
      const matchesSearch = c.name
        .toLowerCase()
        .includes(classSearch.toLowerCase());
      const matchesGrade =
        classGradeFilter === "all" ||
        c.grade_level === parseInt(classGradeFilter);
      return matchesSearch && matchesGrade;
    }) || [];

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const startIndex = (classPage - 1) * ITEMS_PER_PAGE;
  const paginatedClasses = filteredClasses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const getStatusBadge = (
    status?: AcademicYearStatus,
    isCurrent?: boolean,
    t?: any,
  ) => {
    const translate = t || ((key: string) => key);
    if (isCurrent) {
      return (
        <Badge
          variant="default"
          className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30"
        >
          {translate("currentActiveYear")}
        </Badge>
      );
    }

    switch (status) {
      case AcademicYearStatus.PLANNING:
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-muted-foreground/30"
          >
            {translate("planning")}
          </Badge>
        );
      case AcademicYearStatus.ACTIVE:
        return (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/30"
          >
            {translate("active")}
          </Badge>
        );
      case AcademicYearStatus.COMPLETED:
        return (
          <Badge
            variant="outline"
            className="bg-info/10 text-info border-info/30"
          >
            {translate("completed")}
          </Badge>
        );
      case AcademicYearStatus.ARCHIVED:
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30"
          >
            {translate("archived")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isYearLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!year) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {ta("academicYearNotFound")}
        </h2>
        <p className="text-muted-foreground">
          {ta("academicYearNotFoundDesc")}
        </p>
        <Button asChild>
          <Link href="/dashboard/academics/years">{ta("backToList")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link
          href="/dashboard/academics/years"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {ta("backToList")}
        </Link>
      </div>

      <PageHeader
        title={year.name}
        description={`${new Date(year.start_date).toLocaleDateString()} — ${new Date(year.end_date).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-4">
            {getStatusBadge(year.status, year.is_current, ta)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={openEditYearModal}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Year
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteYearDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="terms" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">{ta("terms")}</span>
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{ta("classes")}</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">{ta("statistics")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="space-y-4 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{ta("terms")}</h3>
              <p className="text-sm text-muted-foreground">
                {ta("manageTerms")}
              </p>
            </div>
            <Button size="sm" onClick={openCreateTermModal} className="gap-2">
              <Plus className="h-4 w-4" />
              {ta("addTerm")}
            </Button>
          </div>

          {/* Term Timeline */}
          {termsData?.items && termsData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {ta("termTimeline") || "Term Timeline"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pt-6 pb-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/20 w-full" />
                  </div>
                  <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
                    {termsData.items.map((term) => {
                      const yearStart = new Date(year.start_date).getTime();
                      const yearEnd = new Date(year.end_date).getTime();
                      const termStart = new Date(term.start_date).getTime();
                      const termEnd = new Date(term.end_date).getTime();
                      
                      const totalDuration = yearEnd - yearStart;
                      const startOffset = ((termStart - yearStart) / totalDuration) * 100;
                      const width = ((termEnd - termStart) / totalDuration) * 100;

                      return (
                        <div
                          key={term.id}
                          className="absolute top-[-8px] h-4 rounded-full bg-primary transition-all hover:bg-primary/80 cursor-pointer group"
                          style={{ left: `${startOffset}%`, width: `${width}%` }}
                          title={`${term.name}: ${new Date(term.start_date).toLocaleDateString()} - ${new Date(term.end_date).toLocaleDateString()}`}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded shadow-md whitespace-nowrap z-10 pointer-events-none">
                            {term.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>{new Date(year.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span>{new Date(year.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto min-h-[200px]">
                {isTermsLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !termsData?.items?.length ? (
                  <EmptyState
                    icon={CalendarDays}
                    title={ta("noTermsConfigured")}
                    description={ta("createTermPrompt")}
                    action={
                      <Button onClick={openCreateTermModal}>
                        {ta("addTerm")}
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y">
                    {termsData.items.map((term) => (
                      <div
                        key={term.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-base">
                              {term.name}
                            </span>
                            {term.status === "active" && (
                              <Badge
                                variant="outline"
                                className="bg-success/10 text-success border-success/30 font-normal shadow-none"
                              >
                                {ta("activeTerm")}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(
                              term.start_date,
                            ).toLocaleDateString()} —{" "}
                            {new Date(term.end_date).toLocaleDateString()}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              onClick={() => openEditTermModal(term)}
                            >
                              <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                              {ta("editDetails")}
                            </DropdownMenuItem>

                            {term.status !== "active" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleActivateTerm(term.id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                  {ta("setAsActive")}
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTermId(term.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {ta("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">{ta("classes")}</h3>
              <p className="text-sm text-muted-foreground">
                {ta("manageClasses")}
              </p>
            </div>
            <Button size="sm" onClick={openCreateClassModal} className="gap-2">
              <Plus className="h-4 w-4" />
              {ta("addClass")}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={ta("searchClasses")}
                value={classSearch}
                onChange={(e) => {
                  setClassSearch(e.target.value);
                  setClassPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={classGradeFilter}
              onValueChange={(value) => {
                setClassGradeFilter(value);
                setClassPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={ta("allGrades")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ta("allGrades")}</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
                <SelectItem value="6">Grade 6</SelectItem>
                <SelectItem value="7">Grade 7</SelectItem>
                <SelectItem value="8">Grade 8</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto min-h-[200px]">
                {isClassesLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !filteredClasses.length ? (
                  <EmptyState
                    icon={BookOpen}
                    title={ta("noClassesConfigured")}
                    description={ta("createClassPrompt")}
                    action={
                      <Button onClick={openCreateClassModal}>
                        {ta("addClass")}
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y">
                    {paginatedClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/dashboard/academics/classes/${classItem.id}`}
                              className="font-medium text-base hover:underline"
                            >
                              {classItem.name}
                            </Link>
                            <Badge
                              variant="outline"
                              className="font-normal text-xs bg-muted/50"
                            >
                              {ta("gradeLevel")} {classItem.grade_level}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {classItem.section_count || 0} {ta("sections")}
                            </span>
                            <span>
                              {ta("capacity")}:{" "}
                              {classItem.capacity
                                ? classItem.capacity
                                : ta("unlimited")}
                            </span>
                            <span>
                              {ta("enrolled")}: {classItem.total_students || 0}
                            </span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/academics/classes/${classItem.id}`,
                                )
                              }
                            >
                              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                              {ta("manageSections")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openEditClassModal(classItem)}
                            >
                              <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                              {ta("editDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteClassId(classItem.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {ta("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      {ta("showing", {
                        start: startIndex + 1,
                        end: Math.min(
                          startIndex + ITEMS_PER_PAGE,
                          filteredClasses.length,
                        ),
                        total: filteredClasses.length,
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setClassPage((p) => Math.max(1, p - 1))}
                        disabled={classPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        {classPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setClassPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={classPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>{ta("yearOverview")}</CardTitle>
              <CardDescription>{ta("enrollmentStats")}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-muted-foreground text-sm">
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {year.term_count || 0}
                  </div>
                  <div>{ta("totalTerms")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {year.class_count || 0}
                  </div>
                  <div>{ta("totalClasses")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    —
                  </div>
                  <div>{ta("totalEnrolledStudents")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TermModal
        open={isTermModalOpen}
        onOpenChange={setIsTermModalOpen}
        term={editingTerm}
        onSubmit={handleTermSubmit}
        isLoading={createTerm.isPending || updateTerm.isPending}
        yearStart={year?.start_date}
        yearEnd={year?.end_date}
        existingTerms={termsData?.items || []}
      />

      <ClassModal
        open={isClassModalOpen}
        onOpenChange={setIsClassModalOpen}
        classItem={editingClass}
        onSubmit={handleClassSubmit}
        isLoading={createClass.isPending || updateClass.isPending}
      />

      <ConfirmDialog
        open={!!deleteTermId}
        onOpenChange={(open) => {
          if (!open) setDeleteTermId(null);
        }}
        onConfirm={async () => {
          if (deleteTermId) {
            await deleteTerm.mutateAsync(deleteTermId);
            setDeleteTermId(null);
          }
        }}
        title={ta("deleteTermTitle")}
        description={ta("deleteTermDescription")}
        isLoading={deleteTerm.isPending}
      />

      <ConfirmDialog
        open={!!deleteClassId}
        onOpenChange={(open) => {
          if (!open) setDeleteClassId(null);
        }}
        onConfirm={async () => {
          if (deleteClassId) {
            await deleteClass.mutateAsync(deleteClassId);
            setDeleteClassId(null);
          }
        }}
        title={ta("deleteClassTitle")}
        description={ta("deleteClassDescription")}
        isLoading={deleteClass.isPending}
      />

      <ConfirmDialog
        open={deleteYearDialogOpen}
        onOpenChange={setDeleteYearDialogOpen}
        onConfirm={async () => {
          await deleteYear.mutateAsync(yearId);
          router.push("/dashboard/academics/years");
        }}
        title={ta("deleteYearTitle")}
        description={ta("deleteYearDescription")}
        isLoading={deleteYear.isPending}
      />

      <AcademicYearModal
        open={isYearModalOpen}
        onOpenChange={setIsYearModalOpen}
        year={year}
        onSubmit={handleYearSubmit}
        isLoading={updateYear.isPending}
      />
    </div>
  );
}
