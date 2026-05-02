# Business Rules Extraction

Generated on: April 28, 2026

This document contains all business rules embedded in the frontend code.

---

RULE #1:
NAME: Password minimum length requirement
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\password-strength.tsx
THE RULE IN PLAIN ENGLISH: User passwords must be at least 8 characters long to be considered valid.
THE RULE IN CODE: `minLength: password.length >= 8`
APPLIES TO: All users
HOW ENFORCED: Frontend validation with visual feedback (password strength indicator)

RULE #2:
NAME: Password uppercase requirement
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\password-strength.tsx
THE RULE IN PLAIN ENGLISH: User passwords must contain at least one uppercase letter (A-Z) to be considered valid.
THE RULE IN CODE: `hasUppercase: /[A-Z]/.test(password)`
APPLIES TO: All users
HOW ENFORCED: Frontend validation with visual feedback

RULE #3:
NAME: Password lowercase requirement
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\password-strength.tsx
THE RULE IN PLAIN ENGLISH: User passwords must contain at least one lowercase letter (a-z) to be considered valid.
THE RULE IN CODE: `hasLowercase: /[a-z]/.test(password)`
APPLIES TO: All users
HOW ENFORCED: Frontend validation with visual feedback

RULE #4:
NAME: Password number requirement
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\password-strength.tsx
THE RULE IN PLAIN ENGLISH: User passwords must contain at least one digit (0-9) to be considered valid.
THE RULE IN CODE: `hasNumber: /\d/.test(password)`
APPLIES TO: All users
HOW ENFORCED: Frontend validation with visual feedback

RULE #5:
NAME: Password special character requirement
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\password-strength.tsx
THE RULE IN PLAIN ENGLISH: User passwords must contain at least one special character to be considered valid.
THE RULE IN CODE: `hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`;~']/.test(password)`
APPLIES TO: All users
HOW ENFORCED: Frontend validation with visual feedback

RULE #6:
NAME: Password strength classification
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\password-strength.tsx
THE RULE IN PLAIN ENGLISH: Password strength is classified as weak (≤2 requirements met), fair (3 requirements met), good (4 requirements met), or strong (all 5 requirements met).
THE RULE IN CODE: `if (score <= 2) return 'weak'; if (score <= 3) return 'fair'; if (score <= 4) return 'good'; return 'strong';`
APPLIES TO: All users
HOW ENFORCED: Frontend calculation with visual indicator

RULE #7:
NAME: New password must differ from current
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\student-portal\components\ChangePasswordForm.tsx
THE RULE IN PLAIN ENGLISH: When changing password, the new password cannot be the same as the current password.
THE RULE IN CODE: `.refine((data) => data.newPassword !== data.currentPassword, { message: t("errorSame"), path: ["newPassword"] })`
APPLIES TO: All users changing password
HOW ENFORCED: Frontend validation with error message

RULE #8:
NAME: New password must match confirmation
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\student-portal\components\ChangePasswordForm.tsx
THE RULE IN PLAIN ENGLISH: When changing password, the new password must match the confirmation password exactly.
THE RULE IN CODE: `.refine((data) => data.newPassword === data.confirmPassword, { message: t("errorMatch"), path: ["confirmPassword"] })`
APPLIES TO: All users changing password
HOW ENFORCED: Frontend validation with error message

RULE #9:
NAME: Forced password change on login
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\protected-route.tsx
THE RULE IN PLAIN ENGLISH: Users with the must_change_password flag are redirected to the change password page and cannot access other pages until they change their password.
THE RULE IN CODE: `if (user.must_change_password) { router.push('/change-password'); return; }`
APPLIES TO: All users with must_change_password flag
HOW ENFORCED: Frontend redirect on route access

RULE #10:
NAME: Role-based route access
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\auth\RoleGuard.tsx
THE RULE IN PLAIN ENGLISH: Users can only access pages if they have at least one of the allowed roles. Users without allowed roles are redirected to unauthorized page.
THE RULE IN CODE: `const hasAccess = allowedRoles.some((role) => user.roles.includes(role)); if (!hasAccess) { router.push("/unauthorized"); }`
APPLIES TO: All users based on their assigned roles
HOW ENFORCED: Frontend redirect with role guard component

RULE #11:
NAME: Admin can create users
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only users with admin, director, or registrar roles can create new user accounts.
THE RULE IN CODE: `canCreateUser: (roles: string[]) => roles.some((r) => ['admin', 'director', 'registrar'].includes(r))`
APPLIES TO: Admin, Director, Registrar
HOW ENFORCED: Frontend permission check (likely used to disable UI elements)

RULE #12:
NAME: Admin can edit any user
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Admin users can edit any user regardless of their roles.
THE RULE IN CODE: `if (roles.includes('admin')) return true;`
APPLIES TO: Admin users
HOW ENFORCED: Frontend permission check

RULE #13:
NAME: Director cannot edit admins
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Director users can edit users but cannot edit users who have the admin role.
THE RULE IN CODE: `if (roles.includes('director')) { return !targetRoles.includes('admin'); }`
APPLIES TO: Director users
HOW ENFORCED: Frontend permission check

RULE #14:
NAME: Registrar can only edit students and guardians
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Registrar users can only edit users whose roles are limited to student or guardian. They cannot edit admins, directors, teachers, or other registrars.
THE RULE IN CODE: `if (roles.includes('registrar')) { return targetRoles.every((r) => ['student', 'guardian'].includes(r)); }`
APPLIES TO: Registrar users
HOW ENFORCED: Frontend permission check

RULE #15:
NAME: Admin can restore deleted users
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only admin users can restore deleted user accounts.
THE RULE IN CODE: `canRestoreUser: (roles: string[]) => roles.includes('admin')`
APPLIES TO: Admin users only
HOW ENFORCED: Frontend permission check

RULE #16:
NAME: Admin and director can manage roles
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only admin and director users can assign or modify user roles.
THE RULE IN CODE: `canManageRoles: (roles: string[]) => roles.some((r) => ['admin', 'director'].includes(r))`
APPLIES TO: Admin, Director
HOW ENFORCED: Frontend permission check

RULE #17:
NAME: Only admin can access settings
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only admin users can access the system settings page.
THE RULE IN CODE: `canAccessSettings: (roles: string[]) => roles.includes('admin')`
APPLIES TO: Admin users only
HOW ENFORCED: Frontend permission check

RULE #18:
NAME: Admin and director can manage academics
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only admin and director users can manage academic years, terms, classes, and subjects.
THE RULE IN CODE: `canManageAcademics: (roles: string[]) => roles.some((r) => ['admin', 'director'].includes(r))`
APPLIES TO: Admin, Director
HOW ENFORCED: Frontend permission check

RULE #19:
NAME: Admin, director, and registrar can manage enrollments
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only admin, director, and registrar users can enroll, transfer, or withdraw students.
THE RULE IN CODE: `canManageEnrollments: (roles: string[]) => roles.some((r) => ['admin', 'director', 'registrar'].includes(r))`
APPLIES TO: Admin, Director, Registrar
HOW ENFORCED: Frontend permission check

RULE #20:
NAME: Teachers can take attendance
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Teachers, admins, and registrars can mark student attendance.
THE RULE IN CODE: `canTakeAttendance: (roles: string[]) => roles.some((r) => ['teacher', 'admin', 'registrar'].includes(r))`
APPLIES TO: Teacher, Admin, Registrar
HOW ENFORCED: Frontend permission check

