# BUSINESS CONTEXT REPORT

Generated from codebase analysis on April 29, 2026

---

## QUESTION 1: SCHOOL TYPE

**What type of school is this system designed for?**

**Evidence from code:**
- Phone number validation uses Ethiopian format: `+251\d{9}` (seen in `guardians/[id]/edit/page.tsx` and `students/[id]/edit/page.tsx`)
- Language support includes Amharic (`am`) alongside English (`en`) (seen in settings page and throughout)
- Address fields include Ethiopian administrative divisions: `region`, `zone`, `woreda` (seen in settings page)
- References to "ministry exam result" (seen in student edit page)
- Translation keys include Amharic-specific terminology

**Answer:** This system is designed for Ethiopian schools (K-12 or secondary education).

---

## QUESTION 2: ACADEMIC STRUCTURE

**How is the school structured academically?**

**How are students grouped?**
- Students are assigned to **sections**
- Sections belong to **classes**
- Classes have **grade levels** (e.g., Grade 9, Grade 10)
- Classes belong to **academic years**

**What is the academic calendar structure?**
- **Academic years** with start and end dates
- **Terms** within academic years (e.g., Term 1, Term 2)
- Terms can be marked as "active"
- Academic year can be marked as "current"

**What terminology is used?**
- Academic year / term (not semester/quarter)
- Class / section / grade level (not form)
- Subjects can be: core, elective, vocational, extracurricular

**Evidence:**
- `academics/years/[yearId]/page.tsx` - Shows academic years with terms and classes
- `academics/classes/[classId]/page.tsx` - Shows sections within classes
- `academics/subjects/page.tsx` - Shows subject categories
- Schema files define: `AcademicYear`, `Term`, `Class`, `Section`, `Subject`

---

## QUESTION 3: ENROLLMENT PROCESS

**Based on the code, describe the complete enrollment process step by step.**

**What the code can actually do:**
1. Create student records (via students page)
2. Create guardian accounts (via guardians/create page)
3. Link guardians to students with relationship types (father, mother, guardian, etc.)
4. Transfer students between sections (via enrollments page with transfer modal)
5. Withdraw students (via enrollments page with withdrawal modal)
6. Assign students to sections (implied from section roster page structure)

**What is missing from the enrollment process:**
- **Section roster page has hardcoded empty students array** (`academics/classes/[classId]/sections/[sectionId]/page.tsx` line 38: `const students: unknown[] = [];`) - this means the actual student-to-section assignment UI is not implemented
- No visible enrollment application workflow
- No enrollment approval process
- No enrollment status tracking (pending, approved, rejected)
- No enrollment fee collection integration

**Evidence:**
- `enrollments/page.tsx` - Has transfer and withdrawal modals
- `guardians/[id]/page.tsx` - Has guardian-student linking functionality
- `academics/classes/[classId]/sections/[sectionId]/page.tsx` - Comment says "Student rows will go here in a later phase"

---

## QUESTION 4: ATTENDANCE SYSTEM

**How does attendance work based on the code?**

**Who takes attendance?**
- Teachers (via `TeacherAttendanceForm` component)
- Potentially administrators (via attendance page)

**How is it taken?**
- **Manual entry**: Select status (present, absent, late) for each student
- **Face scan**: Camera-based attendance recognition
- **Face enrollment**: Students must enroll their face data first

**What is tracked?**
- Date of attendance
- Student status: present, absent, late
- Notes/remarks per student
- Attendance percentage per student
- Attendance summary (present%, absent%, late%)
- Attendance warning threshold (default 75% in settings)

**What reports exist?**
- Attendance calendar view (student portal)
- Attendance records table with pagination and filters
- Attendance summary cards
- Attendance warning banner when below threshold

**What is missing?**
- **Multiple backend endpoints marked as "BACKEND REQUIRED"**:
  - `GET /attendance/check` - to check if attendance already taken
  - `POST /attendance/bulk` - to submit attendance records
  - `GET /teachers/{teacherId}/attendance-records` - to fetch teacher's attendance records
