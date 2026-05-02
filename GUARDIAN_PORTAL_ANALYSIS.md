# Guardian Portal Module Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/guardian/page.tsx
- src/app/[locale]/(dashboard)/dashboard/guardian/GuardianPageClient.tsx
- src/features/guardian-portal/components/GuardianDashboardHome.tsx
- src/features/guardian-portal/components/ChildSummaryCard.tsx
- src/features/guardian-portal/components/GuardianAlertBanner.tsx
- src/features/guardian-portal/hooks/useGuardianDashboard.ts
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays a welcome dashboard for guardians with personalized greeting and current date. Shows alert banners for children with low attendance (<75%) or unpaid fees. Displays grid of child summary cards showing child photo, name, class, section, student ID, attendance rate with progress bar, grade average with progress bar, and fee status badge (paid/partial/unpaid). Each card has "View Details" and "Pay Fees" buttons. Shows recent alerts sidebar with alert type, message, student name, and date.

UI COMPONENTS:
- GuardianDashboardHome - Main dashboard with header, alerts, children grid, recent alerts
- ChildSummaryCard - Child card with photo, stats, and action buttons
- GuardianAlertBanner - Alert banners for low attendance and unpaid fees
- Card - Container for dashboard sections
- Avatar - Child photo with fallback
- Progress - Attendance and grade progress bars
- Badge - Fee status indicator
- Button - Action buttons

API CALLS:
- Method: GET
- URL: /api/guardians/{guardianId}/dashboard
- Sends: none
- Expects: GuardianDashboardData object (children: ChildSummary[], recentAlerts: GuardianAlert[])
- File: src/features/guardian-portal/hooks/useGuardianDashboard.ts (line 14)

FORM FIELDS (if form exists):
None

CRUD STATUS:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Dashboard UI is fully implemented with all components. Backend endpoint required for dashboard data. Alert thresholds hardcoded (attendance <75%, fee status unpaid).

EVIDENCE:
From src/features/guardian-portal/hooks/useGuardianDashboard.ts lines 7-21 shows dashboard query:
```typescript
export function useGuardianDashboard() {
  const { user, isHydrated } = useAuthStore();
  const guardianId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.guardianPortal.dashboard(guardianId),
    queryFn: async () => {
      const { data } = await api.get<GuardianDashboardData>(
        `/api/guardians/${guardianId}/dashboard`
      );
      return data;
    },
    enabled: isHydrated && !!guardianId,
  });
}
```

From src/features/guardian-portal/components/GuardianAlertBanner.tsx lines 16-18 shows alert thresholds:
```typescript
const lowAttendance = children.filter((c) => c.attendanceRate < 75);
const unpaidFees = children.filter((c) => c.feeStatus === "unpaid");
```

PROBLEMS FOUND:
1. Backend endpoint /api/guardians/{guardianId}/dashboard not implemented
2. Alert thresholds hardcoded (attendance <75%, fee status unpaid)
3. No refresh functionality for dashboard data
4. Recent alerts section has no pagination
5. No navigation to detailed views from alerts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Children (Child Detail)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/guardian/children/[studentId]/page.tsx
- src/features/guardian-portal/components/ChildDetailTabs.tsx
- src/features/guardian-portal/hooks/useChildDetails.ts
- src/features/guardian-portal/hooks/useMyChildren.ts
- src/features/guardian-portal/components/GuardianAttendanceView.tsx
- src/features/guardian-portal/components/GuardianGradesView.tsx
- src/features/guardian-portal/components/GuardianFeesView.tsx
- src/features/guardian-portal/components/GuardianScheduleView.tsx
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays detailed view of a specific child with IDOR security check (verifies guardian owns the child before fetching data). Shows tabbed interface with Overview, Attendance, Grades, Fees, and Schedule tabs. Overview tab shows child photo, name, student ID, class, section, academic year, enrollment date, attendance rate with progress bar and warning if below 75%, grade average with progress bar. Other tabs show child-specific data for attendance records, grades, fee balance, and schedule.

UI COMPONENTS:
- ChildDetailTabs - Tabbed interface with 5 tabs (Overview, Attendance, Grades, Fees, Schedule)
- GuardianAttendanceView - Attendance records table
- GuardianGradesView - Grades table
- GuardianFeesView - Fee balance and payment history
- GuardianScheduleView - Weekly timetable
- Card - Container for sections
- Tabs - Tab navigation
- Progress - Attendance and grade progress bars
- Avatar - Child photo with fallback

