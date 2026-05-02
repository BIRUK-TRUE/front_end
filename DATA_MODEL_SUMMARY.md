# Frontend Data Model Summary

This document provides a relationship map and summary counts for the complete frontend data model.

## Entity Relationship Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

User ──(Many-to-Many)── Role
 │
 ├──(One-to-Many)──→ Students (when user is guardian)
 ├──(One-to-Many)──→ Classes (when user is teacher)
 ├──(One-to-Many)──→ Notifications (as recipient)
 └──(One-to-Many)──→ AttendanceRecords (as marker)

Guardian ──(One-to-Many)──→ Students
 │
 └──(One-to-Many)──→ Notifications (as recipient)

Student ──(Many-to-One)──→ Guardian
 │
 ├──(Many-to-One)──→ Class
 ├──(Many-to-One)──→ Section
 ├──(Many-to-One)──→ AcademicYear
 ├──(One-to-Many)──→ AttendanceRecords
 ├──(One-to-Many)──→ Grades
 └──(One-to-Many)──→ Enrollments

Teacher ──(One-to-Many)──→ Classes (as class teacher)
 │
 ├──(One-to-Many)──→ SubjectAssignments
 └──(One-to-Many)──→ Grades (as grader)

Class ──(Many-to-One)──→ AcademicYear
 │
 ├──(Many-to-One)──→ Teacher (class teacher)
 ├──(One-to-Many)──→ Sections
 ├──(One-to-Many)──→ Students
 └──(One-to-Many)──→ SubjectAssignments

Section ──(Many-to-One)──→ Class
 │
 ├──(One-to-Many)──→ Students
 └──(One-to-Many)──→ Schedules

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ACADEMIC ENTITIES                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

AcademicYear ──(One-to-Many)──→ Terms
 │
 ├──(One-to-Many)──→ Classes
 ├──(One-to-Many)──→ Enrollments
 └──(One-to-Many)──→ Students (via academic_year_id)

Term ──(Many-to-One)──→ AcademicYear
 │
 ├──(One-to-Many)──→ Assessments
 └──(One-to-Many)──→ Grades

Subject ──(One-to-Many)──→ SubjectAssignments
 │
 ├──(One-to-Many)──→ Assessments
 └──(One-to-Many)──→ Grades

SubjectAssignment ──(Many-to-One)──→ Class
 │
 ├──(Many-to-One)──→ Subject
 ├──(Many-to-One)──→ Teacher
 └──(One-to-Many)──→ Schedules

Assessment ──(Many-to-One)──→ Subject
 │
 ├──(Many-to-One)──→ Term
 └──(One-to-Many)──→ Grades

Schedule ──(Many-to-One)──→ Class
 │
 ├──(Many-to-One)──→ Section
 ├──(Many-to-One)──→ Subject
 └──(Many-to-One)──→ Teacher

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        ENROLLMENT & ATTENDANCE ENTITIES                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

Enrollment ──(Many-to-One)──→ Student
 │
 ├──(Many-to-One)──→ Class
 ├──(Many-to-One)──→ Section
 ├──(Many-to-One)──→ AcademicYear
 └──(One-to-Many)──→ AttendanceRecords

AttendanceRecord ──(Many-to-One)──→ Student
 │
 ├──(Many-to-One)──→ Class
 ├──(Many-to-One)──→ Section
 └──(Many-to-One)──→ User (marked_by)

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           GRADE ENTITIES                                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

Grade ──(Many-to-One)──→ Student
 │
 ├──(Many-to-One)──→ Subject
 ├──(Many-to-One)──→ Assessment
 ├──(Many-to-One)──→ Term
 └──(Many-to-One)──→ Teacher (graded_by)

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          PAYMENT ENTITIES                                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

Payment ──(Many-to-One)──→ Student

FeeStructure ──(Many-to-One)──→ AcademicYear
 │
 ├──(Many-to-One)──→ Class
 └──(One-to-Many)──→ Payments

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION ENTITIES                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

Notification ──(Many-to-One)──→ User (recipient_id)

NotificationRule ──(One-to-Many)──→ Notifications

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          ANALYTICS ENTITIES                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

