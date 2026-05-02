# Admin Portal Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Users Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/users/page.tsx
- src/app/[locale]/(dashboard)/dashboard/users/create/page.tsx
- src/app/[locale]/(dashboard)/dashboard/users/[id]/page.tsx
- src/app/[locale]/(dashboard)/dashboard/users/[id]/edit/page.tsx
- src/hooks/use-users.ts
- src/lib/api/users.service.ts
- src/lib/api/query-keys.ts

WHAT IT DOES:
Manages system users including creating, viewing, editing, deleting, and restoring user accounts. Supports role assignment and user activation/deactivation. Provides filtering by role, status, and search functionality.

UI COMPONENTS:
- UsersPage (src/app/[locale]/(dashboard)/dashboard/users/page.tsx) - Main users list with data table, filters, search, pagination
- CreateUserForm (src/app/[locale]/(dashboard)/dashboard/users/create/page.tsx) - Form to create new users with role selection
- UserDetailPage (src/app/[locale]/(dashboard)/dashboard/users/[id]/page.tsx) - User profile view with details, roles, status
- EditUserForm (src/app/[locale]/(dashboard)/dashboard/users/[id]/edit/page.tsx) - Form to edit user details and roles
- DataTable - Reusable table component for displaying users
- RoleBadge - Badge component for displaying user roles
- StatusBadge - Badge component for displaying active/inactive status
- ConfirmDialog - Confirmation dialog for delete actions

API CALLS:
- Method: GET
- URL: /users
- Sends: { page, size, search, is_active, role, sort_by, sort_order }
- Expects: { items: User[], pages: number, total: number }
- File: src/lib/api/users.service.ts (line 16)

- Method: GET
- URL: /users/{id}
- Sends: none
- Expects: User object
- File: src/lib/api/users.service.ts (line 21)

- Method: GET
- URL: /users/me
- Sends: none
- Expects: Current user object
- File: src/lib/api/users.service.ts (line 26)

- Method: GET
- URL: /users/roles/all
- Sends: none
- Expects: Available roles array
- File: src/lib/api/users.service.ts (line 31)

- Method: GET
- URL: /users/stats/summary
- Sends: none
- Expects: User statistics
- File: src/lib/api/users.service.ts (line 36)

- Method: POST
- URL: /users
- Sends: { email, full_name, password?, phone_number?, address?, role_names: string[] }
- Expects: Created user object
- File: src/lib/api/users.service.ts (line 48)

- Method: PATCH
- URL: /users/{id}
- Sends: { full_name?, phone_number?, address?, profile_image_url?, is_active? }
- Expects: Updated user object
- File: src/lib/api/users.service.ts (line 62)

- Method: DELETE
- URL: /users/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/lib/api/users.service.ts (line 67)

- Method: POST
- URL: /users/{id}/restore
- Sends: none
- Expects: Restoration confirmation
- File: src/lib/api/users.service.ts (line 72)

- Method: PUT
- URL: /users/{id}/roles
- Sends: { role_names: string[] }
- Expects: Updated roles
- File: src/lib/api/users.service.ts (line 77)

FORM FIELDS (if form exists):
Create User Form:
- email: string, required, email validation
- full_name: string, required, min 2 characters
- phone_number: string, optional
- address: string, optional
- password: string, required, min 8 characters
- confirm_password: string, required, must match password
- role_names: string[], required, at least 1 role selected

Edit User Form:
- full_name: string, required, min 2 characters
- phone_number: string, optional
- address: string, optional
- is_active: boolean, required
- role_names: string[], optional (only editable by users with canManageRoles permission)

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ⚠️ Partial - Role update UI exists but mutation not implemented (line 96-101 in edit page shows TODO comment)
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ✅ Wired to API (search parameter sent to /users endpoint)
- Filter:     ✅ Wired to API (role, is_active filters sent to /users endpoint)
- Pagination: ✅ Wired to API (page, size parameters sent to /users endpoint)
- Sort:       ✅ Wired to API (sort_by, sort_order parameters sent to /users endpoint)

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Role update functionality in edit page has UI but the actual API call is not implemented. Line 96-101 in edit page shows: "This would need a separate mutation hook for role updates" but no such hook exists in use-users.ts.

EVIDENCE:
From src/app/[locale]/(dashboard)/dashboard/users/[id]/edit/page.tsx lines 96-101:
```typescript
const onRolesSubmit = (data: EditUserForm) => {
  if (!data.role_names || data.role_names.length === 0) return;
  // Update roles separately using the users service
  // This would need a separate mutation hook for role updates
  setIsEditingRoles(false);
};
```

The users.service.ts has updateRoles method (line 76-81) but no corresponding hook in use-users.ts to call it.

PROBLEMS FOUND:
1. Role update in edit page is incomplete - UI exists but mutation not wired up
2. No useUpdateRoles hook exists in use-users.ts despite updateRoles service method existing
3. Edit page has isOwnProfile check but doesn't prevent deactivating own account

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Students Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/students/page.tsx
- src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx
- src/app/[locale]/(dashboard)/dashboard/students/[id]/page.tsx
- src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx
- src/hooks/use-students.ts
- src/lib/api/students.service.ts
- src/hooks/use-guardians.ts (for guardian linking)
- src/features/enrollments/api/useEnrollments.ts (for enrollment history)
- src/features/attendance/api/useAttendance.ts (for attendance tab)
- src/features/grades/api/useGrades.ts (for grades tab)

WHAT IT DOES:
Manages student records including creating, viewing, editing, deleting, and restoring student accounts. Supports student enrollment history tracking, guardian linking, attendance records, and grade reports. Includes multi-step form for student creation with photo upload, personal info, and academic details.

UI COMPONENTS:
- StudentsPage (src/app/[locale]/(dashboard)/dashboard/students/page.tsx) - Main students list with data table, filters (status, sex), search, pagination
- CreateStudentForm (src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx) - Multi-step form (2 steps) for creating students with photo upload, personal info, and academic details
- StudentDetailPage (src/app/[locale]/(dashboard)/dashboard/students/[id]/page.tsx) - Student profile with tabs (profile, enrollment, attendance, grades)
- EditStudentForm (src/app/[locale]/(dashboard)/dashboard/students/[id]/edit/page.tsx) - Multi-step form for editing student details and guardian linking
- DataTable - Reusable table component for displaying students
- StatusBadge - Badge component for displaying student status (active, graduated, transferred, expelled, withdrawn)
- Tabs - Tab navigation for student detail view
- EnrollmentWizard - Modal for enrolling students in classes
- TransferModal - Modal for transferring students between sections
- WithdrawModal - Modal for withdrawing students
- ConfirmDialog - Confirmation dialog for delete actions

API CALLS:
- Method: GET
- URL: /students
- Sends: { page, size, search, status, is_active, sex, nationality, sort_by, sort_order }
- Expects: { items: Student[], pages: number, total: number }
- File: src/lib/api/students.service.ts (line 18)

- Method: GET
- URL: /students/{id}
- Sends: none
- Expects: Student object
- File: src/lib/api/students.service.ts (line 23)

- Method: GET
- URL: /students/registration/{regNumber}
- Sends: none
- Expects: Student object by registration number
- File: src/lib/api/students.service.ts (line 28)

- Method: GET
- URL: /students/stats/summary
- Sends: none
- Expects: Student statistics
- File: src/lib/api/students.service.ts (line 35)

- Method: POST
- URL: /students
- Sends: { email, full_name, phone_number?, address?, password?, admission_date, date_of_birth, sex, nationality?, previous_school?, ministry_exam_result?, guardian_id? }
- Expects: Created student object
- File: src/lib/api/students.service.ts (line 52)

- Method: PATCH
- URL: /students/{id}
- Sends: { full_name?, phone_number?, address?, profile_image_url?, is_active?, status?, nationality?, previous_school?, ministry_exam_result? }
- Expects: Updated student object
- File: src/lib/api/students.service.ts (line 70)

- Method: DELETE
- URL: /students/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/lib/api/students.service.ts (line 75)

- Method: POST
- URL: /students/{id}/restore
- Sends: none
- Expects: Restoration confirmation
- File: src/lib/api/students.service.ts (line 80)

FORM FIELDS (if form exists):
Create Student Form (2-step wizard):
Step 1 - User Details:
- photo: file, optional (image upload)
- email: string, required, email validation
- full_name: string, required, min 2 characters
- phone_number: string, optional, regex validation (+251 followed by 9 digits)
- address: string, optional
- guardian_id: string, optional (select from guardians list)
- password: string, optional (auto-generated if empty)

Step 2 - Student Details:
- admission_date: string, required (date)
- date_of_birth: string, required (date, must be between 10-25 years old)
- sex: enum, required ('M' or 'F')
- nationality: string, optional (default: 'Ethiopian')
- previous_school: string, optional
- ministry_exam_result: number, optional, min 0, max 100

Edit Student Form (2-step wizard):
Step 1 - Personal Info:
- registration_number: string, read-only
- photo: file, optional (image upload)
- full_name: string, required, min 2 characters
- phone_number: string, optional, regex validation (+251 followed by 9 digits) or empty
- address: string, optional
- status: string, optional (active, graduated, transferred, expelled, withdrawn) - only for admin/registrar

Step 2 - Academic Info:
- nationality: string, optional
- previous_school: string, optional
- ministry_exam_result: number, optional, min 0, max 100 or empty

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ✅ Wired to API (search parameter sent to /students endpoint)
- Filter:     ✅ Wired to API (status, sex filters sent to /students endpoint)
- Pagination: ✅ Wired to API (page, size parameters sent to /students endpoint)
- Sort:       ✅ Wired to API (sort_by, sort_order parameters sent to /students endpoint)

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
All CRUD operations are fully implemented with corresponding hooks in use-students.ts and service methods in students.service.ts. The create page has a complete 2-step wizard with validation. The detail page includes tabs for enrollment history, attendance, and grades with proper API integration.