API CALLS:
- Method: GET
- URL: /api/guardians/{guardianId}/students
- Sends: none
- Expects: ChildSummary[] array
- File: src/features/guardian-portal/hooks/useMyChildren.ts (line 14)

- Method: GET
- URL: /api/students/{studentId}/guardian-view
- Sends: none
- Expects: ChildDetails object (extends ChildSummary with guardianOwned, enrollmentDate, academicYear)
- File: src/features/guardian-portal/hooks/useChildDetails.ts (line 14)

- Method: GET
- URL: /api/students/{studentId}/attendance/records
- Sends: { page, size }
- Expects: PaginatedResponse<AttendanceRecord> object
- File: src/features/guardian-portal/hooks/useChildDetails.ts (line 29)

- Method: GET
- URL: /api/students/{studentId}/grades
- Sends: { term }
- Expects: Grades data object
- File: src/features/guardian-portal/hooks/useChildDetails.ts (line 45)

- Method: GET
- URL: /api/students/{studentId}/schedule
- Sends: none
- Expects: Schedule data object
- File: src/features/guardian-portal/hooks/useChildDetails.ts (line 61)

FORM FIELDS (if form exists):
None

CRUD STATUS:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ⚠️ UI only (attendance page state not wired to API)
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Child detail view is fully implemented with IDOR security check and tabbed interface. Backend endpoints required for all child data. Attendance pagination exists in UI but not wired to API. No edit capability for any data.

EVIDENCE:
From src/app/[locale]/(dashboard)/dashboard/guardian/children/[studentId]/page.tsx lines 20-31 shows IDOR security check:
```typescript
// CRITICAL IDOR SECURITY CHECK (Check Group 10.1)
const { user, isHydrated } = useAuthStore();
const guardianId = user?.id ?? '';

// 1. Fetch guardian's linked children
const { data: children, isLoading: isLoadingChildren } = useMyChildren();

// 2. Verify studentId from URL is in guardian's children list
const isAuthorized = children?.some(child => child.id === studentId);

// 3. Only fetch child data if authorized
const { data: child, isLoading: isLoadingChild, isError } = useChildDetails(studentId);
```

From src/features/guardian-portal/components/ChildDetailTabs.tsx lines 104-109 shows attendance warning:
```typescript
{child.attendanceRate < 75 && (
  <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md border border-red-100">
    <AlertCircle className="h-4 w-4" />
    <span className="text-[10px] font-bold">{t("overviewTab.belowMinimum")}</span>
  </div>
)}
```

PROBLEMS FOUND:
1. Backend endpoint /api/guardians/{guardianId}/students not implemented
2. Backend endpoint /api/students/{studentId}/guardian-view not implemented
3. Backend endpoint /api/students/{studentId}/attendance/records not implemented
4. Backend endpoint /api/students/{studentId}/grades not implemented
5. Backend endpoint /api/students/{studentId}/schedule not implemented
6. Attendance threshold hardcoded to 75 (line 104 in ChildDetailTabs.tsx)
7. Grade passing threshold hardcoded to 50% (line 63 in GuardianGradesView.tsx)
8. Attendance pagination not wired to API (page state in GuardianAttendanceView.tsx line 21)
9. No edit capability for any child data
10. No search or filter functionality

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Attendance (Child Detail Tab)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/features/guardian-portal/components/GuardianAttendanceView.tsx
- src/features/guardian-portal/hooks/useChildDetails.ts
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays attendance records for a specific child in a table format. Shows date, status badge (present/absent/late/excused with color coding), subject/class, and remarks. Uses pagination with page state. Color-coded status badges: green for present, red for absent, yellow for late, blue for excused.

UI COMPONENTS:
- GuardianAttendanceView - Attendance records table
- Table - Records display
- Badge - Status indicator with color coding
- Skeleton - Loading state

API CALLS:
- Method: GET
- URL: /api/students/{studentId}/attendance/records
- Sends: { page, size }
- Expects: PaginatedResponse<AttendanceRecord> object (items, total, page, size, pages)
- File: src/features/guardian-portal/hooks/useChildDetails.ts (line 29)

FORM FIELDS (if form exists):
None

CRUD STATUS:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ⚠️ UI only (page state not sent to API)
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Attendance view is fully implemented with table and status badges. Backend endpoint required for attendance records. Pagination state exists but not wired to API. No filter by date range or status.