RULE #21:
NAME: Teachers and admins can enter grades
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only teachers and admins can enter or modify student grades.
THE RULE IN CODE: `canEnterGrades: (roles: string[]) => roles.some((r) => ['teacher', 'admin'].includes(r))`
APPLIES TO: Teacher, Admin
HOW ENFORCED: Frontend permission check

RULE #22:
NAME: Admin and director can view analytics
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only admin and director users can view the analytics dashboard and reports.
THE RULE IN CODE: `canViewAnalytics: (roles: string[]) => roles.some((r) => ['admin', 'director'].includes(r))`
APPLIES TO: Admin, Director
HOW ENFORCED: Frontend permission check

RULE #23:
NAME: Teachers can view their own analytics
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Teachers can view analytics limited to their own classes and students.
THE RULE IN CODE: `canViewTeacherAnalytics: (roles: string[]) => roles.some((r) => ['teacher', 'admin', 'director'].includes(r))`
APPLIES TO: Teacher, Admin, Director
HOW ENFORCED: Frontend permission check

RULE #24:
NAME: Admin and director can manage notifications
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\lib\permissions.ts
THE RULE IN PLAIN ENGLISH: Only admin and director users can create, modify, or delete notification rules and send system notifications.
THE RULE IN CODE: `canManageNotifications: (roles: string[]) => roles.some((r) => ['admin', 'director'].includes(r))`
APPLIES TO: Admin, Director
HOW ENFORCED: Frontend permission check

RULE #25:
NAME: Academic year name length
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Academic year names must be between 4 and 20 characters long (e.g., "2024-2025").
THE RULE IN CODE: `name: z.string().min(4, "Name must be at least 4 characters").max(20)`
APPLIES TO: Academic years
HOW ENFORCED: Frontend validation with error message

RULE #26:
NAME: Academic year end date after start date
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: The end date of an academic year must be after the start date.
THE RULE IN CODE: `.refine((data) => new Date(data.end_date) > new Date(data.start_date), { message: "End date must be after start date", path: ["end_date"] })`
APPLIES TO: Academic years
HOW ENFORCED: Frontend validation with error message

RULE #27:
NAME: Term number range
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Term numbers must be between 1 and 4 (typically representing terms 1-4 within an academic year).
THE RULE IN CODE: `term_number: z.number().min(1).max(4)`
APPLIES TO: Academic terms
HOW ENFORCED: Frontend validation with error message

RULE #28:
NAME: Term end date after start date
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: The end date of a term must be after the start date.
THE RULE IN CODE: `.refine((data) => new Date(data.end_date) > new Date(data.start_date), { message: "End date must be after start date", path: ["end_date"] })`
APPLIES TO: Academic terms
HOW ENFORCED: Frontend validation with error message

RULE #29:
NAME: Subject code length
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Subject codes must be between 2 and 20 characters long (e.g., "MATH", "ENG101").
THE RULE IN CODE: `code: z.string().min(2).max(20)`
APPLIES TO: Academic subjects
HOW ENFORCED: Frontend validation with error message

RULE #30:
NAME: Subject category restriction
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Subject category must be one of: core, elective, vocational, or extracurricular. Defaults to core if not specified.
THE RULE IN CODE: `category: z.enum(['core', 'elective', 'vocational', 'extracurricular']).default('core')`
APPLIES TO: Academic subjects
HOW ENFORCED: Frontend validation with dropdown selection

RULE #31:
NAME: Class grade level range
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Class grade levels must be between 0 (for Kindergarten) and 12 (for final year of high school).
THE RULE IN CODE: `grade_level: z.number().min(0, "0 for KG").max(12)`
APPLIES TO: Classes
HOW ENFORCED: Frontend validation with error message

RULE #32:
NAME: Class capacity must be positive
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Class capacity, if specified, must be a positive number.
THE RULE IN CODE: `capacity: z.number().positive("Must be a positive number").optional().nullable()`
APPLIES TO: Classes
HOW ENFORCED: Frontend validation with error message

RULE #33:
NAME: Section capacity default
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Section capacity defaults to 40 students if not specified.
THE RULE IN CODE: `capacity: z.number().positive().default(40)`
APPLIES TO: Sections
HOW ENFORCED: Frontend validation with default value

RULE #34:
NAME: Section name length
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\types\schemas.ts
THE RULE IN PLAIN ENGLISH: Section names must be between 1 and 10 characters (e.g., "A", "B", "1", "2").
THE RULE IN CODE: `name: z.string().min(1).max(10)`
APPLIES TO: Sections
HOW ENFORCED: Frontend validation with error message

RULE #35:
NAME: Withdrawal reason minimum length
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\enrollments\types\schemas.ts
THE RULE IN PLAIN ENGLISH: When withdrawing a student, the reason must be at least 5 characters long.
THE RULE IN CODE: `reason: z.string().min(5, "Reason must be at least 5 characters")`
APPLIES TO: Student withdrawals
HOW ENFORCED: Frontend validation with error message

RULE #36:
NAME: Attendance status enumeration
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\attendance\types\index.ts
THE RULE IN PLAIN ENGLISH: Attendance can only be marked as one of four statuses: present, absent, late, or excused.
THE RULE IN CODE: `export enum AttendanceStatus { PRESENT = 'present', ABSENT = 'absent', LATE = 'late', EXCUSED = 'excused' }`
APPLIES TO: Attendance records
HOW ENFORCED: Frontend dropdown selection

RULE #37:
NAME: Grade score validation range
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\teacher\hooks\useTeacherGrades.ts
THE RULE IN PLAIN ENGLISH: When submitting grades, each score must be between 0 and the total marks for the assessment. Scores outside this range are rejected.
THE RULE IN CODE: `if (grade.score < 0 || grade.score > args.totalMarks) { throw new Error("INVALID_SCORE"); }`
APPLIES TO: Grade submissions
HOW ENFORCED: Frontend validation with error toast before API call

RULE #38:
NAME: Risk calculation attendance threshold
CATEGORY: Status
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\utils\calculateRisk.ts
THE RULE IN PLAIN ENGLISH: Students with attendance below the configured threshold (default 75%) are flagged as at-risk, with severity based on how far below threshold they are.
THE RULE IN CODE: `const attWarning = academicThresholds.attendance_warning_threshold || 75; if (student.attendance_rate < attWarning) { const severity = student.attendance_rate < 50 ? 50 : student.attendance_rate < 65 ? 30 : 15; score += severity; }`
APPLIES TO: All students
HOW ENFORCED: Frontend calculation for risk scoring

RULE #39:
NAME: Risk calculation grade threshold
CATEGORY: Status
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\utils\calculateRisk.ts
THE RULE IN PLAIN ENGLISH: Students with grade average below the configured passing mark (default 50%) are flagged as at-risk, with severity based on how far below passing they are.
THE RULE IN CODE: `const passMark = academicThresholds.passing_mark || 50; if (student.grade_average < passMark) { const severity = student.grade_average < 30 ? 50 : student.grade_average < 45 ? 30 : 15; score += severity; }`
APPLIES TO: All students
HOW ENFORCED: Frontend calculation for risk scoring