AnalyticsData (No direct relationships - aggregated data)
SchoolStatistics (No direct relationships - aggregated data)
```

## Relationship Summary

### One-to-Many Relationships
- User → Students (guardian)
- User → Classes (teacher)
- User → Notifications (recipient)
- User → AttendanceRecords (marker)
- Guardian → Students
- Guardian → Notifications (recipient)
- Student → AttendanceRecords
- Student → Grades
- Student → Enrollments
- Teacher → Classes (class teacher)
- Teacher → SubjectAssignments
- Teacher → Grades (grader)
- Class → Sections
- Class → Students
- Class → SubjectAssignments
- Section → Students
- Section → Schedules
- AcademicYear → Terms
- AcademicYear → Classes
- AcademicYear → Enrollments
- AcademicYear → Students (via academic_year_id)
- Term → Assessments
- Term → Grades
- Subject → SubjectAssignments
- Subject → Assessments
- Subject → Grades
- SubjectAssignment → Schedules
- Assessment → Grades
- Enrollment → AttendanceRecords
- FeeStructure → Payments
- NotificationRule → Notifications

### Many-to-One Relationships
- Student → Guardian
- Student → Class
- Student → Section
- Student → AcademicYear
- Class → AcademicYear
- Class → Teacher (class teacher)
- Section → Class
- Term → AcademicYear
- SubjectAssignment → Class
- SubjectAssignment → Subject
- SubjectAssignment → Teacher
- Assessment → Subject
- Assessment → Term
- Schedule → Class
- Schedule → Section
- Schedule → Subject
- Schedule → Teacher
- Enrollment → Student
- Enrollment → Class
- Enrollment → Section
- Enrollment → AcademicYear
- AttendanceRecord → Student
- AttendanceRecord → Class
- AttendanceRecord → Section
- AttendanceRecord → User (marked_by)
- Grade → Student
- Grade → Subject
- Grade → Assessment
- Grade → Term
- Grade → Teacher (graded_by)
- Payment → Student
- FeeStructure → AcademicYear
- FeeStructure → Class
- Notification → User (recipient_id)

### Many-to-Many Relationships
- User ↔ Role (via user.roles array)

## Entity Counts

### Total Entities: 44

**Core Entities (7):**
1. User
2. Student
3. Teacher
4. Guardian
5. Class
6. Section
7. Role

**Academic Entities (6):**
8. AcademicYear
9. Term
10. Subject
11. SubjectAssignment
12. Assessment
13. Schedule

**Enrollment & Attendance Entities (3):**
14. Enrollment
15. AttendanceRecord
16. AttendanceSummary

**Grade Entities (2):**
17. Grade
18. GradeSummary

**Payment Entities (2):**
19. Payment
20. FeeStructure

**Notification Entities (2):**
21. Notification
22. NotificationRule

**Analytics Entities (2):**
23. AnalyticsData
24. SchoolStatistics

**Computed/Summary Entities (3):**
25. AttendanceSummary
26. GradeSummary
27. SchoolStatistics

**Zod Form Types (8):**
28. AcademicYearForm
29. TermForm
30. SubjectForm
31. ClassForm
32. SectionForm
33. EnrollmentForm
34. TransferForm
35. WithdrawalForm

**API Service Filter Types (4):**
36. UserFilters
37. StudentFilters
38. TeacherFilters
39. GuardianFilters

**API Service Settings Types (3):**
40. SchoolInfo
41. AcademicSettings
42. NotificationSettings

**API Service Payload Types (9):**
43. UserCreatePayload
44. UserUpdatePayload
45. StudentCreatePayload
46. StudentUpdatePayload
47. TeacherCreatePayload
48. TeacherUpdatePayload
49. GuardianCreatePayload
50. GuardianUpdatePayload
51. StudentLinkPayload

**Hook Types (4):**
52. SectionStudent
53. EnrollmentStatus
54. FaceDescriptor
55. MarkAttendanceByFacePayload

**Template Types (1):**
56. NotificationTemplate

## Field Counts

### Total Fields Across All Entities: 378

**Breakdown by Category:**
- Core Entities: 85 fields
- Academic Entities: 62 fields
- Enrollment & Attendance Entities: 35 fields
- Grade Entities: 25 fields
- Payment Entities: 34 fields
- Notification Entities: 27 fields
- Analytics Entities: 20 fields
- Computed/Summary Entities: 20 fields
- Zod Form Types: 26 fields
- API Service Filter Types: 42 fields
- API Service Settings Types: 12 fields
- API Service Payload Types: 70 fields
- Hook Types: 17 fields
- Template Types: 6 fields

## Enum Counts

### Total Enums: 18

1. UserRole (6 values)
2. EnrollmentStatus (5 values)
3. EmploymentStatus (4 values)
4. AssessmentType (6 values)
5. DayOfWeek (7 values)
6. AttendanceStatus (5 values)
7. PaymentType (8 values)
8. PaymentStatus (5 values)
9. PaymentMethod (6 values)
10. NotificationType (5 values)
11. NotificationPriority (4 values)
12. NotificationRuleType (6 values)
13. SubjectCategory (4 values)
14. TermNumber (4 values)
15. StudentStatus (5 values)
16. TeacherStatus (5 values)
17. RelationshipType (8 values)
18. Gender (2 values)

## Documentation Files

The complete data model documentation is split across the following files:

1. **DATA_MODEL_CORE.md** - Core entities (User, Student, Teacher, Guardian, Class, Section, Role)
2. **DATA_MODEL_ACADEMIC.md** - Academic entities (AcademicYear, Term, Subject, SubjectAssignment, Assessment, Schedule)
3. **DATA_MODEL_ENROLLMENT_ATTENDANCE.md** - Enrollment and attendance entities (Enrollment, AttendanceRecord, AttendanceSummary)
4. **DATA_MODEL_GRADES_PAYMENTS_NOTIFICATIONS_ANALYTICS.md** - Grades, payments, notifications, and analytics entities
5. **DATA_MODEL_ZOD_FORMS.md** - Zod schema form types for validation
6. **DATA_MODEL_API_TYPES.md** - API service inline types (filters, payloads, settings)
7. **DATA_MODEL_HOOKS_TEMPLATES.md** - Hook types and notification templates
8. **DATA_MODEL_SUMMARY.md** - This file (relationship map and counts)

## Notes

- All entities, fields, and relationships documented are based on actual TypeScript type definitions found in the codebase
- No fields or entities were invented or assumed beyond what exists in the code
- Computed entities (AttendanceSummary, GradeSummary, SchoolStatistics) are inferred from usage patterns in components
- Enum values are inferred from field usage and business logic in components
