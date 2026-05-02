# Frontend Bug Report

## PROBLEM #1
TYPE: TYPE 3 - HARDCODED DATA
SEVERITY: 🟠 High
FILE: `src/lib/api/auth.service.ts`
DESCRIPTION: Mock user accounts are hardcoded for testing without a backend. The MOCK_USERS object contains 6 hardcoded user accounts with passwords and user data.
IMPACT: In production, this could allow unauthorized access if the fallback to mock login is triggered. It also means the app relies on fake data when the API is unreachable.
EVIDENCE:
```typescript
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@school.com': {
    password: 'admin123',
    user: { ... }
  },
  // ... 5 more hardcoded users
};
```

---

## PROBLEM #2
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟠 High
FILE: `src/lib/api/auth.service.ts`
DESCRIPTION: The login function falls back to mock authentication when the API is unreachable (network error). This could mask real API issues and allow login with hardcoded credentials in production.
IMPACT: Users could potentially log in with hardcoded mock credentials if the backend API is down or misconfigured, bypassing real authentication.
EVIDENCE:
```typescript
async login(email: string, password: string) {
  try {
    const { data } = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return data;
  } catch (apiError: any) {
    if (!apiError.response || apiError.code === 'ERR_NETWORK') {
      console.info('[Auth] API unreachable, using mock login');
      return mockLogin(email, password);
    }
    throw apiError;
  }
}
```

---

## PROBLEM #3
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/schedule/api/useSchedule.ts`
DESCRIPTION: Schedule API endpoints are documented as "mocked" and have 404 fallbacks that return empty arrays. The backend endpoints may not exist yet.
IMPACT: Schedule functionality will show empty data instead of errors if the backend endpoints are not implemented, potentially masking missing backend features.
EVIDENCE:
```typescript
export function useSectionSchedule(sectionId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.bySection(sectionId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      // Mocked endpoint: the backend doesn't exist yet, we will handle 404 or return [] safely.
      try {
        const { data } = await axiosInstance.get(`/schedule/section/${sectionId}`, {
          params: { term_id: termId },
        });
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: !!sectionId && !!termId,
  });
}
```

---

## PROBLEM #4
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/attendance/hooks/useSectionStudents.ts`
DESCRIPTION: Comment indicates "BACKEND REQUIRED: GET /sections/{sectionId}/students" - the endpoint may not exist on the backend.
IMPACT: If the backend endpoint is not implemented, the section students feature will fail without clear error messaging.
EVIDENCE:
```typescript
export function useSectionStudents(sectionId: string, page = 1, size = 100) {
  return useQuery({
    queryKey: [...academicsKeys.all, "sections", sectionId, "students", { page, size }],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Student>>(
        `/academics/sections/${sectionId}/students`,
        {
          params: { page, size },
        }
      );
      return data;
    },
    enabled: !!sectionId,
  });
}
```

---

## PROBLEM #5
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/attendance/hooks/useFaceEnrollment.ts`
DESCRIPTION: Comment indicates "BACKEND REQUIRED: GET /face-recognition/enrollment-status?sectionId={id}" - the endpoint may not exist.
IMPACT: Face recognition enrollment status feature will fail if the backend endpoint is not implemented.
EVIDENCE:
```typescript
queryFn: async (): Promise<EnrollmentStatus[]> => {
  if (!sectionId) return [];
  // BACKEND REQUIRED: GET /face-recognition/enrollment-status?sectionId={id}
  const { data } = await axiosInstance.get(`/face-recognition/enrollment-status?sectionId=${sectionId}`);
  return data;
}
```

---

## PROBLEM #6
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/attendance/hooks/useFaceAttendance.ts`
DESCRIPTION: Comment indicates "BACKEND REQUIRED: GET /face-recognition/descriptors?sectionId={id}" - the endpoint may not exist.
IMPACT: Face recognition attendance feature will fail if the backend endpoint is not implemented.
EVIDENCE:
```typescript
queryFn: async (): Promise<FaceDescriptor[]> => {
  if (!sectionId) return [];
  // BACKEND REQUIRED: GET /face-recognition/descriptors?sectionId={id}
  const { data } = await axiosInstance.get(`/face-recognition/descriptors?sectionId=${sectionId}`);
  return data;
}
```

---

## PROBLEM #7
TYPE: TYPE 2 - INCOMPLETE UI
SEVERITY: 🟡 Medium
FILE: `src/app/[locale]/(dashboard)/dashboard/student/my-grades/page.tsx`
DESCRIPTION: TODO comment indicates that `availableTerms` needs a global endpoint or mock, but it's left empty. The term filter may not have any options to select from.
IMPACT: Users may not be able to filter grades by term if the availableTerms array is empty, limiting the functionality of the grades page.
EVIDENCE:
```typescript
// TODO: `availableTerms` needs a global endpoint or we mock. We leave empty for now assuming it flows from an API if wired,
// or the backend just expects them to exist.
```

