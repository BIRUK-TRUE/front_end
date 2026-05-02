# MASTER_ANALYSIS

## Section 1: Master Feature Status List

Sources synthesized in this section:
- `FINAL_SUMMARY.md`
- `ADMIN_PORTAL_ANALYSIS.md`
- `TEACHER_PORTAL_ANALYSIS.md`
- `STUDENT_PORTAL_ANALYSIS.md`
- `GUARDIAN_PORTAL_ANALYSIS.md`
- `REGISTRAR_PORTAL_ANALYSIS.md`
- `AUTHENTICATION_MODULE_ANALYSIS.md`

Conflict notation used below:
- `CONFLICT` means at least two source documents reported different implementation states for the same feature.

| # | Feature Name | Module/Portal | Status | What Works | What Is Missing | Priority |
|---|---|---|---|---|---|---|
| 1 | Login | Authentication | ⚠️ Partial | Login UI, validation, auth store persistence, role redirects, `/auth/login` call are documented. | `CONFLICT`: `AUTHENTICATION_MODULE_ANALYSIS.md` marks Login fully implemented, while `FINAL_SUMMARY.md` marks it partial because of mock fallback and unverified backend. Mock auth fallback and multi-role redirect limitation remain documented issues. | 🔴 Critical |
| 2 | Password Reset | Authentication | ⚠️ Partial | Forgot-password UI and reset-password UI both exist with validation and API calls. | `CONFLICT`: auth analysis marks forgot/reset flows fully implemented, while `FINAL_SUMMARY.md` marks Password Reset partial because backend endpoints are unverified. Reset page also allows empty token submission. | 🟠 High |
| 3 | Password Change | Authentication | ⚠️ Partial | Forced change-password flow is wired and updates `must_change_password`. | `CONFLICT`: `FINAL_SUMMARY.md` marks Password Change full, but auth-specific documents show one dashboard password page is mocked and the student portal password form has path/payload mismatch issues. | 🟡 Medium |
| 4 | User Management (CRUD) | Admin / Users | ✅ Full | Create, view, edit, delete, restore user accounts; filtering, pagination, and user detail flows are documented as working. | Generic CRUD is documented as working, but role editing is incomplete in the dedicated role flow. | 🟢 Low |
| 5 | Role Management | Admin / Users | ⚠️ Partial | Role display, role assignment UI, `/users/{id}/roles` service method, and role-aware forms exist. | `CONFLICT`: `FINAL_SUMMARY.md` marks Role Management full, but `ADMIN_PORTAL_ANALYSIS.md` documents the edit-page role mutation as not wired and missing a dedicated hook. | 🟠 High |
| 6 | Student Management (CRUD) | Admin / Students | ✅ Full | Create, read, update, delete, restore, two-step forms, detail tabs, and list filters are documented. | Photo upload payload and guardian selection payload gaps are still documented in the student forms. | 🟢 Low |
| 7 | Student Search/Filter | Admin / Students | ✅ Full | Search by name/registration and filters by status/sex are wired to API. | No additional missing behavior was documented for this sub-feature. | 🟢 Low |
| 8 | Student Profile | Admin / Students | ✅ Full | Student detail profile with tabs for enrollment, attendance, and grades is documented as implemented. | Photo upload is not actually sent to API according to the admin analysis. | 🟢 Low |
| 9 | Teacher Management (CRUD) | Admin / Teachers | ✅ Full | Create, read, update, delete, restore, filters, and teacher detail pages are documented. | Photo upload payload gap is still noted in the broader admin findings. | 🟢 Low |
| 10 | Teacher Search/Filter | Admin / Teachers | ✅ Full | Search by name/employee ID and status filtering are wired to API. | No additional missing behavior was documented for this sub-feature. | 🟢 Low |
| 11 | Guardian Management (CRUD) | Admin / Guardians | ✅ Full | Create, read, update, delete, restore, guardian detail pages, and student linking flows are largely documented. | Broader guardian-student linking gaps remain for student edit/create flows. | 🟢 Low |
| 12 | Guardian-Student Linking | Admin / Guardians | ⚠️ Partial | Link/unlink behavior and relationship handling are documented from guardian management. | `FINAL_SUMMARY.md` and `ADMIN_PORTAL_ANALYSIS.md` both document that guardian linking in student create/edit is incomplete or placeholder text. | 🟠 High |
| 13 | Academic Years (CRUD) | Admin / Academics | ⚠️ Partial | Create, read, and update are documented; year pages and APIs exist. | `CONFLICT`: `FINAL_SUMMARY.md` marks this full, but `ADMIN_PORTAL_ANALYSIS.md` documents missing delete functionality and a non-functional archive action. | 🟡 Medium |
| 14 | Terms (CRUD) | Admin / Academics | ✅ Full | List, create, edit, delete, and year-term management are documented as wired. | No missing core CRUD behavior was documented for Terms. | 🟢 Low |
| 15 | Classes (CRUD) | Admin / Academics | ⚠️ Partial | Create, read, update, class detail pages, sections tab, and subject assignment are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks Classes full, but `ADMIN_PORTAL_ANALYSIS.md` documents missing delete functionality and missing search/filter/pagination UI. | 🟡 Medium |
| 16 | Sections (CRUD) | Admin / Academics | ⚠️ Partial | Create, read, update, section modal, and section detail structure exist. | Both `FINAL_SUMMARY.md` and `ADMIN_PORTAL_ANALYSIS.md` document gaps: missing delete flow and section roster/student population issues. | 🔴 Critical |
| 17 | Subjects (CRUD) | Admin / Academics | ✅ Full | Subject list, search, category filter, create, edit, delete, and subject assignment APIs are documented. | Pagination UI is missing even though API supports paging. | 🟢 Low |
| 18 | Student Enrollment | Admin / Enrollments | ⚠️ Partial | Enrollment listing, transfer, withdrawal, and create-through-student flows are documented. | No general update flow, no delete flow, and section assignment/workflow completeness remain missing. | 🟠 High |
| 19 | Manual Attendance | Attendance | ❌ Missing | Manual attendance UI exists in teacher/admin flows. | `FINAL_SUMMARY.md` documents the feature as not implemented end to end because submission depends on backend endpoints marked `BACKEND REQUIRED`. | 🔴 Critical |
| 20 | Attendance Records View | Attendance | ✅ Full | Record/history views are documented for attendance consumers, with filters and tables present. | Some portal-specific records views still depend on missing backend endpoints. | 🟢 Low |
| 21 | Attendance Calendar | Student Portal | ⚠️ Partial | Calendar UI, day popovers, warning banner, and month navigation are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks this full, while `STUDENT_PORTAL_ANALYSIS.md` marks it partial because all backing endpoints are still required and thresholds are hardcoded. | 🟡 Medium |
| 22 | Face Recognition Attendance | Attendance | ❌ Missing | Face scan UI exists. | `FINAL_SUMMARY.md` documents backend endpoints as missing; admin attendance analysis also notes face flows were not fully reviewed and not completed end to end. | 🟠 High |
| 23 | Face Enrollment | Attendance | ❌ Missing | Face enrollment UI exists. | `FINAL_SUMMARY.md` documents backend endpoints as missing; admin attendance analysis also does not confirm an end-to-end implementation. | 🟠 High |
| 24 | Grade Entry | Teacher / Grades | ❌ Missing | Grade entry UI, assessment list UI, and bulk submission form exist. | `FINAL_SUMMARY.md` documents this as not implemented end to end because teacher assessment/grade endpoints are marked `BACKEND REQUIRED`. | 🔴 Critical |
| 25 | Grade Viewing (Student) | Student Portal | ⚠️ Partial | Student grade summary, assessment detail table, term/subject filters, and report-card display UI are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks Grade Viewing full, while `STUDENT_PORTAL_ANALYSIS.md` marks My Grades partial because all backend endpoints are required and available terms are still TODO. | 🟡 Medium |
| 26 | Report Card Generation | Student Portal / Grades | ⚠️ Partial | Printable report card UI and print CSS are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks report cards full, but it also notes batch export is not implemented, and student-grade analysis still depends on missing backend/report-card endpoints. | 🟡 Medium |
| 27 | Schedule Management | Admin / Schedule | ⚠️ Partial | Cascading selectors, timetable grid, create/edit/delete UI, and print action are documented. | `CONFLICT`: `ADMIN_PORTAL_ANALYSIS.md` marks this full, but `FINAL_SUMMARY.md` marks it partial because schedule endpoints are mocked/404-tolerant and backend behavior is uncertain. | 🟠 High |
| 28 | Schedule Viewing (Teacher) | Teacher Portal | ⚠️ Partial | Weekly timetable UI and current-day/current-class highlighting are documented. | Backend schedule endpoint is required; no export/print/week navigation is documented. | 🟠 High |
| 29 | Schedule Viewing (Student) | Student Portal | ⚠️ Partial | Weekly timetable UI with current-day/current-period highlighting is documented. | Backend schedule endpoint is required; no export/print/week navigation is documented. | 🟠 High |
| 30 | Notification Composer | Admin / Notifications | ✅ Full | Compose UI, audience selection, and send flow are documented. | Scheduling/template completeness is still called out as missing in admin notification findings. | 🟢 Low |
| 31 | Notification History | Admin / Notifications | ⚠️ Partial | History page and detail view exist. | `FINAL_SUMMARY.md` marks this full, but `ADMIN_PORTAL_ANALYSIS.md` documents missing pagination UI, no sort, and a broken compose link from history. | 🟡 Medium |
| 32 | Alert Rules | Admin / Notifications | ✅ Full | Create, edit, toggle, and delete alert rules are documented. | No additional core missing behavior was documented for alert rules. | 🟢 Low |
| 33 | Real-time Notifications | Notifications | ✅ Full | Realtime toast/listener behavior is documented in the final summary. | No conflicting missing implementation was explicitly documented in the listed source set. | 🟢 Low |
| 34 | Analytics Dashboard | Admin / Analytics | ⚠️ Partial | Dashboard UI, metrics, charts, and refresh actions are documented. | Backend endpoint verification is still incomplete and exports/drill-downs are missing. | 🟠 High |
| 35 | At-Risk Students | Analytics | ⚠️ Partial | At-risk views, guardian notification actions, and intervention creation are documented. | Backend/type support is still uncertain; edit/delete for interventions are missing. | 🟠 High |
| 36 | Attendance Trends | Analytics | ⚠️ Partial | Trend chart UI and hook are documented. | Backend endpoint remains unverified and date-range comparison features are missing. | 🟡 Medium |
| 37 | Grade Distribution | Analytics | ⚠️ Partial | Grade distribution chart UI and hook are documented. | Backend endpoint remains unverified and export/drill-down behavior is missing. | 🟡 Medium |
| 38 | Class Performance | Analytics | ⚠️ Partial | Class performance table UI and hook are documented. | Backend endpoint remains unverified and deeper comparison/drill-down behavior is missing. | 🟡 Medium |
| 39 | Fee Management | Payments | ❌ Missing | Type coverage and related payment hooks/components exist. | `FINAL_SUMMARY.md` documents no admin fee-creation/management UI. | 🔴 Critical |
| 40 | Payment Recording | Payments | ⚠️ Partial | Payment-related hooks exist. | Manual payment-entry UI is missing according to `FINAL_SUMMARY.md`. | 🟠 High |
| 41 | Chapa Payment Integration | Payments | ⚠️ Partial | Chapa payment modal/integration hooks exist and guardian payment flow references them. | UI integration is incomplete and backend initiation endpoints are still required. | 🟠 High |
| 42 | Payment History (Guardian) | Guardian Portal / Payments | ⚠️ Partial | Payment history table and fee breakdown UI are documented. | Final summary reports placeholder behavior; guardian analysis reports missing pagination and unresolved backend requirements. | 🟠 High |
| 43 | School Info Settings | Admin / Settings | ✅ Full | School info form with validation and GET/PATCH API wiring is documented. | Logo upload/reset-to-server-default functionality is still absent. | 🟢 Low |
| 44 | Academic Settings | Admin / Settings | ✅ Full | Academic settings form and GET/PATCH API wiring are documented. | Some UI fields are not in schema/API, but the core documented settings are implemented. | 🟢 Low |
| 45 | Notification Settings | Admin / Settings | ✅ Full | Notification settings form and GET/PATCH API wiring are documented. | Some UI-only fields are not in schema/API. | 🟢 Low |
| 46 | Teacher Dashboard | Teacher Portal | ❌ Missing | Dashboard UI, stats cards, quick actions, and today schedule are documented. | `CONFLICT`: `TEACHER_PORTAL_ANALYSIS.md` marks it partial because UI exists, while `FINAL_SUMMARY.md` marks it missing end to end because required backend endpoints do not exist. | 🔴 Critical |
| 47 | Teacher Class Roster | Teacher Portal | ❌ Missing | Class cards and roster UI are documented under My Classes. | `FINAL_SUMMARY.md` marks Teacher Class Roster missing because `/teachers/{teacherId}/classes` and `/sections/{sectionId}/students` are still backend-required. | 🔴 Critical |
| 48 | Teacher Weekly Timetable | Teacher Portal | ❌ Missing | Weekly timetable UI exists with highlighting. | `CONFLICT`: teacher portal analysis says partial UI implementation, while `FINAL_SUMMARY.md` marks it missing end to end because required backend endpoint is absent. | 🔴 Critical |
| 49 | Student Dashboard | Student Portal | ⚠️ Partial | Dashboard UI, stats cards, today schedule, recent grades, and announcements are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks Student Dashboard full, while `STUDENT_PORTAL_ANALYSIS.md` marks it partial because `/api/students/{studentId}/dashboard` is required and not implemented. | 🟡 Medium |
| 50 | Student Profile | Student Portal | ⚠️ Partial | Read-only self-profile, photo upload UI, and password-change UI are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks Student Profile full, while `STUDENT_PORTAL_ANALYSIS.md` marks My Profile partial because profile/photo endpoints are missing and most data is read-only. | 🟡 Medium |
| 51 | Guardian Dashboard | Guardian Portal | ⚠️ Partial | Dashboard UI, child summary cards, alert banners, and recent alerts are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks Guardian Dashboard full, while `GUARDIAN_PORTAL_ANALYSIS.md` marks it partial because dashboard data endpoint is still required and thresholds are hardcoded. | 🟡 Medium |
| 52 | Guardian Profile | Guardian Portal | ⚠️ Partial | Read-only profile layout and linked-children display are documented. | Change-password form has no submit handler/API wiring, and profile fields are read-only. | 🟠 High |
| 53 | Guardian Child Details | Guardian Portal | ⚠️ Partial | Child detail tabs, IDOR ownership check, and overview/attendance/grades/fees/schedule layouts are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks Guardian Child Details full, while `GUARDIAN_PORTAL_ANALYSIS.md` marks it partial because every child-data endpoint is still required. | 🟡 Medium |
| 54 | Guardian Notifications | Guardian Portal | ⚠️ Partial | Notification list, type filters, mark-as-read, and mark-all-read UI are documented. | `CONFLICT`: `FINAL_SUMMARY.md` marks Guardian Notifications full, while `GUARDIAN_PORTAL_ANALYSIS.md` marks it partial because backend endpoints are required and pagination/delete are missing. | 🟡 Medium |
| 55 | Role-Based Access Control | Security | ⚠️ Partial | Role definitions, permission helpers, `RoleGuard`, and route-protection components exist. | `CONFLICT`: `FINAL_SUMMARY.md` marks RBAC full, but auth analysis documents gaps: `ProtectedRoute` hydration/redirect issues and middleware has no server-side auth enforcement. | 🟠 High |
| 56 | Token Refresh | Security | ⚠️ Partial | Axios interceptor attaches bearer tokens, posts refresh requests, updates tokens, and retries failed requests. | `CONFLICT`: `FINAL_SUMMARY.md` marks Token Refresh full, while auth analysis marks it partial because refresh concurrency control is missing and login redirect is locale-hardcoded. | 🟡 Medium |
| 57 | Forgot Password | Authentication | ✅ Full | Email-only forgot-password form, success confirmation state, and `/auth/forgot-password` call are documented. | Hardcoded loading label text is still noted. | 🟡 Medium |
| 58 | Change Password (Auth Context — Forced) | Authentication | ✅ Full | Forced password-change page is wired to `/auth/change-password`, updates auth store, and redirects after success. | Redirect always goes to `/dashboard` instead of role-specific destination; some labels are hardcoded. | 🟡 Medium |
| 59 | Change Password (Dashboard Context) | Dashboard / Authentication | ❌ Missing | Dashboard page UI exists. | API call is commented out and replaced by `setTimeout` success simulation. | 🟠 High |
| 60 | Change Password (Student Portal) | Student Portal / Authentication | ⚠️ Partial | Student portal password form exists and attempts API submission. | Auth analysis documents likely double `/api` path, wrong payload field names, and missing confirm field in the request body. | 🟠 High |
| 61 | Auth Store (Zustand) | Authentication Infrastructure | ✅ Full | Persisted auth store with `setAuth`, `clearAuth`, `updateTokens`, and `updateUser` is documented. | Uses `sessionStorage` only, so state is not preserved across browser restarts. | 🟢 Low |
| 62 | ProtectedRoute (Client Guard) | Authentication Infrastructure | ⚠️ Partial | Client guard exists for login, password-change, and required-role redirects. | Does not reliably wait for hydration and redirects unauthorized users to `/dashboard` instead of `/unauthorized`. | 🟠 High |
| 63 | RoleGuard (RBAC Guard) | Authentication Infrastructure | ✅ Full | Hydration-aware role guard exists and redirects unauthorized users to `/unauthorized`. | Redundant role check is documented, but core behavior is implemented. | 🟢 Low |
| 64 | Unauthorized Page | Authentication / Shared UI | ⚠️ Partial | Unauthorized page exists and shows current role plus CTA buttons. | Always links to generic `/dashboard`, not role-specific destination; one label is hardcoded in English. | 🟢 Low |
| 65 | Forbidden Page (Shared) | Shared UI / Security | ✅ Full | Reusable 403 page component exists with dashboard/back CTAs. | Dashboard CTA is generic rather than role-specific. | 🟢 Low |
| 66 | Password Strength Indicator | Authentication UI | ✅ Full | Strength meter and requirement checklist are documented and implemented. | Not used consistently across every password-change surface. | 🟢 Low |
| 67 | Language Switcher (Auth Layout) | Authentication UI | ✅ Full | Locale toggle between `en` and `am` is documented and wired. | Only supports the two documented locales; not scalable beyond that. | 🟢 Low |
| 68 | Middleware (Auth/RBAC Protection) | Security Infrastructure | ❌ Missing | Locale-routing middleware exists. | Auth analysis explicitly states middleware has no auth/RBAC enforcement; all access control remains client-side. | 🔴 Critical |
| 69 | Permissions Helper + Hook | Security Infrastructure | ✅ Full | Permission helper functions and `use-permissions` hook are documented. | Enforcement is client-side only; no server-side counterpart is documented here. | 🟢 Low |
| 70 | Directors Management | Admin / Directors | ⚠️ Partial | Filtered directors list, search, status filter, and redirect-based CRUD access are documented. | Missing pagination UI, missing sort, and create/edit still rely on generic users flows without director preselection. | 🟡 Medium |
| 71 | Registrar Portal | Registrar | ❌ Missing | Registrar role and permissions exist inside admin access control. | `REGISTRAR_PORTAL_ANALYSIS.md` explicitly states no separate registrar portal/module exists. | 🟡 Medium |