EVIDENCE:
From src/features/guardian-portal/components/GuardianAttendanceView.tsx lines 21-22 shows pagination state:
```typescript
const [page, setPage] = useState(1);
const { data, isLoading } = useChildAttendance(studentId, { page, size: 10 });
```

From src/features/guardian-portal/components/GuardianAttendanceView.tsx lines 28-36 shows status color coding:
```typescript
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "present": return "bg-green-100 text-green-700 border-green-200";
    case "absent": return "bg-red-100 text-red-700 border-red-200";
    case "late": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "excused": return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "";
  }
};
```

PROBLEMS FOUND:
1. Backend endpoint /api/students/{studentId}/attendance/records not implemented
2. Pagination state not wired to API (no pagination UI controls)
3. No date range filter
4. No status filter
5. No search functionality
6. No sort functionality
7. No export functionality

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Grades (Child Detail Tab)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/features/guardian-portal/components/GuardianGradesView.tsx
- src/features/guardian-portal/hooks/useChildDetails.ts
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays academic performance for a specific child in a table format. Shows subject, assessment name, score with color coding (green if >=50%, red if <50%), total marks, and remarks. Filters by term (hardcoded to "current"). Score cells show color-coded background based on pass/fail threshold.

UI COMPONENTS:
- GuardianGradesView - Grades table
- Table - Grades display
- Skeleton - Loading state

API CALLS:
- Method: GET
- URL: /api/students/{studentId}/grades
- Sends: { term }
- Expects: Grades data object (items array)
- File: src/features/guardian-portal/hooks/useChildDetails.ts (line 45)

FORM FIELDS (if form exists):
None

CRUD STATUS:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ⚠️ UI only (term hardcoded to "current")
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Grades view is fully implemented with table and pass/fail color coding. Backend endpoint required for grades data. Term filter hardcoded to "current". No pagination, no other filters.

EVIDENCE:
From src/features/guardian-portal/components/GuardianGradesView.tsx line 18 shows hardcoded term filter:
```typescript
const { data, isLoading } = useChildGrades(studentId, { term: "current" });
```

From src/features/guardian-portal/components/GuardianGradesView.tsx lines 61-66 shows pass/fail color coding:
```typescript
<span className={cn(
  "px-2 py-0.5 rounded",
  (grade.score / grade.totalMarks) >= 0.5 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
)}>
  {grade.score}
</span>
```

PROBLEMS FOUND:
1. Backend endpoint /api/students/{studentId}/grades not implemented
2. Term filter hardcoded to "current" (no UI control)
3. Passing threshold hardcoded to 50% (line 63)
4. No pagination
5. No subject filter
6. No search functionality
7. No sort functionality
8. No export functionality
9. No report card view

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Schedule (Child Detail Tab)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/features/guardian-portal/components/GuardianScheduleView.tsx
- src/features/guardian-portal/hooks/useChildDetails.ts
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays child's weekly timetable in a grid format showing periods (rows) and days (columns). Each cell shows time, subject name, teacher name, and room. Shows empty cells for free periods. Assumes Monday-Friday schedule. No current day or current period highlighting (unlike student schedule view). Read-only view.

UI COMPONENTS:
- GuardianScheduleView - Weekly timetable grid
- Card - Container for timetable
- Table - Grid layout for schedule
- Skeleton - Loading state

API CALLS:
- Method: GET
- URL: /api/students/{studentId}/schedule
- Sends: none
- Expects: Schedule data object (array of schedule entries)
- File: src/features/guardian-portal/hooks/useChildDetails.ts (line 61)

FORM FIELDS (if form exists):
None

CRUD STATUS:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Weekly timetable view is fully implemented with grid layout. Backend endpoint required for schedule data. No current day highlighting, no current period highlighting. No print/export functionality. No week navigation.

EVIDENCE:
From src/features/guardian-portal/components/GuardianScheduleView.tsx lines 14-15 shows Monday-Friday assumption:
```typescript
const DAYS = [1, 2, 3, 4, 5]; // Mon-Fri
```

