# Business Rule Verification Document

This document contains ALL business rules found in the School Management System codebase. Use this to verify against your school's actual requirements.

---

## TABLE OF CONTENTS

1. [Enrollment Status Transitions](#enrollment-status-transitions)
2. [Teacher Status Transitions](#teacher-status-transitions)
3. [Grade Calculation Rules](#grade-calculation-rules)
4. [Attendance Calculation Rules](#attendance-calculation-rules)
5. [Student Risk Assessment Rules](#student-risk-assessment-rules)
6. [Permission & Role Rules](#permission--role-rules)
7. [Enrollment Rules](#enrollment-rules)
8. [Academic Structure Rules](#academic-structure-rules)
9. [Form Validation Rules](#form-validation-rules)
10. [Date & Time Rules](#date--time-rules)
11. [Notification Rules](#notification-rules)

---

## ENROLLMENT STATUS TRANSITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-001: Enrollment Status Types
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Data Structure / State Machine
FOUND IN: src/features/enrollments/types/index.ts

WHAT THE CODE CURRENTLY DOES:
  Enrollment status can be one of these values:
  - active: Student is currently enrolled and attending
  - withdrawn: Student voluntarily left the school
  - transferred: Student moved to another school
  - completed: Student finished the academic year/term

REAL WORLD SCENARIO:
  "A student named Kidus is enrolled in Grade 5 Section A.
   His enrollment status is 'active'.
   At the end of the year, his status changes to 'completed'."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these 4 status types sufficient for your school?
         Current: active, withdrawn, transferred, completed
         Do you need: graduated, expelled, suspended, on_hold?
         
  ❓ Q2: When a student completes a term but stays in the same class,
         should the status be 'completed' or remain 'active'?
         
  ❓ Q3: Should 'transferred' include where they transferred to?
         Current: No destination field in enrollment type

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (enum defined)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-002: Withdrawal Reason Requirement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Business Rule
FOUND IN: src/features/enrollments/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  When withdrawing a student, a reason is REQUIRED.
  - Minimum length: 5 characters
  - Validation: z.string().min(5, "Reason must be at least 5 characters")
  - withdrawal_date is also required

REAL WORLD SCENARIO:
  "Registrar Abebe wants to withdraw student Hana.
   The system requires him to enter a reason with at least 5 characters.
   He enters 'Family moved' (13 characters) - this is accepted.
   If he enters 'Left' (4 characters) - this is rejected."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is a reason ALWAYS required for withdrawal?
         If NO: Remove the min(5) validation
         
  ❓ Q2: Is 5 characters the minimum reasonable length?
         Should it be longer (e.g., 10 or 20 characters)?
         
  ❓ Q3: Should there be predefined reason options?
         Current: Free text
         Possible: Family relocation, Financial, Health, Disciplinary, Other

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-003: Transfer Date Requirement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Business Rule
FOUND IN: src/features/enrollments/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  When transferring a student to another section:
  - new_section_id is required (UUID validation)
  - transfer_date is required
  - reason is optional

REAL WORLD SCENARIO:
  "Student Samuel is being transferred from Grade 5A to Grade 5B.
   Registrar must select the new section and provide a transfer date.
   A reason can optionally be provided (e.g., 'Class size adjustment')."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should transfer reason be required?
         Current: Optional
         
  ❓ Q2: Can a student be transferred to a different class (grade level)?
         Current: new_section_id only (no class restriction)
         Should transfers be restricted to same grade level?
         
  ❓ Q3: Should there be a limit on how many transfers per year?
         Current: No limit enforced

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## TEACHER STATUS TRANSITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-004: Teacher Status Types
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Data Structure / State Machine
FOUND IN: src/lib/api/teachers.service.ts (TeacherFilters interface)

WHAT THE CODE CURRENTLY DOES:
  Teacher status can be one of these values:
  - active: Teacher is currently employed and teaching
  - on_leave: Teacher is on temporary leave
  - suspended: Teacher is temporarily suspended
  - resigned: Teacher voluntarily resigned
  - retired: Teacher retired from the school

REAL WORLD SCENARIO:
  "Teacher Mrs. Alemu is on maternity leave.
   Her status is 'on_leave'.
   When she returns, her status changes back to 'active'."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these 5 status types sufficient?
         Do you need: terminated, contract_expired, probation?
         
  ❓ Q2: Can a teacher move from 'suspended' back to 'active'?
         Current: No transition rules defined in frontend
         
  ❓ Q3: Should 'on_leave' require start and end dates?
         Current: No date fields in status type

CURRENT IMPLEMENTATION STATUS: ⚠️ Partially Implemented (filter values only)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## GRADE CALCULATION RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-005: Assessment Types
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Data Structure / Grading
FOUND IN: src/features/grades/types/index.ts

WHAT THE CODE CURRENTLY DOES:
  Assessment types are limited to these values:
  - quiz: Short test
  - test: Regular test
  - midterm: Mid-term exam
  - final: Final exam
  - assignment: Homework/assignment
  - project: Project work

REAL WORLD SCENARIO:
  "Teacher Mr. Teklu creates a 'midterm' assessment for Mathematics.
   The system allows this because 'midterm' is a valid assessment type.
   If he tries to create 'oral_exam', the system would reject it."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these 6 assessment types sufficient?
         Do you need: oral_exam, practical, lab_work, presentation?
         
  ❓ Q2: Should there be a limit on how many assessments of each type per term?
         Current: No limit enforced
         
  ❓ Q3: Should 'final' assessment be restricted to once per term per subject?
         Current: No restriction

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (enum)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-006: Passing Mark Threshold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Grading / Risk Calculation
FOUND IN: src/lib/api/settings.service.ts
          src/features/analytics/utils/calculateRisk.ts

WHAT THE CODE CURRENTLY DOES:
  - Default passing mark: 50%
  - Configurable via AcademicSettings.passing_mark
  - Used in risk calculation to identify low grades
  - If grade_average < passing_mark, student flagged as at-risk

REAL WORLD SCENARIO:
  "Student Abel has an average grade of 48%.
   The passing mark is set to 50%.
   Abel is flagged as at-risk due to low grades.
   If the passing mark were 45%, Abel would not be flagged."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is 50% the correct passing mark for your school?
         Some schools use: 40%, 60%, 70%?
         
  ❓ Q2: Should passing mark vary by subject or grade level?
         Current: Single global setting
         
  ❓ Q3: Should there be a distinction between "passing" and "excellent"?
         Current: Only passing threshold defined

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (configurable)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-007: Grade Weighting System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Grading / Calculation
FOUND IN: src/features/grades/types/index.ts (Assessment interface)

WHAT THE CODE CURRENTLY DOES:
  - Each assessment has a 'weight' field (number)
  - Used to calculate weighted average
  - No default weight specified
  - No maximum weight limit defined

REAL WORLD SCENARIO:
  "Teacher creates a 'final' exam with weight 30.
   Creates 'midterm' with weight 20.
   Creates 'quiz' with weight 10.
   Student's final grade is calculated using these weights."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should weights be predefined per assessment type?
         Current: Manual entry for each assessment
         Example: final=30, midterm=20, quiz=10, assignment=5
         
  ❓ Q2: Should total weights for a subject sum to 100?
         Current: No validation
         
  ❓ Q3: Should there be a maximum weight per assessment?
         Current: No limit

CURRENT IMPLEMENTATION STATUS: ⚠️ Partially Implemented (field exists, no validation)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## ATTENDANCE CALCULATION RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-008: Attendance Status Types
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Data Structure / Attendance
FOUND IN: src/features/attendance/types/index.ts

WHAT THE CODE CURRENTLY DOES:
  Attendance status can be one of these values:
  - present: Student attended class
  - absent: Student did not attend
  - late: Student arrived late
  - excused: Absence is excused (medical, family emergency, etc.)

REAL WORLD SCENARIO:
  "Student Kidus arrives 10 minutes late.
   Teacher marks him as 'late'.
  If Kidus is sick and has a doctor's note, he can be marked 'excused'."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these 4 status types sufficient?
         Do you need: early_leave, suspended, field_trip?
         
  ❓ Q2: Should 'late' have a time threshold?
         Current: Manual selection by teacher
         Should auto-detect late based on arrival time?
         
  ❓ Q3: Should 'excused' require documentation upload?
         Current: No requirement

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (enum)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-009: Attendance Warning Threshold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Attendance / Risk Calculation
FOUND IN: src/lib/api/settings.service.ts
          src/features/analytics/utils/calculateRisk.ts

WHAT THE CODE CURRENTLY DOES:
  - Default attendance warning threshold: 75%
  - Configurable via AcademicSettings.attendance_warning_threshold
  - If attendance_rate < threshold, student flagged as at-risk
  - Used in risk calculation with severity levels:
    * < 50%: severity 50 (critical)
    * 50-65%: severity 30 (high)
    * 65-75%: severity 15 (medium)

REAL WORLD SCENARIO:
  "Student Hana has 72% attendance.
   Warning threshold is 75%.
   Hana is flagged as at-risk with medium severity.
  If her attendance drops to 48%, severity becomes critical."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is 75% the correct warning threshold?
         Some schools use: 80%, 85%, 90%?
         
  ❓ Q2: Should there be different thresholds for different grade levels?
         Current: Single global setting
         
  ❓ Q3: Should parents be notified when threshold is crossed?
         Current: Notification system exists but threshold not linked

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (configurable)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-010: Consecutive Absence Threshold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Attendance / Risk Calculation
FOUND IN: src/lib/api/settings.service.ts
          src/features/analytics/utils/calculateRisk.ts

WHAT THE CODE CURRENTLY DOES:
  - Default consecutive absence threshold: 3 days
  - Configurable via NotificationSettings.consecutive_absence_threshold
  - If consecutive_absences >= threshold, student flagged as at-risk
  - Severity levels:
    * >= 5 days: severity 60 (critical)
    * 3-4 days: severity 40 (high)

REAL WORLD SCENARIO:
  "Student Samuel is absent for 3 consecutive days.
   Threshold is set to 3.
   Samuel is flagged as at-risk with high severity.
  If he reaches 5 consecutive days, severity becomes critical."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is 3 days the correct threshold?
         Some schools use: 2 days, 5 days?
         
  ❓ Q2: Should this trigger automatic parent notification?
         Current: Manual notification only
         
  ❓ Q3: Should consecutive absences reset after an excused absence?
         Current: Not specified

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (configurable)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## STUDENT RISK ASSESSMENT RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-011: Risk Level Calculation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Analytics / Risk Assessment
FOUND IN: src/features/analytics/utils/calculateRisk.ts

WHAT THE CODE CURRENTLY DOES:
  Risk levels are determined by cumulative score and critical conditions:
  
  CRITICAL (score >= 80 OR):
  - attendance_rate < 50%
  - grade_average < 30%
  - consecutive_absences >= 5
  
  HIGH (score >= 50 OR):
  - attendance_rate: 50-65%
  - grade_average: 30-45%
  - consecutive_absences: 3-4
  
  MEDIUM (score >= 20 OR):
  - attendance_rate: 65-75%
  - grade_average: 45-50%
  
  LOW: Everything else

REAL WORLD SCENARIO:
  "Student has 48% attendance and 35% grades.
   Attendance < 50% triggers critical condition.
   Grade 35% adds 30 points to score.
   Total score = 50 + 30 = 80.
   Risk level = CRITICAL."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these threshold ranges appropriate?
         Critical: <50% attendance, <30% grades
         High: 50-65% attendance, 30-45% grades
         
  ❓ Q2: Should there be a "VERY_CRITICAL" level?
         Current: Only 4 levels (low, medium, high, critical)
         
  ❓ Q3: Should risk factors be weighted differently?
         Current: Attendance and grades have similar weights

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (calculateRisk function)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## PERMISSION & ROLE RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-012: User Creation Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canCreateUser)

WHAT THE CODE CURRENTLY DOES:
  Only these roles can create users:
  - admin: Can create any user
  - director: Can create any user
  - registrar: Can create any user

REAL WORLD SCENARIO:
  "Registrar Abebe wants to create a new student account.
   He has 'registrar' role, so he is allowed.
  Teacher Mrs. Alemu tries to create a user.
   She has 'teacher' role, so she is denied."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should registrars be able to create ALL user types?
         Current: Yes (admin, director, registrar can create any)
         Should they be restricted to students/guardians only?
         
  ❓ Q2: Should teachers be able to create student accounts?
         Current: No
         
  ❓ Q3: Should there be approval workflow for certain user types?
         Current: No approval required

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-013: User Edit Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canEditUser)

WHAT THE CODE CURRENTLY DOES:
  - admin: Can edit any user
  - director: Can edit any user EXCEPT admins
  - registrar: Can only edit students and guardians
  - teacher: Cannot edit any user
  - student: Cannot edit any user
  - guardian: Cannot edit any user

REAL WORLD SCENARIO:
  "Director wants to edit Teacher Mrs. Alemu's profile.
   Director is allowed because target is not admin.
  Registrar tries to edit Director's profile.
   Registrar is denied because target is not student/guardian."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should teachers be able to edit their own profile?
         Current: No (teachers cannot edit any user)
         
  ❓ Q2: Should registrars be able to edit teachers?
         Current: No (only students/guardians)
         
  ❓ Q3: Should directors be able to edit admins?
         Current: No

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-014: Student Management Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canManageStudents)

WHAT THE CODE CURRENTLY DOES:
  Only these roles can manage students:
  - admin: Full access
  - director: Full access
  - registrar: Full access

REAL WORLD SCENARIO:
  "Registrar Abebe wants to create a new student.
   He has 'registrar' role, so he is allowed.
  Teacher Mrs. Alemu tries to view student list.
   She has 'teacher' role, so she is denied."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should teachers be able to view students in their classes?
         Current: No (canManageStudents is all-or-nothing)
         Should there be a canViewOwnStudents permission?
         
  ❓ Q2: Should guardians be able to view their children's records?
         Current: Separate guardian portal handles this
         
  ❓ Q3: Should directors have full student management access?
         Current: Yes

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-015: Teacher Management Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canManageTeachers)

WHAT THE CODE CURRENTLY DOES:
  Only these roles can manage teachers:
  - admin: Full access
  - director: Full access
  - registrar: NO access
  - teacher: NO access

REAL WORLD SCENARIO:
  "Director wants to hire a new teacher.
   Director is allowed.
  Registrar tries to create a teacher account.
   Registrar is denied."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should registrars be able to manage teachers?
         Current: No
         Some schools allow registrars to handle teacher records
         
  ❓ Q2: Should teachers be able to view other teachers' profiles?
         Current: No
         
  ❓ Q3: Should there be a 'head_teacher' role with limited teacher management?
         Current: No such role defined

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-016: Guardian Management Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canManageGuardians)

WHAT THE CODE CURRENTLY DOES:
  Only these roles can manage guardians:
  - admin: Full access
  - director: Full access
  - registrar: Full access

REAL WORLD SCENARIO:
  "Registrar Abebe wants to create a new guardian account.
   He has 'registrar' role, so he is allowed.
  Teacher Mrs. Alemu tries to view guardian list.
   She is denied."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should teachers be able to view guardians of their students?
         Current: No
         
  ❓ Q2: Should guardians be able to manage their own profile?
         Current: Separate guardian portal allows this
         
  ❓ Q3: Should registrars have full guardian management access?
         Current: Yes

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-017: Attendance Taking Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canTakeAttendance)

WHAT THE CODE CURRENTLY DOES:
  Only these roles can take attendance:
  - teacher: Can take attendance for their classes
  - admin: Can take attendance for any class
  - registrar: Can take attendance for any class

REAL WORLD SCENARIO:
  "Teacher Mrs. Alemu wants to mark attendance for her Grade 5 Math class.
   She is allowed.
  She tries to mark attendance for Grade 6 Science.
   She is denied (not her class)."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should registrars be able to take attendance?
         Current: Yes
         Some schools restrict this to teachers only
         
  ❓ Q2: Should teachers be able to take attendance for substitute classes?
         Current: Only their assigned classes
         
  ❓ Q3: Should there be a "substitute teacher" permission?
         Current: No

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-018: Grade Entry Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canEnterGrades)

WHAT THE CODE CURRENTLY DOES:
  Only these roles can enter grades:
  - teacher: Can enter grades for their subjects
  - admin: Can enter grades for any subject
  - registrar: NO access
  - director: NO access

REAL WORLD SCENARIO:
  "Teacher Mrs. Alemu wants to enter Math grades for her students.
   She is allowed.
  She tries to enter English grades.
   She is denied (not her subject)."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should directors be able to enter grades?
         Current: No
         
  ❓ Q2: Should registrars be able to enter grades?
         Current: No
         
  ❓ Q3: Should there be a grade approval workflow?
         Current: Grades are final once entered

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-019: Analytics View Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canViewAnalytics, canViewTeacherAnalytics)

WHAT THE CODE CURRENTLY DOES:
  School-wide analytics (canViewAnalytics):
  - admin: Can view
  - director: Can view
  - Others: Cannot view
  
  Teacher analytics (canViewTeacherAnalytics):
  - teacher: Can view their own analytics
  - admin: Can view
  - director: Can view
  - Others: Cannot view

REAL WORLD SCENARIO:
  "Director wants to see school-wide attendance trends.
   Director is allowed.
  Teacher Mrs. Alemu wants to see her class performance.
   She is allowed (teacher analytics).
  She tries to see school-wide analytics.
   She is denied."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should registrars be able to view analytics?
         Current: No
         
  ❓ Q2: Should teachers see school-wide or only their own data?
         Current: Only their own (canViewTeacherAnalytics)
         
  ❓ Q3: Should there be a "head_teacher" role with department analytics?
         Current: No

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-020: Settings Access Permission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Authorization
FOUND IN: src/lib/permissions.ts (canAccessSettings)

WHAT THE CODE CURRENTLY DOES:
  Only admin can access settings:
  - admin: Can access
  - director: NO access
  - registrar: NO access
  - Others: NO access

REAL WORLD SCENARIO:
  "Admin wants to change the school logo.
   Admin is allowed.
  Director tries to change the attendance threshold.
  Director is denied."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should directors be able to access settings?
         Current: No
         Some schools allow directors to manage academic settings
         
  ❓ Q2: Should there be granular settings permissions?
         Current: All-or-nothing
         Possible: canManageSchoolSettings, canManageAcademicSettings
         
  ❓ Q3: Should registrars be able to access certain settings?
         Current: No

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend check)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## ENROLLMENT RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-021: Enrollment Creation Requirements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Business Rule
FOUND IN: src/features/enrollments/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  To create an enrollment, these fields are REQUIRED:
  - student_id: UUID format
  - academic_year_id: UUID format
  - class_id: UUID format
  - section_id: UUID format
  - enrollment_date: String (date format)

REAL WORLD SCENARIO:
  "Registrar Abebe wants to enroll student Kidus in Grade 5 Section A.
   He must select:
   - Student: Kidus (student_id)
   - Academic Year: 2024-2025
   - Class: Grade 5
   - Section: A
   - Enrollment Date: Today
   If any field is missing, enrollment is rejected."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should enrollment_date default to today?
         Current: Must be manually entered
         
  ❓ Q2: Should a student be enrolled in only one section per academic year?
         Current: No validation (could enroll in multiple sections)
         
  ❓ Q3: Should there be a section capacity check before enrollment?
         Current: No capacity validation

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## ACADEMIC STRUCTURE RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-022: Academic Year Date Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Business Rule
FOUND IN: src/features/academics/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  When creating an academic year:
  - name: 4-20 characters
  - start_date: Required
  - end_date: Required
  - Validation: end_date must be AFTER start_date
  - description: Optional, max 500 characters

REAL WORLD SCENARIO:
  "Admin creates academic year '2024-2025'.
   Start date: September 1, 2024
   End date: June 30, 2025
   This is valid (end > start).
  If end date is August 31, 2024, it's rejected."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should there be a minimum duration for academic year?
         Current: No minimum (could be 1 day)
         
  ❓ Q2: Should academic years overlap be prevented?
         Current: No validation
         
  ❓ Q3: Should there be a maximum duration?
         Current: No maximum

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema with refinement)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-023: Term Date Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Business Rule
FOUND IN: src/features/academics/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  When creating a term:
  - name: 2-50 characters
  - term_number: 1-4 (max 4 terms per year)
  - start_date: Required
  - end_date: Required
  - Validation: end_date must be AFTER start_date

REAL WORLD SCENARIO:
  "Admin creates 'Term 1' with term_number 1.
   Start: September 1, 2024
   End: November 30, 2024
   This is valid.
  If term_number is 5, it's rejected (max is 4)."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is 4 the maximum number of terms per year?
         Some schools have: 2 terms (semesters), 3 terms (trimesters)
         
  ❓ Q2: Should terms be contained within academic year dates?
         Current: No validation against academic year
         
  ❓ Q3: Should terms overlap be prevented?
         Current: No validation

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema with refinement)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-024: Subject Category Types
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Data Structure / Academic
FOUND IN: src/features/academics/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  Subject categories are limited to:
  - core: Core subjects (Math, English, Amharic, etc.)
  - elective: Optional subjects
  - vocational: Vocational/technical subjects
  - extracurricular: Sports, clubs, etc.
  - Default: core

REAL WORLD SCENARIO:
  "Admin creates 'Mathematics' subject.
   Category: core (default)
  Admin creates 'Basketball' subject.
   Category: extracurricular
  If admin tries 'religious' category, it's rejected."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these 4 categories sufficient?
         Do you need: language, science, arts, religious?
         
  ❓ Q2: Should category affect grading or requirements?
         Current: No business logic tied to category
         
  ❓ Q3: Should 'core' subjects have special requirements?
         Current: No

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (enum)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-025: Class Grade Level Range
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Academic
FOUND IN: src/features/academics/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  When creating a class:
  - name: 2-50 characters
  - grade_level: 0-12 (0 for KG)
  - capacity: Optional, must be positive
  - description: Optional, max 255 characters

REAL WORLD SCENARIO:
  "Admin creates 'Grade 5' class.
   grade_level: 5
   This is valid.
  Admin creates 'Kindergarten' class.
   grade_level: 0
   This is valid.
  If grade_level is 13, it's rejected."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is 0-12 the correct grade range?
         Do you need: Pre-K (-1), Grade 13 (preparatory)?
         
  ❓ Q2: Should capacity be required?
         Current: Optional
         
  ❓ Q3: Should there be a maximum capacity limit?
         Current: No maximum (just must be positive)

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-026: Section Capacity Default
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Academic
FOUND IN: src/features/academics/types/schemas.ts

WHAT THE CODE CURRENTLY DOES:
  When creating a section:
  - name: 1-10 characters
  - capacity: Required, must be positive, default 40
  - room_number: Optional, max 20 characters
  - homeroom_teacher_id: Optional, UUID format

REAL WORLD SCENARIO:
  "Admin creates Section 'A' for Grade 5.
   Capacity defaults to 40 if not specified.
  Admin sets capacity to 35.
  This is valid.
  If capacity is 0 or negative, it's rejected."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is 40 the correct default capacity?
         Some schools use: 30, 35, 45, 50?
         
  ❓ Q2: Should there be a maximum capacity limit?
         Current: No maximum
         
  ❓ Q3: Should room_number be required?
         Current: Optional

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## FORM VALIDATION RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-027: Email Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Data Entry
FOUND IN: Multiple form schemas (users, students, teachers, guardians)

WHAT THE CODE CURRENTLY DOES:
  - Email is required for all user types
  - Must be valid email format
  - Validation: z.string().email()
  - No uniqueness validation in frontend (backend must handle)

REAL WORLD SCENARIO:
  "Registrar enters 'kidus@example.com' for student email.
   This is valid.
  Registrar enters 'kidus-at-example' for student email.
   This is rejected (invalid format)."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should email be required for students?
         Some schools don't require student emails
         
  ❓ Q2: Should email uniqueness be validated in real-time?
         Current: No frontend validation
         
  ❓ Q3: Should there be email domain restrictions?
         Current: Any valid email accepted

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema)
NEEDS BACKEND ENFORCEMENT: YES (uniqueness)

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-028: Name Length Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Validation / Data Entry
FOUND IN: Multiple form schemas