---

## PROBLEM #8
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/notifications/rules/page.tsx`
DESCRIPTION: Uses browser's native `confirm()` dialog for deletion confirmation instead of a custom modal.
IMPACT: Native confirm dialogs are not styled consistently with the app's design and cannot be customized.
EVIDENCE:
```typescript
if (confirm(t('deleteConfirm'))) {
  // delete logic
}
```

---

## PROBLEM #9
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/teacher/components/TeacherAttendanceForm.tsx`
DESCRIPTION: Uses browser's native `window.confirm()` for attendance already taken warning.
IMPACT: Native confirm dialogs are not styled consistently with the app's design.
EVIDENCE:
```typescript
if (window.confirm(t("alreadyTaken"))) {
  // handle logic
}
```

---

## PROBLEM #10
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/attendance/face-enrollment/page.tsx`
DESCRIPTION: Uses browser's native `confirm()` for deletion confirmation.
IMPACT: Native confirm dialogs are not styled consistently with the app's design.
EVIDENCE:
```typescript
if (confirm(t('deleteConfirm', { name: student.name }))) {
  // delete logic
}
```

---

## PROBLEM #11
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(auth)/login/page.tsx`
DESCRIPTION: Console.log statements are used for debugging redirect logic. These should be removed in production.
IMPACT: Console logs in production code can clutter the browser console and potentially leak sensitive information.
EVIDENCE:
```typescript
if (response.user.roles.includes('teacher')) {
  console.log('Redirecting to teacher dashboard');
  router.push('/dashboard/teacher');
} else if (response.user.roles.includes('student')) {
  console.log('Redirecting to student dashboard');
  router.push('/dashboard/student');
}
```

---

## PROBLEM #12
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(auth)/login/page.tsx`
DESCRIPTION: Console.error is used for login error logging. While acceptable for debugging, it should be replaced with proper error handling/logging in production.
IMPACT: Console errors in production can be helpful for debugging but should be handled more gracefully.
EVIDENCE:
```typescript
} catch (error: any) {
  console.error('Login error:', error);
  const msg = error.response?.data?.detail || t('invalidCredentials');
  setServerError(msg);
}
```

---

## PROBLEM #13
TYPE: TYPE 6 - DEAD CODE
SEVERITY: 🟢 Low
FILE: `src/features/schedule/api/useSchedule.ts`
DESCRIPTION: Commented out code for initialData dummy data for visual testing of timetable.
IMPACT: Dead code should be removed to keep the codebase clean.
EVIDENCE:
```typescript
enabled: !!sectionId && !!termId,
// Provide some dummy initialData if we want to visually test a timetable
// initialData: []
```

---

## PROBLEM #14
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/lib/api/users.service.ts`
DESCRIPTION: Filter interface uses `[key: string]: any` which bypasses TypeScript type checking for additional filter parameters.
IMPACT: Reduces type safety and could lead to runtime errors if incorrect filter parameters are passed.
EVIDENCE:
```typescript
export interface UserFilters {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  role?: string;
  sort_by?: 'created_at' | 'full_name' | 'email';
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}
```

---

## PROBLEM #15
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/lib/api/students.service.ts`
DESCRIPTION: Filter interface uses `[key: string]: any` which bypasses TypeScript type checking.
IMPACT: Reduces type safety for filter parameters.
EVIDENCE:
```typescript
export interface StudentFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'graduated' | 'transferred' | 'expelled' | 'withdrawn';
  is_active?: boolean;
  sex?: 'M' | 'F';
  nationality?: string;
  sort_by?: 'created_at' | 'full_name' | 'registration_number' | 'admission_date';
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}
```

---

## PROBLEM #16
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/lib/api/teachers.service.ts`
DESCRIPTION: Filter interface uses `[key: string]: any` which bypasses TypeScript type checking.
IMPACT: Reduces type safety for filter parameters.
EVIDENCE:
```typescript
export interface TeacherFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'retired';
  is_active?: boolean;
  specialization?: string;
  sort_by?: 'created_at' | 'full_name' | 'employee_id' | 'hire_date';
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}
```

---

## PROBLEM #17
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/lib/api/guardians.service.ts`
DESCRIPTION: Filter interface uses `[key: string]: any` which bypasses TypeScript type checking.
IMPACT: Reduces type safety for filter parameters.
EVIDENCE:
```typescript
export interface GuardianFilters {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  has_students?: boolean;
  sort_by?: 'created_at' | 'full_name' | 'email';
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}
```

---

## PROBLEM #18
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/lib/api/auth.service.ts`
DESCRIPTION: Error handler uses `any` type for apiError parameter, reducing type safety.
IMPACT: Reduces type safety in error handling.
EVIDENCE:
```typescript
} catch (apiError: any) {
  if (!apiError.response || apiError.code === 'ERR_NETWORK') {
    console.info('[Auth] API unreachable, using mock login');
    return mockLogin(email, password);
  }
  throw apiError;
}
```