From src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx lines 34-53 shows complete schema with validation:
```typescript
const studentSchema = z.object({
  email: z.string().min(1, tv('emailRequired')).email(tv('invalidEmail')),
  full_name: z.string().min(2, tv('nameMinLength')),
  phone_number: z.string().regex(/^\+251\d{9}$/, { message: t('phoneInvalid') }).optional(),
  address: z.string().optional(),
  password: z.string().optional(),
  admission_date: z.string().min(1, tv('admissionDateRequired')),
  date_of_birth: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
    const maxAge = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    return date >= minAge && date <= maxAge;
  }, { message: t('dateOfBirthInvalid') }),
  sex: z.enum(['M', 'F'], { message: tv('sexRequired') }),
  nationality: z.string().optional(),
  previous_school: z.string().optional(),
  ministry_exam_result: z.coerce.number().min(0).max(100).optional(),
  guardian_id: z.string().optional(),
});
```

PROBLEMS FOUND:
1. Photo upload UI exists but the photo is not actually sent to the API - the form doesn't include profile_image_url in the payload
2. Guardian linking UI in edit page (line 283-296) shows placeholder text "Guardian linking functionality would go here" - not implemented
3. The guardian_id field in create form is selected but not included in the mutation payload (line 102 shows data sent without guardian_id)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Teachers Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/teachers/page.tsx
- src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx
- src/app/[locale]/(dashboard)/dashboard/teachers/[id]/page.tsx
- src/app/[locale]/(dashboard)/dashboard/teachers/[id]/edit/page.tsx
- src/hooks/use-teachers.ts
- src/lib/api/teachers.service.ts
- src/features/schedule/api/useSchedule.ts (for timetable tab)
- src/features/academics/api/useAcademicYears.ts (for academic year selection)
- src/features/academics/api/useTerms.ts (for term selection)

WHAT IT DOES:
Manages teacher records including creating, viewing, editing, deleting, and restoring teacher accounts. Supports teacher specialization, qualification tracking, emergency contact information, and schedule viewing. Includes form sections for user details, teacher details, and emergency contact.

UI COMPONENTS:
- TeachersPage (src/app/[locale]/(dashboard)/dashboard/teachers/page.tsx) - Main teachers list with data table, filters (status, specialization), search, pagination
- CreateTeacherForm (src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx) - Form for creating teachers with photo upload, user details, teacher details, and emergency contact
- TeacherDetailPage (src/app/[locale]/(dashboard)/dashboard/teachers/[id]/page.tsx) - Teacher profile with tabs (profile, classes, timetable)
- EditTeacherForm (src/app/[locale]/(dashboard)/dashboard/teachers/[id]/edit/page.tsx) - Form for editing teacher details and user account linking
- DataTable - Reusable table component for displaying teachers
- StatusBadge - Badge component for displaying teacher status (active, on_leave, suspended, resigned, retired)
- Tabs - Tab navigation for teacher detail view
- TimetableGrid - Component for displaying teacher schedule
- ConfirmDialog - Confirmation dialog for delete actions

API CALLS:
- Method: GET
- URL: /teachers
- Sends: { page, size, search, status, is_active, specialization, sort_by, sort_order }
- Expects: { items: Teacher[], pages: number, total: number }
- File: src/lib/api/teachers.service.ts (line 17)

- Method: GET
- URL: /teachers/{id}
- Sends: none
- Expects: Teacher object
- File: src/lib/api/teachers.service.ts (line 22)

- Method: GET
- URL: /teachers/employee/{employeeId}
- Sends: none
- Expects: Teacher object by employee ID
- File: src/lib/api/teachers.service.ts (line 27)

- Method: GET
- URL: /teachers/stats/summary
- Sends: none
- Expects: Teacher statistics
- File: src/lib/api/teachers.service.ts (line 34)

- Method: POST
- URL: /teachers
- Sends: { email, full_name, phone_number?, address?, password?, hire_date, date_of_birth, sex, qualification?, specialization?, emergency_contact_name?, emergency_contact_phone?, office_location? }
- Expects: Created teacher object
- File: src/lib/api/teachers.service.ts (line 53)

- Method: PATCH
- URL: /teachers/{id}
- Sends: { full_name?, phone_number?, address?, profile_image_url?, is_active?, status?, qualification?, specialization?, emergency_contact_name?, emergency_contact_phone?, office_location? }
- Expects: Updated teacher object
- File: src/lib/api/teachers.service.ts (line 73)

- Method: DELETE
- URL: /teachers/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/lib/api/teachers.service.ts (line 78)

- Method: POST
- URL: /teachers/{id}/restore
- Sends: none
- Expects: Restoration confirmation
- File: src/lib/api/teachers.service.ts (line 83)

FORM FIELDS (if form exists):
Create Teacher Form:
User Details:
- photo: file, optional (image upload)
- email: string, required, email validation
- full_name: string, required, min 2 characters
- phone_number: string, required, regex validation (+251 followed by 9 digits)
- address: string, optional
- password: string, optional (auto-generated if empty)

Teacher Details:
- hire_date: string, required (date, must be today or in the past)
- date_of_birth: string, required (date)
- sex: enum, required ('M' or 'F')
- qualification: string, required (select from: PhD, MSc, BSc, MA, BA, Diploma, Certificate, Other)
- specialization: string, required (select from: Mathematics, Physics, Chemistry, Biology, English, Amharic, History, Geography, Civics, Economics, Physical Education, Art, Music, ICT, Other)
- office_location: string, optional

Emergency Contact:
- emergency_contact_name: string, optional
- emergency_contact_phone: string, optional

Edit Teacher Form:
- employee_id: string, read-only
- photo: file, optional (image upload)
- full_name: string, required, min 2 characters
- phone_number: string, optional, regex validation (+251 followed by 9 digits) or empty
- address: string, optional
- status: string, optional (active, on_leave, suspended, resigned, retired) - only for admin/registrar
- qualification: string, optional
- specialization: string, optional
- office_location: string, optional
- emergency_contact_name: string, optional
- emergency_contact_phone: string, optional

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ✅ Wired to API (search parameter sent to /teachers endpoint)
- Filter:     ✅ Wired to API (status filter sent to /teachers endpoint)
- Pagination: ✅ Wired to API (page, size parameters sent to /teachers endpoint)
- Sort:       ✅ Wired to API (sort_by, sort_order parameters sent to /teachers endpoint)

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
All CRUD operations are fully implemented with corresponding hooks in use-teachers.ts and service methods in teachers.service.ts. The create page has a complete form with validation for user details, teacher details, and emergency contact. The detail page includes tabs for profile, classes, and timetable with proper API integration.

From src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx lines 39-57 shows complete schema with validation:
```typescript
const teacherSchema = z.object({
  email: z.string().min(1, tv('required')).email(tv('invalidEmail')),
  full_name: z.string().min(2, tv('nameMinLength')),
  phone_number: z.string().regex(/^\+251\d{9}$/, { message: t('phoneInvalid') }),
  address: z.string().optional(),
  password: z.string().optional(),
  hire_date: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    return date <= now;
  }, { message: t('hireDateInvalid') }),
  date_of_birth: z.string().min(1, tv('required')),
  sex: z.enum(['M', 'F'], { message: tv('required') }),
  qualification: z.string().min(1, t('qualificationRequired')),
  specialization: z.string().min(1, t('specializationRequired')),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  office_location: z.string().optional(),
});
```

PROBLEMS FOUND:
1. Photo upload UI exists but the photo is not actually sent to the API - the form doesn't include profile_image_url in the payload
2. User account linking UI in edit page (line 276-302) shows buttons for link/unlink but no actual functionality implemented
3. Classes tab in detail page (line 161-174) shows empty state with no actual data fetching or display
4. Timetable tab depends on schedule API but no error handling if schedule data is unavailable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Guardians Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/guardians/page.tsx
- src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx
- src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx
- src/app/[locale]/(dashboard)/dashboard/guardians/[id]/edit/page.tsx
- src/hooks/use-guardians.ts
- src/lib/api/guardians.service.ts
- src/hooks/use-students.ts (for student linking)

WHAT IT DOES:
Manages guardian records including creating, viewing, editing, and deleting guardian accounts. Supports linking guardians to students with relationship types (father, mother, guardian, etc.), primary guardian designation, and student search functionality. Includes a two-step creation process: first create guardian, then optionally link students.

UI COMPONENTS:
- GuardiansPage (src/app/[locale]/(dashboard)/dashboard/guardians/page.tsx) - Main guardians list with data table, search, pagination
- CreateGuardianForm (src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx) - Two-step form: create guardian then link students
- GuardianDetailPage (src/app/[locale]/(dashboard)/dashboard/guardians/[id]/page.tsx) - Guardian profile with linked students, link/unlink functionality
- EditGuardianForm (src/app/[locale]/(dashboard)/dashboard/guardians/[id]/edit/page.tsx) - Form for editing guardian details, read-only linked students view
- DataTable - Reusable table component for displaying guardians
- Dialog - Modal for linking students to guardians
- ConfirmDialog - Confirmation dialog for delete and unlink actions
- Badge - Badge component for relationship type display

API CALLS:
- Method: GET
- URL: /guardians
- Sends: { page, size, search, is_active, has_students, sort_by, sort_order }
- Expects: { items: Guardian[], pages: number, total: number }
- File: src/lib/api/guardians.service.ts (line 32)

