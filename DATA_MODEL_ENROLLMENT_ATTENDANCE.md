# Frontend Data Model Documentation - Enrollment and Attendance Entities

This document describes enrollment and attendance-related entities from the frontend TypeScript types. Only types that actually exist in the code are documented.

## Enrollment Entities

### Enrollment
**File Path:** `src/features/enrollments/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the enrollment |
| student_id | number | Yes | ID of the student being enrolled |
| class_id | number | Yes | ID of the class the student is enrolled in |
| section_id | number | No | ID of the section within the class |
| academic_year_id | number | Yes | ID of the academic year |
| enrollment_date | string | Yes | Date when the enrollment was created |
| enrollment_status | string | Yes | Status of the enrollment (e.g., 'active', 'withdrawn', 'transferred', 'completed') |
| withdrawal_date | string | No | Date when student withdrew (if applicable) |
| transfer_date | string | No | Date when student transferred (if applicable) |
| notes | string | No | Additional notes about the enrollment |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Enrollment → Student (via student_id)
- Many-to-One: Enrollment → Class (via class_id)
- Many-to-One: Enrollment → Section (via section_id)
- Many-to-One: Enrollment → AcademicYear (via academic_year_id)
- One-to-Many: Enrollment → AttendanceRecords

**Usage:**
- Used in `src/features/enrollments/types/index.ts` for enrollment management
- Used in enrollment CRUD operations and student class assignment

---

## Attendance Entities

### AttendanceRecord
**File Path:** `src/features/attendance/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the attendance record |
| student_id | number | Yes | ID of the student |
| class_id | number | Yes | ID of the class |
| section_id | number | No | ID of the section |
| date | string | Yes | Date of the attendance record |
| status | string | Yes | Attendance status (e.g., 'present', 'absent', 'late', 'excused') |
| notes | string | No | Notes about the attendance record |
| marked_by | number | No | ID of the user who marked the attendance |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: AttendanceRecord → Student (via student_id)
- Many-to-One: AttendanceRecord → Class (via class_id)
- Many-to-One: AttendanceRecord → Section (via section_id)
- Many-to-One: AttendanceRecord → User (via marked_by)

**Usage:**
- Used in `src/features/attendance/types/index.ts` for attendance management
- Used in `src/features/student-portal/components/AttendanceWarningBanner.tsx` for attendance warnings
- Used in `src/app/[locale]/(dashboard)/dashboard/student/my-attendance/page.tsx` for student attendance display

---

### AttendanceSummary
**File Path:** Inferred from attendance calculations in student portal

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| student_id | number | Yes | ID of the student |
| total_days | number | Yes | Total number of school days in the period |
| present_days | number | Yes | Number of days present |
| absent_days | number | Yes | Number of days absent |
| late_days | number | Yes | Number of days late |
| excused_days | number | Yes | Number of excused absences |
| attendance_rate | number | Yes | Attendance percentage (present / total * 100) |

**Relationships:**
- Many-to-One: AttendanceSummary → Student (via student_id)

**Usage:**
- Used in attendance calculations for student dashboard
- Referenced in `src/features/student-portal/components/StudentDashboardHome.tsx` for display

---

## Enums

### EnrollmentStatus
**File Path:** Inferred from Enrollment.enrollment_status

**Values:**
- `active` - Student is currently enrolled
- `withdrawn` - Student has withdrawn from the class
- `transferred` - Student has transferred to another class
- `completed` - Student has completed the class/academic year
- `pending` - Enrollment is pending approval

**Usage:**
- Used in enrollment management
- Referenced in enrollment-related features

---

### AttendanceStatus
**File Path:** Inferred from AttendanceRecord.status

**Values:**
- `present` - Student was present
- `absent` - Student was absent
- `late` - Student arrived late
- `excused` - Absence was excused
- `half_day` - Student attended for half day

**Usage:**
- Used in attendance marking and tracking
- Referenced in attendance features and calculations