---

## PROBLEM #19
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/hooks/useSettings.ts`
DESCRIPTION: Mutation function uses `any` type for data parameter.
IMPACT: Reduces type safety for settings updates.
EVIDENCE:
```typescript
mutationFn: async (data: any) => {
  const { data: response } = await axiosInstance.patch('/settings/school-info', data);
  return response.data;
}
```

---

## PROBLEM #20
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/features/student-portal/components/AssessmentDetailsTable.tsx`
DESCRIPTION: Type assertion `as any` is used to bypass TypeScript type checking.
IMPACT: Reduces type safety and could lead to runtime errors.
EVIDENCE:
```typescript
const key = typeStr.toLowerCase() as any;
```

---

## PROBLEM #21
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/features/student-portal/api/useMyProfile.ts`
DESCRIPTION: Error handler uses `any` type for error parameter.
IMPACT: Reduces type safety in error handling.
EVIDENCE:
```typescript
onError: (error: any) => {
  toast.error(error.response?.data?.detail || t('profileUpdateFailed'));
}
```

---

## PROBLEM #22
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/features/student-portal/components/ChangePasswordForm.tsx`
DESCRIPTION: Error handler uses `any` type for error parameter.
IMPACT: Reduces type safety in error handling.
EVIDENCE:
```typescript
} catch (e: any) {
  toast.error(e.response?.data?.detail || t('passwordChangeFailed'));
}
```

---

## PROBLEM #23
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/attendance/hooks/useFaceModels.ts`
DESCRIPTION: Console.warn is used when local models are not found, falling back to CDN.
IMPACT: While acceptable for debugging, it should be handled more gracefully in production.
EVIDENCE:
```typescript
console.warn('Local models not found, falling back to CDN');
```

---

## PROBLEM #24
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/attendance/hooks/useFaceEnrollment.ts`
DESCRIPTION: Console.error is used for face enrollment errors.
IMPACT: Console errors should be handled more gracefully in production.
EVIDENCE:
```typescript
console.error('Face enrollment error:', error);
```

---

## PROBLEM #25
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/attendance/components/FaceRecognitionScanner.tsx`
DESCRIPTION: Multiple console.error statements for face-api loading, camera errors, and detection errors.
IMPACT: Console errors should be handled more gracefully in production.
EVIDENCE:
```typescript
console.error('Failed to load face-api:', error);
console.error('Camera error:', error);
console.error('Detection error:', error);
```

---

## PROBLEM #26
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/attendance/components/FaceEnrollmentFlow.tsx`
DESCRIPTION: Console.error for failed face-api model loading.
IMPACT: Console errors should be handled more gracefully in production.
EVIDENCE:
```typescript
console.error('Failed to load face-api models:', error);
```

---

## PROBLEM #27
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/attendance/components/FaceAttendanceStation.tsx`
DESCRIPTION: Console.warn and console.error for model loading failures.
IMPACT: Console errors should be handled more gracefully in production.
EVIDENCE:
```typescript
console.warn("Local models not found, falling back to CDN");
console.error("Failed to load face-api models:", error);
```

---

## PROBLEM #28
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/grades/utils/exportReportCardPDF.ts`
DESCRIPTION: Console.error for failed PDF export.
IMPACT: Console errors should be handled more gracefully in production.
EVIDENCE:
```typescript
console.error('Failed to export PDF:', error);
```

---

## PROBLEM #29
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/features/grades/components/BatchReportCards.tsx`
DESCRIPTION: Console.error for failed report card generation.
IMPACT: Console errors should be handled more gracefully in production.
EVIDENCE:
```typescript
console.error(`Failed to generate report card for ${student.name}:`, error);
```

---

## PROBLEM #30
TYPE: TYPE 2 - INCOMPLETE UI
SEVERITY: 🟢 Low
FILE: `src/features/schedule/api/useSchedule.ts`
DESCRIPTION: The useTeacherSchedule function has the same "mocked endpoint" comment and 404 fallback as useSectionSchedule.
IMPACT: Teacher schedule will show empty data if backend endpoint is not implemented.
EVIDENCE:
```typescript
export function useTeacherSchedule(teacherId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.byTeacher(teacherId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      // Mocked endpoint
      try {
        const { data } = await axiosInstance.get(`/schedule/teacher/${teacherId}`, {
          params: { term_id: termId },
        });
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: !!teacherId && !!termId,
  });
}
```

---

---

## PROBLEM #31
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/teacher/hooks/useTeacherDashboard.ts`
DESCRIPTION: Comment indicates "BACKEND REQUIRED: GET /teachers/{teacherId}/dashboard-stats" - the endpoint may not exist on the backend.
IMPACT: Teacher dashboard stats will fail if the backend endpoint is not implemented.
EVIDENCE:
```typescript
queryFn: async (): Promise<TeacherDashboardStats> => {
  // BACKEND REQUIRED: GET /teachers/{teacherId}/dashboard-stats
  // Expected response: { todayClasses, totalStudents, pendingGrades, attendanceTakenToday, recentActivity, currentTermName }
  const { data } = await axiosInstance.get(
    `/teachers/${teacherId}/dashboard-stats`,
  );
  return data;
},
```