RULE #40:
NAME: Risk calculation consecutive absence threshold
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\utils\calculateRisk.ts
THE RULE IN PLAIN ENGLISH: Students with consecutive absences meeting or exceeding the configured threshold (default 3 days) are flagged as at-risk.
THE RULE IN CODE: `const consecutiveThreshold = notificationThresholds.consecutive_absence_threshold || 3; if (student.consecutive_absences >= consecutiveThreshold) { const severity = student.consecutive_absences >= 5 ? 60 : 40; score += severity; }`
APPLIES TO: All students
HOW ENFORCED: Frontend calculation for risk scoring

RULE #41:
NAME: Critical risk level determination
CATEGORY: Status
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\utils\calculateRisk.ts
THE RULE IN PLAIN ENGLISH: Students are classified as "critical" risk if they have attendance below 50%, grade average below 30%, or 5+ consecutive absences, or cumulative risk score of 80+.
THE RULE IN CODE: `const isCritical = student.attendance_rate < 50 || student.grade_average < 30 || student.consecutive_absences >= 5; if (isCritical || score >= 80) { level = 'critical'; }`
APPLIES TO: All students
HOW ENFORCED: Frontend calculation for risk classification

RULE #42:
NAME: High risk level determination
CATEGORY: Status
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\utils\calculateRisk.ts
THE RULE IN PLAIN ENGLISH: Students are classified as "high" risk if they have attendance 50-65%, grade average 30-45%, or 3-4 consecutive absences, or cumulative risk score of 50+.
THE RULE IN CODE: `const isHigh = (student.attendance_rate >= 50 && student.attendance_rate < 65) || (student.grade_average >= 30 && student.grade_average < 45) || (student.consecutive_absences >= 3 && student.consecutive_absences < 5); if (isHigh || score >= 50) { level = 'high'; }`
APPLIES TO: All students
HOW ENFORCED: Frontend calculation for risk classification

RULE #43:
NAME: Medium risk level determination
CATEGORY: Status
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\utils\calculateRisk.ts
THE RULE IN PLAIN ENGLISH: Students are classified as "medium" risk if they have attendance 65-75%, grade average 45-50%, or cumulative risk score of 20+.
THE RULE IN CODE: `const isMedium = (student.attendance_rate >= 65 && student.attendance_rate < 75) || (student.grade_average >= 45 && student.grade_average < 50); if (isMedium || score >= 20) { level = 'medium'; }`
APPLIES TO: All students
HOW ENFORCED: Frontend calculation for risk classification

RULE #44:
NAME: Student dashboard attendance color threshold
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\student-portal\components\StudentDashboardHome.tsx
THE RULE IN PLAIN ENGLISH: Attendance rate is displayed as green if 80%+, yellow if 60-79%, red if below 60%.
THE RULE IN CODE: `const getAttendanceColor = (rate: number) => { if (rate >= 80) return "green"; if (rate >= 60) return "yellow"; return "red"; };`
APPLIES TO: Student dashboard display
HOW ENFORCED: Frontend calculation for color coding

RULE #45:
NAME: Student dashboard score color threshold
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\student-portal\components\StudentDashboardHome.tsx
THE RULE IN PLAIN ENGLISH: Score average is displayed as green if 60%+, yellow if 40-59%, red if below 40%.
THE RULE IN CODE: `const getScoreColor = (score: number) => { if (score >= 60) return "green"; if (score >= 40) return "yellow"; return "red"; };`
APPLIES TO: Student dashboard display
HOW ENFORCED: Frontend calculation for color coding

RULE #46:
NAME: Face attendance duplicate handling
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\attendance\hooks\useFaceAttendance.ts
THE RULE IN PLAIN ENGLISH: When marking attendance via face recognition, if a student is already marked for that date (HTTP 409), no error toast is shown to avoid spamming notifications.
THE RULE IN CODE: `if (error.response?.status !== 409) { // 409 usually means already marked toast.error(t('markFailed')); }`
APPLIES TO: Face recognition attendance marking
HOW ENFORCED: Frontend error handling (suppresses toast for 409)

RULE #47:
NAME: Enrollment wizard cascade reset
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\enrollments\components\EnrollmentWizard.tsx
THE RULE IN PLAIN ENGLISH: When the academic year is changed in the enrollment wizard, the class and section selections are reset. When the class is changed, the section selection is reset.
THE RULE IN CODE: `useEffect(() => { form.setValue('class_id', ''); form.setValue('section_id', ''); }, [academicYearId, form]); useEffect(() => { form.setValue('section_id', ''); }, [classId, form]);`
APPLIES TO: Enrollment form
HOW ENFORCED: Frontend form state management

RULE #48:
NAME: Section capacity enforcement
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\enrollments\components\EnrollmentWizard.tsx
THE RULE IN PLAIN ENGLISH: Sections that are full (is_full flag is true) are disabled in the dropdown and cannot be selected for enrollment.
THE RULE IN CODE: `<SelectItem key={section.id} value={section.id} disabled={section.is_full}>`
APPLIES TO: Student enrollment
HOW ENFORCED: Frontend disabled dropdown option

RULE #49:
NAME: Academic year default date range
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\academics\components\AcademicYearModal.tsx
THE RULE IN PLAIN ENGLISH: When creating a new academic year, the start date defaults to today and the end date defaults to one year from today.
THE RULE IN CODE: `start_date: format(new Date(), 'yyyy-MM-dd'), end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')`
APPLIES TO: Academic year creation
HOW ENFORCED: Frontend default value in form

RULE #50:
NAME: Face enrollment capture requirement
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\attendance\components\FaceEnrollmentFlow.tsx
THE RULE IN PLAIN ENGLISH: Face enrollment requires capturing 5 different face images/angles from the student to create a reliable facial recognition profile.
THE RULE IN CODE: `const steps = [{ key: 'step1', label: t('instructions.step1') }, { key: 'step2', label: t('instructions.step2') }, { key: 'step3', label: t('instructions.step3') }, { key: 'step4', label: t('instructions.step4') }, { key: 'step5', label: t('instructions.step5') }];`
APPLIES TO: Face recognition enrollment
HOW ENFORCED: Frontend multi-step wizard with progress tracking

RULE #51:
NAME: Grade letter calculation scale
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\grades\components\GradeEntryGrid.tsx
THE RULE IN PLAIN ENGLISH: Letter grades are calculated as: A (90%+), B (80-89%), C (70-79%), D (60-69%), F (below 60%).
THE RULE IN CODE: `const pct = (score / maxScore) * 100; if (pct >= 90) return 'A'; if (pct >= 80) return 'B'; if (pct >= 70) return 'C'; if (pct >= 60) return 'D'; return 'F';`
APPLIES TO: Grade display
HOW ENFORCED: Frontend calculation for letter grade display

RULE #52:
NAME: Grade input range enforcement
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\grades\components\GradeEntryGrid.tsx
THE RULE IN PLAIN ENGLISH: Grade input values are automatically clamped to be between 0 and the maximum score for the assessment.
THE RULE IN CODE: `const numValue = value === '' ? null : Math.min(Math.max(Number(value), 0), maxScore);`
APPLIES TO: Grade entry
HOW ENFORCED: Frontend input validation (automatic clamping)