From src/features/guardian-portal/components/GuardianScheduleView.tsx lines 78-90 shows schedule cell rendering:
```typescript
<td key={`${day}-${period}`} className={cn("border-r border-b p-3 align-top min-h-[80px] transition-colors hover:bg-primary/[0.02]", !entry && "bg-muted/[0.05]")}>
  {entry ? (
    <div className="space-y-1.5">
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-tighter">
        {entry.startTime} - {entry.endTime}
      </span>
      <p className="font-bold text-xs text-foreground leading-tight">{entry.subjectName}</p>
      <p className="text-[10px] text-muted-foreground italic">Teacher: {entry.teacherName || "Unassigned"}</p>
      {entry.room && (
        <p className="text-[9px] bg-primary/5 text-primary-foreground/70 px-1.5 py-0.5 rounded-sm w-fit">
          RM: {entry.room}
        </p>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-[40px]">
      <span className="text-muted-foreground/10 font-bold text-lg select-none">-</span>
    </div>
  )}
</td>
```

PROBLEMS FOUND:
1. Backend endpoint /api/students/{studentId}/schedule not implemented
2. No current day highlighting
3. No current period highlighting
4. No print functionality
5. No export functionality (PDF, image)
6. No filter by term or academic year
7. No week navigation (previous/next week)
8. Assumes Monday-Friday schedule (no weekend support)
9. No teacher name fallback when unassigned (shows "Unassigned" string)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Notifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/guardian/notifications/page.tsx
- src/features/guardian-portal/components/GuardianNotificationList.tsx
- src/features/guardian-portal/hooks/useGuardianNotifications.ts
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays notifications for guardian with tabbed filter by type (all, attendance, grade, fee, general). Shows notification list with icon, type label, unread badge, timestamp, title, message, and student name. Unread notifications have blue left border and background. Clicking unread notification marks as read. "Mark all read" button to mark all notifications as read. Color-coded icons by type (red=attendance, blue=grade, orange=fee, primary=general).

UI COMPONENTS:
- GuardianNotificationList - Notification list with filters
- Tabs - Type filter tabs
- Card - Container for notifications
- Badge - Unread indicator
- Button - Mark all read action
- Skeleton - Loading state

API CALLS:
- Method: GET
- URL: /api/guardians/{guardianId}/notifications
- Sends: { type }
- Expects: PaginatedResponse<GuardianNotification> object (items, total, page, size, pages)
- File: src/features/guardian-portal/hooks/useGuardianNotifications.ts (line 16)

- Method: PATCH
- URL: /api/notifications/{notificationId}/read
- Sends: none
- Expects: Success confirmation
- File: src/features/guardian-portal/hooks/useGuardianNotifications.ts (line 33)

- Method: PATCH
- URL: /api/guardians/{guardianId}/notifications/read-all
- Sends: none
- Expects: Success confirmation
- File: src/features/guardian-portal/hooks/useGuardianNotifications.ts (line 54)

FORM FIELDS (if form exists):
None

CRUD STATUS:
Notifications:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ✅ Full (mark as read, mark all read)
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ✅ Wired to API (type)
- Pagination: ❌ Missing (API returns paginated but UI has no pagination controls)
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Notifications view is fully implemented with type filters and mark as read functionality. Backend endpoints required for notifications. Mark as read and mark all read mutations implemented. No pagination UI despite API returning paginated data. No delete functionality.

EVIDENCE:
From src/features/guardian-portal/hooks/useGuardianNotifications.ts lines 9-24 shows notifications query:
```typescript
export function useGuardianNotifications(filters: any) {
  const { user, isHydrated } = useAuthStore();
  const guardianId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.guardianPortal.notifications(guardianId, filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<GuardianNotification>>(
        `/api/guardians/${guardianId}/notifications`,
        { params: filters }
      );
      return data;
    },
    enabled: isHydrated && !!guardianId,
  });
}
```

From src/features/guardian-portal/hooks/useGuardianNotifications.ts lines 26-45 shows mark as read mutation:
```typescript
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const guardianId = user?.id ?? '';

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guardianPortal.notifications(guardianId, {}),
      });
      toast.success('Notification marked as read');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to mark notification as read');
    },
  });
}
```