### Section 1 Totals

- Total features: 71
- ✅ Fully implemented: 24 (33.8%)
- ⚠️ Partially implemented: 36 (50.7%)
- ❌ Not implemented: 11 (15.5%)

## Section 2: Master Bug List

Notes for this section:
- Duplicate bug reports from multiple source documents were merged into one bug entry.
- Severity ordering follows the source material where stated; when multiple sources referenced the same issue, the highest stated severity was used.

BUG #1  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Authentication login fallback  
PORTAL: Authentication  
FILE: `src/lib/api/auth.service.ts`  
DESCRIPTION: Login falls back to hardcoded mock users when the API is unreachable.  
IMPACT: Real authentication can be bypassed if the backend is down or misconfigured.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `FINAL_SUMMARY.md`, `BUSINESS_CONTEXT_REPORT.md`

BUG #2  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Mock user credentials in production code  
PORTAL: Authentication  
FILE: `src/lib/api/auth.service.ts`  
DESCRIPTION: Six hardcoded mock user accounts with passwords are embedded in the frontend auth service.  
IMPACT: Unauthorized access is possible if mock authentication is triggered; test data is mixed into production flow.  
SOURCE DOCUMENT: `BUG_REPORT.md`

BUG #3  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Section roster  
PORTAL: Admin / Academics  
FILE: `src/app/[locale]/(dashboard)/dashboard/academics/classes/[classId]/sections/[sectionId]/page.tsx`  
DESCRIPTION: The section student list is hardcoded to `const students: unknown[] = []` with placeholder comments instead of real data loading.  
IMPACT: Administrators cannot see or manage which students are assigned to a section.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `FINAL_SUMMARY.md`, `BUSINESS_CONTEXT_REPORT.md`

BUG #4  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Teacher dashboard data  
PORTAL: Teacher  
FILE: `src/features/teacher/hooks/useTeacherDashboard.ts`  
DESCRIPTION: The dashboard stats endpoint is marked `BACKEND REQUIRED` and is not confirmed to exist.  
IMPACT: Teachers cannot reliably access dashboard metrics needed for daily work.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `TEACHER_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`

BUG #5  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Teacher class roster  
PORTAL: Teacher  
FILE: `src/features/teacher/hooks/useTeacherClasses.ts`  
DESCRIPTION: Teacher classes and class-roster endpoints are marked `BACKEND REQUIRED`.  
IMPACT: Teachers cannot open assigned classes or load roster data for attendance and grading.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `TEACHER_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`

BUG #6  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Teacher attendance submission  
PORTAL: Teacher  
FILE: `src/features/teacher/hooks/useTeacherAttendance.ts`  
DESCRIPTION: Teacher attendance depends on missing backend endpoints including `/teachers/{teacherId}/attendance-records` and `/attendance/check`.  
IMPACT: Teachers cannot reliably record or review attendance.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `TEACHER_PORTAL_ANALYSIS.md`, `BUSINESS_CONTEXT_REPORT.md`

BUG #7  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Teacher grade entry  
PORTAL: Teacher  
FILE: `src/features/teacher/hooks/useTeacherGrades.ts`  
DESCRIPTION: Teacher assessments, assessment grades, and bulk grade submission endpoints are marked `BACKEND REQUIRED`.  
IMPACT: Teachers cannot enter grades end to end.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `TEACHER_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`, `BUSINESS_CONTEXT_REPORT.md`

BUG #8  
SEVERITY: 🔴 Critical  
FEATURE AFFECTED: Middleware-based access control  
PORTAL: Security  
FILE: `middleware.ts`  
DESCRIPTION: Middleware performs locale routing only and does not enforce authentication or RBAC.  
IMPACT: All route protection is client-side only, leaving server-side route access unprotected.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #9  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Student-to-guardian linking in student edit  
PORTAL: Admin / Students  
FILE: `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`  
DESCRIPTION: Guardian linking dialog is still placeholder text instead of working UI.  
IMPACT: Students cannot be properly linked to guardians during edit flow.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `ADMIN_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`, `BUSINESS_CONTEXT_REPORT.md`

BUG #10  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Guardian password change  
PORTAL: Guardian  
FILE: `src/app/[locale]/(dashboard)/dashboard/guardian/profile/page.tsx`  
DESCRIPTION: Guardian password fields render but there is no submit handler, validation flow, or API call.  
IMPACT: Guardians cannot change their passwords.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `GUARDIAN_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`, `BUSINESS_CONTEXT_REPORT.md`

BUG #11  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Face attendance descriptors  
PORTAL: Attendance  
FILE: `src/features/attendance/hooks/useFaceAttendance.ts`  
DESCRIPTION: Face recognition descriptor loading is marked `BACKEND REQUIRED`.  
IMPACT: Face attendance cannot function without backend support.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `FINAL_SUMMARY.md`

BUG #12  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Face enrollment status  
PORTAL: Attendance  
FILE: `src/features/attendance/hooks/useFaceEnrollment.ts`  
DESCRIPTION: Face enrollment status loading is marked `BACKEND REQUIRED`.  
IMPACT: Face enrollment cannot function without backend support.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `FINAL_SUMMARY.md`

BUG #13  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Section student fetching for attendance and roster use cases  
PORTAL: Attendance / Teacher  
FILE: `src/features/attendance/hooks/useSectionStudents.ts`  
DESCRIPTION: Section students endpoint is marked `BACKEND REQUIRED` in bug analysis.  
IMPACT: Section-based student retrieval can fail across roster, attendance, and related features.  
SOURCE DOCUMENT: `BUG_REPORT.md`

BUG #14  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Student term filter for grades  
PORTAL: Student  
FILE: `src/app/[locale]/(dashboard)/dashboard/student/my-grades/page.tsx`  
DESCRIPTION: `availableTerms` is left empty with a TODO comment requiring a global endpoint or mock.  
IMPACT: Students may not be able to filter grades by term.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `STUDENT_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`, `BUSINESS_CONTEXT_REPORT.md`

BUG #15  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Student portal password change  
PORTAL: Student  
FILE: `src/features/student-portal/components/ChangePasswordForm.tsx`  
DESCRIPTION: The form posts to `/api/auth/change-password` even though the base URL already includes `/api`, and the payload uses camelCase fields instead of the snake_case auth contract.  
IMPACT: Student password change is likely broken even though the UI exists.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #16  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Schedule backend masking  
PORTAL: Admin / Schedule  
FILE: `src/features/schedule/api/useSchedule.ts`  
DESCRIPTION: Schedule queries catch 404s and return empty arrays with comments stating the endpoints are mocked.  
IMPACT: Missing schedule backend functionality is hidden behind empty-state behavior instead of explicit failure.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `ADMIN_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`

BUG #17  
SEVERITY: 🟠 High  
FEATURE AFFECTED: Guardian payment data loading  
PORTAL: Guardian / Payments  
FILE: `src/features/guardian-portal/hooks/useGuardianPayments.ts`  
DESCRIPTION: Fee balance, payment history, and payment initiation endpoints are all documented as required and not confirmed to exist.  
IMPACT: Guardian payment flow and balance visibility cannot work end to end.  
SOURCE DOCUMENT: `GUARDIAN_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`

