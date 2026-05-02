# Frontend Data Model Documentation - Core Entities

This document describes the complete data model from the frontend TypeScript types. Only types that actually exist in the code are documented.

## Core Entities

### User
**File Path:** `src/lib/store/auth-store.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the user |
| email | string | Yes | User's email address |
| first_name | string | Yes | User's first name |
| last_name | string | Yes | User's last name |
| roles | string[] | Yes | Array of role names assigned to the user (e.g., 'admin', 'teacher', 'student', 'guardian') |
| must_change_password | boolean | Yes | Flag indicating if user must change password on next login |

**Relationships:**
- One-to-Many: User → Students (when user is a guardian)
- One-to-Many: User → Classes (when user is a teacher)
- One-to-Many: User → Notifications (as recipient)

**Usage:**
- Used in `src/lib/store/auth-store.ts` for authentication state
- Used in `src/components/auth/RoleGuard.tsx` for role-based access control
- Used in `src/components/auth/protected-route.tsx` for route protection
- Used in `src/hooks/use-permissions.ts` for permission checks

---

### Student
**File Path:** `src/features/student-portal/types.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the student |
| student_id | string | Yes | Student's unique ID number/registration number |
| first_name | string | Yes | Student's first name |
| last_name | string | Yes | Student's last name |
| date_of_birth | string | Yes | Student's date of birth |
| gender | string | Yes | Student's gender |
| enrollment_date | string | Yes | Date when student was enrolled |
| enrollment_status | string | Yes | Current enrollment status (e.g., 'active', 'withdrawn', 'transferred') |
| guardian_id | number | Yes | ID of the guardian associated with the student |
| class_id | number | No | ID of the class the student is assigned to |
| section_id | number | No | ID of the section within the class |
| academic_year_id | number | No | ID of the current academic year |
| photo_url | string | No | URL to student's photo |
| address | string | No | Student's home address |
| phone | string | No | Student's phone number |
| email | string | No | Student's email address |
| emergency_contact_name | string | No | Name of emergency contact |
| emergency_contact_phone | string | No | Phone number of emergency contact |
| medical_conditions | string | No | Any medical conditions or allergies |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Student → Guardian (via guardian_id)
- Many-to-One: Student → Class (via class_id)
- Many-to-One: Student → Section (via section_id)
- Many-to-One: Student → AcademicYear (via academic_year_id)
- One-to-Many: Student → AttendanceRecords
- One-to-Many: Student → Grades
- One-to-Many: Student → Enrollments

**Usage:**
- Used in `src/features/student-portal/types.ts` for student portal features
- Used in `src/features/student-portal/components/StudentDashboardHome.tsx` for dashboard display
- Used in `src/features/student-portal/components/StudentReportCard.tsx` for report card generation
- Used in `src/features/student-portal/components/AttendanceWarningBanner.tsx` for attendance warnings

---

### Teacher
**File Path:** `src/features/teacher/types.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the teacher |
| teacher_id | string | Yes | Teacher's unique ID number |
| first_name | string | Yes | Teacher's first name |
| last_name | string | Yes | Teacher's last name |
| email | string | Yes | Teacher's email address |
| phone | string | No | Teacher's phone number |
| subject_specialization | string | No | Primary subject specialization |
| qualification | string | No | Academic qualification |
| hire_date | string | Yes | Date when teacher was hired |
| employment_status | string | Yes | Employment status (e.g., 'active', 'inactive') |
| photo_url | string | No | URL to teacher's photo |
| address | string | No | Teacher's address |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- One-to-Many: Teacher → Classes (as class teacher)
- One-to-Many: Teacher → SubjectAssignments
- One-to-Many: Teacher → Grades (as grader)

**Usage:**
- Used in `src/features/teacher/types.ts` for teacher-related features
- Used in teacher dashboard and class management pages

---

### Guardian
**File Path:** `src/features/guardian-portal/types.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the guardian |
| guardian_id | string | Yes | Guardian's unique ID number |
| first_name | string | Yes | Guardian's first name |
| last_name | string | Yes | Guardian's last name |
| email | string | Yes | Guardian's email address |
| phone | string | No | Guardian's phone number |
| relationship | string | Yes | Relationship to student (e.g., 'father', 'mother', 'guardian') |
| address | string | No | Guardian's address |
| occupation | string | No | Guardian's occupation |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- One-to-Many: Guardian → Students
- One-to-Many: Guardian → Notifications (as recipient)

**Usage:**
- Used in `src/features/guardian-portal/types.ts` for guardian portal features
- Used in guardian dashboard for viewing student information

---

### Class
**File Path:** `src/features/academics/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the class |
| class_name | string | Yes | Name of the class (e.g., 'Grade 10', 'Form 4') |
| academic_year_id | number | Yes | ID of the academic year this class belongs to |
| class_teacher_id | number | No | ID of the teacher assigned as class teacher |
| capacity | number | No | Maximum number of students allowed in the class |
| description | string | No | Description of the class |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Class → AcademicYear (via academic_year_id)
- Many-to-One: Class → Teacher (via class_teacher_id)
- One-to-Many: Class → Sections
- One-to-Many: Class → Students
- One-to-Many: Class → SubjectAssignments

**Usage:**
- Used in `src/features/academics/types/index.ts` for academic management
- Used in `src/app/[locale]/(dashboard)/dashboard/academics/classes/[classId]/page.tsx` for class details page

---

### Section
**File Path:** `src/features/academics/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the section |
| section_name | string | Yes | Name of the section (e.g., 'A', 'B', 'Science') |
| class_id | number | Yes | ID of the class this section belongs to |
| room_number | string | No | Room number where the section meets |
| capacity | number | No | Maximum number of students in the section |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Section → Class (via class_id)
- One-to-Many: Section → Students
- One-to-Many: Section → Schedules

**Usage:**
- Used in `src/features/academics/types/index.ts` for academic management
- Used in class management pages for section CRUD operations

---

### Role
**File Path:** Inferred from user.roles array in auth-store.ts

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Role name (e.g., 'admin', 'director', 'registrar', 'teacher', 'student', 'guardian') |

**Relationships:**
- Many-to-Many: Role ↔ User (via user.roles array)

**Usage:**
- Used in `src/lib/store/auth-store.ts` for user authentication
- Used in `src/lib/permissions.ts` for permission checking
- Used in `src/hooks/use-permissions.ts` for permission hooks
- Used in `src/components/auth/RoleGuard.tsx` for role-based access control

---

## Enums

### UserRole
**File Path:** Inferred from various permission checks

**Values:**
- `admin` - Full system access
- `director` - Administrative oversight
- `registrar` - Student and enrollment management
- `teacher` - Teaching and grading
- `student` - Student portal access
- `guardian` - Guardian portal access

**Usage:**
- Used throughout the application for role-based access control
- Referenced in `src/lib/permissions.ts` for permission definitions

---

### EnrollmentStatus
**File Path:** Inferred from Student.enrollment_status

**Values:**
- `active` - Student is currently enrolled
- `withdrawn` - Student has withdrawn
- `transferred` - Student has transferred to another school
- `graduated` - Student has graduated
- `suspended` - Student is temporarily suspended

**Usage:**
- Used in student enrollment management
- Referenced in enrollment-related features

---

### EmploymentStatus
**File Path:** Inferred from Teacher.employment_status

**Values:**
- `active` - Teacher is currently employed
- `inactive` - Teacher is not currently employed
- `on_leave` - Teacher is on leave
- `terminated` - Teacher's employment has been terminated

**Usage:**
- Used in teacher management
- Referenced in teacher-related features