PROBLEMS FOUND:
1. Backend endpoint /api/guardians/{guardianId}/notifications not implemented
2. Backend endpoint /api/notifications/{notificationId}/read not implemented
3. Backend endpoint /api/guardians/{guardianId}/notifications/read-all not implemented
4. No pagination UI controls (API returns paginated data)
5. No search functionality
6. No sort functionality
7. No delete functionality for notifications
8. No filter by date range
9. No filter by read/unread status
10. "Mark all read" button disabled when all are read (line 68) but logic may be incorrect

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Payments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/guardian/payments/page.tsx
- src/features/guardian-portal/components/GuardianPaymentsPage.tsx
- src/features/guardian-portal/components/GuardianFeesView.tsx
- src/features/guardian-portal/hooks/useGuardianPayments.ts
- src/features/guardian-portal/hooks/useMyChildren.ts
- src/features/payments/components/ChapaPaymentModal.tsx
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays fee management page with child selector dropdown (if multiple children). Shows three summary cards: total fees, amount paid, outstanding balance with due date. Shows fee breakdown table with type, total amount, paid amount, remaining balance, and action button (pay or paid badge). Shows payment history table with date, amount, method, status badge, and download receipt button. Opens Chapa payment modal for fee payment. Refreshes data after successful payment.

UI COMPONENTS:
- GuardianPaymentsPage - Main payments page with child selector
- GuardianFeesView - Fee balance and payment history
- ChapaPaymentModal - Payment modal for Chapa integration
- Card - Container for sections
- Table - Fee breakdown and payment history
- Select - Child selector
- Button - Pay and download receipt actions
- Badge - Status indicators

API CALLS:
- Method: GET
- URL: /api/students/{studentId}/fees/balance
- Sends: none
- Expects: ChildFeeBalance object (studentId, total, paid, outstanding, dueDate, breakdown: FeeBreakdown[])
- File: src/features/guardian-portal/hooks/useGuardianPayments.ts (line 14)

- Method: GET
- URL: /api/students/{studentId}/payments
- Sends: none
- Expects: PaymentRecord[] array (id, date, amount, method, status, receiptUrl, reference)
- File: src/features/guardian-portal/hooks/useGuardianPayments.ts (line 29)

- Method: POST
- URL: /api/payments/initiate
- Sends: { studentId, amount, method }
- Expects: Payment initiation response
- File: src/features/guardian-portal/hooks/useGuardianPayments.ts (line 43)

FORM FIELDS (if form exists):
None (payment handled by ChapaPaymentModal)

CRUD STATUS:
Fees:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

Payments:
- CREATE: ✅ Full (via ChapaPaymentModal)
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ⚠️ UI only (child selector)
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Payments view is fully implemented with fee balance, breakdown, payment history, and Chapa payment integration. Backend endpoints required for fee balance and payment history. Child selector for multiple children. ChapaPaymentModal handles payment initiation. No pagination for payment history. No export functionality.

EVIDENCE:
From src/features/guardian-portal/hooks/useGuardianPayments.ts lines 8-36 shows fee balance and payment history queries:
```typescript
export function useFeeBalance(studentId: string) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.fees(studentId),
    queryFn: async () => {
      const { data } = await api.get<ChildFeeBalance>(
        `/api/students/${studentId}/fees/balance`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function usePaymentHistory(studentId: string) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.payments(studentId),
    queryFn: async () => {
      const { data } = await api.get<PaymentRecord[]>(
        `/api/students/${studentId}/payments`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
```

From src/features/guardian-portal/components/GuardianFeesView.tsx lines 43-61 shows student adapter for ChapaPaymentModal:
```typescript
const studentAdapter = {
  id: studentId,
  name: "Child Name", // In a real app, this would come from a student query or parent prop
  registration_number: studentId,
  class_name: "",
  section_name: "",
  total_balance: balance?.outstanding || 0,
  fees: (balance?.breakdown || []).map(f => ({
    id: f.id,
    fee_type: f.type,
    amount: f.amount,
    paid: f.paid,
    balance: f.balance,
    due_date: f.dueDate,
    status: (f.balance === 0 ? 'paid' : f.balance < f.amount ? 'partial' : 'unpaid') as any
  }))
};
```

PROBLEMS FOUND:
1. Backend endpoint /api/students/{studentId}/fees/balance not implemented
2. Backend endpoint /api/students/{studentId}/payments not implemented
3. Backend endpoint /api/payments/initiate not implemented
4. Student adapter has hardcoded "Child Name" (line 47)
5. No pagination for payment history
6. No date range filter for payment history
7. No search functionality
8. No sort functionality
9. No export functionality for payment history
10. ChapaPaymentModal not reviewed in detail
11. Due date formatting may not handle all date formats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardian Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/guardian/profile/page.tsx
- src/features/guardian-portal/hooks/useMyChildren.ts
- src/features/guardian-portal/types.ts