RULE #53:
NAME: Payment amount validation
CATEGORY: Fees
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\payments\components\ChapaPaymentModal.tsx
THE RULE IN PLAIN ENGLISH: Payment amount must be greater than 0 and cannot exceed the outstanding fee balance.
THE RULE IN CODE: `if (!numAmount || numAmount <= 0 || numAmount > maxAmount) { toast.error(t('invalidAmount')); return; }`
APPLIES TO: Fee payments
HOW ENFORCED: Frontend validation with error toast

RULE #54:
NAME: Payment required fields
CATEGORY: Fees
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\payments\components\ChapaPaymentModal.tsx
THE RULE IN PLAIN ENGLISH: Email, first name, and last name are required fields for payment processing.
THE RULE IN CODE: `if (!email || !firstName || !lastName) { toast.error(t('fillRequiredFields')); return; }`
APPLIES TO: Fee payments
HOW ENFORCED: Frontend validation with error toast

RULE #55:
NAME: Payment transaction reference format
CATEGORY: Fees
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\payments\components\ChapaPaymentModal.tsx
THE RULE IN PLAIN ENGLISH: Payment transaction references are formatted as "SCHFEE-{timestamp}-{guardianIdPrefix}" to ensure uniqueness.
THE RULE IN CODE: `const reference = \`SCHFEE-${Date.now()}-${guardianId.slice(0, 6)}\`;`
APPLIES TO: Chapa payment integration
HOW ENFORCED: Frontend string formatting

RULE #56:
NAME: Notification priority levels
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\notifications\types\index.ts
THE RULE IN PLAIN ENGLISH: Notifications can have one of four priority levels: low, medium, high, or urgent.
THE RULE IN CODE: `export enum NotificationPriority { LOW = 'low', MEDIUM = 'medium', HIGH = 'high', URGENT = 'urgent' }`
APPLIES TO: All notifications
HOW ENFORCED: Frontend enum/type restriction

RULE #57:
NAME: Notification type enumeration
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\notifications\types\index.ts
THE RULE IN PLAIN ENGLISH: Notifications can only be of specific types: attendance, grade, fee, schedule, announcement, system, absence, late, grade_alert, attendance_alert, fee_reminder, or fee_overdue.
THE RULE IN CODE: `export enum NotificationType { ATTENDANCE = 'attendance', GRADE = 'grade', FEE = 'fee', SCHEDULE = 'schedule', ANNOUNCEMENT = 'announcement', SYSTEM = 'system', ABSENCE = 'absence', LATE = 'late', GRADE_ALERT = 'grade_alert', ATTENDANCE_ALERT = 'attendance_alert', FEE_REMINDER = 'fee_reminder', FEE_OVERDUE = 'fee_overdue' }`
APPLIES TO: All notifications
HOW ENFORCED: Frontend enum/type restriction

RULE #58:
NAME: Schedule day of week encoding
CATEGORY: Schedule
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\schedule\types\index.ts
THE RULE IN PLAIN ENGLISH: Days of the week are encoded as numbers where 0=Sunday, 1=Monday, ..., 6=Saturday.
THE RULE IN CODE: `day_of_week: number; // 0=Sunday, 1=Monday... 6=Saturday`
APPLIES TO: Schedule entries
HOW ENFORCED: Frontend encoding convention

RULE #59:
NAME: Schedule time format
CATEGORY: Schedule
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\schedule\types\index.ts
THE RULE IN PLAIN ENGLISH: Schedule times must be in HH:mm:ss format (24-hour format).
THE RULE IN CODE: `start_time: string; // HH:mm:ss format (e.g. "08:00:00")`
APPLIES TO: Schedule entries
HOW ENFORCED: Frontend format convention

RULE #60:
NAME: Grade entry pagination size
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\grades\components\GradeEntryGrid.tsx
THE RULE IN PLAIN ENGLISH: Grade entry grid displays 20 students per page.
THE RULE IN CODE: `const pageSize = 20;`
APPLIES TO: Grade entry grid
HOW ENFORCED: Frontend pagination logic

RULE #61:
NAME: Bulk grade quick-set values
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\grades\components\GradeEntryGrid.tsx
THE RULE IN PLAIN ENGLISH: Bulk grade setting offers quick buttons for 100%, 90%, 80%, and 70% of the maximum score.
THE RULE IN CODE: `[maxScore, Math.round(maxScore * 0.9), Math.round(maxScore * 0.8), Math.round(maxScore * 0.7)].map((score)`
APPLIES TO: Grade entry bulk actions
HOW ENFORCED: Frontend UI buttons

RULE #62:
NAME: Attendance warning display threshold
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\student-portal\components\AttendanceWarningBanner.tsx
THE RULE IN PLAIN ENGLISH: Attendance warning banner is displayed when a student's attendance rate falls below 75% (configurable threshold).
THE RULE IN CODE: `if (rate >= threshold) { return null; }` with `threshold = 75`
APPLIES TO: Student portal attendance display
HOW ENFORCED: Frontend conditional rendering

RULE #63:
NAME: Report card passing threshold
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\student-portal\components\StudentReportCard.tsx
THE RULE IN PLAIN ENGLISH: Students are considered passing if their percentage score meets or exceeds 50% (configurable threshold).
THE RULE IN CODE: `const getPassStatus = (percentage: number) => percentage >= passingThreshold;` with `passingThreshold = 50`
APPLIES TO: Student report cards
HOW ENFORCED: Frontend calculation for pass/fail status

RULE #64:
NAME: Late arrival time threshold
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\attendance\components\FaceAttendanceStation.tsx
THE RULE IN PLAIN ENGLISH: Students marked via face recognition before 8:30 AM are marked as "present", while those at or after 8:30 AM are marked as "late".
THE RULE IN CODE: `const LATE_THRESHOLD = 8 * 60 + 30; // 8:30 AM in minutes; const status = currentTime < LATE_THRESHOLD ? 'present' : 'late';`
APPLIES TO: Face recognition attendance marking
HOW ENFORCED: Frontend hardcoded time comparison

RULE #65:
NAME: Face recognition confidence threshold
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\attendance\components\FaceAttendanceStation.tsx
THE RULE IN PLAIN ENGLISH: Face matching uses a confidence threshold from academic settings (default 0.6) to determine if a detected face matches an enrolled student.
THE RULE IN CODE: `const threshold = settings?.face_recognition_confidence_threshold || 0.6; if (distance < threshold) { // match found }`
APPLIES TO: Face recognition attendance
HOW ENFORCED: Frontend distance comparison against threshold

RULE #66:
NAME: Role-based navigation visibility
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\layout\sidebar.tsx
THE RULE IN PLAIN ENGLISH: Navigation menu items are shown or hidden based on user role: teachers see teacher-specific items, students see student-specific items, guardians see guardian-specific items, and admin/director/registrar see admin items.
THE RULE IN CODE: `const getNavItems = (): NavItem[] => { if (isStudent) return studentNavItems; if (isTeacher) return teacherNavItems; if (isGuardian) return guardianNavItems; return adminNavItems; };`
APPLIES TO: Sidebar navigation
HOW ENFORCED: Frontend conditional rendering based on role

RULE #67:
NAME: Real-time toast minimum priority
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\components\layout\top-bar.tsx
THE RULE IN PLAIN ENGLISH: Real-time toast notifications are only displayed for notifications with medium priority or higher (low priority notifications do not trigger toasts).
THE RULE IN CODE: `useRealtimeToasts({ userId, enabled: !!userId, minPriority: NotificationPriority.MEDIUM, });`
APPLIES TO: Real-time notification toasts
HOW ENFORCED: Frontend hook configuration