- Face recognition backend endpoints may not exist
- No attendance policy enforcement (e.g., auto-mark absent after X minutes)
- No parent notification on absence (UI exists but backend unclear)

**Evidence:**
- `attendance/page.tsx` - Main attendance page with filters
- `attendance/face-scan/page.tsx` - Face scan setup
- `attendance/face-enrollment/page.tsx` - Face enrollment for students
- `teacher/components/TeacherAttendanceForm.tsx` - Teacher attendance form
- `teacher/hooks/useTeacherAttendance.ts` - Has "BACKEND REQUIRED" comments
- `student-portal/components/AttendanceCalendar.tsx` - Student attendance view

---

## QUESTION 5: GRADING SYSTEM

**How do grades work based on the code?**

**What types of assessments exist?**
- Not explicitly defined in code, but assessment records exist with:
  - Assessment name
  - Assessment type
  - Assessment date
  - Score and percentage

**How are grades entered?**
- Teachers enter grades via `TeacherGradeEntry` component
- Grades are entered per student per assessment
- Bulk submission of grades for an assessment
- Score validation (0-100 range)
- Remarks can be added per student

**What is the grading scale?**
- Default grading scale in settings:
  - A: 90+
  - B: 80+
  - C: 70+
  - D: 60+
- Configurable via academic settings

**What is the passing mark?**
- Passing threshold: 50% (from `student-portal/api/useAcademicSettings.ts` and settings page)
- Configurable via academic settings

**What reports exist?**
- Subject score summary table (per subject: assessments, total score, percentage, pass/fail)
- Assessment details table (detailed assessment grades with pagination)
- Student report card (printable, includes grades by subject)
- Grade filters by term and subject

**What is missing?**
- **availableTerms endpoint is missing** - TODO comment says "needs a global endpoint or we mock" (`student/my-grades/page.tsx`)
- **Multiple teacher grade endpoints marked as "BACKEND REQUIRED"**:
  - `GET /teachers/{teacherId}/assessments`
  - `GET /assessments/{assessmentId}/grades`
  - `POST /assessments/{assessmentId}/grades/bulk`
- No grade curve or adjustment features
- No grade book export functionality

**Evidence:**
- `grades/page.tsx` - Main grades page
- `teacher/components/TeacherGradeEntry.tsx` - Teacher grade entry
- `teacher/hooks/useTeacherGrades.ts` - Has "BACKEND REQUIRED" comments
- `student-portal/components/SubjectScoreSummaryTable.tsx` - Subject summary
- `student-portal/components/AssessmentDetailsTable.tsx` - Assessment details
- `student-portal/components/StudentReportCard.tsx` - Report card
- `settings/page.tsx` - Grading scale configuration

---

## QUESTION 6: FEE SYSTEM

**How do fees and payments work based on the code?**

**What types of fees exist?**
- Not determinable from code - fee structure is not visible in the codebase

**How are payments recorded?**
- There is a `guardian/payments/page.tsx` that renders `GuardianPaymentsPage` component
- However, the actual payment recording logic is not visible in the pages I reviewed
- No fee creation or management pages were found

**What is missing?**
- Fee structure definition
- Fee assignment to students
- Payment recording interface
- Payment history
- Fee reminders (UI mentions fee reminders but implementation unclear)
- Receipt generation
- Payment status tracking

**Evidence:**
- `guardian/payments/page.tsx` - Only renders a component, no logic visible
- Settings page mentions "fee_reminder" notification setting but no fee management UI
- Notifications page mentions "fee_overdue" trigger but no fee system

**Answer:** The fee system appears to be largely unimplemented. Only a placeholder page exists.

---

## QUESTION 7: USER CAPABILITIES SUMMARY

**In plain English, what can each role do?**