WHAT IT DOES:
Displays guardian profile information in read-only format. Shows personal info card with avatar, full name, verified account badge, email (read-only), phone (read-only). Shows linked children card with list of children as clickable links to child detail pages. Shows change password form with current password, new password, and confirm password fields (UI only, no functionality). Security note card with informational text.

UI COMPONENTS:
- GuardianProfilePage - Main profile page with sections
- Card - Container for profile sections
- Avatar - Guardian photo with fallback
- Input - Read-only email and phone, password fields
- Button - Update password button (non-functional)
- Badge - Verified account indicator
- Link - Child navigation links
- Skeleton - Loading state

API CALLS:
- Method: GET
- URL: /api/guardians/{guardianId}/students
- Sends: none
- Expects: ChildSummary[] array
- File: src/features/guardian-portal/hooks/useMyChildren.ts (line 14)

FORM FIELDS (if form exists):
Change Password Form (UI only, no functionality):
- currentPassword: string, required
- newPassword: string, required
- confirmPassword: string, required

CRUD STATUS:
Profile Data:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ❌ Missing (UI exists but not functional)
- DELETE: ❌ Not applicable

Password:
- UPDATE: ❌ Missing (UI exists but not functional)

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Profile view is partially implemented with read-only display and linked children. Change password form exists but has no functionality (no API call, no validation). Personal information fields are read-only with no edit capability. Backend endpoint required for linked children.

EVIDENCE:
From src/app/[locale]/(dashboard)/dashboard/guardian/profile/page.tsx lines 140-159 shows change password form (non-functional):
```typescript
<Card className="shadow-sm">
  <CardHeader className="border-b bg-muted/10">
    <CardTitle className="text-lg flex items-center gap-2">
      <Lock className="h-5 w-5 text-primary" />
      {t("changePassword")}
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-6 space-y-4">
    <div className="space-y-1.5">
      <Label htmlFor="current" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {t("currentPassword")}
      </Label>
      <Input id="current" type="password" />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="new" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {t("newPassword")}
      </Label>
      <Input id="new" type="password" />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {t("confirmPassword")}
      </Label>
      <Input id="confirm" type="password" />
    </div>
    <Button className="w-full mt-2 font-bold shadow-sm">{t("updatePassword")}</Button>
  </CardContent>
</Card>
```

From src/app/[locale]/(dashboard)/dashboard/guardian/profile/page.tsx lines 64-67 shows read-only email input:
```typescript
<Input id="email" value={user.email} readOnly className="pl-10 bg-muted/50 cursor-not-allowed" />
```

PROBLEMS FOUND:
1. Backend endpoint /api/guardians/{guardianId}/students not implemented
2. Change password form has no functionality (no onSubmit handler, no API call)
3. No validation for password fields
4. No error handling for password change
5. Personal information fields are read-only with no edit capability
6. No photo upload functionality
7. No email verification for password change
8. No password strength indicator
9. Profile data comes from auth store (user object) not from profile API
10. No way to update personal information (name, phone, email)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This analysis covers 8 guardian portal features. Below is a summary of implementation status across all features:

FULLY IMPLEMENTED:
- None

PARTIALLY IMPLEMENTED:
- Guardian Dashboard - Backend endpoint required
- Guardian Children (Child Detail) - Backend endpoints required, IDOR security implemented
- Guardian Attendance - Backend endpoint required, pagination not wired
- Guardian Grades - Backend endpoint required, filters hardcoded
- Guardian Schedule - Backend endpoint required, no current day highlighting
- Guardian Notifications - Backend endpoints required, mark as read implemented
- Guardian Payments - Backend endpoints required, Chapa integration
- Guardian Profile - Backend endpoint required, change password non-functional

COMMON ISSUES ACROSS FEATURES:
1. All backend endpoints not implemented (marked as API required)
2. No search functionality in any feature
3. No sort functionality in any feature
4. Missing export functionality (Attendance, Grades, Schedule, Payments)
5. Hardcoded thresholds (attendance 75%, passing grade 50%)
6. Read-only data in multiple features (Profile, Schedule)
7. Pagination UI missing in several features (Attendance, Grades, Notifications, Payments)
8. Filters hardcoded or not wired to API (Grades term filter)
9. Change password form exists but has no functionality
10. IDOR security check implemented in Child Detail (good practice)

TOTAL FEATURES ANALYZED: 8
FULLY IMPLEMENTED: 0 (0%)
PARTIALLY IMPLEMENTED: 8 (100%)
NOT IMPLEMENTED: 0 (0%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