RULE #68:
NAME: Schedule teacher conflict detection
CATEGORY: Schedule
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\schedule\components\ScheduleEntryModal.tsx
THE RULE IN PLAIN ENGLISH: When adding or editing a schedule entry, the system checks if the teacher is already scheduled at the same time and day, and prevents conflicts.
THE RULE IN CODE: `const teacherConflict = existingEntries.find(e => e.teacher_id === teacherId && e.day_of_week === dayOfWeek && e.id !== editingId); if (teacherConflict) { errors.teacher_id = t('teacherConflict'); }`
APPLIES TO: Schedule entry creation/editing
HOW ENFORCED: Frontend validation with error message

RULE #69:
NAME: Schedule room conflict detection
CATEGORY: Schedule
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\schedule\components\ScheduleEntryModal.tsx
THE RULE IN PLAIN ENGLISH: When adding or editing a schedule entry, the system checks if the room is already in use at the same time and day, and prevents conflicts.
THE RULE IN CODE: `const roomConflict = existingEntries.find(e => e.room_id === roomId && e.day_of_week === dayOfWeek && e.id !== editingId); if (roomConflict) { errors.room_id = t('roomConflict'); }`
APPLIES TO: Schedule entry creation/editing
HOW ENFORCED: Frontend validation with error message

RULE #70:
NAME: Schedule section conflict detection
CATEGORY: Schedule
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\schedule\components\ScheduleEntryModal.tsx
THE RULE IN PLAIN ENGLISH: When adding or editing a schedule entry, the system checks if the section is already scheduled at the same time and day, and prevents conflicts.
THE RULE IN CODE: `const sectionConflict = existingEntries.find(e => e.section_id === sectionId && e.day_of_week === dayOfWeek && e.id !== editingId); if (sectionConflict) { errors.section_id = t('sectionConflict'); }`
APPLIES TO: Schedule entry creation/editing
HOW ENFORCED: Frontend validation with error message

RULE #71:
NAME: Alert rule consecutive absence range
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\notifications\components\AlertRuleFormModal.tsx
THE RULE IN PLAIN ENGLISH: Consecutive absence threshold for alert rules must be between 1 and 30 days.
THE RULE IN CODE: `consecutive_absence_threshold: z.number().min(1).max(30)`
APPLIES TO: Alert rule creation
HOW ENFORCED: Frontend validation with error message

RULE #72:
NAME: Alert rule percentage threshold range
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\notifications\components\AlertRuleFormModal.tsx
THE RULE IN PLAIN ENGLISH: Percentage threshold for alert rules (attendance or grade) must be between 0 and 100.
THE RULE IN CODE: `percentage_threshold: z.number().min(0).max(100)`
APPLIES TO: Alert rule creation
HOW ENFORCED: Frontend validation with error message

RULE #73:
NAME: Alert rule fee overdue range
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\notifications\components\AlertRuleFormModal.tsx
THE RULE IN PLAIN ENGLISH: Fee overdue threshold for alert rules must be between 0 and 90 days.
THE RULE IN CODE: `fee_overdue_threshold: z.number().min(0).max(90)`
APPLIES TO: Alert rule creation
HOW ENFORCED: Frontend validation with error message

RULE #74:
NAME: SMS segment calculation
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\notifications\components\NotificationComposer.tsx
THE RULE IN PLAIN ENGLISH: SMS messages are divided into segments of 160 characters each, with the total segment count calculated based on message length.
THE RULE IN CODE: `const segments = Math.ceil(message.length / 160);`
APPLIES TO: SMS notification composition
HOW ENFORCED: Frontend calculation for cost estimation

RULE #75:
NAME: SMS cost calculation
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\notifications\components\NotificationComposer.tsx
THE RULE IN PLAIN ENGLISH: SMS cost is calculated as 0.5 units per recipient per segment.
THE RULE IN CODE: `const estimatedCost = recipientCount * segments * 0.5;`
APPLIES TO: SMS notification composition
HOW ENFORCED: Frontend calculation for cost estimation

RULE #76:
NAME: At-risk attendance color thresholds
CATEGORY: Status
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\components\AtRiskStudentsTable.tsx
THE RULE IN PLAIN ENGLISH: In the at-risk students table, attendance rate below 60% is shown with destructive (red) color, 60-74% with orange color, and 75%+ with normal color.
THE RULE IN CODE: `if (row.attendance_rate < 60) return 'destructive'; if (row.attendance_rate < 75) return 'orange'; return 'default';`
APPLIES TO: At-risk students table display
HOW ENFORCED: Frontend calculation for color coding

RULE #77:
NAME: At-risk grade color thresholds
CATEGORY: Status
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\analytics\components\AtRiskStudentsTable.tsx
THE RULE IN PLAIN ENGLISH: In the at-risk students table, grade average below 40% is shown with destructive (red) color, 40-49% with orange color, and 50%+ with normal color.
THE RULE IN CODE: `if (row.grade_average < 40) return 'destructive'; if (row.grade_average < 50) return 'orange'; return 'default';`
APPLIES TO: At-risk students table display
HOW ENFORCED: Frontend calculation for color coding

RULE #78:
NAME: Teacher grade score validation
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\features\teacher\components\TeacherGradeEntry.tsx
THE RULE IN PLAIN ENGLISH: When entering grades, the score cannot be negative and cannot exceed the total marks for the assessment.
THE RULE IN CODE: `if (score < 0 || score > assessment.total_marks) { toast.error(t('scoreOutOfRange')); return; }`
APPLIES TO: Teacher grade entry
HOW ENFORCED: Frontend validation with error toast

RULE #79:
NAME: Create user page role restriction
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\create\page.tsx
THE RULE IN PLAIN ENGLISH: Only users with admin or director roles can access the create user page.
THE RULE IN CODE: `<ProtectedRoute requireRoles={['admin', 'director']}>`
APPLIES TO: Admin, Director
HOW ENFORCED: Frontend ProtectedRoute role gate

RULE #80:
NAME: Create user requires at least one role
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\create\page.tsx
THE RULE IN PLAIN ENGLISH: When creating a user, at least one role must be selected.
THE RULE IN CODE: `role_names: z.array(z.string()).min(1, tv('atLeastOneRole'))`
APPLIES TO: User creation
HOW ENFORCED: Frontend Zod validation

RULE #81:
NAME: Create user password confirmation must match
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\create\page.tsx
THE RULE IN PLAIN ENGLISH: When creating a user, password and confirm password must match.
THE RULE IN CODE: `.refine((data) => data.password === data.confirm_password, { path: ['confirm_password'] })`
APPLIES TO: User creation
HOW ENFORCED: Frontend Zod validation

RULE #82:
NAME: Academic settings attendance warning threshold range
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\settings\page.tsx
THE RULE IN PLAIN ENGLISH: Attendance warning threshold must be between 50% and 100%.
THE RULE IN CODE: `attendance_warning_threshold: z.number().min(50).max(100)`
APPLIES TO: Academic settings
HOW ENFORCED: Frontend Zod validation

RULE #83:
NAME: Academic settings face recognition confidence threshold range
CATEGORY: Attendance
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\settings\page.tsx
THE RULE IN PLAIN ENGLISH: Face recognition confidence threshold must be between 50% and 100%.
THE RULE IN CODE: `confidence_threshold: z.number().min(50).max(100)`
APPLIES TO: Academic settings
HOW ENFORCED: Frontend Zod validation