WHAT THE CODE CURRENTLY DOES:
  - full_name: Minimum 2 characters
  - Maximum varies by entity (50-100 characters)
  - No format validation (letters, spaces, etc.)

REAL WORLD SCENARIO:
  "Registrar enters 'A' for student name.
   This is rejected (min 2 characters).
  Registrar enters 'Kidus Abebe' (12 characters).
   This is valid."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Is 2 characters the minimum reasonable?
         Should it be 3 for first name, 2 for last name separately?
         
  ❓ Q2: Should names allow numbers or special characters?
         Current: Yes (no format validation)
         
  ❓ Q3: Should first name and last name be separate fields?
         Current: Single full_name field

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (Zod schema)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-029: Password Strength Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Security / Validation
FOUND IN: src/components/auth/password-strength.tsx

WHAT THE CODE CURRENTLY DOES:
  - Password is optional (auto-generated if empty)
  - When provided, strength is checked:
    * Weak: < 6 characters
    * Medium: 6-10 characters
    * Strong: > 10 characters with mixed case/numbers/symbols
  - Visual feedback shown to user

REAL WORLD SCENARIO:
  "Admin leaves password empty for new user.
   System auto-generates a strong password.
  Admin enters '123456' for password.
   System shows 'Weak' strength warning."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should password be required (not optional)?
         Current: Optional with auto-generation
         
  ❓ Q2: Should there be minimum complexity requirements?
         Current: Only length-based
         Should require: uppercase, lowercase, number, symbol?
         
  ❓ Q3: Should auto-generated passwords be forced to change on first login?
         Current: Not specified

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (frontend component)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## DATE & TIME RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-030: Date Format Consistency
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Data Format / Consistency
FOUND IN: All date fields across schemas