### ADMIN
- Manage academic years (create, edit, view, archive)
- Manage terms within academic years
- Manage classes and sections
- Manage subjects
- Manage students (create, edit, view, delete)
- Manage guardians (create, edit, view, delete, link to students)
- Manage directors (users with director role)
- Manage notifications (compose, view history)
- Configure school settings (school info, academic settings, notification settings)
- View analytics dashboard
- Manage users (implied from users page)

### TEACHER
- View dashboard with stats (today's classes, total students, pending grades, attendance taken)
- View weekly timetable
- View class roster with attendance summary
- Take attendance (manual entry)
- View attendance records
- Enter and submit student grades for assessments
- View assessments with filters
- **Backend endpoints for teacher features are marked as "BACKEND REQUIRED"**

### STUDENT
- View dashboard with personalized content
- View profile information
- Change password
- View attendance (calendar view, records table, summary)
- View grades (subject summary, assessment details, report card)
- View schedule (weekly timetable)
- Filter grades by term and subject

### GUARDIAN
- View dashboard with children's information
- View profile
- View linked children
- View children's details (grades, attendance, schedule)
- View notifications
- View payments (placeholder only)
- **Password change form has no submit handler**

---

## QUESTION 8: WHAT WOULD STOP A SCHOOL FROM USING THIS TODAY?

**List the specific things that are broken or missing that would prevent real use.**

### Critical Blockers:
1. **Authentication uses mock fallback** - If backend auth fails, it falls back to mock user (PROBLEM #1, #2)
2. **Section roster page has hardcoded empty students** - Cannot view or manage students in sections (PROBLEM #39)
3. **Teacher features have missing backend endpoints** - Teachers cannot take attendance, enter grades, or view their schedule (PROBLEM #31-35)
4. **Guardian password change doesn't work** - No submit handler (PROBLEM #50)
5. **Student grades term filtering incomplete** - availableTerms endpoint missing (PROBLEM #55)
6. **Guardian linking in student edit is placeholder** - Cannot link guardians to students (PROBLEM #54)

### High-Priority Missing Features:
7. **Fee system is unimplemented** - Cannot manage or collect fees
8. **Enrollment workflow incomplete** - Cannot properly assign students to sections
9. **Face recognition backend may not exist** - Face attendance features may not work
10. **Multiple native confirm dialogs** - Poor UX, not consistent with app design (PROBLEM #8, #9, #10, #40, #41)

### Type Safety Issues (may cause runtime errors):
11. **Extensive use of `any` types** - 27 instances of type safety issues that could cause runtime errors

### API Endpoints Marked as Required but May Not Exist:
12. Schedule endpoints (PROBLEM #3, #30)
13. Face recognition endpoints (PROBLEM #5, #6)
14. Teacher dashboard, schedule, classes, grades, attendance endpoints (PROBLEM #31-35)

---

## QUESTION 9: MINIMUM VIABLE FEATURES FOR LAUNCH

**What is the minimum set of features that must work for a school to start using this system?**

| Feature | Currently Working? | Notes |
|---------|-------------------|-------|
| **Authentication** | ⚠️ Partial | Has mock fallback, needs real backend |
| **Student Management** | ✅ Working | CRUD operations exist |
| **Guardian Management** | ✅ Working | CRUD and linking exist |
| **Academic Structure** | ✅ Working | Years, terms, classes, sections management |
| **Subject Management** | ✅ Working | CRUD operations exist |
| **Class Roster** | ❌ Broken | Hardcoded empty students array |
| **Attendance (Manual)** | ❌ Broken | Backend endpoints missing |
| **Attendance (Face)** | ❌ Broken | Backend endpoints missing |
| **Grade Entry** | ❌ Broken | Backend endpoints missing |
| **Grade Viewing (Student)** | ✅ Working | Student can view grades |
| **Report Cards** | ✅ Working | Can generate report cards |
| **Fee Management** | ❌ Missing | Entirely unimplemented |
| **Notifications** | ✅ Working | Can compose and view history |
| **Analytics** | ✅ Working | Dashboard exists |

**Minimum viable set for launch:**
1. ✅ Authentication (fix mock fallback)
2. ✅ Student management
3. ✅ Guardian management
4. ✅ Academic structure
5. ❌ Class roster (MUST FIX - hardcoded empty array)
6. ❌ Manual attendance (MUST FIX - backend endpoints)
7. ❌ Grade entry (MUST FIX - backend endpoints)
8. ✅ Grade viewing
9. ❌ Fee management (could defer to later phase)

---

## QUESTION 10: OBSERVATIONS ABOUT BUSINESS RULES

**Based on the business rules you found in Phase 6:**

### Which rules seem correct for a real school?
- **User role-based access control** - Correct, different roles need different permissions
- **Guardian-student linking with relationship types** - Correct, real schools track relationships
- **Academic year and term structure** - Correct, standard academic calendar
- **Attendance tracking with status types** - Correct, present/absent/late is standard
- **Grading scale configuration** - Correct, schools need customizable grading
- **Passing threshold configuration** - Correct, schools set their own standards
- **Section capacity limits** - Correct, classrooms have physical limits
- **Student status tracking (active, graduated, transferred, etc.)** - Correct, standard enrollment statuses

### Which rules seem wrong or unrealistic?
- **Face recognition as primary attendance method** - May be unrealistic for many schools due to cost, privacy concerns, and technical requirements
- **Hardcoded Ethiopian phone format** - Limits system to Ethiopia only, not internationalizable
- **No visible enrollment approval workflow** - Real schools typically have application and approval processes
- **No visible attendance policy enforcement** - Real schools have policies like "3 absences = warning" but this is not enforced in code

### Which important rules are completely missing?
- **Enrollment application and approval workflow** - No process for new student applications
- **Attendance consequence policies** - No automated consequences for poor attendance (e.g., detention, parent notification)
- **Grade promotion/retention rules** - No rules for when students advance to next grade
- **Fee payment deadlines and penalties** - No late fee policies
- **Disciplinary tracking** - No behavior or disciplinary record system
- **Extracurricular activity management** - No sports, clubs, or activity tracking
- **Transportation management** - No bus route or transportation tracking
- **Library management** - No book borrowing or library system
- **Health records** - No medical or vaccination tracking
- **Parent-teacher conference scheduling** - No meeting scheduling system

### What would a school administrator likely complain about?
1. **"I can't see which students are in which sections"** - Section roster is broken (hardcoded empty)
2. **"Teachers can't take attendance"** - Backend endpoints missing
3. **"Teachers can't enter grades"** - Backend endpoints missing
4. **"I can't manage fees or payments"** - Entire fee system missing
5. **"The face recognition doesn't work"** - Backend may not exist
6. **"I can't properly enroll new students into classes"** - Section assignment incomplete
7. **"Guardians can't change their passwords"** - Form has no submit handler
8. **"The system falls back to a fake user if authentication fails"** - Security concern
9. **"I can't filter grades by term"** - availableTerms endpoint missing
10. **"The delete confirmations look different from the rest of the app"** - Native confirm dialogs used

---

## SUMMARY

This School Management System is designed for Ethiopian K-12 schools. It has a solid foundation for academic structure management (years, terms, classes, sections, subjects) and student/guardian management. However, critical operational features are incomplete or broken:

- **Teacher features are non-functional** due to missing backend endpoints
- **Section roster is broken** (hardcoded empty students)
- **Fee system is completely missing**
- **Face recognition features may not work**
- **Several type safety issues** could cause runtime errors

The system appears to be in a mid-development state where the administrative UI is largely complete, but the operational features (attendance, grading, fees) that teachers and students would use daily are not yet functional.

**Recommendation:** Before any school can use this system, the following MUST be fixed:
1. Remove mock authentication fallback
2. Implement section roster student list
3. Implement all teacher-related backend endpoints
4. Implement fee management system (or clearly mark as out of scope)
5. Fix guardian password change functionality
6. Implement guardian linking in student edit
7. Replace native confirm dialogs with custom modals
8. Resolve type safety issues that could cause runtime errors