RULE #84:
NAME: Academic settings default grading scale
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\settings\page.tsx
THE RULE IN PLAIN ENGLISH: If no academic settings exist, the grading scale defaults to A=90, B=80, C=70, D=60.
THE RULE IN CODE: `defaultValues: { grading_scale: { A: 90, B: 80, C: 70, D: 60 }, ... }`
APPLIES TO: Academic settings
HOW ENFORCED: Frontend default form values

RULE #85:
NAME: Notification settings default consecutive absence threshold
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\settings\page.tsx
THE RULE IN PLAIN ENGLISH: Consecutive absence threshold defaults to 3 if not provided.
THE RULE IN CODE: `defaultValues: { consecutive_absence_threshold: 3 }` and `notificationSettings.consecutive_absence_threshold ?? 3`
APPLIES TO: Notification settings
HOW ENFORCED: Frontend default form values

RULE #86:
NAME: Alert rule threshold display fallbacks
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\notifications\rules\page.tsx
THE RULE IN PLAIN ENGLISH: If an alert rule has no configured threshold, the UI displays default thresholds: 3 days (consecutive absence), 75% (low attendance), 60% (low grade), 30 days (fee overdue).
THE RULE IN CODE: `config.days || 3`, `config.percentage || 75`, `config.percentage || 60`, `config.days || 30`
APPLIES TO: Alert rules UI
HOW ENFORCED: Frontend display fallback logic

RULE #87:
NAME: Login redirect based on role
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(auth)\login\page.tsx
THE RULE IN PLAIN ENGLISH: After login (when password change is not required), users are redirected based on their role: teacher -> /dashboard/teacher, student -> /dashboard/student, guardian -> /guardian, otherwise -> /dashboard.
THE RULE IN CODE: `if (response.user.roles.includes('teacher')) router.push('/dashboard/teacher'); else if (response.user.roles.includes('student')) router.push('/dashboard/student'); else if (response.user.roles.includes('guardian')) router.push('/guardian'); else router.push('/dashboard');`
APPLIES TO: All users after login
HOW ENFORCED: Frontend redirect logic

RULE #88:
NAME: Forgot password email non-disclosure
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(auth)\forgot-password\page.tsx
THE RULE IN PLAIN ENGLISH: The UI does not reveal whether an email exists; even if the forgot-password request fails, the user is shown a generic “reset email sent” confirmation.
THE RULE IN CODE: `try { await authService.forgotPassword(...) } catch { /* Don't reveal whether email exists */ } finally { setIsSubmitted(true); }`
APPLIES TO: Password reset initiation
HOW ENFORCED: Frontend error suppression and generic success flow

RULE #89:
NAME: Create student page role restriction
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\students\create\page.tsx
THE RULE IN PLAIN ENGLISH: Only users with admin or registrar roles can access the create student page.
THE RULE IN CODE: `<ProtectedRoute requireRoles={['admin', 'registrar']}>`
APPLIES TO: Admin, Registrar
HOW ENFORCED: Frontend ProtectedRoute role gate

RULE #90:
NAME: Student phone number format
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\students\create\page.tsx
THE RULE IN PLAIN ENGLISH: Student phone numbers, when provided, must be in Ethiopian +251 format with 9 digits after the country code.
THE RULE IN CODE: `phone_number: z.string().regex(/^\+251\d{9}$/).optional()`
APPLIES TO: Student creation
HOW ENFORCED: Frontend Zod validation

RULE #91:
NAME: Student date-of-birth age range
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\students\create\page.tsx
THE RULE IN PLAIN ENGLISH: Student date of birth must result in an age between 10 and 25 years old.
THE RULE IN CODE: `const minAge = new Date(now.getFullYear() - 25, ...); const maxAge = new Date(now.getFullYear() - 10, ...); return date >= minAge && date <= maxAge;`
APPLIES TO: Student creation
HOW ENFORCED: Frontend Zod refine validation

RULE #92:
NAME: Ministry exam result range
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\students\create\page.tsx
THE RULE IN PLAIN ENGLISH: If provided, ministry exam result must be between 0 and 100.
THE RULE IN CODE: `ministry_exam_result: z.coerce.number().min(0).max(100).optional()`
APPLIES TO: Student creation
HOW ENFORCED: Frontend Zod validation

RULE #93:
NAME: Create teacher page role restriction
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\teachers\create\page.tsx
THE RULE IN PLAIN ENGLISH: Only users with admin or registrar roles can access the create teacher page.
THE RULE IN CODE: `<ProtectedRoute requireRoles={['admin', 'registrar']}>`
APPLIES TO: Admin, Registrar
HOW ENFORCED: Frontend ProtectedRoute role gate

RULE #94:
NAME: Teacher hire date cannot be in the future
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\teachers\create\page.tsx
THE RULE IN PLAIN ENGLISH: Teacher hire date must be today or earlier (future dates are invalid).
THE RULE IN CODE: `hire_date: z.string().refine((val) => { ... return date <= now; }, { message: t('hireDateInvalid') })`
APPLIES TO: Teacher creation
HOW ENFORCED: Frontend Zod refine validation

RULE #95:
NAME: Teacher phone number format
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\teachers\create\page.tsx
THE RULE IN PLAIN ENGLISH: Teacher phone numbers must be in Ethiopian +251 format with 9 digits after the country code.
THE RULE IN CODE: `phone_number: z.string().regex(/^\+251\d{9}$/)`
APPLIES TO: Teacher creation
HOW ENFORCED: Frontend Zod validation

RULE #96:
NAME: Create guardian page role restriction
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\create\page.tsx
THE RULE IN PLAIN ENGLISH: Only users with admin or registrar roles can access the create guardian page.
THE RULE IN CODE: `<ProtectedRoute requireRoles={['admin', 'registrar']}>`
APPLIES TO: Admin, Registrar
HOW ENFORCED: Frontend ProtectedRoute role gate

RULE #97:
NAME: Guardian relationship type restriction
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\create\page.tsx
THE RULE IN PLAIN ENGLISH: Guardian relationship type must be selected from predefined options (father, mother, uncle, aunt, grandparent, sibling, legal_guardian, other).
THE RULE IN CODE: `const RELATIONSHIP_OPTIONS = ['father','mother','uncle','aunt','grandparent','sibling','legal_guardian','other'];`
APPLIES TO: Guardian creation and linking
HOW ENFORCED: Frontend dropdown options + Zod validation (`relationship_type: z.string().min(1, ...)`)

RULE #98:
NAME: Guardian phone number format
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\create\page.tsx
THE RULE IN PLAIN ENGLISH: Guardian phone numbers must be in Ethiopian +251 format with 9 digits after the country code.
THE RULE IN CODE: `phone_number: z.string().regex(/^\+251\d{9}$/)`
APPLIES TO: Guardian creation
HOW ENFORCED: Frontend Zod validation

RULE #99:
NAME: Link students requires at least one selection
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\create\page.tsx
THE RULE IN PLAIN ENGLISH: After creating a guardian, students can only be linked if at least one student is selected.
THE RULE IN CODE: `if (!createdGuardianId || selectedStudentIds.length === 0) return;` and `disabled={selectedStudentIds.length === 0 ...}`
APPLIES TO: Guardian-student linking
HOW ENFORCED: Frontend guard clause + disabled button