WHAT THE CODE CURRENTLY DOES:
  - All dates are stored as strings
  - Format expected: YYYY-MM-DD (ISO 8601)
  - No timezone handling specified
  - Date picker components handle formatting

REAL WORLD SCENARIO:
  "Registrar selects September 1, 2024 from date picker.
   It's sent to API as '2024-09-01'.
  Backend expects this format."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should dates include timezone information?
         Current: No timezone handling
         
  ❓ Q2: Should date format be configurable per locale?
         Current: Fixed YYYY-MM-DD
         
  ❓ Q3: Should there be date validation (e.g., no future birth dates)?
         Current: No date logic validation

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (consistent format)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## NOTIFICATION RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-031: Notification Types
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Data Structure / Notifications
FOUND IN: src/features/notifications/types/index.ts

WHAT THE CODE CURRENTLY DOES:
  Notification types include:
  - attendance: Attendance-related
  - grade: Grade-related
  - fee: Fee/payment-related
  - schedule: Schedule changes
  - announcement: General announcements
  - system: System messages
  - absence: Absence alerts
  - late: Late arrival alerts
  - grade_alert: Low grade alerts
  - attendance_alert: Attendance threshold alerts
  - fee_reminder: Fee due reminders
  - fee_overdue: Overdue fee alerts