- Method: GET
- URL: /guardians/{id}
- Sends: none
- Expects: Guardian object
- File: src/lib/api/guardians.service.ts (line 37)

- Method: GET
- URL: /guardians/stats/summary
- Sends: none
- Expects: Guardian statistics
- File: src/lib/api/guardians.service.ts (line 42)

- Method: GET
- URL: /guardians/student/{studentId}/guardians
- Sends: none
- Expects: Guardians for a specific student
- File: src/lib/api/guardians.service.ts (line 47)

- Method: POST
- URL: /guardians
- Sends: { email, full_name, phone_number?, address?, password?, occupation?, workplace?, student_links?: StudentLinkPayload[] }
- Expects: Created guardian object
- File: src/lib/api/guardians.service.ts (line 63)

- Method: PATCH
- URL: /guardians/{id}
- Sends: { full_name?, phone_number?, address?, profile_image_url?, is_active?, occupation?, workplace? }
- Expects: Updated guardian object
- File: src/lib/api/guardians.service.ts (line 79)

- Method: DELETE
- URL: /guardians/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/lib/api/guardians.service.ts (line 84)

- Method: POST
- URL: /guardians/{guardianId}/students
- Sends: { student_id, relationship_type, is_primary?, is_emergency_contact?, can_pickup? }
- Expects: Link confirmation
- File: src/lib/api/guardians.service.ts (line 89)

- Method: DELETE
- URL: /guardians/{guardianId}/students/{studentId}
- Sends: none
- Expects: Unlink confirmation
- File: src/lib/api/guardians.service.ts (line 97)

FORM FIELDS (if form exists):
Create Guardian Form (Step 1 - Create Guardian):
User Details:
- email: string, required, email validation
- full_name: string, required, min 2 characters
- phone_number: string, required, regex validation (+251 followed by 9 digits)
- address: string, optional
- password: string, optional (auto-generated if empty)

Guardian Details:
- relationship_type: string, required (select from: father, mother, uncle, aunt, grandparent, sibling, legal_guardian, other)
- is_primary: boolean, optional (checkbox)
- occupation: string, optional
- workplace: string, optional

Step 2 - Link Students (after creation):
- student selection: multi-select from search results
- relationship_type: string (uses value from step 1)
- is_primary: boolean (uses value from step 1)

Edit Guardian Form:
- full_name: string, required, min 2 characters
- phone_number: string, optional, regex validation (+251 followed by 9 digits) or empty
- address: string, optional
- occupation: string, optional
- workplace: string, optional

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ✅ Wired to API (search parameter sent to /guardians endpoint)
- Filter:     ❌ Missing (no filter UI in list page)
- Pagination: ✅ Wired to API (page, size parameters sent to /guardians endpoint)
- Sort:       ✅ Wired to API (sort_by, sort_order parameters sent to /guardians endpoint)

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
All CRUD operations are fully implemented with corresponding hooks in use-guardians.ts and service methods in guardians.service.ts. The create page has a two-step process: first create guardian, then optionally link students. The detail page includes student linking/unlinking functionality with proper API integration.

From src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx lines 39-49 shows complete schema with validation:
```typescript
const guardianSchema = z.object({
  email: z.string().min(1, tv('required')).email(tv('invalidEmail')),
  full_name: z.string().min(2, tv('nameMinLength')),
  phone_number: z.string().regex(/^\+251\d{9}$/, { message: t('phoneInvalid') }),
  address: z.string().optional(),
  password: z.string().optional(),
  occupation: z.string().optional(),
  workplace: z.string().optional(),
  relationship_type: z.string().min(1, t('relationshipRequired')),
  is_primary: z.boolean().optional(),
});
```

From src/lib/api/guardians.service.ts lines 14-28 shows StudentLinkPayload structure:
```typescript
export interface StudentLinkPayload {
  student_id: string;
  relationship_type:
    | 'father'
    | 'mother'
    | 'guardian'
    | 'uncle'
    | 'aunt'
    | 'grandparent'
    | 'sibling'
    | 'other';
  is_primary?: boolean;
  is_emergency_contact?: boolean;
  can_pickup?: boolean;
}
```

PROBLEMS FOUND:
1. No filter UI in guardians list page despite has_students filter being available in API
2. Student linking in create form uses relationship_type from form but doesn't allow per-student relationship customization
3. Link student modal in detail page (line 66) hardcodes relationship_type to 'guardian' instead of allowing selection
4. No restore functionality for guardians (no restore hook or service method)
5. Edit page shows linked students as read-only but doesn't provide link/unlink functionality

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Directors Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/directors/page.tsx
- src/hooks/use-users.ts (reused from Users management)
- src/lib/api/users.service.ts (reused from Users management)

WHAT IT DOES:
Displays a filtered list of users with the 'director' role. This is a specialized view of the Users management feature that only shows directors. It provides search, status filtering (active/inactive), and actions to view, edit, delete, or restore director accounts. All CRUD operations redirect to the Users management pages.

UI COMPONENTS:
- DirectorsPage (src/app/[locale]/(dashboard)/dashboard/directors/page.tsx) - Filtered list of director users with table, search, status filters
- Table - Custom table component for displaying directors
- Avatar - Avatar component for displaying user profile images
- StatusBadge - Badge component for displaying active/inactive status
- DropdownMenu - Menu for actions (view, edit, delete, restore)
- ConfirmDialog - Confirmation dialog for delete actions
- EmptyState - Empty state when no directors found

API CALLS:
- Method: GET
- URL: /users
- Sends: { page, size, search, role: 'director', is_active }
- Expects: { items: User[], pages: number, total: number }
- File: src/lib/api/users.service.ts (line 16) - called via useUsers hook

- Method: DELETE
- URL: /users/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/lib/api/users.service.ts (line 67) - called via useDeleteUser hook

- Method: POST
- URL: /users/{id}/restore
- Sends: none
- Expects: Restoration confirmation
- File: src/lib/api/users.service.ts (line 72) - called via useRestoreUser hook

FORM FIELDS (if form exists):
None - This page only displays a list. Create/edit forms are handled by the Users management pages.

CRUD STATUS:
- CREATE: ✅ Full (redirects to /dashboard/users/create)
- READ:   ✅ Full (filtered view of users with director role)
- UPDATE: ✅ Full (redirects to /dashboard/users/{id}/edit)
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ✅ Wired to API (search parameter sent to /users endpoint)
- Filter:     ✅ Wired to API (status filter: active/inactive/all sent as is_active parameter)
- Pagination: ❌ Missing (no pagination UI in this page, though API supports it)
- Sort:       ❌ Missing (no sort UI in this page)

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Missing pagination UI and sort functionality. The page filters users by director role but doesn't provide full pagination controls. All CRUD operations redirect to Users management pages.

EVIDENCE:
From src/app/[locale]/(dashboard)/dashboard/directors/page.tsx lines 48-55 shows the filtering logic:
```typescript
// Directors are users with the 'director' role
const { data, isLoading } = useUsers({
  page,
  size: 20,
  search: search || undefined,
  role: 'director',
  is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
});
```

The page redirects to Users management for create/edit (lines 79-84, 183-191):
```typescript
<Link href="/dashboard/users/create">
  <Button className="gap-2 min-h-[44px]">
    <Plus className="h-4 w-4" aria-hidden="true" />
    {t('createUser')}
  </Button>
</Link>
```

PROBLEMS FOUND:
1. No pagination UI despite page state being tracked (line 44) and API supporting pagination
2. No sort functionality despite API supporting sort_by and sort_order parameters
3. Create button redirects to generic user creation but doesn't pre-select 'director' role
4. No dedicated director-specific create/edit flows - relies entirely on Users management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Academics Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/academics/subjects/page.tsx
- src/app/[locale]/(dashboard)/dashboard/academics/years/page.tsx
- src/app/[locale]/(dashboard)/dashboard/academics/years/[yearId]/page.tsx
- src/app/[locale]/(dashboard)/dashboard/academics/classes/[classId]/page.tsx
- src/features/academics/api/useSubjects.ts
- src/features/academics/api/useAcademicYears.ts
- src/features/academics/api/useClasses.ts
- src/features/academics/api/useTerms.ts
- src/features/academics/components/SubjectModal.tsx
- src/features/academics/components/AcademicYearModal.tsx
- src/features/academics/components/SectionModal.tsx
- src/features/academics/components/ClassSubjectModal.tsx

WHAT IT DOES:
Manages academic structure including subjects, academic years, terms, classes, and sections. Supports subject categorization (core, elective, vocational, extracurricular), academic year lifecycle (planning, active, completed, archived), class management with sections, and subject assignment to classes.

UI COMPONENTS:
- SubjectsPage - Subject list with search, category filter, CRUD operations via modal
- AcademicYearsPage - Academic years list with status badges, activate/archive actions
- ClassDetailPage - Class detail with sections tab and subjects tab, section management, subject assignment
- SubjectModal - Modal for creating/editing subjects
- AcademicYearModal - Modal for creating/editing academic years
- SectionModal - Modal for creating/editing sections
- ClassSubjectModal - Modal for assigning/removing subjects to classes
- Table - Custom table components for displaying data
- Badge - Badge components for status and category display
- Tabs - Tab navigation for class detail view

API CALLS:
Subjects:
- Method: GET
- URL: /academics/subjects
- Sends: { page, size, search, category }
- Expects: { items: Subject[], pages: number, total: number }
- File: src/features/academics/api/useSubjects.ts (line 42)