RULE #100:
NAME: Analytics page role restriction
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\analytics\page.tsx
THE RULE IN PLAIN ENGLISH: Only users with admin or director roles can access the analytics page.
THE RULE IN CODE: `<ProtectedRoute requireRoles={['admin', 'director']}>`
APPLIES TO: Admin, Director
HOW ENFORCED: Frontend ProtectedRoute role gate

RULE #101:
NAME: Schedule page role restriction
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\schedule\page.tsx
THE RULE IN PLAIN ENGLISH: Only users with admin or registrar roles can access the schedule management page.
THE RULE IN CODE: `<ProtectedRoute requireRoles={['admin', 'registrar']}>`
APPLIES TO: Admin, Registrar
HOW ENFORCED: Frontend ProtectedRoute role gate

RULE #102:
NAME: Schedule filter cascade resets
CATEGORY: Schedule
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\schedule\page.tsx
THE RULE IN PLAIN ENGLISH: Changing academic year resets the selected term, and changing class resets the selected section.
THE RULE IN CODE: `onValueChange={(v) => { setYearId(v); setTermId(''); }}` and `onValueChange={(v) => { setClassId(v); setSectionId(''); }}`
APPLIES TO: Schedule page filters
HOW ENFORCED: Frontend state reset logic

RULE #103:
NAME: Schedule term/section selection requires prerequisites
CATEGORY: Schedule
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\schedule\page.tsx
THE RULE IN PLAIN ENGLISH: Term selection is disabled until an academic year is selected; section selection is disabled until a class is selected.
THE RULE IN CODE: `<Select ... disabled={!yearId}>` and `<Select ... disabled={!classId}>`
APPLIES TO: Schedule page filters
HOW ENFORCED: Frontend disabled controls

RULE #104:
NAME: User must be active to access the system (UI meaning)
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\[id]\edit\page.tsx
THE RULE IN PLAIN ENGLISH: A user marked inactive is treated as deactivated (cannot access the system), while an active user can access the system.
THE RULE IN CODE: `{isActive ? 'User can access the system' : 'User is deactivated'}`
APPLIES TO: User accounts
HOW ENFORCED: Frontend toggle meaning / UI policy statement

RULE #105:
NAME: Role editing not allowed for own account
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\[id]\edit\page.tsx
THE RULE IN PLAIN ENGLISH: Users cannot edit their own roles; role management UI is hidden for the current user’s own profile.
THE RULE IN CODE: `const isOwnProfile = currentUser?.id === id;` and `{canManageRoles && !isOwnProfile && ( ... )}`
APPLIES TO: Role management
HOW ENFORCED: Frontend conditional rendering

RULE #106:
NAME: Empty phone number is omitted on guardian update
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\[id]\edit\page.tsx
THE RULE IN PLAIN ENGLISH: If the guardian phone number field is left blank, the update payload omits `phone_number` rather than sending an empty string.
THE RULE IN CODE: `if (payload.phone_number === '') { delete payload.phone_number; }`
APPLIES TO: Guardian updates
HOW ENFORCED: Frontend payload normalization

RULE #107:
NAME: Student status options restriction
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\students\[id]\edit\page.tsx
THE RULE IN PLAIN ENGLISH: When editing a student (admin/registrar only), the student status must be one of: active, graduated, transferred, expelled, withdrawn.
THE RULE IN CODE: `<SelectItem value="active" /> ... <SelectItem value="graduated" /> ... <SelectItem value="transferred" /> ... <SelectItem value="expelled" /> ... <SelectItem value="withdrawn" />`
APPLIES TO: Student record status
HOW ENFORCED: Frontend dropdown options (shown only to admin/registrar)

RULE #108:
NAME: Empty student optional fields omitted on update
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\students\[id]\edit\page.tsx
THE RULE IN PLAIN ENGLISH: When updating a student, empty `phone_number` and empty/undefined `ministry_exam_result` are removed from the update payload.
THE RULE IN CODE: `if (payload.ministry_exam_result === '' || payload.ministry_exam_result === undefined) { delete payload.ministry_exam_result; } if (payload.phone_number === '') { delete payload.phone_number; }`
APPLIES TO: Student updates
HOW ENFORCED: Frontend payload normalization

RULE #109:
NAME: Teacher status options restriction
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\teachers\[id]\edit\page.tsx
THE RULE IN PLAIN ENGLISH: When editing a teacher (admin/registrar only), the teacher status must be one of: active, on_leave, suspended, resigned, retired.
THE RULE IN CODE: `<SelectItem value="active" /> ... <SelectItem value="on_leave" /> ... <SelectItem value="suspended" /> ... <SelectItem value="resigned" /> ... <SelectItem value="retired" />`
APPLIES TO: Teacher status
HOW ENFORCED: Frontend dropdown options (shown only to admin/registrar)

RULE #110:
NAME: Empty teacher phone number omitted on update
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\teachers\[id]\edit\page.tsx
THE RULE IN PLAIN ENGLISH: When updating a teacher, an empty phone number is removed from the update payload.
THE RULE IN CODE: `if (payload.phone_number === '') { delete payload.phone_number; }`
APPLIES TO: Teacher updates
HOW ENFORCED: Frontend payload normalization

RULE #111:
NAME: User edit action restricted by permission and self-profile
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\[id]\page.tsx
THE RULE IN PLAIN ENGLISH: The Edit action for a user is only shown if the current user has permission to edit the target user and the target user is not the current user.
THE RULE IN CODE: `const canEdit = canEditUser(userRoles); const isOwnProfile = currentUser?.id === id; {canEdit && !isOwnProfile && ( ... Edit ... )}`
APPLIES TO: User management
HOW ENFORCED: Frontend conditional rendering

RULE #112:
NAME: User delete action restricted by permission and active status
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\[id]\page.tsx
THE RULE IN PLAIN ENGLISH: The Delete action for a user is only shown if the current user can delete the target user, the target user is not the current user, and the target user is active.
THE RULE IN CODE: `{canDelete && !isOwnProfile && user.is_active && ( ... Delete ... )}`
APPLIES TO: User management
HOW ENFORCED: Frontend conditional rendering

RULE #113:
NAME: User restore action restricted to inactive users with restore permission
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\users\[id]\page.tsx
THE RULE IN PLAIN ENGLISH: The Restore action is only shown if the user is inactive and the current user has restore permission.
THE RULE IN CODE: `{!user.is_active && canRestoreUser && ( ... Restore ... )}`
APPLIES TO: User restore workflow
HOW ENFORCED: Frontend conditional rendering

RULE #114:
NAME: Guardian relationship badge color mapping
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\[id]\page.tsx
THE RULE IN PLAIN ENGLISH: Guardian relationship types map to UI badge colors: father/mother -> blue, grandparent -> purple, legal_guardian -> green, otherwise -> gray.
THE RULE IN CODE: `if (relationship === 'father' || relationship === 'mother') ...; if (relationship === 'grandparent') ...; if (relationship === 'legal_guardian') ...; return gray`
APPLIES TO: Guardian relationship display
HOW ENFORCED: Frontend mapping function