REAL WORLD SCENARIO:
  "Student has low attendance.
   System sends 'attendance_alert' notification to guardian.
  Student has low grades.
   System sends 'grade_alert' notification."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these 12 notification types sufficient?
         Do you need: behavior, achievement, event?
         
  ❓ Q2: Should certain notification types be automatic vs manual?
         Current: Both exist
         
  ❓ Q3: Should notification types have priority levels?
         Current: Separate priority field (low, medium, high, urgent)

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (enum)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-032: Notification Channels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Notifications / Delivery
FOUND IN: src/features/notifications/types/index.ts

WHAT THE CODE CURRENTLY DOES:
  Supported notification channels:
  - in_app: Shown in app notification center
  - sms: Sent via SMS
  - email: Sent via email
  - Multiple channels can be used simultaneously

REAL WORLD SCENARIO:
  "Admin sends fee reminder to guardians.
   Channels selected: in_app and sms.
  Guardians receive notification in app and via SMS."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Are these 3 channels sufficient?
         Do you need: WhatsApp, push notification (mobile app)?
         
  ❓ Q2: Should certain notification types use specific channels?
         Current: Manual selection
         Example: urgent → SMS, announcements → email
         
  ❓ Q3: Should users be able to opt-out of certain channels?
         Current: NotificationPreferences exists but not fully implemented

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (enum)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BR-033: Notification Priority Levels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY: Notifications / Priority
FOUND IN: src/features/notifications/types/index.ts