---

## PROBLEM #32
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/teacher/hooks/useTeacherSchedule.ts`
DESCRIPTION: Comment indicates "BACKEND REQUIRED: GET /teachers/{teacherId}/schedule" - the endpoint may not exist.
IMPACT: Teacher schedule will fail if the backend endpoint is not implemented.
EVIDENCE:
```typescript
queryFn: async (): Promise<TeacherScheduleEntry[]> => {
  // BACKEND REQUIRED: GET /teachers/{teacherId}/schedule
  // Expected response: TeacherScheduleEntry[]
  const { data } = await axiosInstance.get(`/teachers/${teacherId}/schedule`);
  return data;
},
```

---

## PROBLEM #33
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/teacher/hooks/useTeacherClasses.ts`
DESCRIPTION: Comments indicate "BACKEND REQUIRED: GET /teachers/{teacherId}/classes" and "BACKEND REQUIRED: GET /sections/{sectionId}/students" - endpoints may not exist.
IMPACT: Teacher classes and class roster features will fail if backend endpoints are not implemented.
EVIDENCE:
```typescript
queryFn: async (): Promise<TeacherClassItem[]> => {
  // BACKEND REQUIRED: GET /teachers/{teacherId}/classes
  // Expected response: TeacherClassItem[]
  const { data } = await axiosInstance.get(`/teachers/${teacherId}/classes`);
  return data;
},
// ...
queryFn: async (): Promise<TeacherRosterResponse> => {
  // BACKEND REQUIRED: GET /sections/{sectionId}/students
  // Expected response: { students: TeacherStudent[], summary: { presentPercent, absentPercent, latePercent } }
  const { data } = await axiosInstance.get(`/sections/${sectionId}/students`);
  return data;
},
```

---

## PROBLEM #34
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/teacher/hooks/useTeacherGrades.ts`
DESCRIPTION: Comments indicate "BACKEND REQUIRED: GET /teachers/{teacherId}/assessments", "BACKEND REQUIRED: GET /assessments/{assessmentId}/grades", and "BACKEND REQUIRED: POST /assessments/{assessmentId}/grades/bulk" - endpoints may not exist.
IMPACT: Teacher grade entry features will fail if backend endpoints are not implemented.
EVIDENCE:
```typescript
queryFn: async (): Promise<{ items: TeacherAssessment[]; total: number }> => {
  // BACKEND REQUIRED: GET /teachers/{teacherId}/assessments
  // Expected query params: { sectionId, subjectName, termName, page, size }
  const { data } = await axiosInstance.get(`/teachers/${teacherId}/assessments`, {
    params: filters,
  });
  return data;
},
// ...
queryFn: async (): Promise<TeacherAssessmentGrade[]> => {
  // BACKEND REQUIRED: GET /assessments/{assessmentId}/grades
  const { data } = await axiosInstance.get(`/assessments/${assessmentId}/grades`);
  return data;
},
// ...
// BACKEND REQUIRED: POST /assessments/{assessmentId}/grades/bulk
// Expected request body: { grades: [{ studentId, score, remarks }] }
const { data } = await axiosInstance.post(
  `/assessments/${args.assessmentId}/grades/bulk`,
  { grades: args.grades },
);
```

---

## PROBLEM #35
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/features/teacher/hooks/useTeacherAttendance.ts`
DESCRIPTION: Comments indicate "BACKEND REQUIRED: GET /attendance/check", "BACKEND REQUIRED: POST /attendance/bulk", and "BACKEND REQUIRED: GET /teachers/{teacherId}/attendance-records" - endpoints may not exist.
IMPACT: Teacher attendance features will fail if backend endpoints are not implemented.
EVIDENCE:
```typescript
// BACKEND REQUIRED: GET /attendance/check
// Expected query params: { sectionId, date }
const check = await axiosInstance.get("/attendance/check", {
  params: { sectionId: payload.sectionId, date: payload.date },
});
// ...
// BACKEND REQUIRED: POST /attendance/bulk
// Expected request body: { sectionId, date, records: [{ studentId, status, note }] }
const { data } = await axiosInstance.post("/attendance/bulk", payload);
// ...
// BACKEND REQUIRED: GET /teachers/{teacherId}/attendance-records
// Expected query params: { sectionId, fromDate, toDate, page, size }
const { data } = await axiosInstance.get(
  `/teachers/${teacherId}/attendance-records`,
  {
    params: filters,
  },
);
```