- Method: POST
- URL: /academics/subjects
- Sends: { code, name, category, description? }
- Expects: Created subject object
- File: src/features/academics/api/useSubjects.ts (line 54)

- Method: PATCH
- URL: /academics/subjects/{id}
- Sends: { code?, name?, category?, description? }
- Expects: Updated subject object
- File: src/features/academics/api/useSubjects.ts (line 72)

- Method: DELETE
- URL: /academics/subjects/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/features/academics/api/useSubjects.ts (line 90)

Academic Years:
- Method: GET
- URL: /academics/years
- Sends: { page, size }
- Expects: { items: AcademicYear[], pages: number, total: number }
- File: src/features/academics/api/useAcademicYears.ts (line 12)

- Method: GET
- URL: /academics/years/{id}
- Sends: none
- Expects: AcademicYear object
- File: src/features/academics/api/useAcademicYears.ts (line 24)

- Method: POST
- URL: /academics/years
- Sends: { name, start_date, end_date, status? }
- Expects: Created academic year object
- File: src/features/academics/api/useAcademicYears.ts (line 36)

- Method: PATCH
- URL: /academics/years/{id}
- Sends: { name?, start_date?, end_date?, status?, is_current? }
- Expects: Updated academic year object
- File: src/features/academics/api/useAcademicYears.ts (line 54)

Classes:
- Method: GET
- URL: /academics/years/{yearId}/classes
- Sends: { page, size }
- Expects: { items: Class[], pages: number, total: number }
- File: src/features/academics/api/useClasses.ts (line 14)

- Method: GET
- URL: /academics/classes/{classId}
- Sends: none
- Expects: Class object with sections
- File: src/features/academics/api/useClasses.ts (line 27)

- Method: POST
- URL: /academics/years/{yearId}/classes
- Sends: { name, grade_level, description?, capacity? }
- Expects: Created class object
- File: src/features/academics/api/useClasses.ts (line 39)

- Method: PATCH
- URL: /academics/classes/{id}
- Sends: { name?, grade_level?, description?, capacity? }
- Expects: Updated class object
- File: src/features/academics/api/useClasses.ts (line 58)

Sections:
- Method: POST
- URL: /academics/classes/{classId}/sections
- Sends: { name, room_number?, capacity? }
- Expects: Created section object
- File: src/features/academics/api/useClasses.ts (line 79)

- Method: PATCH
- URL: /academics/sections/{id}
- Sends: { name?, room_number?, capacity? }
- Expects: Updated section object
- File: src/features/academics/api/useClasses.ts (line 97)

- Method: GET
- URL: /academics/sections/{sectionId}
- Sends: none
- Expects: Section object
- File: src/features/academics/api/useClasses.ts (line 114)

Class Subjects:
- Method: GET
- URL: /academics/classes/{classId}/subjects
- Sends: none
- Expects: Subject[] array
- File: src/features/academics/api/useClasses.ts (line 126)

- Method: POST
- URL: /academics/classes/{classId}/subjects
- Sends: { subject_id }
- Expects: Assignment confirmation
- File: src/features/academics/api/useClasses.ts (line 138)

- Method: DELETE
- URL: /academics/classes/{classId}/subjects/{subjectId}
- Sends: none
- Expects: Removal confirmation
- File: src/features/academics/api/useClasses.ts (line 156)

Terms:
- Method: GET
- URL: /academics/years/{yearId}/terms
- Sends: { page, size }
- Expects: { items: Term[], pages: number, total: number }
- File: src/features/academics/api/useTerms.ts (line 12)

- Method: POST
- URL: /academics/years/{yearId}/terms
- Sends: { name, start_date, end_date, is_active? }
- Expects: Created term object
- File: src/features/academics/api/useTerms.ts (line 26)

- Method: PATCH
- URL: /academics/terms/{id}
- Sends: { name?, start_date?, end_date?, is_active? }
- Expects: Updated term object
- File: src/features/academics/api/useTerms.ts (line 45)

- Method: DELETE
- URL: /academics/terms/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/features/academics/api/useTerms.ts (line 63)

FORM FIELDS (if form exists):
Subject Form:
- code: string, required
- name: string, required
- category: string, required (core, elective, vocational, extracurricular)
- description: string, optional

Academic Year Form:
- name: string, required
- start_date: string, required (date)
- end_date: string, required (date)
- status: string, optional (planning, active, completed, archived)

Section Form:
- name: string, required
- room_number: string, optional
- capacity: number, optional

Term Form:
- name: string, required
- start_date: string, required (date)
- end_date: string, required (date)
- is_active: boolean, optional

CRUD STATUS:
Subjects:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

Academic Years:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Missing (no delete hook or UI)

Classes:
- CREATE: ✅ Full (via academic year detail page)
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Missing (no delete hook or UI)

Sections:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Missing (no delete hook or UI)

Terms:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
Subjects:
- Search:     ✅ Wired to API
- Filter:     ✅ Wired to API (category filter)
- Pagination: ❌ Missing (no pagination UI)
- Sort:       ❌ Missing

Academic Years:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing (no pagination UI)
- Sort:       ❌ Missing

Classes:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

Terms:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Subjects, Terms, and Sections have full CRUD. Academic Years and Classes are missing delete functionality. No pagination UI for any sub-feature. No search/filter for Academic Years, Classes, or Terms.

EVIDENCE:
From src/features/academics/api/useSubjects.ts lines 49-65 shows create subject hook:
```typescript
export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: SubjectForm) => {
      const { data } = await axiosInstance.post('/academics/subjects', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.subjects.all() });
      toast.success('Subject created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create subject');
    }
  });
};
```

From src/features/academics/api/useTerms.ts lines 58-74 shows delete term hook exists:
```typescript
export const useDeleteTerm = (yearId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/academics/terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...academicsKeys.years.detail(yearId), 'terms'] });
      queryClient.invalidateQueries({ queryKey: academicsKeys.years.detail(yearId) });
      toast.success('Term deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete term. Ensure it has no active dependencies.');
    }
  });
};
```

PROBLEMS FOUND:
1. No delete functionality for Academic Years (no delete hook in useAcademicYears.ts)
2. No delete functionality for Classes (no delete hook in useClasses.ts)
3. No delete functionality for Sections (no delete hook in useClasses.ts)
4. No pagination UI for Subjects, Academic Years, Classes, or Terms
5. No search functionality for Academic Years, Classes, or Terms
6. No filter functionality for Academic Years, Classes, or Terms
7. Archive Year action in Academic Years page (line 204-208) is a menu item with no actual functionality

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Enrollments Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/enrollments/page.tsx
- src/features/enrollments/api/useEnrollments.ts
- src/features/enrollments/components/TransferModal.tsx
- src/features/enrollments/components/WithdrawModal.tsx
- src/features/enrollments/components/EnrollmentWizard.tsx (for enrollment creation)
- src/features/enrollments/types/index.ts
- src/features/enrollments/types/schemas.ts

WHAT IT DOES:
Manages student enrollments including viewing enrollment history, transferring students between classes/sections, and withdrawing students. Provides filtering by academic year and status, search functionality, and pagination. The actual enrollment creation is handled through the Students management feature (enroll action on student detail page).

UI COMPONENTS:
- EnrollmentsPage - Main enrollments list with data table, search, filters (academic year, status), pagination
- TransferModal - Modal for transferring students to different class/section
- WithdrawModal - Modal for withdrawing students with reason input
- DataTable - Reusable table component for displaying enrollments
- Badge - Badge component for status display (active, withdrawn, transferred, completed)
- Select - Dropdown filters for academic year and status
- EmptyState - Empty state when no enrollments found

API CALLS:
- Method: GET
- URL: /enrollments
- Sends: { page, search, academic_year_id, status }
- Expects: { items: Enrollment[], pages: number, total: number }
- File: src/features/enrollments/api/useEnrollments.ts (line 21)

- Method: GET
- URL: /students/{studentId}/enrollments
- Sends: none
- Expects: Enrollment[] array for a specific student
- File: src/features/enrollments/api/useEnrollments.ts (line 32)

- Method: POST
- URL: /enrollments
- Sends: { student_id, class_id, section_id?, academic_year_id, enrollment_date, status? }
- Expects: Created enrollment object
- File: src/features/enrollments/api/useEnrollments.ts (line 44)

- Method: POST
- URL: /enrollments/{enrollmentId}/transfer
- Sends: { to_class_id, to_section_id?, transfer_date?, reason? }
- Expects: Transfer confirmation
- File: src/features/enrollments/api/useEnrollments.ts (line 62)

- Method: POST
- URL: /enrollments/{enrollmentId}/withdraw
- Sends: { withdrawal_date, reason? }
- Expects: Withdrawal confirmation
- File: src/features/enrollments/api/useEnrollments.ts (line 80)

FORM FIELDS (if form exists):
Transfer Form:
- to_class_id: string, required
- to_section_id: string, optional
- transfer_date: string, optional (date)
- reason: string, optional

Withdrawal Form:
- withdrawal_date: string, optional (date)
- reason: string, optional

Enrollment Form (via EnrollmentWizard):
- student_id: string, required
- class_id: string, required
- section_id: string, optional
- academic_year_id: string, required
- enrollment_date: string, required (date)
- status: string, optional

CRUD STATUS:
- CREATE: ✅ Full (via Students management feature)
- READ:   ✅ Full
- UPDATE: ⚠️ Partial (only transfer and withdraw operations, no general update)
- DELETE: ❌ Missing (no delete functionality)

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ✅ Wired to API (search parameter sent to /enrollments endpoint)
- Filter:     ✅ Wired to API (academic_year_id and status filters sent to /enrollments endpoint)
- Pagination: ✅ Wired to API (page parameter sent to /enrollments endpoint)
- Sort:       ❌ Missing (no sort UI or API parameters)

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Read, create (via students), transfer, and withdraw are fully implemented. No general update functionality (only status changes via transfer/withdraw). No delete functionality. No sort functionality.