WHAT THE CODE CURRENTLY DOES:
  Priority levels:
  - low: Informational
  - medium: Normal importance
  - high: Important
  - urgent: Critical, immediate attention

REAL WORLD SCENARIO:
  "System sends 'fee_overdue' notification.
   Priority: urgent.
  System sends 'announcement' notification.
   Priority: medium."

BUSINESS QUESTIONS TO VERIFY WITH YOUR SCHOOL:
  ❓ Q1: Should priority affect delivery method?
         Current: No automatic channel selection based on priority
         
  ❓ Q2: Should urgent notifications bypass user preferences?
         Current: Not specified
         
  ❓ Q3: Should there be a priority escalation rule?
         Current: No escalation logic

CURRENT IMPLEMENTATION STATUS: ✅ Implemented (enum)
NEEDS BACKEND ENFORCEMENT: YES

MY VERIFICATION:
  ☐ Q1 Answer: _______________________
  ☐ Q2 Answer: _______________________
  ☐ Q3 Answer: _______________________
  ☐ Overall Rule Correct: YES / NO / NEEDS CHANGE
  ☐ Changes Needed: _______________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## SUMMARY

Total Business Rules Documented: 33

Categories:
- Enrollment Status Transitions: 3 rules
- Teacher Status Transitions: 1 rule
- Grade Calculation Rules: 3 rules
- Attendance Calculation Rules: 3 rules
- Student Risk Assessment Rules: 1 rule
- Permission & Role Rules: 9 rules
- Enrollment Rules: 1 rule
- Academic Structure Rules: 5 rules
- Form Validation Rules: 3 rules
- Date & Time Rules: 1 rule
- Notification Rules: 3 rules

**Next Steps:**
1. Review each rule with school leadership
2. Mark verification checkboxes
3. Note any changes needed
4. Update codebase based on verified changes
5. Ensure backend enforces all business rules