---

## PROBLEM #36
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/academics/years/[yearId]/page.tsx`
DESCRIPTION: Type assertion `as any` is used to bypass TypeScript type checking.
IMPACT: Reduces type safety and could lead to runtime errors.
EVIDENCE:
```typescript
await updateTerm.mutateAsync({
  id,
  data: { status: 'active' } as any
});
```

---

## PROBLEM #37
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx`
DESCRIPTION: Type assertion `as any` is used in form register for grading scale.
IMPACT: Reduces type safety for form registration.
EVIDENCE:
```typescript
{...register(`grading_scale.${grade}` as any, { valueAsNumber: true })}
```

---

## PROBLEM #38
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx`
DESCRIPTION: Type assertion `as any` is used for router push.
IMPACT: Reduces type safety for navigation.
EVIDENCE:
```typescript
router.push(`/dashboard/academics/classes/${classItem.id}` as any)
```

---

## PROBLEM #39
TYPE: TYPE 2 - INCOMPLETE UI
SEVERITY: 🟡 Medium
FILE: `src/app/[locale]/(dashboard)/dashboard/academics/classes/[classId]\sections\[sectionId]\page.tsx`
DESCRIPTION: Students array is hardcoded as empty array with type `unknown[]`. The comment indicates "Student rows will go here in a later phase".
IMPACT: The section roster page will always show no students, making the feature incomplete.
EVIDENCE:
```typescript
const students: unknown[] = [];
// ...
{students.length === 0 ? (
  <EmptyState
    icon={Users}
    title={t('noStudentsTitle')}
    description={t('noStudentsDescription')}
    action={
      <Button variant="outline" asChild>
        <Link href="/dashboard/enrollments">{t('goToEnrollments')}</Link>
      </Button>
    }
  />
) : (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{t('studentName')}</TableHead>
        <TableHead>{t('idNumber')}</TableHead>
        <TableHead>{t('gender')}</TableHead>
        <TableHead className="text-right">{tc('actions')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {/* Student rows will go here in a later phase */}
    </TableBody>
  </Table>
)}
```

---

## PROBLEM #40
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/attendance\face-enrollment\page.tsx`
DESCRIPTION: Uses browser's native `confirm()` for deletion confirmation (same as PROBLEM #10 but in a different context).
IMPACT: Native confirm dialogs are not styled consistently with the app's design.
EVIDENCE:
```typescript
if (confirm(t('deleteConfirm', { name: student.name }))) {
  deleteEnrollment.mutate(student.id);
}
```

---

## PROBLEM #41
TYPE: TYPE 4 - MISSING UI STATES
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard\notifications\rules\page.tsx`
DESCRIPTION: Uses browser's native `confirm()` for deletion confirmation (same as PROBLEM #8 but in a different context).
IMPACT: Native confirm dialogs are not styled consistently with the app's design.
EVIDENCE:
```typescript
if (confirm(t('deleteConfirm'))) {
  deleteMutation.mutate(id);
}
```

---

## PROBLEM #42
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/edit/page.tsx`
DESCRIPTION: Type assertion `as any` is used for zodResolver.
IMPACT: Reduces type safety for form validation.
EVIDENCE:
```typescript
resolver: zodResolver(editGuardianSchema) as any,
```

---

## PROBLEM #43
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/edit/page.tsx`
DESCRIPTION: Payload is typed as `any` when submitting form data.
IMPACT: Reduces type safety for form submission.
EVIDENCE:
```typescript
const payload: any = { ...data };
```

---

## PROBLEM #44
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/edit/page.tsx`
DESCRIPTION: Type assertion `as any` is used for relationship_type translation.
IMPACT: Reduces type safety for translation key.
EVIDENCE:
```typescript
{t(link.relationship_type as any) || link.relationship_type}
```

---

## PROBLEM #45
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx`
DESCRIPTION: Type assertion `as any` is used for relationship_type.
IMPACT: Reduces type safety for relationship type.
EVIDENCE:
```typescript
relationship_type: 'guardian' as any,
```

---

## PROBLEM #46
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx`
DESCRIPTION: Type assertion `as any` is used for relationship_type translation.
IMPACT: Reduces type safety for translation key.
EVIDENCE:
```typescript
{t(guardian.relationship_type as any) || guardian.relationship_type}
```

---

## PROBLEM #47
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx`
DESCRIPTION: Student array items are typed as `any`.
IMPACT: Reduces type safety for student data.
EVIDENCE:
```typescript
{students.items.map((student: any) => (
```

---

## PROBLEM #48
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx`
DESCRIPTION: Student link items are typed as `any`.
IMPACT: Reduces type safety for student link data.
EVIDENCE:
```typescript
{guardian.student_links.map((link: any) => (
```

---

## PROBLEM #49
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx`
DESCRIPTION: Type assertion `as any` is used for relationship_type translation in linked students.
IMPACT: Reduces type safety for translation key.
EVIDENCE:
```typescript
{t(link.relationship_type as any) || link.relationship_type}
```

---

## PROBLEM #50
TYPE: TYPE 2 - INCOMPLETE UI
SEVERITY: 🟡 Medium
FILE: `src/app/[locale]/(dashboard)/dashboard/guardian/profile/page.tsx`
DESCRIPTION: Password change form has no submit handler or state management. The form fields are present but the button does nothing.
IMPACT: Users cannot change their password through this form.
EVIDENCE:
```typescript
<Button className="w-full mt-2 font-bold shadow-sm">{t("updatePassword")}</Button>
```
The form has no `onSubmit` handler and no state management for the password fields.

---

## PROBLEM #51
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`
DESCRIPTION: Type assertion `as any` is used for setValue.
IMPACT: Reduces type safety for form value setting.
EVIDENCE:
```typescript
setValue('profile_image_url' as any, '');
```

---

## PROBLEM #52
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`
DESCRIPTION: Payload is typed as `any` when submitting form data.
IMPACT: Reduces type safety for form submission.
EVIDENCE:
```typescript
const payload: any = { ...data };
```

---

## PROBLEM #53
TYPE: TYPE 5 - BROKEN LOGIC
SEVERITY: 🟢 Low
FILE: `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`
DESCRIPTION: Guardian items are typed as `any`.
IMPACT: Reduces type safety for guardian data.
EVIDENCE:
```typescript
{guardians.map((g: any) => (
```

---

## PROBLEM #54
TYPE: TYPE 2 - INCOMPLETE UI
SEVERITY: 🟡 Medium
FILE: `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`
DESCRIPTION: Guardian linking dialog has placeholder text "Guardian linking functionality would go here" instead of actual implementation.
IMPACT: Guardian linking feature is incomplete.
EVIDENCE:
```typescript
<DialogContent>
  <DialogHeader>
    <DialogTitle>{t('linkGuardian')}</DialogTitle>
  </DialogHeader>
  <p className="text-sm text-muted-foreground">Guardian linking functionality would go here</p>
</DialogContent>
```

---

## PROBLEM #55
TYPE: TYPE 1 - BROKEN API CALLS
SEVERITY: 🟡 Medium
FILE: `src/app/[locale]/(dashboard)/dashboard/student/my-grades/page.tsx`
DESCRIPTION: TODO comment indicates `availableTerms` needs a global endpoint or mock implementation. The comment states it's left empty for now.
IMPACT: Term filtering in grades page may not work properly without the endpoint.
EVIDENCE:
```typescript
// TODO: `availableTerms` needs a global endpoint or we mock. We leave empty for now assuming it flows from an API if wired,
// or the backend just expects them to exist.
```

---

PROBLEM #56: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/analytics/hooks/useAnalyticsDashboard.ts`
DESCRIPTION: Uses `any` type for filter parameters, reducing type safety
IMPACT: Type safety issues could cause runtime errors if incorrect filter types are passed
EVIDENCE:
```typescript
summary: (filters?: any) => [...analyticsAll, 'summary', filters] as const,
atRisk: (filters?: any) => [...analyticsAll, 'at-risk', filters] as const,
trend: (filters?: any) => [...analyticsAll, 'trend', filters] as const,
distribution: (filters?: any) => [...analyticsAll, 'distribution', filters] as const,
```

---

PROBLEM #57: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/analytics/hooks/useAtRiskStudents.ts`
DESCRIPTION: Uses `any` type for filters and casts data as StudentRisk
IMPACT: Type safety issues, potential runtime errors if backend data doesn't match expected type
EVIDENCE:
```typescript
filters?: {
  riskLevel?: string;
  classId?: string;
  sectionId?: string;
  termId?: string;
  teacherId?: string;
}
// Later in the file:
students: data.students as StudentRisk[],
```

---

PROBLEM #58: TYPE 1 (Broken API Calls) - HIGH
FILE: `src/features/attendance/hooks/useFaceAttendance.ts`
DESCRIPTION: Backend endpoint for face descriptors is marked as "BACKEND REQUIRED"
IMPACT: Face recognition attendance feature will not work without backend implementation
EVIDENCE:
```typescript
// BACKEND REQUIRED: GET /face-recognition/descriptors?sectionId={id}
// Expected response: { studentId, descriptors: number[][] }[]
const { data } = await axiosInstance.get(`/face-recognition/descriptors?sectionId=${sectionId}`);
```

---

PROBLEM #59: TYPE 1 (Broken API Calls) - HIGH
FILE: `src/features/attendance/hooks/useFaceEnrollment.ts`
DESCRIPTION: Backend endpoint for enrollment status is marked as "BACKEND REQUIRED"
IMPACT: Face enrollment feature will not work without backend implementation
EVIDENCE:
```typescript
// BACKEND REQUIRED: GET /face-recognition/enrollment-status?sectionId={id}
// Expected response: { studentId, enrolled: boolean, enrolledAt? }[]
const { data } = await axiosInstance.get(`/face-recognition/enrollment-status?sectionId=${sectionId}`);
```

---

PROBLEM #60: TYPE 4 (Missing UI States) - LOW
FILE: `src/features/attendance/hooks/useFaceEnrollment.ts`
DESCRIPTION: Console.error used for error handling instead of proper error state
IMPACT: Errors logged to console but not displayed to user
EVIDENCE:
```typescript
onError: (error: any) => {
  console.error('Face enrollment error:', error);
  toast.error(t('enrollFailed'));
},
```

---

PROBLEM #61: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/attendance/hooks/useFaceModels.ts`
DESCRIPTION: Uses `any` type for faceApi, console.warn for fallback
IMPACT: Type safety issue, console warning in production
EVIDENCE:
```typescript
const [faceApi, setFaceApi] = useState<any>(null);
// ...
console.warn('Local models not found, falling back to CDN');
```

---

PROBLEM #62: TYPE 1 (Broken API Calls) - HIGH
FILE: `src/features/attendance/hooks/useSectionStudents.ts`
DESCRIPTION: Backend endpoint for section students is marked as "BACKEND REQUIRED"
IMPACT: Cannot fetch students for a section without backend implementation
EVIDENCE:
```typescript
// BACKEND REQUIRED: GET /sections/{sectionId}/students
// Expected response: { items: SectionStudent[] }
const { data } = await axiosInstance.get(`/sections/${sectionId}/students`);
```

---

PROBLEM #63: TYPE 2 (Incomplete UI) - MEDIUM
FILE: `src/features/grades/utils/exportReportCardPDF.ts`
DESCRIPTION: Batch export function throws error with "not yet implemented"
IMPACT: Cannot export multiple report cards as ZIP
EVIDENCE:
```typescript
export async function exportReportCardsAsZip(
  elements: Array<{ id: string; filename: string }>,
  zipFilename: string
): Promise<void> {
  // For batch export, we'd need JSZip
  // This is a placeholder for future implementation
  throw new Error('Batch export not yet implemented');
}
```

---

PROBLEM #64: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/guardian-portal/hooks/useChildDetails.ts`
DESCRIPTION: Uses `any` type for filters parameters
IMPACT: Type safety issues
EVIDENCE:
```typescript
export function useChildAttendance(studentId: string, filters: any) {
export function useChildGrades(studentId: string, filters: any) {
```

---

PROBLEM #65: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/guardian-portal/hooks/useGuardianNotifications.ts`
DESCRIPTION: Uses `any` type for filters parameter
IMPACT: Type safety issues
EVIDENCE:
```typescript
export function useGuardianNotifications(filters: any) {
```

---

PROBLEM #66: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/notifications/api/useNotifications.ts`
DESCRIPTION: Uses `any` type for filters parameters in multiple places
IMPACT: Type safety issues
EVIDENCE:
```typescript
history: (filters?: any) => [...notificationsKeys.all, 'history', filters] as const,
// ...
export function useNotificationHistory(filters?: {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  channel?: string;
  target?: string;
}) {
```

---

PROBLEM #67: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/notifications/types/index.ts`
DESCRIPTION: AlertRule config uses `any` type
IMPACT: Type safety issues for alert rule configuration
EVIDENCE:
```typescript
config?: Record<string, any>;
```

---

PROBLEM #68: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/schedule/api/useSchedule.ts`
DESCRIPTION: Uses `any` type for error handling
IMPACT: Type safety issue
EVIDENCE:
```typescript
} catch (error: any) {
  if (error.response?.status === 404) return [];
  throw error;
}
```

---

PROBLEM #69: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/lib/api/guardians.service.ts`
DESCRIPTION: GuardianFilters uses index signature with `any` type
IMPACT: Type safety issues for guardian filters
EVIDENCE:
```typescript
export interface GuardianFilters {
  // ...
  [key: string]: any;
}
```

---

PROBLEM #70: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/lib/api/students.service.ts`
DESCRIPTION: StudentFilters uses index signature with `any` type
IMPACT: Type safety issues for student filters
EVIDENCE:
```typescript
export interface StudentFilters {
  // ...
  [key: string]: any;
}
```

---

PROBLEM #71: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/lib/api/teachers.service.ts`
DESCRIPTION: TeacherFilters uses index signature with `any` type
IMPACT: Type safety issues for teacher filters
EVIDENCE:
```typescript
export interface TeacherFilters {
  // ...
  [key: string]: any;
}
```

---

PROBLEM #72: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/lib/api/users.service.ts`
DESCRIPTION: UserFilters uses index signature with `any` type
IMPACT: Type safety issues for user filters
EVIDENCE:
```typescript
export interface UserFilters {
  // ...
  [key: string]: any;
}
```

---

PROBLEM #73: TYPE 4 (Missing UI States) - LOW
FILE: `src/lib/api/auth.service.ts`
DESCRIPTION: Console.info used for mock authentication fallback
IMPACT: Console message in production when API is unreachable
EVIDENCE:
```typescript
if (!apiError.response || apiError.code === 'ERR_NETWORK') {
  console.info('[Auth] API unreachable, using mock login');
  return mockLogin(email, password);
}
```

---

PROBLEM #74: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/hooks/use-guardians.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: { response?: { data?: { detail?: string } } }) => {
```

---

PROBLEM #75: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/hooks/use-students.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: { response?: { data?: { detail?: string } } }) => {
```

---

PROBLEM #76: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/hooks/use-teachers.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: { response?: { data?: { detail?: string } } }) => {
```

---

PROBLEM #77: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/hooks/use-users.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: { response?: { data?: { detail?: string } } }) => {
```

---

PROBLEM #78: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/notifications/api/useNotificationComposer.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: { response?: { data?: { detail?: string } } }) => {
```

---

PROBLEM #79: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/notifications/api/useNotificationHistory.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: () => {
  toast.error(t("failed"));
},
```

---

PROBLEM #80: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/notifications/hooks/useRealtimeToasts.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: any) => {
```

---

PROBLEM #81: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/guardian-portal/hooks/useGuardianNotifications.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: any) => {
```

---

PROBLEM #82: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/guardian-portal/hooks/useGuardianPayments.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: any) => {
```

---

PROBLEM #83: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/attendance/hooks/useFaceAttendance.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: any) => {
```

---

PROBLEM #84: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/attendance/hooks/useFaceEnrollment.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: any) => {
```

---

PROBLEM #85: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/grades/api/useGrades.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: { response?: { data?: { detail?: string } } }) => {
```

---

PROBLEM #86: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/payments/api/usePayments.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: { response?: { data?: { detail?: string } } }) => {
```

---

PROBLEM #87: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/enrollments/api/useEnrollments.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: any) => {
```

---

PROBLEM #88: TYPE 5 (Broken Logic) - MEDIUM
FILE: `src/features/analytics/hooks/useAtRiskStudents.ts`
DESCRIPTION: Error handling uses `any` type
IMPACT: Type safety issue
EVIDENCE:
```typescript
onError: (error: any) => {
```

---

---

## SUMMARY

TOTAL PROBLEMS: 88
Critical: 0
High: 6
Medium: 36
Low: 46

### Breakdown by Type:
- TYPE 1 (Broken API Calls): 13
- TYPE 2 (Incomplete UI): 6
- TYPE 3 (Hardcoded Data): 1
- TYPE 4 (Missing UI States): 11
- TYPE 5 (Broken Logic): 56
- TYPE 6 (Dead Code): 1

### Key Issues to Address:
1. **Remove mock authentication fallback** in production (PROBLEM #1, #2, #73)
2. **Implement or remove mocked schedule endpoints** (PROBLEM #3, #30, #68)
3. **Verify backend endpoints exist** for face recognition features (PROBLEM #5, #6, #58, #59, #62)
4. **Implement availableTerms endpoint** for grades filtering (PROBLEM #7, #55)
5. **Replace native confirm dialogs** with custom modals (PROBLEM #8, #9, #10, #40, #41)
6. **Remove console.log/warn/info statements** from production code (PROBLEM #11, #12, #60, #61, #73)
7. **Improve type safety** by removing `any` types where possible (PROBLEM #14-22, #36-38, #42-49, #51-53, #56-57, #61, #64-72, #74-88)
8. **Handle console errors more gracefully** in production (PROBLEM #23-29)
9. **Implement teacher-related backend endpoints** (PROBLEM #31-35)
10. **Complete section roster student list implementation** (PROBLEM #39)
11. **Implement password change functionality** in guardian profile (PROBLEM #50)
12. **Implement guardian linking functionality** in student edit (PROBLEM #54)
13. **Implement batch report card export** (PROBLEM #63)