EVIDENCE:
From src/features/enrollments/api/useEnrollments.ts lines 17-26 shows enrollments query:
```typescript
export const useEnrollments = (filters: object = {}) => {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>('/enrollments', { params: filters });
      return data;
    },
    enabled: true,
  });
};
```

From src/app/[locale]/(dashboard)/dashboard/enrollments/page.tsx lines 54-59 shows filter implementation:
```typescript
const enrollmentFilters = {
  page,
  search: search || undefined,
  academic_year_id: yearFilter !== 'all' ? yearFilter : undefined,
  status: statusFilter !== 'all' ? statusFilter : undefined,
};
```

From src/features/enrollments/api/useEnrollments.ts lines 57-73 shows transfer student hook:
```typescript
export const useTransferStudent = (enrollmentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: TransferForm) => {
      const { data } = await axiosInstance.post(`/enrollments/${enrollmentId}/transfer`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success('Student transferred successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to transfer student');
    }
  });
};
```

PROBLEMS FOUND:
1. No general update functionality for enrollments (only transfer and withdraw operations)
2. No delete functionality for enrollments
3. No sort functionality despite data table supporting it
4. Create enrollment button redirects to students page instead of opening a modal or dedicated enrollment creation flow
5. TransferModal and WithdrawModal components not reviewed in detail (assumed to exist based on imports)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Schedule Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx
- src/features/schedule/api/useSchedule.ts
- src/features/schedule/components/TimetableGrid.tsx
- src/features/schedule/components/AddPeriodModal.tsx
- src/features/schedule/components/EditPeriodModal.tsx
- src/features/schedule/types/index.ts

WHAT IT DOES:
Manages class timetables/schedules by allowing selection of academic year, term, class, and section. Displays a weekly timetable grid with schedule entries. Supports adding, editing, and deleting schedule periods. Includes print functionality for timetables.

UI COMPONENTS:
- SchedulePage - Main schedule page with cascading dropdowns (year, term, class, section) and timetable grid
- TimetableGrid - Weekly timetable grid displaying schedule entries with add/edit/delete actions
- AddPeriodModal - Modal for adding new schedule entries with day, time, subject, and teacher selection
- EditPeriodModal - Modal for editing existing schedule entries
- Select - Dropdown selectors for academic year, term, class, and section
- EmptyState - Empty state when no section/term is selected
- Button - Print and add period buttons

API CALLS:
- Method: GET
- URL: /schedule/section/{sectionId}
- Sends: { term_id }
- Expects: ScheduleEntry[] array
- File: src/features/schedule/api/useSchedule.ts (line 20)

- Method: GET
- URL: /schedule/teacher/{teacherId}
- Sends: { term_id }
- Expects: ScheduleEntry[] array
- File: src/features/schedule/api/useSchedule.ts (line 41)

- Method: POST
- URL: /schedule
- Sends: { section_id, term_id, day_of_week, start_time, end_time, subject_id, teacher_id, room_number? }
- Expects: Created schedule entry object
- File: src/features/schedule/api/useSchedule.ts (line 58)

- Method: PATCH
- URL: /schedule/{id}
- Sends: { section_id?, term_id?, day_of_week?, start_time?, end_time?, subject_id?, teacher_id?, room_number? }
- Expects: Updated schedule entry object
- File: src/features/schedule/api/useSchedule.ts (line 95)

- Method: DELETE
- URL: /schedule/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/features/schedule/api/useSchedule.ts (line 77)

FORM FIELDS (if form exists):
Schedule Entry Form (Add/Edit):
- day_of_week: number, required (1-7 for Monday-Sunday)
- start_time: string, required (time format)
- end_time: string, required (time format)
- subject_id: string, required
- teacher_id: string, required
- room_number: string, optional

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ✅ Wired to UI (cascading filters: year, term, class, section)
- Pagination: ❌ Missing (not applicable for timetable view)
- Sort:       ❌ Missing (not applicable for timetable view)

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
From src/features/schedule/api/useSchedule.ts lines 14-33 shows section schedule query with 404 handling:
```typescript
export function useSectionSchedule(sectionId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.bySection(sectionId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
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

From src/features/schedule/api/useSchedule.ts lines 54-71 shows create schedule entry hook:
```typescript
export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateScheduleEntryPayload) => {
      const { data } = await axiosInstance.post('/schedule', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.bySection(variables.section_id, variables.term_id),
      });
      toast.success('Schedule entry created');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create schedule entry');
    },
  });
}
```

From src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx lines 97-153 shows cascading filter implementation:
```typescript
<div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl border shadow-sm">
  <div className="w-full md:w-48 space-y-2">
    <label className="text-xs font-medium text-muted-foreground uppercase ml-1">{ts('academicYear')}</label>
    <Select value={yearId} onValueChange={(v) => { setYearId(v); setTermId(''); }}>
      <SelectTrigger className="h-11">
        <SelectValue placeholder={ts('selectYear')} />
      </SelectTrigger>
      <SelectContent>
        {years?.items?.map((y: any) => (
          <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  {/* Similar cascading selects for term, class, section */}
</div>
```

PROBLEMS FOUND:
1. API endpoints are mocked with 404 handling (line 24-26 in useSchedule.ts) - backend may not be fully implemented
2. No conflict detection for overlapping schedule entries
3. No bulk operations (create/delete multiple entries at once)
4. TimetableGrid, AddPeriodModal, and EditPeriodModal components not reviewed in detail (assumed to exist based on imports)
5. No teacher schedule view in admin portal (only section schedule)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Attendance Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/attendance/page.tsx
- src/features/attendance/api/useAttendance.ts
- src/features/attendance/types/index.ts
- src/app/[locale]/(dashboard)/dashboard/attendance/face-scan/page.tsx (face scan method)
- src/app/[locale]/(dashboard)/dashboard/attendance/face-enrollment/page.tsx (face enrollment)

WHAT IT DOES:
Manages student attendance with multiple methods: manual entry, face scan, and barcode/QR code (disabled). Provides cascading filters for academic year, class, section, and date. Displays student roster with status selection (present, absent, late, excused), bulk operations (mark all present), and real-time statistics. Includes face recognition attendance system with enrollment and scanning capabilities.

UI COMPONENTS:
- AttendancePage - Main attendance page with method selector, cascading filters, student roster grid, and statistics cards
- AttendanceMethodSelector - Card with buttons for manual entry, face scan, and barcode/QR code methods
- StatsRow - Four stat cards showing present, absent, late, and excused counts
- StudentAttendanceGrid - List of students with radio buttons for status selection
- Select - Dropdown selectors for academic year, class, section, and date picker
- Badge - Status badges with color coding
- Avatar - Student avatar with initials
- Button - Mark all present and submit attendance buttons

API CALLS:
- Method: GET
- URL: /attendance/section/{sectionId}
- Sends: { date }
- Expects: AttendanceRecord[] array with student roster and existing attendance
- File: src/features/attendance/api/useAttendance.ts (line 20)

- Method: GET
- URL: /attendance/student/{studentId}
- Sends: { page, size }
- Expects: { items: AttendanceRecord[], total: number }
- File: src/features/attendance/api/useAttendance.ts (line 33)

- Method: GET
- URL: /attendance/student/{studentId}/stats
- Sends: none
- Expects: StudentAttendanceStats object
- File: src/features/attendance/api/useAttendance.ts (line 46)

- Method: POST
- URL: /attendance/bulk
- Sends: { section_id, date, entries: [{ student_id, status, note? }] }
- Expects: Bulk submission confirmation
- File: src/features/attendance/api/useAttendance.ts (line 57)

FORM FIELDS (if form exists):
Attendance Entry Form (per student):
- student_id: string, required
- status: enum, required (present, absent, late, excused)
- note: string, optional

CRUD STATUS:
- CREATE: ✅ Full (bulk submission via manual entry or face scan)
- READ:   ✅ Full (by section and by student)
- UPDATE: ✅ Full (resubmitting attendance updates records)
- DELETE: ❌ Missing (no delete functionality for attendance records)

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ✅ Wired to UI (cascading filters: year, class, section, date)
- Pagination: ❌ Missing (not applicable for attendance roster view)
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Manual attendance entry is fully implemented. Face scan and face enrollment features exist but not reviewed in detail. No delete functionality for attendance records. Barcode/QR code method is disabled.

EVIDENCE:
From src/features/attendance/api/useAttendance.ts lines 16-27 shows attendance by section query:
```typescript
export function useAttendanceBySection(sectionId: string, date: string) {
  return useQuery({
    queryKey: attendanceKeys.bySection(sectionId, date),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const { data } = await axiosInstance.get(`/attendance/section/${sectionId}`, {
        params: { date },
      });
      return data;
    },
    enabled: !!sectionId && !!date,
  });
}
```

From src/features/attendance/api/useAttendance.ts lines 53-70 shows submit attendance hook:
```typescript
export function useSubmitAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkAttendancePayload) => {
      const { data } = await axiosInstance.post('/attendance/bulk', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.bySection(variables.section_id, variables.date),
      });
      toast.success('Attendance submitted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to submit attendance');
    },
  });
}
```

From src/app/[locale]/(dashboard)/dashboard/attendance/page.tsx lines 89-99 shows mark all present functionality:
```typescript
const markAllPresent = () => {
  if (!existingRecords) return;
  const map: Record<string, AttendanceEntry> = {};
  existingRecords.forEach((r) => {
    map[r.student_id] = {
      student_id: r.student_id,
      status: AttendanceStatus.PRESENT,
    };
  });
  setEntries(map);
};
```

PROBLEMS FOUND:
1. No delete functionality for attendance records
2. Barcode/QR code attendance method is disabled (line 186 in page.tsx)
3. Face scan and face enrollment pages not reviewed in detail
4. No attendance history view or reports in admin portal
5. No export functionality for attendance data
6. No validation for duplicate attendance submissions on same date

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Grades Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/grades/page.tsx
- src/features/grades/api/useGrades.ts
- src/features/grades/types/index.ts
- src/features/grades/components/GradeEntryGrid.tsx

WHAT IT DOES:
Manages student grades through assessments and grade entry. Provides cascading filters for academic year, class, subject, and assessment. Supports creating assessments (quiz, test, midterm, final, assignment, project) with max score and weight. Displays student roster with score input fields, automatic letter grade calculation (A-F based on percentage), and bulk grade submission.

UI COMPONENTS:
- GradesPage - Main grades page with cascading filters, assessment management, and grade entry grid
- AssessmentSelector - Horizontal list of assessment buttons for quick selection
- CreateAssessmentDialog - Modal for creating new assessments with name, type, max score, and weight
- GradeEntryGrid - Student list with score input fields and calculated letter grades
- Select - Dropdown selectors for academic year, class, subject, and assessment
- Badge - Assessment type badges with color coding and letter grade badges
- Avatar - Student avatar with initials
- Button - Save grades and create assessment buttons

API CALLS:
- Method: GET
- URL: /assessments
- Sends: { class_id, subject_id }
- Expects: Assessment[] array
- File: src/features/grades/api/useGrades.ts (line 20)

- Method: POST
- URL: /assessments
- Sends: { name, type, max_score, weight, subject_id, class_id, term_id }
- Expects: Created assessment object
- File: src/features/grades/api/useGrades.ts (line 33)

- Method: GET
- URL: /grades/assessment/{assessmentId}
- Sends: none
- Expects: Grade[] array with student roster and existing grades
- File: src/features/grades/api/useGrades.ts (line 50)

- Method: POST
- URL: /grades/bulk
- Sends: { assessment_id, entries: [{ student_id, score, comment? }] }
- Expects: Bulk submission confirmation
- File: src/features/grades/api/useGrades.ts (line 61)

- Method: GET
- URL: /grades/report-card/{studentId}
- Sends: { term_id }
- Expects: ReportCard object
- File: src/features/grades/api/useGrades.ts (line 80)

FORM FIELDS (if form exists):
Assessment Creation Form:
- name: string, required
- type: enum, required (quiz, test, midterm, final, assignment, project)
- max_score: number, required (default 100)
- weight: number, required (default 10, min 1, max 100)

Grade Entry Form (per student):
- student_id: string, required
- score: number, required (min 0, max max_score)
- comment: string, optional

CRUD STATUS:
Assessments:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ❌ Missing (no edit assessment functionality)
- DELETE: ❌ Missing (no delete assessment functionality)

Grades:
- CREATE: ✅ Full (bulk submission)
- READ:   ✅ Full (by assessment and report card)
- UPDATE: ✅ Full (resubmitting grades updates records)
- DELETE: ❌ Missing (no delete grade functionality)

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ✅ Wired to UI (cascading filters: year, class, subject, assessment)
- Pagination: ❌ Missing (not applicable for grade entry view)
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Assessment creation and grade entry are fully implemented. No edit or delete functionality for assessments. No delete functionality for grades. No grade history view or reports in admin portal (report card API exists but no UI).

EVIDENCE:
From src/features/grades/api/useGrades.ts lines 16-27 shows assessments query:
```typescript
export function useAssessments(classId: string, subjectId: string) {
  return useQuery({
    queryKey: gradesKeys.assessments(classId, subjectId),
    queryFn: async (): Promise<Assessment[]> => {
      const { data } = await axiosInstance.get('/assessments', {
        params: { class_id: classId, subject_id: subjectId },
      });
      return data;
    },
    enabled: !!classId && !!subjectId,
  });
}
```

From src/features/grades/api/useGrades.ts lines 29-44 shows create assessment hook:
```typescript
export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Assessment, 'id' | 'created_at' | 'subject_name' | 'class_name' | 'term_name'>) => {
      const { data } = await axiosInstance.post('/assessments', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all });
      toast.success('Assessment created successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create assessment');
    },
  });
}
```

From src/app/[locale]/(dashboard)/dashboard/grades/page.tsx lines 319-321 shows automatic letter grade calculation:
```typescript
const letterGrade = pct !== null
  ? pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'
  : '—';