BUG #18  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Role update from user edit page  
PORTAL: Admin / Users  
FILE: `src/app/[locale]/(dashboard)/dashboard/users/[id]/edit/page.tsx`  
DESCRIPTION: Role update UI exists but does not call a mutation hook; the handler only closes editing state.  
IMPACT: Role changes appear editable but are not actually saved from this flow.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #19  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Own-account deactivation protection  
PORTAL: Admin / Users  
FILE: `src/app/[locale]/(dashboard)/dashboard/users/[id]/edit/page.tsx`  
DESCRIPTION: The page checks for own profile but does not block deactivating the current user.  
IMPACT: Users could deactivate their own account from the edit flow.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #20  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Student create/edit photo handling  
PORTAL: Admin / Students  
FILE: `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`  
DESCRIPTION: Photo upload UI exists but the file or `profile_image_url` is not properly carried into the payload.  
IMPACT: Student photos cannot be saved consistently.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #21  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Student create guardian selection  
PORTAL: Admin / Students  
FILE: `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx`  
DESCRIPTION: Guardian selection exists in the form, but `guardian_id` is not included in the create mutation payload.  
IMPACT: Student creation does not preserve selected guardian linkage.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #22  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Teacher detail supporting tabs  
PORTAL: Admin / Teachers  
FILE: `src/app/[locale]/(dashboard)/dashboard/teachers/[id]/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/teachers/[id]/edit/page.tsx`  
DESCRIPTION: Teacher photo payload, account linking, classes tab, and timetable error handling are incomplete.  
IMPACT: Teacher detail pages provide incomplete related-data management.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #23  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Guardian restore and linking controls  
PORTAL: Admin / Guardians  
FILE: `src/app/[locale]/(dashboard)/dashboard/guardians/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/edit/page.tsx`  
DESCRIPTION: Restore functionality is missing, list filtering is incomplete, and some linking flows hardcode relationship type or are read-only.  
IMPACT: Guardian lifecycle and link management are incomplete.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #24  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Directors management pagination and preselection  
PORTAL: Admin / Directors  
FILE: `src/app/[locale]/(dashboard)/dashboard/directors/page.tsx`  
DESCRIPTION: Page tracks paging state but provides no pagination UI, no sort, and redirects create/edit to generic user flows without director preselection.  
IMPACT: Director-specific management flow is incomplete and inconsistent.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #25  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Academic year/class/section delete and archive actions  
PORTAL: Admin / Academics  
FILE: `src/features/academics/api/useAcademicYears.ts`, `src/features/academics/api/useClasses.ts`, `src/app/[locale]/(dashboard)/dashboard/academics/years/page.tsx`  
DESCRIPTION: Delete hooks are missing for academic years, classes, and sections, and archive year UI is present without functioning action.  
IMPACT: Administrators cannot fully manage the academic structure lifecycle.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #26  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Enrollment general update/delete flow  
PORTAL: Admin / Enrollments  
FILE: `src/features/enrollments/api/useEnrollments.ts`, `src/app/[locale]/(dashboard)/dashboard/enrollments/page.tsx`  
DESCRIPTION: Enrollment flow supports transfer/withdraw only; general update and delete are absent.  
IMPACT: Enrollment records cannot be fully maintained once created.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #27  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Schedule conflict handling  
PORTAL: Admin / Schedule  
FILE: `src/features/schedule/api/useSchedule.ts`, `src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx`  
DESCRIPTION: No overlap/conflict detection exists for schedule entries and no bulk operations are provided.  
IMPACT: Invalid or overlapping schedules can be created without frontend prevention.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #28  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Attendance record maintenance  
PORTAL: Admin / Attendance  
FILE: `src/app/[locale]/(dashboard)/dashboard/attendance/page.tsx`, `src/features/attendance/api/useAttendance.ts`  
DESCRIPTION: No delete, export, duplicate-submission prevention, or admin history/reporting flow is documented.  
IMPACT: Attendance records are difficult to audit or correct.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #29  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Grades management lifecycle  
PORTAL: Admin / Grades  
FILE: `src/app/[locale]/(dashboard)/dashboard/grades/page.tsx`  
DESCRIPTION: Assessment edit/delete, grade delete, grade history/reporting, export, and robust score validation are incomplete.  
IMPACT: Administrative grade management is incomplete beyond basic entry/display.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #30  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Notification history and compose flow  
PORTAL: Admin / Notifications  
FILE: `src/app/[locale]/(dashboard)/dashboard/notifications/history/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/notifications/compose/page.tsx`  
DESCRIPTION: Notification history lacks delete/pagination/sort, and the compose button link from history is broken; scheduling/template management is also absent.  
IMPACT: Notification administration is incomplete and harder to operate at scale.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #31  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Analytics interventions and exports  
PORTAL: Admin / Analytics  
FILE: `src/features/analytics/components/AnalyticsOverview.tsx`, `src/features/analytics/hooks/useAtRiskStudents.ts`, `src/features/analytics/hooks/useAnalyticsDashboard.ts`  
DESCRIPTION: Intervention notes cannot be edited or deleted, and analytics lacks export, drill-down, date range, and term comparison capabilities.  
IMPACT: Analytics is viewable but not operationally complete.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`, `TEACHER_PORTAL_ANALYSIS.md`

BUG #32  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Settings schema/API mismatch  
PORTAL: Admin / Settings  
FILE: `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx`, `src/lib/api/settings.service.ts`  
DESCRIPTION: Security and attendance tabs are UI-only, several academic/notification fields exist in UI but not schema/API, and face-recognition settings are duplicated.  
IMPACT: Settings pages present configurable options that are not actually persisted.  
SOURCE DOCUMENT: `ADMIN_PORTAL_ANALYSIS.md`

BUG #33  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Teacher attendance records edit flow  
PORTAL: Teacher  
FILE: `src/features/teacher/components/TeacherAttendanceForm.tsx`  
DESCRIPTION: An edit button is rendered in records view but has no functionality.  
IMPACT: Teachers cannot correct an already-entered attendance record from the documented UI.  
SOURCE DOCUMENT: `TEACHER_PORTAL_ANALYSIS.md`

BUG #34  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Teacher grade filters and editing  
PORTAL: Teacher  
FILE: `src/features/teacher/components/TeacherGradeEntry.tsx`, `src/features/teacher/hooks/useTeacherGrades.ts`  
DESCRIPTION: UI filters may not be correctly wired, existing grades have no dedicated edit mode, and pagination/search/sort/export remain incomplete.  
IMPACT: Teacher grade-entry workflow is cumbersome even if backend endpoints exist.  
SOURCE DOCUMENT: `TEACHER_PORTAL_ANALYSIS.md`

BUG #35  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Teacher schedule usability  
PORTAL: Teacher  
FILE: `src/features/teacher/components/TeacherWeeklyTimetable.tsx`  
DESCRIPTION: Teacher schedule is read-only and lacks print/export, term filtering, and week navigation, while assuming a Monday-Friday schedule.  
IMPACT: Teachers cannot use the timetable flexibly or export it.  
SOURCE DOCUMENT: `TEACHER_PORTAL_ANALYSIS.md`

BUG #36  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Student dashboard/detail navigation  
PORTAL: Student  
FILE: `src/features/student-portal/components/StudentDashboardHome.tsx`  
DESCRIPTION: Dashboard components have no refresh button, no deep links to detail views, and announcement cards have no full-detail view.  
IMPACT: Students can see summary data but cannot easily drill into it.  
SOURCE DOCUMENT: `STUDENT_PORTAL_ANALYSIS.md`

BUG #37  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Student attendance thresholds and calendar assumptions  
PORTAL: Student  
FILE: `src/app/[locale]/(dashboard)/dashboard/student/my-attendance/page.tsx`, `src/features/student-portal/components/AttendanceCalendar.tsx`  
DESCRIPTION: Warning threshold is hardcoded to 75, calendar assumes Sunday-Saturday, and export/search/sort/date-range capabilities are absent.  
IMPACT: Attendance interpretation and reporting are limited and policy-sensitive.  
SOURCE DOCUMENT: `STUDENT_PORTAL_ANALYSIS.md`

BUG #38  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Student profile editing scope  
PORTAL: Student  
FILE: `src/features/student-portal/api/useMyProfile.ts`, `src/features/student-portal/components/ProfilePhotoUpload.tsx`, `src/features/student-portal/components/ChangePasswordForm.tsx`  
DESCRIPTION: Profile information is read-only, guardian info is not editable, photo delete is missing, and password UI lacks some strength/verification behaviors.  
IMPACT: Students cannot manage much of their own profile data.  
SOURCE DOCUMENT: `STUDENT_PORTAL_ANALYSIS.md`

BUG #39  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Student schedule precision  
PORTAL: Student  
FILE: `src/features/student-portal/components/StudentWeeklyTimetable.tsx`  
DESCRIPTION: Current-period detection uses hour-only precision and the schedule assumes Monday-Friday with no week navigation or export.  
IMPACT: Real-time timetable highlighting can be inaccurate and inflexible.  
SOURCE DOCUMENT: `STUDENT_PORTAL_ANALYSIS.md`

BUG #40  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Guardian child-detail data tabs  
PORTAL: Guardian  
FILE: `src/features/guardian-portal/hooks/useChildDetails.ts`, `src/features/guardian-portal/components/GuardianAttendanceView.tsx`, `src/features/guardian-portal/components/GuardianGradesView.tsx`, `src/features/guardian-portal/components/GuardianScheduleView.tsx`  
DESCRIPTION: Attendance pagination is not properly wired, grade term is hardcoded to `current`, passing/attendance thresholds are hardcoded, and schedule lacks current-day/current-period highlighting plus export controls.  
IMPACT: Guardians cannot fully explore or trust child-detail data workflows.  
SOURCE DOCUMENT: `GUARDIAN_PORTAL_ANALYSIS.md`

BUG #41  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Guardian notifications management  
PORTAL: Guardian  
FILE: `src/features/guardian-portal/hooks/useGuardianNotifications.ts`, `src/features/guardian-portal/components/GuardianNotificationList.tsx`  
DESCRIPTION: Notifications lack pagination UI, delete, date/read-state filters, and may have incorrect `mark all read` disable logic.  
IMPACT: Guardians cannot manage larger notification histories effectively.  
SOURCE DOCUMENT: `GUARDIAN_PORTAL_ANALYSIS.md`

BUG #42  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Guardian payment presentation  
PORTAL: Guardian / Payments  
FILE: `src/features/guardian-portal/components/GuardianFeesView.tsx`  
DESCRIPTION: Payment UI adapter hardcodes `"Child Name"` and lacks pagination, filters, and export for payment history.  
IMPACT: Payment data presentation is partially placeholder and not production-ready.  
SOURCE DOCUMENT: `GUARDIAN_PORTAL_ANALYSIS.md`

BUG #43  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Login redirect logic  
PORTAL: Authentication  
FILE: `src/app/[locale]/(auth)/login/page.tsx`  
DESCRIPTION: Multi-role users are redirected using a simple `if/else if` chain, so only the first matching role is honored.  
IMPACT: Users with multiple roles may be routed to the wrong destination.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #44  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Reset-password token handling  
PORTAL: Authentication  
FILE: `src/app/[locale]/(auth)/reset-password/page.tsx`  
DESCRIPTION: Reset-password submission does not guard against a missing token.  
IMPACT: The frontend can issue invalid reset requests with an empty token.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #45  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Forced password-change redirect  
PORTAL: Authentication  
FILE: `src/app/[locale]/(auth)/change-password/page.tsx`  
DESCRIPTION: Successful forced password change always redirects to `/dashboard` instead of a role-specific dashboard.  
IMPACT: Non-admin users may land on the wrong post-change destination.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #46  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Dashboard change-password page  
PORTAL: Dashboard / Authentication  
FILE: `src/app/[locale]/(dashboard)/dashboard/change-password/page.tsx`  
DESCRIPTION: The intended auth-service password call is commented out and replaced with a fake delay/success flow.  
IMPACT: Dashboard password change is not connected to the backend.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #47  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Token refresh flow locale/concurrency  
PORTAL: Authentication Infrastructure  
FILE: `src/lib/api/axios.ts`  
DESCRIPTION: Refresh failure redirect is hardcoded to `/en/login`, and simultaneous 401 responses have no refresh concurrency control.  
IMPACT: Locale can be lost on logout and multiple failing requests can trigger unstable refresh behavior.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #48  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: ProtectedRoute hydration and unauthorized routing  
PORTAL: Authentication Infrastructure  
FILE: `src/components/auth/protected-route.tsx`  
DESCRIPTION: ProtectedRoute can redirect before store hydration and sends unauthorized roles to `/dashboard` instead of `/unauthorized`.  
IMPACT: Legitimate sessions can be misrouted and unauthorized handling is inconsistent.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #49  
SEVERITY: 🟡 Medium  
FEATURE AFFECTED: Unauthorized/forbidden destination routing  
PORTAL: Authentication / Shared UI  
FILE: `src/app/[locale]/unauthorized/page.tsx`, `src/components/shared/forbidden-page.tsx`  
DESCRIPTION: Both pages send users to generic `/dashboard` instead of role-specific destinations.  
IMPACT: Users can be routed to irrelevant dashboards after denial pages.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #50  
SEVERITY: 🟢 Low  
FEATURE AFFECTED: Native confirmation dialogs  
PORTAL: Cross-cutting UI  
FILE: `src/app/[locale]/(dashboard)/dashboard/notifications/rules/page.tsx`, `src/features/teacher/components/TeacherAttendanceForm.tsx`, `src/app/[locale]/(dashboard)/dashboard/attendance/face-enrollment/page.tsx`  
DESCRIPTION: Several actions still rely on browser-native `confirm()` or `window.confirm()`.  
IMPACT: Confirmation UX is inconsistent with the application design system.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `FINAL_SUMMARY.md`

BUG #51  
SEVERITY: 🟢 Low  
FEATURE AFFECTED: Console logging in production flows  
PORTAL: Cross-cutting UI / Logic  
FILE: Multiple files including `src/app/[locale]/(auth)/login/page.tsx`, attendance face-recognition files, PDF/export helpers, and auth service  
DESCRIPTION: Multiple production paths still use `console.log`, `console.info`, `console.warn`, or `console.error` for operational behavior.  
IMPACT: Console noise can leak internal behavior and reduces production polish.  
SOURCE DOCUMENT: `BUG_REPORT.md`, `AUTHENTICATION_MODULE_ANALYSIS.md`

BUG #52  
SEVERITY: 🟢 Low  
FEATURE AFFECTED: Type safety across hooks and services  
PORTAL: Cross-cutting code quality  
FILE: Multiple files across `src/lib/api/*.ts`, `src/hooks/*.ts`, `src/features/*`  
DESCRIPTION: Extensive use of `any`, broad index signatures, and `as any` casts is documented across filters, payloads, translation keys, error handlers, analytics hooks, guardian hooks, notifications, payments, enrollments, and attendance code.  
IMPACT: Runtime-shape mistakes are harder to catch and maintainability is reduced.  
SOURCE DOCUMENT: `BUG_REPORT.md`

BUG #53  
SEVERITY: 🟢 Low  
FEATURE AFFECTED: Dead/commented schedule test code  
PORTAL: Admin / Schedule  
FILE: `src/features/schedule/api/useSchedule.ts`  
DESCRIPTION: Commented-out dummy `initialData` remains in schedule query code.  
IMPACT: Code cleanliness and maintainability are reduced.  
SOURCE DOCUMENT: `BUG_REPORT.md`

BUG #54  
SEVERITY: 🟢 Low  
FEATURE AFFECTED: Auth text internationalization consistency  
PORTAL: Authentication  
FILE: Multiple auth pages including forgot-password, forced change-password, unauthorized page  
DESCRIPTION: Some loading labels and button text remain hardcoded in English.  
IMPACT: Localization is inconsistent across auth-related flows.  
SOURCE DOCUMENT: `AUTHENTICATION_MODULE_ANALYSIS.md`

## Section 3: Master API Gaps List

API GAP #1  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherDashboard.ts`  
FRONTEND CALLS: `GET /teachers/{teacherId}/dashboard-stats`  
BACKEND HAS: NOTHING CONFIRMED  
MISMATCH DETAIL: Source documents explicitly mark the teacher dashboard endpoint as `BACKEND REQUIRED`.  
USED BY FEATURE: Teacher Dashboard  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #2  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherClasses.ts`  
FRONTEND CALLS: `GET /teachers/{teacherId}/classes`  
BACKEND HAS: NOTHING CONFIRMED  
MISMATCH DETAIL: Teacher classes endpoint is documented as required but not implemented.  
USED BY FEATURE: My Classes / Teacher Class Roster  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #3  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherClasses.ts`  
FRONTEND CALLS: `GET /sections/{sectionId}/students`  
BACKEND HAS: `GET /academics/sections/{sectionId}/students` and also a separate summary entry for `GET /sections/{sectionId}/students`  
MISMATCH DETAIL: The portal analysis and bug report flag the non-`/academics` route as backend-required; the endpoint summary documents a different academic route for section students, creating an unresolved route discrepancy.  
USED BY FEATURE: Teacher Class Roster  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #4  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherAttendance.ts`  
FRONTEND CALLS: `GET /teachers/{teacherId}/attendance-records`  
BACKEND HAS: NOTHING CONFIRMED  
MISMATCH DETAIL: Teacher attendance-records endpoint is marked `BACKEND REQUIRED`.  
USED BY FEATURE: Teacher Attendance Records  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #5  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherAttendance.ts`  
FRONTEND CALLS: `GET /attendance/check`  
BACKEND HAS: Endpoint is listed in `API_ENDPOINTS_SUMMARY.md`, but teacher analysis and business context still mark it `BACKEND REQUIRED`  
MISMATCH DETAIL: `CONFLICT`: endpoint appears in the API inventory but feature analysis does not confirm backend implementation.  
USED BY FEATURE: Teacher Attendance Submission Guard  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #6  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherGrades.ts`  
FRONTEND CALLS: `GET /teachers/{teacherId}/assessments`  
BACKEND HAS: NOTHING CONFIRMED  
MISMATCH DETAIL: Teacher assessments endpoint is marked `BACKEND REQUIRED`.  
USED BY FEATURE: Teacher Grades  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #7  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherGrades.ts`  
FRONTEND CALLS: `GET /assessments/{assessmentId}/grades`  
BACKEND HAS: Listed in `API_ENDPOINTS_SUMMARY.md`, but teacher analysis still marks it `BACKEND REQUIRED`  
MISMATCH DETAIL: `CONFLICT`: API inventory lists the endpoint, while feature analysis treats it as absent/unconfirmed.  
USED BY FEATURE: Teacher Grades  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #8  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/teacher/hooks/useTeacherGrades.ts`  
FRONTEND CALLS: `POST /assessments/{assessmentId}/grades/bulk`  
BACKEND HAS: Listed in `API_ENDPOINTS_SUMMARY.md`, but teacher analysis still marks it `BACKEND REQUIRED`  
MISMATCH DETAIL: `CONFLICT`: endpoint appears in summary but is not treated as available by the teacher module analysis.  
USED BY FEATURE: Teacher Grade Submission  
PORTAL: Teacher  
PRIORITY: 🔴 Critical

API GAP #9  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/attendance/api/useAttendance.ts`  
FRONTEND CALLS: `POST /attendance/bulk`  
BACKEND HAS: Endpoint is listed in `API_ENDPOINTS_SUMMARY.md`, but `FINAL_SUMMARY.md` and business context still treat manual attendance as blocked  
MISMATCH DETAIL: `CONFLICT`: endpoint is inventoried but not confirmed operational.  
USED BY FEATURE: Manual Attendance  
PORTAL: Attendance  
PRIORITY: 🔴 Critical

API GAP #10  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/attendance/hooks/useFaceAttendance.ts`  
FRONTEND CALLS: `GET /face-recognition/descriptors?sectionId={id}`  
BACKEND HAS: Face-recognition descriptors endpoint is listed, but bug and portal documents mark it `BACKEND REQUIRED`  
MISMATCH DETAIL: `CONFLICT`: endpoint appears in the summary inventory but is not confirmed implemented by feature analysis.  
USED BY FEATURE: Face Recognition Attendance  
PORTAL: Attendance  
PRIORITY: 🟠 High

API GAP #11  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/attendance/hooks/useFaceEnrollment.ts`  
FRONTEND CALLS: `GET /face-recognition/enrollment-status?sectionId={id}`  
BACKEND HAS: Face-recognition enrollment-status endpoint is listed, but feature analysis still marks it `BACKEND REQUIRED`  
MISMATCH DETAIL: `CONFLICT`: endpoint appears in API summary but is not confirmed live by module analysis.  
USED BY FEATURE: Face Enrollment  
PORTAL: Attendance  
PRIORITY: 🟠 High

API GAP #12  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/student-portal/api/useStudentPortalDashboard.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/dashboard`  
BACKEND HAS: Nothing else in the endpoint summary confirms a non-`/api` equivalent  
MISMATCH DETAIL: Student portal analysis explicitly marks the endpoint not implemented.  
USED BY FEATURE: Student Dashboard  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #13  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/student-portal/api/useMyAttendance.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/attendance/summary`, `GET /api/students/{studentId}/attendance/calendar`, `GET /api/students/{studentId}/attendance/records`  
BACKEND HAS: Nothing confirmed beyond the frontend API inventory  
MISMATCH DETAIL: All three student attendance endpoints are documented as not implemented in the portal analysis.  
USED BY FEATURE: My Attendance  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #14  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/student-portal/api/useMyGrades.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/grades/summary`, `GET /api/students/{studentId}/grades/assessments`, `GET /api/students/{studentId}/grades/report-card`  
BACKEND HAS: Nothing confirmed beyond the frontend API inventory  
MISMATCH DETAIL: Student portal analysis explicitly marks the grades endpoints as not implemented.  
USED BY FEATURE: My Grades / Report Card  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #15  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/student-portal/api/useMyGrades.ts` and `src/app/[locale]/(dashboard)/dashboard/student/my-grades/page.tsx`  
FRONTEND CALLS: global terms source for grades filters  
BACKEND HAS: NOTHING  
MISMATCH DETAIL: The frontend documents that `availableTerms` needs a global endpoint or mock, but none is defined in the source set.  
USED BY FEATURE: Student term filtering for grades  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #16  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/student-portal/api/useMyProfile.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/profile`, `PATCH /api/students/{studentId}/photo`  
BACKEND HAS: Nothing confirmed beyond the frontend API inventory  
MISMATCH DETAIL: Student profile and photo endpoints are documented as not implemented.  
USED BY FEATURE: My Profile  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #17  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/student-portal/api/useMySchedule.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/schedule`  
BACKEND HAS: Nothing confirmed beyond the frontend API inventory  
MISMATCH DETAIL: Student schedule endpoint is documented as not implemented.  
USED BY FEATURE: My Schedule  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #18  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/student-portal/api/useAcademicSettings.ts`  
FRONTEND CALLS: `GET /api/settings/academic`  
BACKEND HAS: `GET /settings/academic`  
MISMATCH DETAIL: Student portal analysis marks `/api/settings/academic` not implemented while the admin settings API is documented under `/settings/academic`; frontend route prefixing differs.  
USED BY FEATURE: Student grade thresholds / pass mark  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #19  
TYPE: PATH MISMATCH  
FRONTEND HOOK/FILE: `src/features/student-portal/components/ChangePasswordForm.tsx`  
FRONTEND CALLS: `POST /api/auth/change-password`  
BACKEND HAS: `POST /auth/change-password` with axios base URL already ending in `/api`  
MISMATCH DETAIL: The request path duplicates `/api` and points to a different contract than the shared auth service.  
USED BY FEATURE: Student Password Change  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #20  
TYPE: PAYLOAD MISMATCH  
FRONTEND HOOK/FILE: `src/features/student-portal/components/ChangePasswordForm.tsx`  
FRONTEND CALLS: `POST /api/auth/change-password` with `{ currentPassword, newPassword }`  
BACKEND HAS: `POST /auth/change-password` expecting `{ current_password, new_password, new_password_confirm }`  
MISMATCH DETAIL: Field casing and required confirmation field do not match the documented auth backend contract.  
USED BY FEATURE: Student Password Change  
PORTAL: Student  
PRIORITY: 🟠 High

API GAP #21  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/guardian-portal/hooks/useGuardianDashboard.ts`  
FRONTEND CALLS: `GET /api/guardians/{guardianId}/dashboard`  
BACKEND HAS: Endpoint appears in API summary, but guardian analysis still marks it not implemented  
MISMATCH DETAIL: `CONFLICT`: endpoint is inventoried but not confirmed operational by feature analysis.  
USED BY FEATURE: Guardian Dashboard  
PORTAL: Guardian  
PRIORITY: 🟠 High

API GAP #22  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/guardian-portal/hooks/useMyChildren.ts` and `src/features/guardian-portal/hooks/useChildDetails.ts`  
FRONTEND CALLS: `GET /api/guardians/{guardianId}/students`, `GET /api/students/{studentId}/guardian-view`  
BACKEND HAS: Endpoint summary lists these paths, but guardian analysis still marks them not implemented  
MISMATCH DETAIL: `CONFLICT`: API inventory and feature analysis disagree on readiness.  
USED BY FEATURE: Guardian Child Details / IDOR validation  
PORTAL: Guardian  
PRIORITY: 🟠 High

API GAP #23  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/guardian-portal/hooks/useChildDetails.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/attendance/records`, `GET /api/students/{studentId}/grades`, `GET /api/students/{studentId}/schedule`  
BACKEND HAS: Nothing confirmed beyond the frontend inventory  
MISMATCH DETAIL: Guardian child-detail endpoints are documented as not implemented.  
USED BY FEATURE: Guardian Attendance / Grades / Schedule  
PORTAL: Guardian  
PRIORITY: 🟠 High

API GAP #24  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/guardian-portal/hooks/useGuardianNotifications.ts`  
FRONTEND CALLS: `GET /api/guardians/{guardianId}/notifications`, `PATCH /api/notifications/{notificationId}/read`, `PATCH /api/guardians/{guardianId}/notifications/read-all`  
BACKEND HAS: Guardian portal inventory lists them, but guardian analysis still marks them not implemented  
MISMATCH DETAIL: `CONFLICT`: endpoint inventory exists, but feature analysis treats them as unavailable.  
USED BY FEATURE: Guardian Notifications  
PORTAL: Guardian  
PRIORITY: 🟠 High

API GAP #25  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/features/guardian-portal/hooks/useGuardianPayments.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/fees/balance`, `GET /api/students/{studentId}/payments`, `POST /api/payments/initiate`  
BACKEND HAS: Endpoint summary documents `GET /students/{studentId}/fees`, `GET /students/{studentId}/payments`, `POST /payments/chapa/initialize`, `POST /payments`, and `POST /payments/chapa/verify`  
MISMATCH DETAIL: Guardian frontend uses different fee and initiate routes than the documented payment backend summary.  
USED BY FEATURE: Guardian Payments / Chapa initiation  
PORTAL: Guardian  
PRIORITY: 🟠 High

API GAP #26  
TYPE: PATH MISMATCH  
FRONTEND HOOK/FILE: `src/features/guardian-portal/hooks/useGuardianPayments.ts`  
FRONTEND CALLS: `GET /api/students/{studentId}/fees/balance`  
BACKEND HAS: `GET /students/{studentId}/fees`  
MISMATCH DETAIL: Frontend expects a `/fees/balance` route while the API summary documents `/fees`.  
USED BY FEATURE: Guardian Fee Balance  
PORTAL: Guardian  
PRIORITY: 🟠 High

API GAP #27  
TYPE: PATH MISMATCH  
FRONTEND HOOK/FILE: `src/features/guardian-portal/hooks/useGuardianPayments.ts`  
FRONTEND CALLS: `POST /api/payments/initiate`  
BACKEND HAS: `POST /payments/chapa/initialize` and `POST /payments`  
MISMATCH DETAIL: Payment initiation path differs from the documented payments module routes.  
USED BY FEATURE: Guardian Payment Initiation  
PORTAL: Guardian  
PRIORITY: 🟠 High

API GAP #28  
TYPE: DISABLED  
FRONTEND HOOK/FILE: `src/app/[locale]/(dashboard)/dashboard/attendance/page.tsx`  
FRONTEND CALLS: Barcode/QR attendance method UI  
BACKEND HAS: NOTHING DOCUMENTED  
MISMATCH DETAIL: The barcode/QR method is presented as a mode but is disabled in the admin attendance UI.  
USED BY FEATURE: Alternate Attendance Methods  
PORTAL: Attendance  
PRIORITY: 🟡 Medium

API GAP #29  
TYPE: RESPONSE MISMATCH  
FRONTEND HOOK/FILE: `src/features/schedule/api/useSchedule.ts`  
FRONTEND CALLS: `GET /schedule/section/{sectionId}`, `GET /schedule/teacher/{teacherId}`  
BACKEND HAS: Endpoints are inventoried, but frontend deliberately converts 404 to `[]`  
MISMATCH DETAIL: The frontend treats missing routes as an empty successful schedule instead of a hard failure, masking whether the backend route actually exists.  
USED BY FEATURE: Schedule Management / Teacher Schedule  
PORTAL: Admin / Teacher  
PRIORITY: 🟡 Medium

API GAP #30  
TYPE: PAYLOAD MISMATCH  
FRONTEND HOOK/FILE: `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx`  
FRONTEND CALLS: student create submission  
BACKEND HAS: Student service documents `guardian_id` support on `POST /students`  
MISMATCH DETAIL: Admin student-create flow selects `guardian_id` but does not include it in the payload sent through the mutation.  
USED BY FEATURE: Student Creation with Guardian Link  
PORTAL: Admin  
PRIORITY: 🟡 Medium

API GAP #31  
TYPE: PAYLOAD MISMATCH  
FRONTEND HOOK/FILE: `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx`  
FRONTEND CALLS: student/teacher create-update submissions  
BACKEND HAS: Student and teacher services support `profile_image_url?` on update payloads  
MISMATCH DETAIL: Photo upload UI exists, but the documented admin form flows do not carry image information into the actual mutation payloads.  
USED BY FEATURE: Student Management / Teacher Management  
PORTAL: Admin  
PRIORITY: 🟡 Medium

API GAP #32  
TYPE: NO ERROR HANDLING  
FRONTEND HOOK/FILE: Multiple delete-style mutations noted in `API_ENDPOINTS_SUMMARY.md`  
FRONTEND CALLS: Several API calls counted in the summary as having no error handling  
BACKEND HAS: Endpoint-specific behavior not detailed  
MISMATCH DETAIL: The API summary explicitly states 8 calls have no error handling; the source set does not enumerate all eight, but the gap is documented at summary level.  
USED BY FEATURE: Cross-cutting  
PORTAL: Cross-cutting  
PRIORITY: 🟡 Medium

API GAP #33  
TYPE: MISSING  
FRONTEND HOOK/FILE: `src/app/[locale]/(dashboard)/dashboard/change-password/page.tsx`  
FRONTEND CALLS: intended dashboard password change submission  
BACKEND HAS: `POST /auth/change-password`  
MISMATCH DETAIL: The UI exists but the actual API call is commented out and never made.  
USED BY FEATURE: Dashboard Password Change  
PORTAL: Authentication  
PRIORITY: 🟡 Medium

API GAP #34  
TYPE: MISSING  
FRONTEND HOOK/FILE: Settings security and attendance tabs in `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx`  
FRONTEND CALLS: security/attendance settings persistence  
BACKEND HAS: Only `/settings/school-info`, `/settings/academic`, and `/settings/notifications` are documented  
MISMATCH DETAIL: UI exposes security and attendance settings without matching API endpoints in the documented backend contract.  
USED BY FEATURE: Settings  
PORTAL: Admin  
PRIORITY: 🟡 Medium

## Section 4: Master Business Rules List

Rule statuses in this section come from `BUSINESS_RULES.md` cross-referenced with `BUSINESS_CONTEXT_REPORT.md`.

### Access

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 1 | Password minimum length requirement | Password must be at least 8 characters. | `src/components/auth/password-strength.tsx` | ✅ Correctly implemented |  |
| 2 | Password uppercase requirement | Password must include an uppercase letter. | `src/components/auth/password-strength.tsx` | ✅ Correctly implemented |  |
| 3 | Password lowercase requirement | Password must include a lowercase letter. | `src/components/auth/password-strength.tsx` | ✅ Correctly implemented |  |
| 4 | Password number requirement | Password must include a number. | `src/components/auth/password-strength.tsx` | ✅ Correctly implemented |  |
| 5 | Password special character requirement | Password must include a special character. | `src/components/auth/password-strength.tsx` | ✅ Correctly implemented |  |
| 6 | Password strength classification | Password strength is weak/fair/good/strong based on 5 checks. | `src/components/auth/password-strength.tsx` | ✅ Correctly implemented |  |
| 7 | New password must differ from current | New password cannot equal current password. | `src/features/student-portal/components/ChangePasswordForm.tsx` | ✅ Correctly implemented |  |
| 8 | New password must match confirmation | New password and confirm password must match. | `src/features/student-portal/components/ChangePasswordForm.tsx` | ✅ Correctly implemented |  |
| 9 | Forced password change on login | Users flagged `must_change_password` are redirected to change password before other pages. | `src/components/auth/protected-route.tsx` | ✅ Correctly implemented |  |
| 10 | Role-based route access | Only allowed roles can access guarded pages. | `src/components/auth/RoleGuard.tsx` | ✅ Correctly implemented |  |
| 11 | Admin can create users | Admin, director, and registrar can create users. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 12 | Admin can edit any user | Admin can edit any user. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 13 | Director cannot edit admins | Directors can edit users except admins. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 14 | Registrar can only edit students and guardians | Registrars can only edit student/guardian users. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 15 | Admin can restore deleted users | Only admins can restore users. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 16 | Admin and director can manage roles | Only admin/director can assign roles. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 17 | Only admin can access settings | Settings page is admin-only. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 18 | Admin and director can manage academics | Academic management is limited to admin/director. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 22 | Admin and director can view analytics | Analytics dashboard is limited to admin/director. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 23 | Teachers can view their own analytics | Teachers can view teacher-scoped analytics. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 24 | Admin and director can manage notifications | Notification management is limited to admin/director. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 66 | Role-based navigation visibility | Navigation items are shown/hidden by role. | `src/lib/permissions.ts` and guarded dashboard pages | ✅ Correctly implemented |  |
| 79 | Create user page role restriction | Only admin/director/registrar can access create-user page. | `src/app/[locale]/(dashboard)/dashboard/users/create/page.tsx` | ✅ Correctly implemented |  |
| 80 | Create user requires at least one role | At least one role must be selected when creating a user. | `src/app/[locale]/(dashboard)/dashboard/users/create/page.tsx` | ✅ Correctly implemented |  |
| 81 | Create user password confirmation must match | Password and confirm password must match. | `src/app/[locale]/(dashboard)/dashboard/users/create/page.tsx` | ✅ Correctly implemented |  |
| 87 | Login redirect based on role | After login, redirect is chosen by role. | `src/app/[locale]/(auth)/login/page.tsx` | ✅ Correctly implemented |  |
| 88 | Forgot password email non-disclosure | Forgot-password success is shown regardless of whether email exists. | `src/app/[locale]/(auth)/forgot-password/page.tsx` | ✅ Correctly implemented |  |
| 89 | Create student page role restriction | Only admin/registrar can access create-student page. | `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx` | ✅ Correctly implemented |  |
| 93 | Create teacher page role restriction | Only admin/registrar can access create-teacher page. | `src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx` | ✅ Correctly implemented |  |
| 96 | Create guardian page role restriction | Only admin/registrar can access create-guardian page. | `src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx` | ✅ Correctly implemented |  |
| 100 | Analytics page role restriction | Analytics page is restricted to admin/director. | `src/app/[locale]/(dashboard)/dashboard/analytics/page.tsx` | ✅ Correctly implemented |  |
| 101 | Schedule page role restriction | Schedule page is restricted to admin/registrar. | `src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx` | ✅ Correctly implemented |  |
| 104 | User must be active to access the system (UI meaning) | Inactive users are treated as unable to access the system. | `src/app/[locale]/(dashboard)/dashboard/users/[id]/edit/page.tsx` | ✅ Correctly implemented |  |
| 105 | Role editing not allowed for own account | Users cannot edit their own roles. | `src/app/[locale]/(dashboard)/dashboard/users/[id]/edit/page.tsx` | ✅ Correctly implemented |  |
| 111 | User edit action restricted by permission and self-profile | Edit button only appears when permissions allow and the target is not self. | `src/app/[locale]/(dashboard)/dashboard/users/[id]/page.tsx` | ✅ Correctly implemented |  |
| 112 | User delete action restricted by permission and active status | Delete action appears only for active users when permission allows. | `src/app/[locale]/(dashboard)/dashboard/users/[id]/page.tsx` | ✅ Correctly implemented |  |
| 113 | User restore action restricted to inactive users with restore permission | Restore appears only for inactive users when permission allows. | `src/app/[locale]/(dashboard)/dashboard/users/[id]/page.tsx` | ✅ Correctly implemented |  |
| 124 | Guardian IDOR protection on child detail access | Guardians can only view children linked to them. | `src/app/[locale]/(dashboard)/dashboard/guardian/children/[studentId]/page.tsx` | ✅ Correctly implemented |  |
| 125 | Password change requires minimum 8 characters and confirmation match | Dashboard password change requires 8+ chars and matching confirmation. | `src/app/[locale]/(dashboard)/dashboard/change-password/page.tsx` | ✅ Correctly implemented |  |

### Enrollment

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 19 | Admin, director, and registrar can manage enrollments | Enrollment operations are limited to admin/director/registrar. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 25 | Academic year name length | Academic year name must be 4-20 characters. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 26 | Academic year end date after start date | Academic year end date must be after start date. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 27 | Term number range | Term number must be 1-4. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 28 | Term end date after start date | Term end date must be after start date. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 29 | Subject code length | Subject code must be 2-20 characters. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 30 | Subject category restriction | Subject category must be core/elective/vocational/extracurricular. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 31 | Class grade level range | Grade level must be 0-12. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 32 | Class capacity must be positive | Class capacity, if set, must be positive. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 33 | Section capacity default | Section capacity defaults to 40. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 34 | Section name length | Section name must be 1-10 characters. | `src/features/academics/types/schemas.ts` | ✅ Correctly implemented |  |
| 35 | Withdrawal reason minimum length | Withdrawal reason must be at least 5 characters. | `src/features/enrollments/types/schemas.ts` | ✅ Correctly implemented |  |
| 47 | Enrollment wizard cascade reset | Changing parent selections resets dependent enrollment fields. | `src/features/enrollments/components/EnrollmentWizard.tsx` | ✅ Correctly implemented |  |
| 48 | Section capacity enforcement | Enrollment UI prevents over-capacity section assignment. | `src/features/enrollments/components/EnrollmentWizard.tsx` | ⚠️ Partially implemented | ISSUE: `BUSINESS_RULES.md` notes there is no maximum class-size enforcement beyond UI disabling. |
| 49 | Academic year default date range | New academic year defaults use current-year date assumptions. | `src/features/academics/components/AcademicYearModal.tsx` | ✅ Correctly implemented |  |
| 90 | Student phone number format | Student phone must use Ethiopian `+251` format. | `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx` | ✅ Correctly implemented |  |
| 91 | Student date-of-birth age range | Student DOB must fall within allowed age range. | `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx` | ✅ Correctly implemented |  |
| 92 | Ministry exam result range | Ministry exam result must be 0-100. | `src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx` | ✅ Correctly implemented |  |
| 95 | Teacher phone number format | Teacher phone must use Ethiopian `+251` format. | `src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx` | ✅ Correctly implemented |  |
| 97 | Guardian relationship type restriction | Guardian relationship must be chosen from predefined values. | `src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx` | ✅ Correctly implemented |  |
| 98 | Guardian phone number format | Guardian phone must use Ethiopian `+251` format. | `src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx` | ✅ Correctly implemented |  |
| 99 | Link students requires at least one selection | At least one student must be selected before link action. | `src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx` | ✅ Correctly implemented |  |
| 106 | Empty phone number is omitted on guardian update | Blank guardian phone is removed from update payload. | `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/edit/page.tsx` | ✅ Correctly implemented |  |
| 107 | Student status options restriction | Student status must be one of active/graduated/transferred/expelled/withdrawn. | `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx` | ✅ Correctly implemented |  |
| 108 | Empty student optional fields omitted on update | Blank optional student fields are removed from update payload. | `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx` | ✅ Correctly implemented |  |
| 110 | Empty teacher phone number omitted on update | Blank teacher phone is removed from update payload. | `src/app/[locale]/(dashboard)/dashboard/teachers/[id]/edit/page.tsx` | ✅ Correctly implemented |  |
| 115 | Guardian-student link requires selected student | Student selection is required before guardian link submit. | `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx` | ✅ Correctly implemented |  |
| 116 | Guardian detail page uses fixed relationship type for linking | Guardian detail link flow always sends `relationship_type: 'guardian'`. | `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx` | ✅ Correctly implemented |  |
| 121 | Enrollment transfer/withdraw actions restricted to active enrollments | Transfer and withdraw actions only appear for active enrollments. | `src/app/[locale]/(dashboard)/dashboard/enrollments/page.tsx` | ✅ Correctly implemented |  |
| 126 | Prevent duplicate enrollment in same section | Same student should not be enrolled twice into the same section. | Missing from documented code | ❌ Missing from code but should exist | ISSUE: `BUSINESS_RULES.md` lists this as a missing rule. |
| 127 | Prevent grade entry before assessment date | Grades should not be entered before the assessment date. | Missing from documented code | ❌ Missing from code but should exist | ISSUE: `BUSINESS_RULES.md` lists this as a missing rule. |
| 128 | Enforce minimum subjects per class | Classes should require a minimum subject load. | Missing from documented code | ❌ Missing from code but should exist | ISSUE: `BUSINESS_RULES.md` lists this as a missing rule. |
| 129 | Teacher workload limit | Teacher subject/class assignment should respect workload limits. | Missing from documented code | ❌ Missing from code but should exist | ISSUE: `BUSINESS_RULES.md` lists this as a missing rule. |
| 130 | Guardian relationship limit | A guardian should have governed limits or rules for linked students/relationships. | Missing from documented code | ❌ Missing from code but should exist | ISSUE: `BUSINESS_RULES.md` lists this as a missing rule. |

### Attendance

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 20 | Teachers can take attendance | Teacher/admin/registrar can mark attendance. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 36 | Attendance status enumeration | Attendance status is limited to present/absent/late/excused. | `src/features/attendance/types/index.ts` | ✅ Correctly implemented |  |
| 40 | Risk calculation consecutive absence threshold | Consecutive absences contribute to risk scoring from a default threshold of 3. | `src/features/analytics/utils/calculateRisk.ts` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` flags risk thresholds as policy-sensitive and potentially school-specific. |
| 44 | Student dashboard attendance color threshold | Attendance color coding uses thresholds for visual state. | `src/features/student-portal/components/StudentDashboardHome.tsx` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` explicitly questions the chosen threshold. |
| 46 | Face attendance duplicate handling | Existing attendance is checked before re-submission. | `src/features/teacher/hooks/useTeacherAttendance.ts` | ✅ Correctly implemented |  |
| 50 | Face enrollment capture requirement | Face enrollment requires multiple captures. | `src/app/[locale]/(dashboard)/dashboard/attendance/face-enrollment/page.tsx` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` flags the required capture count as policy/accuracy dependent. |
| 62 | Attendance warning display threshold | Attendance warning banners use threshold-based display logic. | `src/features/student-portal/components/AttendanceWarningBanner.tsx` | ✅ Correctly implemented |  |
| 64 | Late arrival time threshold | Late arrival is judged against a fixed time threshold. | `src/features/attendance/components/*` and settings usage described in `BUSINESS_RULES.md` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` says the hardcoded threshold may not be configurable for all schools. |
| 65 | Face recognition confidence threshold | Face-recognition decisions use a configured confidence threshold. | `src/features/attendance/hooks/useFaceModels.ts` and settings-driven logic | ✅ Correctly implemented |  |
| 82 | Academic settings attendance warning threshold range | Attendance warning threshold must stay within configured range. | `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx` | ✅ Correctly implemented |  |
| 83 | Academic settings face recognition confidence threshold range | Face-recognition confidence threshold must stay within configured range. | `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx` | ✅ Correctly implemented |  |
| 131 | Prevent attendance marking for future dates | Attendance should not be markable for future dates. | Missing from documented code | ❌ Missing from code but should exist | ISSUE: `BUSINESS_RULES.md` lists this as a missing rule. |

### Grading

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 21 | Teachers and admins can enter grades | Grade entry is limited to teacher/admin roles. | `src/lib/permissions.ts` | ✅ Correctly implemented |  |
| 37 | Grade score validation range | Grade score must be between 0 and total marks. | `src/features/teacher/hooks/useTeacherGrades.ts` | ✅ Correctly implemented |  |
| 45 | Student dashboard score color threshold | Student dashboard score colors are threshold-based. | `src/features/student-portal/components/StudentDashboardHome.tsx` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` explicitly questions the chosen threshold. |
| 51 | Grade letter calculation scale | Letter grades are derived from percentage thresholds. | `src/features/analytics/utils/calculateRisk.ts` and grade display logic referenced in `BUSINESS_RULES.md` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` questions whether the hardcoded scale matches real school policy. |
| 52 | Grade input range enforcement | Grade inputs enforce min/max boundaries. | `src/app/[locale]/(dashboard)/dashboard/grades/page.tsx` and teacher grade hooks | ✅ Correctly implemented |  |
| 60 | Grade entry pagination size | Grade entry uses a fixed page size. | `src/features/teacher/components/TeacherGradeEntry.tsx` | ✅ Correctly implemented |  |
| 61 | Bulk grade quick-set values | Bulk grade entry offers preset values/actions. | `src/features/teacher/components/TeacherGradeEntry.tsx` | ✅ Correctly implemented |  |
| 63 | Report card passing threshold | Report cards use passing-threshold logic from academic settings/defaults. | `src/features/student-portal/components/StudentReportCard.tsx` and settings usage | ✅ Correctly implemented |  |
| 78 | Teacher grade score validation | Teacher score submission rejects values outside valid range. | `src/features/teacher/hooks/useTeacherGrades.ts` | ✅ Correctly implemented |  |
| 84 | Academic settings default grading scale | Academic settings define default grade thresholds. | `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx` | ✅ Correctly implemented |  |
| 122 | Assessment weight must be between 1 and 100 | Assessment weight input is restricted to 1-100. | `src/app/[locale]/(dashboard)/dashboard/grades/page.tsx` | ✅ Correctly implemented |  |
| 123 | Letter grade scale thresholds | Letter grades map from percentage thresholds. | `src/app/[locale]/(dashboard)/dashboard/grades/page.tsx` | ✅ Correctly implemented |  |

### Fees

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 53 | Payment amount validation | Payment amount must be a valid positive amount. | `src/features/payments/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 54 | Payment required fields | Payment records require core identifying fields. | `src/features/payments/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 55 | Payment transaction reference format | Payment reference values follow a constrained format. | `src/features/payments/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |

### Schedule

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 58 | Schedule day of week encoding | Schedule day values follow a defined day-of-week scheme. | `src/features/schedule/types/index.ts` and timetable components | ✅ Correctly implemented |  |
| 59 | Schedule time format | Schedule entries use consistent time formatting. | `src/features/schedule/types/index.ts` and timetable components | ✅ Correctly implemented |  |
| 68 | Schedule teacher conflict detection | Teacher should not be double-booked in schedule logic. | `src/features/schedule/components/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 69 | Schedule room conflict detection | Room should not be double-booked in schedule logic. | `src/features/schedule/components/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 70 | Schedule section conflict detection | Section should not have overlapping schedule entries. | `src/features/schedule/components/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 102 | Schedule filter cascade resets | Changing year/class resets dependent selections. | `src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx` | ✅ Correctly implemented |  |
| 103 | Schedule term/section selection requires prerequisites | Term needs year first; section needs class first. | `src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx` | ✅ Correctly implemented |  |

### Status

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 38 | Risk calculation attendance threshold | Low attendance contributes to risk score using configured/default threshold. | `src/features/analytics/utils/calculateRisk.ts` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` flags risk thresholds as potentially school-specific. |
| 39 | Risk calculation grade threshold | Low grade average contributes to risk score using configured/default threshold. | `src/features/analytics/utils/calculateRisk.ts` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` flags risk thresholds as potentially school-specific. |
| 41 | Critical risk level determination | Critical risk is assigned by hardcoded attendance/grade/absence thresholds or score 80+. | `src/features/analytics/utils/calculateRisk.ts` | ⚠️ Questionable — may not match real school practice | ISSUE: Thresholds are documented as policy-sensitive. |
| 42 | High risk level determination | High risk uses defined threshold bands or score 50+. | `src/features/analytics/utils/calculateRisk.ts` | ⚠️ Questionable — may not match real school practice | ISSUE: Thresholds are documented as policy-sensitive. |
| 43 | Medium risk level determination | Medium risk uses defined threshold bands below high/critical. | `src/features/analytics/utils/calculateRisk.ts` | ⚠️ Questionable — may not match real school practice | ISSUE: Thresholds are documented as policy-sensitive. |
| 76 | At-risk attendance color thresholds | At-risk attendance colors use thresholds different from student dashboard thresholds. | `src/features/analytics/components/*` and student dashboard components | 🔴 Conflicting — contradicts another rule | ISSUE: `BUSINESS_RULES.md` explicitly says the at-risk color thresholds differ from student dashboard thresholds. |
| 77 | At-risk grade color thresholds | At-risk grade colors use thresholds different from student dashboard thresholds. | `src/features/analytics/components/*` and student dashboard components | 🔴 Conflicting — contradicts another rule | ISSUE: `BUSINESS_RULES.md` explicitly says the at-risk color thresholds differ from student dashboard thresholds. |

### Other

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 56 | Notification priority levels | Notification priority is limited to defined priority levels. | `src/features/notifications/types/index.ts` | ✅ Correctly implemented |  |
| 57 | Notification type enumeration | Notification type is limited to documented categories. | `src/features/notifications/types/index.ts` | ✅ Correctly implemented |  |
| 67 | Real-time toast minimum priority | Realtime toasts follow minimum-priority display logic. | `src/features/notifications/hooks/useRealtimeToasts.ts` | ✅ Correctly implemented |  |
| 71 | Alert rule consecutive absence range | Consecutive-absence alert threshold has bounded range. | `src/features/notifications/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 72 | Alert rule percentage threshold range | Percentage-based alert thresholds have bounded range. | `src/features/notifications/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 73 | Alert rule fee overdue range | Fee-overdue rule uses bounded threshold values. | `src/features/notifications/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 74 | SMS segment calculation | SMS content length is converted into message segments. | `src/features/notifications/*` as documented in `BUSINESS_RULES.md` | ✅ Correctly implemented |  |
| 75 | SMS cost calculation | SMS cost is derived from segment count with fixed pricing. | `src/features/notifications/*` as documented in `BUSINESS_RULES.md` | ⚠️ Questionable — may not match real school practice | ISSUE: `BUSINESS_RULES.md` says the hardcoded SMS unit cost may not match provider pricing. |
| 85 | Notification settings default consecutive absence threshold | Notification settings define default absence threshold. | `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx` | ✅ Correctly implemented |  |
| 86 | Alert rule threshold display fallbacks | Alert-rule displays use fallback text/values when thresholds are missing. | `src/features/notifications/components/*` | ✅ Correctly implemented |  |
| 94 | Teacher hire date cannot be in the future | Teacher hire date must be today or earlier. | `src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx` | ✅ Correctly implemented |  |
| 109 | Teacher status options restriction | Teacher status is limited to active/on_leave/suspended/resigned/retired. | `src/app/[locale]/(dashboard)/dashboard/teachers/[id]/edit/page.tsx` | ✅ Correctly implemented |  |
| 114 | Guardian relationship badge color mapping | Relationship types map to fixed badge colors. | `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx` | ✅ Correctly implemented |  |
| 117 | Guardian delete warning includes linked student count | Delete warning includes the number of linked students. | `src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx` | ✅ Correctly implemented |  |
| 118 | Academic year "set as current" restricted by status | Year can only be set current when not archived/completed/current. | `src/app/[locale]/(dashboard)/dashboard/academics/years/page.tsx` | ✅ Correctly implemented |  |
| 119 | Academic year "archive" only shown for completed years | Archive action appears only for completed years. | `src/app/[locale]/(dashboard)/dashboard/academics/years/page.tsx` | ✅ Correctly implemented |  |
| 120 | Term "set as active" restricted to non-active terms | Set-as-active action appears only when term is not active. | `src/app/[locale]/(dashboard)/dashboard/academics/years/[yearId]/page.tsx` | ✅ Correctly implemented |  |

### Additional Missing Rules From Source Documents

| Rule # | Name | Plain English | Where in Code | Status | Issue |
|---|---|---|---|---|---|
| 132 | Fee deadlines and penalties | Fee due-date penalties should be enforceable in the system. | Missing from documented code | ❌ Missing from code but should exist | ISSUE: `BUSINESS_CONTEXT_REPORT.md` calls out missing fee payment deadline and penalty rules. |

## Section 5: Master Data Model

Sources synthesized in this section:
- `DATA_MODEL_CORE.md`
- `DATA_MODEL_ACADEMIC.md`
- `DATA_MODEL_API_TYPES.md`
- `DATA_MODEL_ENROLLMENT_ATTENDANCE.md`
- `DATA_MODEL_GRADES_PAYMENTS_NOTIFICATIONS_ANALYTICS.md`
- `DATA_MODEL_HOOKS_TEMPLATES.md`
- `DATA_MODEL_SUMMARY.md`
- `DATA_MODEL_ZOD_FORMS.md`

Merged-entity notes:
- Duplicates were merged under one entity heading.
- Closely related summary/computed types and payload/filter/form types were kept because `DATA_MODEL_SUMMARY.md` explicitly counts them as part of the frontend data model.
- `MISSING FIELDS` only lists gaps explicitly implied by the source documents; no new fields were invented.

### Core Entities

ENTITY: User  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique identifier for the user |
| email | string | Yes | User email address |
| first_name | string | Yes | User first name |
| last_name | string | Yes | User last name |
| roles | string[] | Yes | Assigned role names |
| must_change_password | boolean | Yes | Whether password must be changed at next login |

RELATIONSHIPS:
- Many-to-Many with `Role` via `user.roles`
- One-to-Many to `Notification` as recipient
- One-to-Many to `AttendanceRecord` as marker
- Referenced as guardian/teacher identity in permission-driven flows

VALIDATION RULES:
- No entity-specific Zod schema documented

MISSING FIELDS:
- `full_name` is used widely in API payloads/service types but is not present on the auth-store `User` entity
- `is_active` is used in user-management UI logic but is not present on the auth-store `User` entity
- `phone_number`, `address`, and `profile_image_url` appear in payload/update types but not on this core entity

ENTITY: Student  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique student identifier |
| student_id | string | Yes | Student ID / registration number |
| first_name | string | Yes | Student first name |
| last_name | string | Yes | Student last name |
| date_of_birth | string | Yes | Student birth date |
| gender | string | Yes | Student gender |
| enrollment_date | string | Yes | Date student enrolled |
| enrollment_status | string | Yes | Enrollment status |
| guardian_id | number | Yes | Linked guardian ID |
| class_id | number | No | Linked class ID |
| section_id | number | No | Linked section ID |
| academic_year_id | number | No | Active academic year ID |
| photo_url | string | No | Student photo URL |
| address | string | No | Student address |
| phone | string | No | Student phone number |
| email | string | No | Student email |
| emergency_contact_name | string | No | Emergency contact name |
| emergency_contact_phone | string | No | Emergency contact phone |
| medical_conditions | string | No | Medical conditions/allergies |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Guardian`
- Many-to-One to `Class`
- Many-to-One to `Section`
- Many-to-One to `AcademicYear`
- One-to-Many to `AttendanceRecord`
- One-to-Many to `Grade`
- One-to-Many to `Enrollment`
- Many portal-specific summary/detail models derive from this entity

VALIDATION RULES:
- Student creation phone must match Ethiopian `+251` format
- DOB must fall within allowed age range
- Ministry exam result must be 0-100 if present
- Empty optional fields may be removed from update payloads

MISSING FIELDS:
- `status` appears in `StudentUpdatePayload` and admin edit UI, while core entity names it `enrollment_status`
- `full_name` appears in service payloads but not as a stored field here
- `sex` is used in create payloads while this entity uses `gender`
- `admission_date` appears in create payloads while entity uses `enrollment_date`
- Student-create payload documentation does not include guardian-link metadata beyond `guardian_id`

ENTITY: Teacher  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique teacher identifier |
| teacher_id | string | Yes | Teacher ID number |
| first_name | string | Yes | Teacher first name |
| last_name | string | Yes | Teacher last name |
| email | string | Yes | Teacher email |
| phone | string | No | Teacher phone |
| subject_specialization | string | No | Primary specialization |
| qualification | string | No | Academic qualification |
| hire_date | string | Yes | Hire date |
| employment_status | string | Yes | Employment status |
| photo_url | string | No | Teacher photo URL |
| address | string | No | Teacher address |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- One-to-Many to `Class` as class teacher
- One-to-Many to `SubjectAssignment`
- One-to-Many to `Grade` as grader
- One-to-Many to `Schedule`

VALIDATION RULES:
- Teacher phone must match Ethiopian `+251` format
- Hire date cannot be in the future
- Empty phone may be omitted from update payload

MISSING FIELDS:
- `status` appears in `TeacherUpdatePayload` while core entity uses `employment_status`
- `specialization` appears in payloads while core entity uses `subject_specialization`
- `date_of_birth`, `sex`, `emergency_contact_name`, `emergency_contact_phone`, and `office_location` appear in payload types but not in the core entity
- `full_name` appears in payload types but the core entity splits first/last name

ENTITY: Guardian  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique guardian identifier |
| guardian_id | string | Yes | Guardian ID number |
| first_name | string | Yes | Guardian first name |
| last_name | string | Yes | Guardian last name |
| email | string | Yes | Guardian email |
| phone | string | No | Guardian phone |
| relationship | string | Yes | Relationship to student |
| address | string | No | Guardian address |
| occupation | string | No | Guardian occupation |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- One-to-Many to `Student`
- One-to-Many to `Notification`
- Uses `StudentLinkPayload` for explicit guardian-student linking behavior

VALIDATION RULES:
- Guardian phone must match Ethiopian `+251` format
- Relationship type must be chosen from predefined options
- Empty phone may be omitted from update payload

MISSING FIELDS:
- `workplace`, `profile_image_url`, and `is_active` appear in guardian payload/update types but not on the core entity
- `full_name` is used in payloads while the core entity splits names
- Link-management flags like `is_primary`, `is_emergency_contact`, and `can_pickup` only exist in `StudentLinkPayload`, not on the core guardian entity

ENTITY: Class  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique class identifier |
| class_name | string | Yes | Class name |
| academic_year_id | number | Yes | Parent academic year ID |
| class_teacher_id | number | No | Assigned class teacher ID |
| capacity | number | No | Maximum class capacity |
| description | string | No | Class description |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `AcademicYear`
- Many-to-One to `Teacher`
- One-to-Many to `Section`
- One-to-Many to `Student`
- One-to-Many to `SubjectAssignment`
- One-to-Many to `Schedule`
- One-to-Many to `Enrollment`

VALIDATION RULES:
- Grade level must be 0-12 in `ClassForm`
- Capacity must be positive if present

MISSING FIELDS:
- `grade_level` exists in `ClassForm` and create/update payload usage but is absent from the core class entity table
- `name` is used in forms/payloads while the core entity uses `class_name`

ENTITY: Section  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique section identifier |
| section_name | string | Yes | Section name |
| class_id | number | Yes | Parent class ID |
| room_number | string | No | Assigned room number |
| capacity | number | No | Section capacity |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Class`
- One-to-Many to `Student`
- One-to-Many to `Schedule`
- One-to-Many to `Enrollment`

VALIDATION RULES:
- Name must be 1-10 characters
- Capacity defaults to 40 and must be positive

MISSING FIELDS:
- `homeroom_teacher_id` exists in `SectionForm` but not in the core entity table
- `name` is used in forms/payloads while the core entity uses `section_name`

ENTITY: Role  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Role name |

RELATIONSHIPS:
- Many-to-Many with `User`

VALIDATION RULES:
- Role values are constrained by documented role lists and permission helpers

MISSING FIELDS:
- No additional fields documented

### Academic Entities

ENTITY: AcademicYear  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique academic year identifier |
| year_name | string | Yes | Academic year name |
| start_date | string | Yes | Start date |
| end_date | string | Yes | End date |
| is_active | boolean | Yes | Whether this year is active/current |
| description | string | No | Description |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- One-to-Many to `Term`
- One-to-Many to `Class`
- One-to-Many to `Enrollment`
- One-to-Many to `Student`
- Many fee definitions reference it through `FeeStructure`

VALIDATION RULES:
- Name must be 4-20 characters
- End date must be after start date

MISSING FIELDS:
- Forms/payloads use `name`; core entity uses `year_name`
- Status concepts like `planning`, `completed`, and `archived` are used in business rules/UI but are not listed in this entity table

ENTITY: Term  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique term identifier |
| term_name | string | Yes | Term name |
| academic_year_id | number | Yes | Parent academic year ID |
| start_date | string | Yes | Start date |
| end_date | string | Yes | End date |
| is_active | boolean | Yes | Whether term is active |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `AcademicYear`
- One-to-Many to `Assessment`
- One-to-Many to `Grade`

VALIDATION RULES:
- Term number must be 1-4 in `TermForm`
- End date must be after start date

MISSING FIELDS:
- `term_number` exists in `TermForm` but not in the core term entity table
- Forms/payloads use `name`; core entity uses `term_name`

ENTITY: Subject  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique subject identifier |
| subject_code | string | Yes | Subject code |
| subject_name | string | Yes | Subject name |
| description | string | No | Description |
| credit_hours | number | No | Credit/load value |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- One-to-Many to `SubjectAssignment`
- One-to-Many to `Assessment`
- One-to-Many to `Grade`

VALIDATION RULES:
- Code must be 2-20 characters
- Category must be one of core/elective/vocational/extracurricular in `SubjectForm`

MISSING FIELDS:
- `category` exists in `SubjectForm` and business rules but not in the core subject entity table
- Forms/payloads use `code` and `name`; core entity uses `subject_code` and `subject_name`

ENTITY: SubjectAssignment  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique assignment identifier |
| class_id | number | Yes | Parent class ID |
| subject_id | number | Yes | Linked subject ID |
| teacher_id | number | Yes | Linked teacher ID |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Class`
- Many-to-One to `Subject`
- Many-to-One to `Teacher`
- One-to-Many to `Schedule`

VALIDATION RULES:
- No separate Zod form documented

MISSING FIELDS:
- No additional fields documented

ENTITY: Assessment  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique assessment identifier |
| assessment_name | string | Yes | Assessment name |
| subject_id | number | Yes | Linked subject ID |
| term_id | number | Yes | Linked term ID |
| assessment_type | string | Yes | Assessment type |
| max_score | number | Yes | Maximum score |
| weight | number | Yes | Weight in final calculation |
| assessment_date | string | Yes | Assessment date |
| description | string | No | Description |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Subject`
- Many-to-One to `Term`
- One-to-Many to `Grade`

VALIDATION RULES:
- Weight must be between 1 and 100
- Score-entry logic validates against total marks

MISSING FIELDS:
- No additional fields documented

ENTITY: Schedule  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique schedule identifier |
| class_id | number | Yes | Linked class ID |
| section_id | number | No | Linked section ID |
| subject_id | number | Yes | Linked subject ID |
| teacher_id | number | Yes | Linked teacher ID |
| day_of_week | string | Yes | Day of week |
| start_time | string | Yes | Start time |
| end_time | string | Yes | End time |
| room_number | string | No | Room number |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Class`
- Many-to-One to `Section`
- Many-to-One to `Subject`
- Many-to-One to `Teacher`

VALIDATION RULES:
- Uses day-of-week encoding and time-format constraints
- Conflict-detection rules are documented for teacher, room, and section collisions

MISSING FIELDS:
- No additional fields documented

### Enrollment and Attendance Entities

ENTITY: Enrollment  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique enrollment identifier |
| student_id | number | Yes | Student ID |
| class_id | number | Yes | Class ID |
| section_id | number | No | Section ID |
| academic_year_id | number | Yes | Academic year ID |
| enrollment_date | string | Yes | Enrollment date |
| enrollment_status | string | Yes | Enrollment status |
| withdrawal_date | string | No | Withdrawal date |
| transfer_date | string | No | Transfer date |
| notes | string | No | Notes |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Student`
- Many-to-One to `Class`
- Many-to-One to `Section`
- Many-to-One to `AcademicYear`
- One-to-Many to `AttendanceRecord`

VALIDATION RULES:
- Transfer and withdrawal forms constrain required IDs/dates and reason length
- Transfer/withdraw actions are only shown for active enrollments

MISSING FIELDS:
- `status` is used in UI/service filters while the core entity uses `enrollment_status`
- No duplicate-enrollment prevention field/rule is documented

ENTITY: AttendanceRecord  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique attendance record ID |
| student_id | number | Yes | Student ID |
| class_id | number | Yes | Class ID |
| section_id | number | No | Section ID |
| date | string | Yes | Attendance date |
| status | string | Yes | Attendance status |
| notes | string | No | Notes |
| marked_by | number | No | Marking user ID |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Student`
- Many-to-One to `Class`
- Many-to-One to `Section`
- Many-to-One to `User`

VALIDATION RULES:
- Status limited to present/absent/late/excused
- Duplicate-handling logic exists for teacher attendance submission flow

MISSING FIELDS:
- Some business rules mention future-date prevention, but no such documented field or enforcement flag exists

ENTITY: AttendanceSummary  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| student_id | number | Yes | Student ID |
| total_days | number | Yes | Total school days |
| present_days | number | Yes | Days present |
| absent_days | number | Yes | Days absent |
| late_days | number | Yes | Days late |
| excused_days | number | Yes | Excused absences |
| attendance_rate | number | Yes | Attendance percentage |

RELATIONSHIPS:
- Many-to-One to `Student`

VALIDATION RULES:
- Used by warning thresholds and dashboard color logic

MISSING FIELDS:
- No additional fields documented

### Grades, Payments, Notifications, and Analytics Entities

ENTITY: Grade  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique grade identifier |
| student_id | number | Yes | Student ID |
| subject_id | number | Yes | Subject ID |
| assessment_id | number | Yes | Assessment ID |
| term_id | number | Yes | Term ID |
| score | number | Yes | Raw score |
| max_score | number | Yes | Maximum score |
| percentage | number | Yes | Percentage score |
| letter_grade | string | No | Letter grade |
| comments | string | No | Teacher comments |
| graded_by | number | No | Grading teacher ID |
| graded_date | string | No | Date graded |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Student`
- Many-to-One to `Subject`
- Many-to-One to `Assessment`
- Many-to-One to `Term`
- Many-to-One to `Teacher`

VALIDATION RULES:
- Score must remain within 0 and total marks
- Letter-grade logic and passing thresholds are documented

MISSING FIELDS:
- No additional fields documented

ENTITY: GradeSummary  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| student_id | number | Yes | Student ID |
| subject_id | number | Yes | Subject ID |
| term_id | number | Yes | Term ID |
| average_score | number | Yes | Average score |
| average_percentage | number | Yes | Average percentage |
| letter_grade | string | No | Overall letter grade |
| total_assessments | number | Yes | Assessment count |
| rank | number | No | Student rank |

RELATIONSHIPS:
- Many-to-One to `Student`
- Many-to-One to `Subject`
- Many-to-One to `Term`

VALIDATION RULES:
- Uses passing-threshold and letter-grade display logic

MISSING FIELDS:
- No additional fields documented

ENTITY: Payment  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique payment identifier |
| student_id | number | Yes | Student ID |
| payment_type | string | Yes | Payment type |
| amount | number | Yes | Payment amount |
| payment_date | string | Yes | Payment date |
| payment_method | string | Yes | Payment method |
| payment_status | string | Yes | Payment status |
| due_date | string | No | Due date |
| reference_number | string | No | Transaction reference |
| description | string | No | Description |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `Student`
- Often paired with `FeeStructure`

VALIDATION RULES:
- Payment amount, required fields, and reference-format rules are documented

MISSING FIELDS:
- No additional fields documented

ENTITY: FeeStructure  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique fee structure ID |
| fee_name | string | Yes | Fee name |
| fee_type | string | Yes | Fee type |
| amount | number | Yes | Fee amount |
| academic_year_id | number | Yes | Academic year ID |
| class_id | number | No | Class-specific fee class ID |
| due_date | string | No | Due date |
| is_recurring | boolean | Yes | Recurring flag |
| recurrence_period | string | No | Recurrence period |
| description | string | No | Description |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `AcademicYear`
- Many-to-One to `Class`
- One-to-Many to `Payment`

VALIDATION RULES:
- Fee deadline/penalty business rules are missing according to business-context analysis

MISSING FIELDS:
- No additional fields documented

ENTITY: Notification  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique notification ID |
| recipient_id | number | Yes | Recipient user ID |
| recipient_type | string | Yes | Recipient type |
| title | string | Yes | Notification title |
| message | string | Yes | Notification body |
| notification_type | string | Yes | Notification type |
| priority | string | Yes | Priority level |
| is_read | boolean | Yes | Read flag |
| read_at | string | No | Read timestamp |
| action_url | string | No | Click-through URL |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- Many-to-One to `User`
- Often generated from `NotificationRule`

VALIDATION RULES:
- Type and priority enumerations are documented

MISSING FIELDS:
- No additional fields documented

ENTITY: NotificationRule  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique rule ID |
| rule_name | string | Yes | Rule name |
| rule_type | string | Yes | Trigger type |
| threshold_value | number | Yes | Threshold that triggers the rule |
| is_enabled | boolean | Yes | Active flag |
| recipient_roles | string[] | Yes | Recipient role list |
| notification_template | string | No | Template text |
| created_at | string | Yes | Record creation timestamp |
| updated_at | string | Yes | Record update timestamp |

RELATIONSHIPS:
- One-to-Many to `Notification`

VALIDATION RULES:
- Consecutive-absence, percentage, and fee-overdue threshold ranges are documented

MISSING FIELDS:
- Configuration flexibility appears elsewhere as `config?: Record<string, any>` in notification types, but is not represented on this core rule entity table

ENTITY: AnalyticsData  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | number | Yes | Unique analytics record ID |
| metric_name | string | Yes | Metric name |
| metric_value | number | Yes | Metric value |
| metric_type | string | Yes | Metric type |
| entity_type | string | Yes | Entity category |
| entity_id | number | No | Specific entity ID |
| period_start | string | Yes | Analysis start date |
| period_end | string | Yes | Analysis end date |
| breakdown | string | No | Breakdown dimension |
| created_at | string | Yes | Record creation timestamp |

RELATIONSHIPS:
- Aggregated data only; no direct entity ownership documented

VALIDATION RULES:
- Used by dashboard/analytics calculations and risk classification logic

MISSING FIELDS:
- No additional fields documented

ENTITY: SchoolStatistics  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| total_students | number | Yes | Total students |
| total_teachers | number | Yes | Total teachers |
| total_classes | number | Yes | Total classes |
| total_subjects | number | Yes | Total subjects |
| average_attendance_rate | number | Yes | School-wide attendance average |
| average_grade | number | Yes | School-wide grade average |
| active_academic_year | string | Yes | Active academic year name |
| report_date | string | Yes | Report date |

RELATIONSHIPS:
- Aggregated/statistical summary only

VALIDATION RULES:
- No separate Zod schema documented

MISSING FIELDS:
- No additional fields documented

### API Service Types

ENTITY: UserFilters  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| page | number | No | Page number |
| size | number | No | Page size |
| search | string | No | Search query |
| is_active | boolean | No | Active-status filter |
| role | string | No | Role filter |
| sort_by | `'created_at' \| 'full_name' \| 'email'` | No | Sort field |
| sort_order | `'asc' \| 'desc'` | No | Sort direction |
| [key: string] | any | No | Additional filter params |

RELATIONSHIPS:
- Supports list retrieval for `User`

VALIDATION RULES:
- Sort values constrained to listed fields

MISSING FIELDS:
- None documented; note that the `any` index signature is treated as a type-safety concern elsewhere

ENTITY: UserCreatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| email | string | Yes | User email |
| full_name | string | Yes | Full name |
| password | string | No | Password |
| phone_number | string | No | Phone |
| address | string | No | Address |
| role_names | string[] | Yes | Role names |

RELATIONSHIPS:
- Creates `User`

VALIDATION RULES:
- Password confirmation and at least one role are enforced in page-level forms

MISSING FIELDS:
- No additional fields documented

ENTITY: UserUpdatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| full_name | string | No | Full name |
| phone_number | string | No | Phone |
| address | string | No | Address |
| profile_image_url | string | No | Profile image URL |
| is_active | boolean | No | Active status |

RELATIONSHIPS:
- Updates `User`

VALIDATION RULES:
- Permission-based access to edit actions is documented

MISSING FIELDS:
- Role updates use a separate `/users/{id}/roles` contract and are not part of this payload

ENTITY: StudentFilters  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| page | number | No | Page number |
| size | number | No | Page size |
| search | string | No | Search query |
| status | `'active' \| 'graduated' \| 'transferred' \| 'expelled' \| 'withdrawn'` | No | Status filter |
| is_active | boolean | No | Active filter |
| sex | `'M' \| 'F'` | No | Gender filter |
| nationality | string | No | Nationality filter |
| sort_by | `'created_at' \| 'full_name' \| 'registration_number' \| 'admission_date'` | No | Sort field |
| sort_order | `'asc' \| 'desc'` | No | Sort direction |
| [key: string] | any | No | Additional filter params |

RELATIONSHIPS:
- Supports list retrieval for `Student`

VALIDATION RULES:
- Enumerated status and sex values

MISSING FIELDS:
- No additional fields documented

ENTITY: StudentCreatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| email | string | Yes | Student email |
| full_name | string | Yes | Full name |
| phone_number | string | No | Phone |
| address | string | No | Address |
| password | string | No | Password |
| admission_date | string | Yes | Admission date |
| date_of_birth | string | Yes | Date of birth |
| sex | `'M' \| 'F'` | Yes | Sex |
| nationality | string | No | Nationality |
| previous_school | string | No | Previous school |
| ministry_exam_result | number | No | Ministry exam score |

RELATIONSHIPS:
- Creates `Student`

VALIDATION RULES:
- Phone, age range, and ministry exam result validations are documented

MISSING FIELDS:
- `guardian_id` is discussed in portal analysis but is absent from this documented API payload table even though the admin analysis mentions it in service usage

ENTITY: StudentUpdatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| full_name | string | No | Full name |
| phone_number | string | No | Phone |
| address | string | No | Address |
| profile_image_url | string | No | Photo URL |
| is_active | boolean | No | Active status |
| status | string | No | Enrollment status |
| nationality | string | No | Nationality |
| previous_school | string | No | Previous school |
| ministry_exam_result | number | No | Ministry exam score |

RELATIONSHIPS:
- Updates `Student`

VALIDATION RULES:
- Empty optional fields may be removed before submission

MISSING FIELDS:
- No additional fields documented

ENTITY: TeacherFilters  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| page | number | No | Page number |
| size | number | No | Page size |
| search | string | No | Search query |
| status | `'active' \| 'on_leave' \| 'suspended' \| 'resigned' \| 'retired'` | No | Status filter |
| is_active | boolean | No | Active filter |
| specialization | string | No | Specialization filter |
| sort_by | `'created_at' \| 'full_name' \| 'employee_id' \| 'hire_date'` | No | Sort field |
| sort_order | `'asc' \| 'desc'` | No | Sort direction |
| [key: string] | any | No | Additional filter params |

RELATIONSHIPS:
- Supports list retrieval for `Teacher`

VALIDATION RULES:
- Enumerated status values

MISSING FIELDS:
- No additional fields documented

ENTITY: TeacherCreatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| email | string | Yes | Teacher email |
| full_name | string | Yes | Full name |
| phone_number | string | No | Phone |
| address | string | No | Address |
| password | string | No | Password |
| hire_date | string | Yes | Hire date |
| date_of_birth | string | Yes | Date of birth |
| sex | `'M' \| 'F'` | Yes | Sex |
| qualification | string | No | Qualification |
| specialization | string | No | Specialization |
| emergency_contact_name | string | No | Emergency contact name |
| emergency_contact_phone | string | No | Emergency contact phone |
| office_location | string | No | Office location |

RELATIONSHIPS:
- Creates `Teacher`

VALIDATION RULES:
- Hire date and phone format validations are documented

MISSING FIELDS:
- No additional fields documented

ENTITY: TeacherUpdatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| full_name | string | No | Full name |
| phone_number | string | No | Phone |
| address | string | No | Address |
| profile_image_url | string | No | Photo URL |
| is_active | boolean | No | Active status |
| status | string | No | Teacher status |
| qualification | string | No | Qualification |
| specialization | string | No | Specialization |
| emergency_contact_name | string | No | Emergency contact name |
| emergency_contact_phone | string | No | Emergency contact phone |
| office_location | string | No | Office location |

RELATIONSHIPS:
- Updates `Teacher`

VALIDATION RULES:
- Empty phone may be removed before submission

MISSING FIELDS:
- No additional fields documented

ENTITY: GuardianFilters  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| page | number | No | Page number |
| size | number | No | Page size |
| search | string | No | Search query |
| is_active | boolean | No | Active filter |
| has_students | boolean | No | Linked-students filter |
| sort_by | `'created_at' \| 'full_name' \| 'email'` | No | Sort field |
| sort_order | `'asc' \| 'desc'` | No | Sort direction |
| [key: string] | any | No | Additional filter params |

RELATIONSHIPS:
- Supports list retrieval for `Guardian`

VALIDATION RULES:
- Sort values constrained to documented fields

MISSING FIELDS:
- No additional fields documented

ENTITY: StudentLinkPayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| student_id | string | Yes | Student UUID |
| relationship_type | `'father' \| 'mother' \| 'guardian' \| 'uncle' \| 'aunt' \| 'grandparent' \| 'sibling' \| 'other'` | Yes | Relationship type |
| is_primary | boolean | No | Primary guardian flag |
| is_emergency_contact | boolean | No | Emergency-contact flag |
| can_pickup | boolean | No | Pickup permission flag |

RELATIONSHIPS:
- Links `Guardian` to `Student`

VALIDATION RULES:
- Relationship type restricted to predefined values

MISSING FIELDS:
- Guardian detail page hardcodes `relationship_type: 'guardian'` and does not expose all payload fields in documented UI

ENTITY: GuardianCreatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| email | string | Yes | Guardian email |
| full_name | string | Yes | Full name |
| phone_number | string | No | Phone |
| address | string | No | Address |
| password | string | No | Password |
| occupation | string | No | Occupation |
| workplace | string | No | Workplace |
| student_links | StudentLinkPayload[] | No | Initial student links |

RELATIONSHIPS:
- Creates `Guardian`
- May create `StudentLinkPayload` records with it

VALIDATION RULES:
- Phone and relationship restrictions are documented

MISSING FIELDS:
- No additional fields documented

ENTITY: GuardianUpdatePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| full_name | string | No | Full name |
| phone_number | string | No | Phone |
| address | string | No | Address |
| profile_image_url | string | No | Photo URL |
| is_active | boolean | No | Active status |
| occupation | string | No | Occupation |
| workplace | string | No | Workplace |

RELATIONSHIPS:
- Updates `Guardian`

VALIDATION RULES:
- Empty phone may be removed before submission

MISSING FIELDS:
- No additional fields documented

ENTITY: SchoolInfo  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| school_name | string | Yes | School name |
| address | string | Yes | School address |
| phone | string | Yes | School phone |
| email | string | Yes | School email |
| logo_url | string \| null | No | School logo URL |

RELATIONSHIPS:
- Referenced by report cards, settings, and profile/configuration views

VALIDATION RULES:
- School info form enforces required strings and email/URL patterns

MISSING FIELDS:
- `region`, `zone`, `woreda`, and `website` are documented in settings/business context but are not present in this API-type table

ENTITY: AcademicSettings  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| grading_scale | `Record<string, number>` | Yes | Grade-threshold map |
| passing_mark | number | Yes | Passing threshold |
| attendance_warning_threshold | number | Yes | Attendance warning threshold |
| confidence_threshold | number | Yes | Face-recognition confidence threshold |

RELATIONSHIPS:
- Consumed by student grades, analytics, attendance warnings, and settings

VALIDATION RULES:
- Threshold ranges are documented in settings and business-rule files

MISSING FIELDS:
- UI/documentation mention `late_arrival_threshold`, `max_students_per_section`, `academic_year_start_month`, and `face_recognition_enabled`, but they are not present in this type

ENTITY: NotificationSettings  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| absence_alert | boolean | Yes | Absence alerts enabled |
| low_grade_alert | boolean | Yes | Low-grade alerts enabled |
| fee_reminder | boolean | Yes | Fee reminders enabled |
| consecutive_absence_threshold | number | Yes | Consecutive-absence threshold |

RELATIONSHIPS:
- Consumed by alerts, notifications, and analytics risk logic

VALIDATION RULES:
- Default threshold behavior is documented

MISSING FIELDS:
- UI/documentation mention `low_grade_alert_threshold`, `fee_reminder_days_before`, `notify_guardian_on_absence`, and `notify_guardian_on_low_grade`, but they are not present in this type

### Hook and Template Types

ENTITY: SectionStudent  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Student identifier |
| name | string | Yes | Student full name |
| registration_number | string | Yes | Registration number |
| email | string | No | Student email |
| phone | string | No | Student phone |

RELATIONSHIPS:
- Simplified projection of `Student`

VALIDATION RULES:
- No separate Zod schema documented

MISSING FIELDS:
- Broader roster views often expect additional student detail such as gender/status, which are not present in this lightweight hook type

ENTITY: EnrollmentStatus  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| studentId | string | Yes | Student identifier |
| enrolled | boolean | Yes | Face-enrollment status |
| enrolledAt | string | No | Enrollment timestamp |

RELATIONSHIPS:
- Face-enrollment status projection of `Student`

VALIDATION RULES:
- No separate Zod schema documented

MISSING FIELDS:
- No additional fields documented

ENTITY: FaceDescriptor  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| student_id | string | Yes | Student identifier |
| descriptors | number[][] | Yes | Face descriptor vectors |

RELATIONSHIPS:
- Biometric projection associated to `Student`

VALIDATION RULES:
- Confidence-threshold rules apply in recognition flows

MISSING FIELDS:
- No additional fields documented

ENTITY: MarkAttendanceByFacePayload  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| studentId | string | Yes | Student identifier |
| sectionId | string | Yes | Section identifier |
| timestamp | string | Yes | Capture timestamp |
| confidence | number | Yes | Recognition confidence |
| method | `'face_recognition'` | Yes | Attendance method |
| capturedImage | string | No | Base64 image |

RELATIONSHIPS:
- Sends attendance action tied to `Student` and `Section`

VALIDATION RULES:
- Confidence-threshold and duplicate-attendance rules apply

MISSING FIELDS:
- No additional fields documented

ENTITY: NotificationTemplate  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Template name |
| type | `NotificationType` | Yes | Notification type |
| title | string | Yes | Template title |
| message | string | Yes | Message with placeholders |
| priority | `NotificationPriority` | Yes | Priority level |
| variables | string[] | Yes | Placeholder variables |

RELATIONSHIPS:
- Used to generate `Notification`

VALIDATION RULES:
- Type and priority depend on notification enums

MISSING FIELDS:
- No additional fields documented

### Zod Form Types

ENTITY: AcademicYearForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Academic year name |
| start_date | string | Yes | Start date |
| end_date | string | Yes | End date |
| description | `string \| null` | No | Description |

RELATIONSHIPS:
- Creates/edits `AcademicYear`

VALIDATION RULES:
- Name min/max length
- End date after start date

MISSING FIELDS:
- `is_active`/status controls exist in the entity/UI but not in this form type

ENTITY: TermForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Term name |
| term_number | number | Yes | Term number |
| start_date | string | Yes | Start date |
| end_date | string | Yes | End date |

RELATIONSHIPS:
- Creates/edits `Term`

VALIDATION RULES:
- Name length
- Term number 1-4
- End date after start date

MISSING FIELDS:
- `is_active` exists on the entity but not in this form type

ENTITY: SubjectForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| code | string | Yes | Subject code |
| name | string | Yes | Subject name |
| category | `'core' \| 'elective' \| 'vocational' \| 'extracurricular'` | Yes | Subject category |
| description | `string \| null` | No | Description |

RELATIONSHIPS:
- Creates/edits `Subject`

VALIDATION RULES:
- Code and name length
- Category enum

MISSING FIELDS:
- `credit_hours` exists on the entity but not in this form type

ENTITY: ClassForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Class name |
| grade_level | number | Yes | Grade level |
| description | `string \| null` | No | Description |
| capacity | `number \| null` | No | Capacity |

RELATIONSHIPS:
- Creates/edits `Class`

VALIDATION RULES:
- Grade level 0-12
- Capacity positive if present

MISSING FIELDS:
- `academic_year_id` and `class_teacher_id` exist on the entity side but not in this form type

ENTITY: SectionForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Section name |
| capacity | number | Yes | Capacity |
| room_number | `string \| null` | No | Room number |
| homeroom_teacher_id | `string \| null` | No | Homeroom teacher ID |

RELATIONSHIPS:
- Creates/edits `Section`

VALIDATION RULES:
- Name length
- Positive capacity with default 40

MISSING FIELDS:
- `class_id` exists on the entity side but not in this form type

ENTITY: EnrollmentForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| student_id | string | Yes | Student UUID |
| academic_year_id | string | Yes | Academic year UUID |
| class_id | string | Yes | Class UUID |
| section_id | string | Yes | Section UUID |
| enrollment_date | string | Yes | Enrollment date |

RELATIONSHIPS:
- Creates `Enrollment`

VALIDATION RULES:
- Required IDs and date

MISSING FIELDS:
- `status` exists in some creation flows but is not part of this form type

ENTITY: TransferForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| new_section_id | string | Yes | Destination section UUID |
| transfer_date | string | Yes | Transfer date |
| reason | string | No | Transfer reason |

RELATIONSHIPS:
- Updates `Enrollment`

VALIDATION RULES:
- Required destination section and date

MISSING FIELDS:
- API usage elsewhere refers to `to_class_id`/`to_section_id`, which differs from this form naming

ENTITY: WithdrawalForm  
FIELDS:

| Field | Type | Required | Description |
|---|---|---|---|
| withdrawal_date | string | Yes | Withdrawal date |
| reason | string | Yes | Withdrawal reason |

RELATIONSHIPS:
- Updates `Enrollment`

VALIDATION RULES:
- Reason minimum 5 characters

MISSING FIELDS:
- No additional fields documented

## Section 6: Critical Path To Launch

### Question 1: Blocking Issues

1. Authentication fallback to mock users
What is blocked: Safe production login.
Why it is blocked: `BUG_REPORT.md`, `FINAL_SUMMARY.md`, and `BUSINESS_CONTEXT_REPORT.md` all document that login falls back to hardcoded mock users when the API is unreachable.
Which file causes it: `src/lib/api/auth.service.ts`

2. Section roster is non-functional
What is blocked: Viewing and managing student assignments inside sections.
Why it is blocked: `BUG_REPORT.md`, `FINAL_SUMMARY.md`, and `BUSINESS_CONTEXT_REPORT.md` all document a hardcoded empty student array on the section page.
Which file causes it: `src/app/[locale]/(dashboard)/dashboard/academics/classes/[classId]/sections/[sectionId]/page.tsx`

3. Teacher operational workflows are not backed by working endpoints
What is blocked: Teacher dashboard, class roster, attendance, grade entry, and teacher schedule.
Why it is blocked: `TEACHER_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`, and `BUSINESS_CONTEXT_REPORT.md` repeatedly document `BACKEND REQUIRED` endpoints for these features.
Which files cause it:
- `src/features/teacher/hooks/useTeacherDashboard.ts`
- `src/features/teacher/hooks/useTeacherClasses.ts`
- `src/features/teacher/hooks/useTeacherAttendance.ts`
- `src/features/teacher/hooks/useTeacherGrades.ts`
- `src/features/teacher/hooks/useTeacherSchedule.ts`

4. Manual attendance is not confirmed end to end
What is blocked: Reliable daily attendance entry.
Why it is blocked: `FINAL_SUMMARY.md` and `BUSINESS_CONTEXT_REPORT.md` both classify manual attendance as broken/missing because required backend attendance submission/check flows are not confirmed.
Which files cause it:
- `src/features/attendance/api/useAttendance.ts`
- `src/features/teacher/hooks/useTeacherAttendance.ts`

5. Grade entry is not confirmed end to end
What is blocked: Teacher submission of assessment grades.
Why it is blocked: `FINAL_SUMMARY.md`, `TEACHER_PORTAL_ANALYSIS.md`, and `BUSINESS_CONTEXT_REPORT.md` all document missing or unverified grade-entry endpoints.
Which files cause it:
- `src/features/teacher/hooks/useTeacherGrades.ts`
- `src/app/[locale]/(dashboard)/dashboard/grades/page.tsx`

6. Guardian password change does not function
What is blocked: Guardian self-service password updates.
Why it is blocked: The guardian profile page contains UI only, with no submit handler or API flow according to `GUARDIAN_PORTAL_ANALYSIS.md`, `BUG_REPORT.md`, and `FINAL_SUMMARY.md`.
Which file causes it: `src/app/[locale]/(dashboard)/dashboard/guardian/profile/page.tsx`

7. Student-to-guardian linking is incomplete in student edit flow
What is blocked: Completing student record setup with linked guardians from the student edit screen.
Why it is blocked: The student edit dialog is placeholder text according to `ADMIN_PORTAL_ANALYSIS.md`, `BUG_REPORT.md`, and `BUSINESS_CONTEXT_REPORT.md`.
Which file causes it: `src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx`

8. Fee system is absent as an operational admin capability
What is blocked: Fee creation/management and school payment operations.
Why it is blocked: `FINAL_SUMMARY.md` says fee management is missing, and `BUSINESS_CONTEXT_REPORT.md` states the fee system appears largely unimplemented.
Which file causes it: No fee-management admin page is documented; only payment-related hooks/components exist.

### Question 2: Minimum Working System

| Minimum Feature | Current Status | What needs to happen to make it work |
|---|---|---|
| Authentication | Partial | Mock fallback must be removed or disabled and real backend login must be relied on, as documented in `FINAL_SUMMARY.md` and `BUSINESS_CONTEXT_REPORT.md`. |
| Student management | Working | No blocker was identified in the source set for basic CRUD; documented issues are secondary to core create/read/update/delete behavior. |
| Guardian management | Working | No blocker was identified in the source set for basic CRUD, though linking behavior remains partially incomplete in some flows. |
| Academic structure (years, terms, classes, subjects) | Working/Partial | Core management works, but delete/archive gaps remain for some sub-entities according to `ADMIN_PORTAL_ANALYSIS.md`. |
| Class roster / section membership visibility | Broken | Section page must stop using the hardcoded empty student array and load real students as documented in `FINAL_SUMMARY.md` and `BUG_REPORT.md`. |
| Manual attendance | Broken | Attendance check/submission and roster-dependent flows must be backed by working endpoints per `TEACHER_PORTAL_ANALYSIS.md` and `BUSINESS_CONTEXT_REPORT.md`. |
| Grade entry | Broken | Teacher assessment list, assessment grade retrieval, and bulk grade submission endpoints must exist and work, per `TEACHER_PORTAL_ANALYSIS.md` and `FINAL_SUMMARY.md`. |
| Grade viewing | Partial | Student grade endpoints and available term source must exist and return the expected data documented in `STUDENT_PORTAL_ANALYSIS.md`. |
| Report cards | Partial | Report-card endpoint support must exist; batch export remains unimplemented per `FINAL_SUMMARY.md` and `BUG_REPORT.md`. |
| Fee management | Missing | Admin-side fee structure and management capability must exist; current source documents describe it as absent. |

### Question 3: Effort Estimate

These estimates are copied in spirit from the sizing and roadmap language already documented in `FINAL_SUMMARY.md` and grouped by the requested buckets.

Features that need < 1 hour to fix:
- Remove or disable console logging and native confirm usage where already identified by `BUG_REPORT.md`
- Fix missing token guard on reset password, as documented in `AUTHENTICATION_MODULE_ANALYSIS.md`
- Fix broken compose link in notification history, as documented in `ADMIN_PORTAL_ANALYSIS.md`

Features that need 1-4 hours to fix:
- Guardian password change wiring, documented in `FINAL_SUMMARY.md` as a short frontend fix
- Implement available terms source for student grades filtering, documented in `FINAL_SUMMARY.md`
- Replace native confirm dialogs with design-system confirmation modals, documented in `FINAL_SUMMARY.md`
- Dashboard change-password page API hookup, based on `AUTHENTICATION_MODULE_ANALYSIS.md`

Features that need 1-2 days to fix:
- Section roster student list implementation, documented in `FINAL_SUMMARY.md` as a short targeted fix
- Guardian linking UI in student edit flow, documented in `FINAL_SUMMARY.md` as a 2-3 day frontend task
- Basic fee-management UI creation, documented in `FINAL_SUMMARY.md` as roughly 1 week but the smallest usable slice belongs in this medium bucket only if scope is limited
- Schedule conflict handling and related schedule UX gaps from `ADMIN_PORTAL_ANALYSIS.md`

Features that need > 2 days to build:
- Teacher backend endpoint suite for dashboard, classes, attendance, grades, and schedule, documented in `FINAL_SUMMARY.md` and `BUSINESS_CONTEXT_REPORT.md`
- Manual attendance backend completion, documented in `FINAL_SUMMARY.md`
- Grade-entry backend completion, documented in `FINAL_SUMMARY.md`
- Fee management system, documented in `FINAL_SUMMARY.md` and `BUSINESS_CONTEXT_REPORT.md`
- Face-recognition backend support, documented in `FINAL_SUMMARY.md` and `BUG_REPORT.md`
- Analytics backend completion, documented in `FINAL_SUMMARY.md`

### Question 4: Risk Assessment

If this system were deployed to a school today:

What would break immediately on day 1?
- Authentication could fall back to mock users if the real API is unreachable, per `BUG_REPORT.md` and `FINAL_SUMMARY.md`.
- Teachers would not be able to complete core daily operations like attendance and grade entry, per `FINAL_SUMMARY.md`, `TEACHER_PORTAL_ANALYSIS.md`, and `BUSINESS_CONTEXT_REPORT.md`.
- Section-level roster visibility would fail because the section page shows no students, per `BUG_REPORT.md` and `BUSINESS_CONTEXT_REPORT.md`.
- Fee operations would not exist as an admin capability, per `FINAL_SUMMARY.md` and `BUSINESS_CONTEXT_REPORT.md`.

What data could be lost or corrupted?
- Login behavior could use fake mock account data instead of real backend state, per `BUG_REPORT.md`.
- Schedule features can silently convert missing backend routes into empty arrays, masking absent data rather than surfacing failure, per `BUG_REPORT.md` and `ADMIN_PORTAL_ANALYSIS.md`.
- Multiple type-safety issues using `any` are documented in `BUG_REPORT.md` as raising runtime-shape risk across filters, payloads, and error handling.

What security issues exist?
- Mock authentication fallback and hardcoded mock credentials, per `BUG_REPORT.md` and `FINAL_SUMMARY.md`.
- Middleware lacks server-side auth/RBAC enforcement, per `AUTHENTICATION_MODULE_ANALYSIS.md`.
- Several access protections are client-side only, per `AUTHENTICATION_MODULE_ANALYSIS.md`.

What would teachers complain about first?
- They cannot reliably take attendance.
- They cannot reliably enter grades.
- Their dashboard, class list, and schedule depend on missing/unconfirmed backend endpoints.
These points are all documented in `TEACHER_PORTAL_ANALYSIS.md`, `FINAL_SUMMARY.md`, and `BUSINESS_CONTEXT_REPORT.md`.

What would students complain about first?
- Grade filtering by term is incomplete because `availableTerms` is empty/TODO.
- Student dashboard/profile/schedule/attendance all depend on missing backend endpoints.
- Password-change behavior in the student portal uses a mismatched auth contract.
These are documented in `STUDENT_PORTAL_ANALYSIS.md` and `AUTHENTICATION_MODULE_ANALYSIS.md`.

What would admins complain about first?
- They cannot see who is actually in each section.
- Fee management is absent.
- Guardian linking from student edit is incomplete.
- Some settings tabs expose UI that does not persist to documented APIs.
These are documented in `FINAL_SUMMARY.md`, `ADMIN_PORTAL_ANALYSIS.md`, and `BUSINESS_CONTEXT_REPORT.md`.

## Section 7: Conflicts and Inconsistencies

### Document-to-Document Conflicts

CONFLICT #1:
BETWEEN: `FINAL_SUMMARY.md` and `AUTHENTICATION_MODULE_ANALYSIS.md`
ON: Login status
DOCUMENT A SAYS: `User Login | Authentication | ⚠️ Partial | UI exists, form validation | Mock fallback in production, backend may not exist`
DOCUMENT B SAYS: `IMPLEMENTATION STATUS: ✅ FULLY IMPLEMENTED`
LIKELY TRUTH: Partial. The auth module confirms the UI/API call exists, but the final summary and bug report document a production-critical mock fallback in `src/lib/api/auth.service.ts`, so the feature is not production-complete.

CONFLICT #2:
BETWEEN: `FINAL_SUMMARY.md` and `AUTHENTICATION_MODULE_ANALYSIS.md`
ON: Password reset status
DOCUMENT A SAYS: `Password Reset | Authentication | ⚠️ Partial | UI exists for forgot/reset | Backend endpoints unverified`
DOCUMENT B SAYS: Forgot Password and Reset Password are each `✅ FULLY IMPLEMENTED`
LIKELY TRUTH: Partial. The flows are implemented in UI terms, but the final summary explicitly downgrades them because backend readiness is not confirmed.

CONFLICT #3:
BETWEEN: `FINAL_SUMMARY.md` and `AUTHENTICATION_MODULE_ANALYSIS.md`
ON: Password change status
DOCUMENT A SAYS: `Password Change | Authentication | ✅ Full`
DOCUMENT B SAYS: one auth-context change password is full, dashboard-context change password is `❌ NOT IMPLEMENTED`, and student-portal change password is `⚠️ PARTIALLY IMPLEMENTED`
LIKELY TRUTH: Partial. The codebase has multiple password-change implementations with different states, so the single full status in the final summary overstates the situation.

CONFLICT #4:
BETWEEN: `FINAL_SUMMARY.md` and `ADMIN_PORTAL_ANALYSIS.md`
ON: Role management status
DOCUMENT A SAYS: `Role Management | Users | ✅ Full`
DOCUMENT B SAYS: users edit-page role update is incomplete because the mutation hook is not wired
LIKELY TRUTH: Partial. The service method exists, but the admin analysis points to a real UI mutation gap with code evidence.

CONFLICT #5:
BETWEEN: `FINAL_SUMMARY.md` and `ADMIN_PORTAL_ANALYSIS.md`
ON: Academic years status
DOCUMENT A SAYS: `Academic Years (CRUD) | Academics | ✅ Full`
DOCUMENT B SAYS: missing delete functionality and archive-year action has no actual functionality
LIKELY TRUTH: Partial. The admin analysis provides detailed CRUD breakdown and identifies missing operations.

CONFLICT #6:
BETWEEN: `FINAL_SUMMARY.md` and `ADMIN_PORTAL_ANALYSIS.md`
ON: Classes status
DOCUMENT A SAYS: `Classes (CRUD) | Academics | ✅ Full`
DOCUMENT B SAYS: no delete functionality for classes and no search/filter/pagination UI
LIKELY TRUTH: Partial. The final summary compresses the module, but the admin analysis documents missing CRUD completeness.

CONFLICT #7:
BETWEEN: `FINAL_SUMMARY.md` and `ADMIN_PORTAL_ANALYSIS.md`
ON: Schedule management status
DOCUMENT A SAYS: `Schedule Management | ⚠️ Partial | Endpoints return empty on 404 (mocked)`
DOCUMENT B SAYS: `IMPLEMENTATION STATUS: ✅ FULLY IMPLEMENTED`
LIKELY TRUTH: Partial. The admin analysis itself also documents mocked/404-softened endpoints in its problems section, which aligns more with the final summary than with its own headline status.

CONFLICT #8:
BETWEEN: `FINAL_SUMMARY.md` and `STUDENT_PORTAL_ANALYSIS.md`
ON: Student dashboard status
DOCUMENT A SAYS: `Student Dashboard | Student | ✅ Full`
DOCUMENT B SAYS: `⚠️ PARTIALLY IMPLEMENTED — Backend endpoint required`
LIKELY TRUTH: Partial. The student analysis consistently marks all student-portal features as dependent on missing API endpoints.

CONFLICT #9:
BETWEEN: `FINAL_SUMMARY.md` and `STUDENT_PORTAL_ANALYSIS.md`
ON: Student profile status
DOCUMENT A SAYS: `Student Profile | Student | ✅ Full`
DOCUMENT B SAYS: `⚠️ PARTIALLY IMPLEMENTED — Backend endpoints required for profile data and photo upload`
LIKELY TRUTH: Partial. The profile UI exists, but backend dependencies are still documented as missing.

CONFLICT #10:
BETWEEN: `FINAL_SUMMARY.md` and `STUDENT_PORTAL_ANALYSIS.md`
ON: Grade viewing (student) status
DOCUMENT A SAYS: `Grade Viewing (Student) | ✅ Full`
DOCUMENT B SAYS: `⚠️ PARTIALLY IMPLEMENTED — Backend endpoints required for all grades data`
LIKELY TRUTH: Partial. The final summary itself also mentions the available-terms endpoint gap.

CONFLICT #11:
BETWEEN: `FINAL_SUMMARY.md` and `GUARDIAN_PORTAL_ANALYSIS.md`
ON: Guardian dashboard/child-details/notifications status
DOCUMENT A SAYS: `Guardian Dashboard | ✅ Full`, `Guardian Child Details | ✅ Full`, `Guardian Notifications | ✅ Full`
DOCUMENT B SAYS: all guardian portal features are `⚠️ PARTIALLY IMPLEMENTED` because required endpoints are not implemented
LIKELY TRUTH: Partial. The guardian analysis is internally consistent and provides endpoint-level evidence for all affected screens.

CONFLICT #12:
BETWEEN: `FINAL_SUMMARY.md` and `AUTHENTICATION_MODULE_ANALYSIS.md`
ON: Role-based access control and token refresh
DOCUMENT A SAYS: `Role-Based Access Control | ✅ Full` and `Token Refresh | ✅ Full`
DOCUMENT B SAYS: RBAC/protection layers are only partially implemented because middleware has no auth enforcement, ProtectedRoute has hydration/routing issues, and refresh has locale/concurrency issues
LIKELY TRUTH: Partial. The underlying pieces exist, but the auth analysis documents gaps that prevent calling the stack fully complete.

CONFLICT #13:
BETWEEN: `API_ENDPOINTS_SUMMARY.md` and portal/module analyses
ON: Backend readiness of multiple endpoints
DOCUMENT A SAYS: endpoint inventory lists teacher, student, guardian, face-recognition, schedule, and attendance endpoints
DOCUMENT B SAYS: many of those same endpoints are marked `BACKEND REQUIRED` or "may not exist" in feature analyses
LIKELY TRUTH: Endpoint references exist in frontend code, but backend implementation is unverified. The summary is an inventory of frontend calls, not proof that the backend supports them.

CONFLICT #14:
BETWEEN: `FINAL_SUMMARY.md` and `BUSINESS_RULES.md`
ON: Total business-rule count
DOCUMENT A SAYS: `Total business rules: 15`
DOCUMENT B SAYS: documents rules `#1` through `#125`
LIKELY TRUTH: 125 documented rules in the extracted rules file. The final summary’s count is almost certainly an undersized rollup.

CONFLICT #15:
BETWEEN: `FINAL_SUMMARY.md` and `DATA_MODEL_SUMMARY.md`
ON: Total data-entity count
DOCUMENT A SAYS: `Total data entities: 25+`
DOCUMENT B SAYS: `Total Entities: 44` and then lists additional grouped items up to 56 named entries
LIKELY TRUTH: The data-model files document a substantially larger type surface than 25+, so the final summary is only a coarse approximation.

### System-Level Inconsistencies

1. Password change exists in three different forms with different behavior.
One place says auth-context change password is complete, another dashboard page is mocked, and the student portal uses a different API path/payload contract.

2. Grade and attendance policy thresholds are inconsistent across views.
`BUSINESS_RULES.md` explicitly states that at-risk color thresholds differ from student dashboard thresholds.

3. Guardian linking behavior differs by entry point.
The guardian detail page hardcodes `relationship_type: 'guardian'`, while guardian create flow documents broader relationship options, and student edit linking is still placeholder UI.

4. Section-student API shape/path differs across documents.
`API_ENDPOINTS_SUMMARY.md` documents both `/academics/sections/{sectionId}/students` and `/sections/{sectionId}/students` style routes in different contexts, while teacher and attendance analyses still mark section-student loading as backend-required.

5. Schedule completeness differs by portal.
Admin schedule is described as full in one analysis but also documented as mocked/404-softened; teacher and student schedule views are clearly partial because their endpoints are unverified.

6. Registrar capability exists without a registrar portal.
`REGISTRAR_PORTAL_ANALYSIS.md` says the registrar role exists only as restricted access inside the admin portal, while other roles have dedicated portal areas.

7. Fee-related concepts exist in guardian/payment hooks and settings, but a real admin fee-management module is absent.
This creates a system where payment viewing/integration is partially represented, but fee-definition and operational fee management are not.

8. UI settings fields exceed documented API types.
`ADMIN_PORTAL_ANALYSIS.md` documents settings UI fields that do not exist in `AcademicSettings` and `NotificationSettings` types from `DATA_MODEL_API_TYPES.md`.

9. Core entity names and API payload names do not consistently align.
Examples documented in the data-model files include:
- `Student.gender` vs payload `sex`
- `Student.enrollment_date` vs payload `admission_date`
- `Teacher.subject_specialization` vs payload `specialization`
- `AcademicYear.year_name` vs form field `name`
- `Section.section_name` vs form field `name`

## Additional Findings

1. The analysis corpus itself is internally uneven in granularity.
Some documents classify a feature as “full” based on UI completeness, while others classify the same feature as partial/missing because backend readiness is unverified.

2. The API endpoint summary is an inventory of frontend calls, not a backend verification report.
That explains several apparent contradictions with portal analyses that still mark the same endpoints as required or absent.

3. The business-rules extraction is much broader than the high-level summary suggests.
The dedicated business-rules document contains 125 rules plus missing/questionable-rule notes, far beyond the abbreviated count in the final summary.

4. The data model contains both domain entities and operational/supporting type definitions.
This includes filters, payloads, hook response shapes, and Zod form types, which is why the detailed data-model files produce a much larger model surface than the high-level summary.