RULE #115:
NAME: Guardian-student link requires selected student
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\[id]\page.tsx
THE RULE IN PLAIN ENGLISH: A student can only be linked to a guardian when a student has been selected in the link modal.
THE RULE IN CODE: `if (selectedStudentId) { linkStudent.mutate(...) }` and `disabled={!selectedStudentId ...}`
APPLIES TO: Guardian-student linking
HOW ENFORCED: Frontend guard clause + disabled button

RULE #116:
NAME: Guardian detail page uses fixed relationship type for linking
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\[id]\page.tsx
THE RULE IN PLAIN ENGLISH: When linking a student from the guardian detail page, the relationship type is always sent as "guardian".
THE RULE IN CODE: `relationship_type: 'guardian' as any`
APPLIES TO: Guardian-student linking from guardian detail
HOW ENFORCED: Frontend hardcoded payload value

RULE #117:
NAME: Guardian delete warning includes linked student count
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardians\[id]\page.tsx
THE RULE IN PLAIN ENGLISH: If a guardian has linked students, the delete confirmation shows a warning that includes the number of linked students.
THE RULE IN CODE: `message={linkedStudentCount > 0 ? t('deleteWarning').replace('{count}', linkedStudentCount.toString()) : undefined}`
APPLIES TO: Guardian deletion
HOW ENFORCED: Frontend conditional confirmation message

RULE #118:
NAME: Academic year "set as current" restricted by status
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\academics\years\page.tsx
THE RULE IN PLAIN ENGLISH: The "Set as Current" action for an academic year is only shown if the year is not already current, and its status is not completed or archived.
THE RULE IN CODE: `{!year.is_current && year.status !== AcademicYearStatus.COMPLETED && year.status !== AcademicYearStatus.ARCHIVED && ( ... )}`
APPLIES TO: Academic year management
HOW ENFORCED: Frontend conditional rendering

RULE #119:
NAME: Academic year "archive" only shown for completed years
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\academics\years\page.tsx
THE RULE IN PLAIN ENGLISH: The "Archive Year" action is only displayed when the academic year status is completed.
THE RULE IN CODE: `{year.status === AcademicYearStatus.COMPLETED && ( ... ArchiveYear ... )}`
APPLIES TO: Academic year archiving workflow
HOW ENFORCED: Frontend conditional rendering

RULE #120:
NAME: Term "set as active" restricted to non-active terms
CATEGORY: Other
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\academics\years\[yearId]\page.tsx
THE RULE IN PLAIN ENGLISH: The "Set as Active" action for a term is only shown if the term's status is not already active.
THE RULE IN CODE: `{term.status !== 'active' && ( ... setAsActive ... )}`
APPLIES TO: Term management
HOW ENFORCED: Frontend conditional rendering

RULE #121:
NAME: Enrollment transfer/withdraw actions restricted to active enrollments
CATEGORY: Enrollment
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\enrollments\page.tsx
THE RULE IN PLAIN ENGLISH: Transfer and withdraw actions for an enrollment are only shown when the enrollment status is active.
THE RULE IN CODE: `{enrollment.status === 'active' && ( ... transferStudent ... withdrawStudent ... )}`
APPLIES TO: Enrollment workflow
HOW ENFORCED: Frontend conditional rendering

RULE #122:
NAME: Assessment weight must be between 1 and 100
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\grades\page.tsx
THE RULE IN PLAIN ENGLISH: When creating an assessment, the weight percentage must be between 1 and 100.
THE RULE IN CODE: `<Input type="number" value={newAssessment.weight} min={1} max={100} onChange={...} />`
APPLIES TO: Assessment creation
HOW ENFORCED: Frontend input constraints

RULE #123:
NAME: Letter grade scale thresholds
CATEGORY: Grading
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\grades\page.tsx
THE RULE IN PLAIN ENGLISH: Letter grades are calculated from percentage scores as: A >= 90%, B >= 80%, C >= 70%, D >= 60%, F < 60%.
THE RULE IN CODE: `pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'`
APPLIES TO: Grade display
HOW ENFORCED: Frontend calculation

RULE #124:
NAME: Guardian IDOR protection on child detail access
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\guardian\children\[studentId]\page.tsx
THE RULE IN PLAIN ENGLISH: A guardian can only view a child's detail page if the student ID is in the guardian's linked children list; otherwise a 403 access denied page is shown.
THE RULE IN CODE: `const isAuthorized = children?.some(child => child.id === studentId); if (!isAuthorized) { return <AccessDenied />; }`
APPLIES TO: Guardian child access
HOW ENFORCED: Frontend authorization check before data fetch

RULE #125:
NAME: Password change requires minimum 8 characters and confirmation match
CATEGORY: Access
FILE: c:\Users\hp\Pictures\final project\front_end\src\app\[locale]\(dashboard)\dashboard\change-password\page.tsx
THE RULE IN PLAIN ENGLISH: When changing password, the new password must be at least 8 characters long and must match the confirmation password.
THE RULE IN CODE: `new_password: z.string().min(8, tv('passwordMinLength')); .refine((data) => data.new_password === data.confirm_password, { message: tv('passwordsDoNotMatch'), path: ['confirm_password'] })`
APPLIES TO: Password change
HOW ENFORCED: Frontend Zod validation

---

## RULES BY CATEGORY

**ENROLLMENT RULES:** 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 47, 48, 49, 90, 91, 92, 95, 97, 98, 99, 106, 107, 108, 110, 115, 116, 121
**ATTENDANCE RULES:** 36, 38, 40, 44, 46, 62, 64, 65, 82, 83
**GRADING RULES:** 37, 41, 42, 43, 45, 51, 52, 60, 61, 63, 78, 84, 122, 123
**ACCESS CONTROL RULES:** 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 66, 79, 80, 81, 87, 88, 89, 93, 96, 100, 101, 104, 105, 111, 112, 113, 124, 125
**FEE/PAYMENT RULES:** 53, 54, 55
**SCHEDULE RULES:** 58, 59, 68, 69, 70, 102, 103
**STATUS RULES:** 41, 42, 43, 76, 77
**OTHER RULES:** 1, 2, 3, 4, 5, 6, 39, 50, 56, 57, 67, 71, 72, 73, 74, 75, 85, 86, 94, 109, 114, 117, 118, 119, 120

---

## RULE ISSUES

**INCOMPLETE:** None identified

**CONFLICTING:** None identified

**MISSING:**
- No rule preventing duplicate enrollment of same student in same section
- No rule preventing grade entry before assessment date
- No rule preventing attendance marking for future dates
- No maximum class size enforcement beyond UI disabling
- No rule for minimum number of subjects per class
- No rule for teacher workload limits
- No rule for guardian relationship limits (max students per guardian)

**QUESTIONABLE:**
- Rule #38-43: Risk thresholds (75% attendance, 50% grades) may not match all school policies
- Rule #44: 80% attendance threshold for green color may be too strict for some schools
- Rule #45: 60% score threshold for green color may be too lenient for some schools
- Rule #51: 90% for 'A' grade may not match Ethiopian grading scale (often 100-90-80-70-60)
- Rule #50: 5 face captures required may be excessive or insufficient depending on accuracy needs
- Rule #64: Late arrival threshold hardcoded to 8:30 AM may not be configurable for all schools
- Rule #75: SMS cost of 0.5 units per segment may not reflect actual provider pricing
- Rule #76-77: At-risk color thresholds differ from student dashboard thresholds (inconsistent)