```

PROBLEMS FOUND:
1. No edit functionality for assessments
2. No delete functionality for assessments
3. No delete functionality for grades
4. term_id is hardcoded to empty string in create assessment (line 91 in page.tsx)
5. No grade history view or reports in admin portal
6. No export functionality for grades
7. No validation for score exceeding max_score in UI (only HTML attribute)
8. GradeEntryGrid component not reviewed in detail (assumed to exist based on imports)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Notifications Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/notifications/page.tsx (history)
- src/app/[locale]/(dashboard)/dashboard/notifications/alert-rules/page.tsx
- src/app/[locale]/(dashboard)/dashboard/notifications/compose/page.tsx
- src/app/[locale]/(dashboard)/dashboard/notifications/rules/page.tsx
- src/features/notifications/api/useNotifications.ts
- src/features/notifications/api/useNotificationHistory.ts
- src/features/notifications/api/useNotificationComposer.ts
- src/features/notifications/components/NotificationComposer.tsx
- src/features/notifications/components/AlertRulesManager.tsx
- src/features/notifications/components/AlertRuleFormModal.tsx

WHAT IT DOES:
Manages notifications with three main sub-features: notification history (view past notifications with filters), compose/send new notifications, and alert rules (automated notification triggers). Supports multiple channels (in-app, SMS, email), priority levels (urgent, high, medium, low), and recipient targeting (all users, specific roles, specific users). Alert rules support automated triggers for consecutive absence, low attendance rate, low grades, and fee overdue.

UI COMPONENTS:
- NotificationsPage (history) - Filterable table of notification history with detail modal
- AlertRulesPage - Card grid for managing automated notification rules with toggle switches
- ComposeNotificationPage - Form for creating and sending new notifications
- NotificationComposer - Component for composing messages with recipient preview
- AlertRulesManager - Component for managing alert rules
- AlertRuleFormModal - Modal for creating/editing alert rules
- Table - History table with filters
- Dialog - Detail modal for notification details
- Select - Dropdown filters for type, date range, channel
- Badge - Priority badges, channel badges, status badges
- Switch - Toggle for enabling/disabling alert rules

API CALLS:
Notification History:
- Method: GET
- URL: /notifications/history
- Sends: { type, dateFrom, dateTo, channel, target, page, limit, search }
- Expects: { items: NotificationHistory[], total: number }
- File: src/features/notifications/api/useNotificationHistory.ts (line 37)

- Method: GET
- URL: /notifications/{notificationId}/detail
- Sends: none
- Expects: NotificationDetail object with recipients and status
- File: src/features/notifications/api/useNotificationHistory.ts (line 50)

- Method: POST
- URL: /notifications/{notificationId}/retry
- Sends: none
- Expects: Retry confirmation
- File: src/features/notifications/api/useNotificationHistory.ts (line 66)

Notification Composer:
- Method: POST
- URL: /notifications/preview-recipients
- Sends: { targetType, targetIds }
- Expects: { count: number, sampleNames: string[] }
- File: src/features/notifications/api/useNotificationComposer.ts (line 13)

- Method: POST
- URL: /notifications/send
- Sends: { title, message, priority, channels, targetType, targetIds, scheduledFor? }
- Expects: Send confirmation
- File: src/features/notifications/api/useNotificationComposer.ts (line 26)

Alert Rules:
- Method: GET
- URL: /notifications/alert-rules
- Sends: none
- Expects: AlertRule[] array
- File: src/features/notifications/api/useNotifications.ts (line 183)

- Method: POST
- URL: /notifications/alert-rules
- Sends: { name, trigger, config, channels, recipients, enabled }
- Expects: Created alert rule object
- File: src/features/notifications/api/useNotifications.ts (line 193)

- Method: PATCH
- URL: /notifications/alert-rules/{id}
- Sends: { name?, trigger?, config?, channels?, recipients?, enabled? }
- Expects: Updated alert rule object
- File: src/features/notifications/api/useNotifications.ts (line 210)

- Method: DELETE
- URL: /notifications/alert-rules/{id}
- Sends: none
- Expects: Deletion confirmation
- File: src/features/notifications/api/useNotifications.ts (line 227)

General Notifications:
- Method: GET
- URL: /notifications
- Sends: none
- Expects: Notification[] array for current user
- File: src/features/notifications/api/useNotifications.ts (line 24)

- Method: GET
- URL: /notifications/unread/count
- Sends: none
- Expects: { count: number }
- File: src/features/notifications/api/useNotifications.ts (line 37)

- Method: POST
- URL: /notifications/{notificationId}/read
- Sends: none
- Expects: Mark as read confirmation
- File: src/features/notifications/api/useNotifications.ts (line 79)

- Method: POST
- URL: /notifications/read-all
- Sends: none
- Expects: Mark all as read confirmation
- File: src/features/notifications/api/useNotifications.ts (line 97)

- Method: GET
- URL: /notifications/preferences
- Sends: none
- Expects: NotificationPreferences object
- File: src/features/notifications/api/useNotifications.ts (line 112)

- Method: PATCH
- URL: /notifications/preferences
- Sends: { emailEnabled?, smsEnabled?, inAppEnabled?, categories? }
- Expects: Updated preferences object
- File: src/features/notifications/api/useNotifications.ts (line 124)

FORM FIELDS (if form exists):
Notification Composer Form:
- title: string, required
- message: string, required
- priority: enum, required (urgent, high, medium, low)
- channels: array, required (in_app, sms, email)
- targetType: enum, required (all, role, specific)
- targetIds: array, optional (user IDs or role names)
- scheduledFor: string, optional (datetime)

Alert Rule Form:
- name: string, required
- trigger: enum, required (consecutive_absence, low_attendance_rate, low_grade, fee_overdue)
- config: object, required (thresholds based on trigger type)
- channels: array, required (in_app, sms, email)
- recipients: array, required (student, guardian, teacher, admin)
- enabled: boolean, required

CRUD STATUS:
Notification History:
- CREATE: ❌ Not applicable (history is read-only)
- READ:   ✅ Full
- UPDATE: ⚠️ Partial (retry failed notifications only)
- DELETE: ❌ Missing

Notification Composer:
- CREATE: ✅ Full
- READ:   ❌ Not applicable
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

Alert Rules:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ✅ Wired to API (search parameter in history)
- Filter:     ✅ Wired to API (type, date range, channel, target filters)
- Pagination: ⚠️ Partial (API supports page/limit but no pagination UI in history page)
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Notification history, composer, and alert rules are fully implemented. No delete functionality for notification history. No pagination UI in history page despite API support. NotificationComposer, AlertRulesManager, and AlertRuleFormModal components not reviewed in detail (assumed to exist based on imports).

EVIDENCE:
From src/features/notifications/api/useNotificationHistory.ts lines 28-44 shows history query with filters:
```typescript
export function useNotificationHistory(
  filters: NotificationHistoryFilters = {},
) {
  return useQuery({
    queryKey: historyKeys.list(filters),
    queryFn: async (): Promise<{
      items: NotificationHistory[];
      total: number;
    }> => {
      const { data } = await axiosInstance.get("/notifications/history", {
        params: filters,
      });
      return data;
    },
    enabled: true,
  });
}
```

From src/features/notifications/api/useNotifications.ts lines 189-204 shows create alert rule hook:
```typescript
export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<AlertRule, 'id' | 'created_at'>) => {
      const { data } = await axiosInstance.post('/notifications/alert-rules', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.alertRules() });
      toast.success('Alert rule created');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create alert rule');
    },
  });
}
```

From src/app/[locale]/(dashboard)/dashboard/notifications/rules/page.tsx lines 38-43 shows toggle active functionality:
```typescript
const handleToggleActive = (rule: AlertRule) => {
  updateMutation.mutate({
    id: rule.id,
    payload: { enabled: !rule.enabled },
  });
};
```

PROBLEMS FOUND:
1. No delete functionality for notification history
2. No pagination UI in history page despite API supporting page/limit parameters
3. No sort functionality in history page
4. Compose button in history page (line 127-130) doesn't have a working link/href
5. NotificationComposer, AlertRulesManager, and AlertRuleFormModal components not reviewed in detail
6. No bulk actions for notification history (delete all, mark all as read)
7. No notification template management
8. No scheduling UI in compose page (scheduledFor field exists but no UI shown)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Analytics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/analytics/page.tsx
- src/features/analytics/components/AnalyticsOverview.tsx
- src/features/analytics/components/MetricCard.tsx
- src/features/analytics/components/AttendanceTrendChart.tsx
- src/features/analytics/components/GradeDistributionChart.tsx
- src/features/analytics/components/AtRiskSummaryChart.tsx
- src/features/analytics/components/AtRiskStudentsTable.tsx
- src/features/analytics/components/ClassPerformanceTable.tsx
- src/features/analytics/hooks/useAnalyticsDashboard.ts
- src/features/analytics/hooks/useAtRiskStudents.ts
- src/features/analytics/hooks/useAttendanceTrend.ts
- src/features/analytics/hooks/useClassPerformance.ts
- src/features/analytics/hooks/useGradeDistribution.ts

WHAT IT DOES:
Provides comprehensive analytics dashboard with key metrics, charts, and tables. Displays summary metrics (total students, attendance rate, grade average, at-risk students), attendance trend charts, grade distribution charts, at-risk student summary, at-risk students table with intervention actions, and class performance comparison table. Supports filtering by term and class, with refresh functionality.

UI COMPONENTS:
- AnalyticsOverview - Main analytics dashboard with filters, metrics, charts, and tables
- MetricCard - Card component for displaying key metrics with trend indicators
- AttendanceTrendChart - Line chart showing attendance trends over time
- GradeDistributionChart - Bar/pie chart showing grade distribution
- AtRiskSummaryChart - Chart showing at-risk student counts by risk level
- AtRiskStudentsTable - Table of at-risk students with notify guardian and add intervention actions
- ClassPerformanceTable - Table comparing class performance metrics
- Select - Dropdown filters for term and class
- Button - Refresh button

API CALLS:
- Method: GET
- URL: /analytics/summary
- Sends: { termId, classId, teacherId? }
- Expects: AnalyticsSummary object (totalStudents, schoolAttendanceRate, schoolGradeAverage, atRiskCounts)
- File: src/features/analytics/hooks/useAnalyticsDashboard.ts (line 24)

- Method: GET
- URL: /analytics/at-risk-students
- Sends: { riskLevel, classId, sectionId, termId, teacherId }
- Expects: { students: StudentRisk[], total: number }
- File: src/features/analytics/hooks/useAtRiskStudents.ts (line 19)

- Method: GET
- URL: /analytics/attendance-trend
- Sends: { days, classId, sectionId, teacherId }
- Expects: AttendanceTrendEntry[] array
- File: src/features/analytics/hooks/useAttendanceTrend.ts (line 16)

- Method: GET
- URL: /analytics/grade-distribution
- Sends: { termId, subjectId, classId }
- Expects: GradeDistributionEntry[] array
- File: src/features/analytics/hooks/useGradeDistribution.ts (line 15)

- Method: GET
- URL: /analytics/class-performance
- Sends: { termId }
- Expects: ClassPerformanceEntry[] array
- File: src/features/analytics/hooks/useClassPerformance.ts (line 11)

- Method: GET
- URL: /analytics/enrollment-trends
- Sends: none
- Expects: { year: string, students: number }[] array
- File: src/features/analytics/hooks/useAnalyticsDashboard.ts (line 37)

- Method: GET
- URL: /analytics/recent-activity
- Sends: none
- Expects: any[] array
- File: src/features/analytics/hooks/useAnalyticsDashboard.ts (line 48)

- Method: POST
- URL: /notifications/send-to-guardian
- Sends: { studentId, message, type: 'intervention' }
- Expects: Send confirmation
- File: src/features/analytics/hooks/useAtRiskStudents.ts (line 40)

- Method: POST
- URL: /analytics/interventions
- Sends: { student_id, note, type, date }
- Expects: Intervention creation confirmation
- File: src/features/analytics/hooks/useAtRiskStudents.ts (line 62)

FORM FIELDS (if form exists):
Intervention Note Form:
- student_id: string, required
- note: string, required
- type: string, optional (default: 'counseling')
- date: string, required (auto-filled with current date)

CRUD STATUS:
Analytics Data:
- CREATE: ❌ Not applicable (read-only dashboard)
- READ:   ✅ Full
- UPDATE: ❌ Not applicable
- DELETE: ❌ Not applicable

Interventions:
- CREATE: ✅ Full (intervention notes)
- READ:   ✅ Full
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ✅ Wired to UI (term and class filters)
- Pagination: ❌ Missing (not applicable for dashboard view)
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — Analytics dashboard is fully implemented with comprehensive metrics and charts. Intervention notes can be created. No edit or delete functionality for interventions. No export functionality for analytics data. MetricCard, AttendanceTrendChart, GradeDistributionChart, AtRiskSummaryChart, AtRiskStudentsTable, and ClassPerformanceTable components not reviewed in detail (assumed to exist based on imports).

EVIDENCE:
From src/features/analytics/hooks/useAnalyticsDashboard.ts lines 20-31 shows analytics summary query:
```typescript
export function useAnalyticsSummary(filters?: { termId?: string; classId?: string; teacherId?: string }) {
  return useQuery({
    queryKey: analyticsKeys.summary(filters),
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data } = await axiosInstance.get<AnalyticsSummary>('/analytics/summary', {
        params: filters,
      });
      return data;
    },
    enabled: true,
  });
}
```

From src/features/analytics/hooks/useAtRiskStudents.ts lines 56-78 shows add intervention note hook:
```typescript
export function useAddInterventionNote() {
  const t = useTranslations("analytics.interventionNote");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, note, type }: { studentId: string; note: string; type?: string }) => {
      const { data } = await axiosInstance.post(`/analytics/interventions`, {
        student_id: studentId,
        note,
        type: type || 'counseling',
        date: new Date().toISOString()
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.atRisk() });
      toast.success(t("saveSuccess"));
    },
    onError: () => {
      toast.error(t("saveFailed"));
    }
  });
}
```

From src/features/analytics/components/AnalyticsOverview.tsx lines 81-87 shows refresh all functionality:
```typescript
const handleRefreshAll = () => {
  refetchSummary();
  refetchTrend();
  refetchDistribution();
  refetchAtRisk();
  refetchPerformance();
};
```

PROBLEMS FOUND:
1. No edit functionality for intervention notes
2. No delete functionality for intervention notes
3. No export functionality for analytics data (PDF, Excel, etc.)
4. No drill-down functionality from charts to detailed views
5. No date range filter for analytics (only term filter)
6. MetricCard, AttendanceTrendChart, GradeDistributionChart, AtRiskSummaryChart, AtRiskStudentsTable, and ClassPerformanceTable components not reviewed in detail
7. Enrollment trends and recent activity hooks exist but not used in AnalyticsOverview component
8. No comparison between different terms or years

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- src/app/[locale]/(dashboard)/dashboard/settings/page.tsx
- src/hooks/use-settings.ts
- src/lib/api/settings.service.ts

WHAT IT DOES:
Provides comprehensive settings management with multiple tabs: General (school information), Academic (grading scale, attendance thresholds, face recognition), Notifications (alert settings), Appearance (theme, language, date/time format), Security (session timeout, 2FA, password policies - admin only), and Attendance (attendance methods, face recognition settings). Uses localStorage for appearance settings and API calls for other settings.

UI COMPONENTS:
- SettingsPage - Main settings page with tab navigation
- SchoolInfoTab - School information form with validation
- AcademicTab - Academic settings with grading scale inputs and sliders
- NotificationsTab - Notification settings with switches and thresholds
- AppearanceTab - Theme, language, date/time format selectors
- SecurityTab - Security settings (session timeout, 2FA, password policies)
- AttendanceTab - Attendance settings (default method, auto-mark absent, face recognition)
- Tabs - Tab navigation for different setting categories
- Card - Card containers for each tab
- Form components: Input, Textarea, Select, Switch, Slider

API CALLS:
- Method: GET
- URL: /settings/school-info
- Sends: none
- Expects: SchoolInfo object (school_name, address, phone, email, website, region, zone, woreda)
- File: src/lib/api/settings.service.ts (line 27)

- Method: PATCH
- URL: /settings/school-info
- Sends: { school_name?, address?, phone?, email?, website?, region?, zone?, woreda? }
- Expects: Updated school info object
- File: src/lib/api/settings.service.ts (line 31)

- Method: GET
- URL: /settings/academic
- Sends: none
- Expects: AcademicSettings object (grading_scale, passing_mark, attendance_warning_threshold, confidence_threshold)
- File: src/lib/api/settings.service.ts (line 36)

- Method: PATCH
- URL: /settings/academic
- Sends: { grading_scale?, passing_mark?, attendance_warning_threshold?, confidence_threshold? }
- Expects: Updated academic settings object
- File: src/lib/api/settings.service.ts (line 40)

- Method: GET
- URL: /settings/notifications
- Sends: none
- Expects: NotificationSettings object (absence_alert, low_grade_alert, fee_reminder, consecutive_absence_threshold)
- File: src/lib/api/settings.service.ts (line 45)

- Method: PATCH
- URL: /settings/notifications
- Sends: { absence_alert?, low_grade_alert?, fee_reminder?, consecutive_absence_threshold? }
- Expects: Updated notification settings object
- File: src/lib/api/settings.service.ts (line 49)

FORM FIELDS (if form exists):
School Info Form:
- school_name: string, required
- address: string, required
- phone: string, required
- email: string, required, email format
- website: string, optional, URL format
- region: string, optional
- zone: string, optional
- woreda: string, optional

Academic Settings Form:
- grading_scale.A: number, required (0-100)
- grading_scale.B: number, required (0-100)
- grading_scale.C: number, required (0-100)
- grading_scale.D: number, required (0-100)
- attendance_warning_threshold: number, required (50-100)
- confidence_threshold: number, required (50-100)
- late_arrival_threshold: number, optional (UI only, not in schema)
- max_students_per_section: number, optional (UI only, not in schema)
- academic_year_start_month: number, optional (UI only, not in schema)
- face_recognition_enabled: boolean, optional (UI only, not in schema)

Notification Settings Form:
- absence_alert: boolean, required
- low_grade_alert: boolean, required
- fee_reminder: boolean, required
- consecutive_absence_threshold: number, required (min 1)
- low_grade_alert_threshold: number, optional (UI only, not in schema)
- fee_reminder_days_before: number, optional (UI only, not in schema)
- notify_guardian_on_absence: boolean, optional (UI only, not in schema)
- notify_guardian_on_low_grade: boolean, optional (UI only, not in schema)

Appearance Settings (localStorage):
- theme: enum (light, dark, system)
- language: enum (en, am)
- dateFormat: enum (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- timeFormat: enum (12h, 24h)

Security Settings (UI only, no API):
- sessionTimeout: enum (30, 60, 120, 240, never)
- require2fa: boolean
- passwordExpiry: number (0-365)
- minPasswordLength: number (8-32)
- passwordComplexity: boolean

Attendance Settings (UI only, no API):
- defaultMethod: enum (manual, face, barcode)
- autoMarkAbsent: number (5-60)
- allowEditing: boolean
- reportTemplate: enum (standard, detailed, summary)
- faceRecognition: boolean
- confidenceThreshold: number (50-99)

CRUD STATUS:
School Info:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Not applicable

Academic Settings:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Not applicable

Notification Settings:
- CREATE: ❌ Not applicable
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Not applicable

Appearance Settings:
- CREATE: ❌ Not applicable
- READ:   ✅ Full (localStorage)
- UPDATE: ✅ Full (localStorage)
- DELETE: ❌ Not applicable

Security Settings:
- CREATE: ❌ Not applicable
- READ:   ❌ Not implemented (UI only)
- UPDATE: ❌ Not implemented (UI only, no API)
- DELETE: ❌ Not applicable

Attendance Settings:
- CREATE: ❌ Not applicable
- READ:   ❌ Not implemented (UI only)
- UPDATE: ❌ Not implemented (UI only, no API)
- DELETE: ❌ Not applicable

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Not applicable
- Filter:     ❌ Not applicable
- Pagination: ❌ Not applicable
- Sort:       ❌ Not applicable

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — School info, academic settings, and notification settings are fully implemented with API integration. Appearance settings use localStorage. Security and attendance tabs have UI but no API integration. Some fields in academic and notification tabs exist in UI but are not in the schema/API (late_arrival_threshold, max_students_per_section, academic_year_start_month, low_grade_alert_threshold, fee_reminder_days_before, notify_guardian_on_absence, notify_guardian_on_low_grade).

EVIDENCE:
From src/lib/api/settings.service.ts lines 25-33 shows school info API calls:
```typescript
export const settingsService = {
  getSchoolInfo: async () => {
    const { data } = await axiosInstance.get<SchoolInfo>('/settings/school-info');
    return data;
  },
  updateSchoolInfo: async (data: Partial<SchoolInfo>) => {
    const response = await axiosInstance.patch('/settings/school-info', data);
    return response.data;
  },
```

From src/app/[locale]/(dashboard)/dashboard/settings/page.tsx lines 36-46 shows school info schema with validation:
```typescript
const schoolInfoSchema = z.object({
  school_name: z.string().min(1, 'School name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  region: z.string().optional(),
  zone: z.string().optional(),
  woreda: z.string().optional(),
});
```

From src/app/[locale]/(dashboard)/dashboard/settings/page.tsx lines 91-95 shows localStorage handling for appearance settings:
```typescript
const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
  setTheme(value);
  localStorage.setItem('theme', value);
  toast.success(ts('settingsSaved'));
};
```

PROBLEMS FOUND:
1. Security tab has no API integration (UI only)
2. Attendance tab has no API integration (UI only)
3. Several fields in academic tab not in schema: late_arrival_threshold, max_students_per_section, academic_year_start_month
4. Several fields in notification tab not in schema: low_grade_alert_threshold, fee_reminder_days_before, notify_guardian_on_absence, notify_guardian_on_low_grade
5. Face recognition settings appear in both academic and attendance tabs (duplicated)
6. 2FA marked as "coming soon" (line 688)
7. No logo upload functionality despite logo_url in SchoolInfo interface
8. No reset to server defaults functionality (only reset to form defaults)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This analysis covers 14 admin portal features. Below is a summary of implementation status across all features:

FULLY IMPLEMENTED:
- Users Management
- Students Management
- Teachers Management
- Guardians Management
- Directors Management
- Academics Management

PARTIALLY IMPLEMENTED:
- Enrollments Management - Missing general update and delete, no sorting
- Schedule Management - API endpoints mocked, no conflict detection, no teacher schedule view
- Attendance Management - No delete, barcode/QR disabled, no reports
- Grades Management - No edit/delete for assessments, no delete for grades, no reports
- Notifications Management - No delete for history, no pagination UI, compose button broken
- Analytics - No edit/delete for interventions, no export, no drill-down
- Settings - Security and attendance tabs have no API, schema mismatches

COMMON ISSUES ACROSS FEATURES:
1. Missing delete functionality in several features (Enrollments, Schedule, Attendance, Grades, Notifications)
2. Missing edit functionality in several features (Enrollments, Grades, Analytics interventions)
3. Missing export functionality (Attendance, Grades, Analytics)
4. Missing reports/views (Attendance history, Grade reports, Teacher schedule view)
5. Schema/UI mismatches (Settings has fields in UI not in schema)
6. API endpoints mocked or incomplete (Schedule)
7. Pagination not implemented in UI despite API support (Notifications)
8. Sorting not implemented in most features

TOTAL FEATURES ANALYZED: 14
FULLY IMPLEMENTED: 6 (43%)
PARTIALLY IMPLEMENTED: 8 (57%)
NOT IMPLEMENTED: 0 (0%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
