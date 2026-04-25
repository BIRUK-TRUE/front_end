# API Endpoint Contract

This document lists every single API endpoint the frontend calls across all features.

## Internal API Endpoints

| Method | Endpoint | Request Body | Response Shape | Feature | Hook File |
|--------|----------|-------------|----------------|---------|-----------|
| GET | `/teachers/{teacherId}/dashboard-stats` | - | `TeacherDashboardStats` | teacher | useTeacherDashboard.ts |
| GET | `/teachers/{teacherId}/classes` | - | `TeacherClassItem[]` | teacher | useTeacherClasses.ts |
| GET | `/sections/{sectionId}/students` | - | `TeacherRosterResponse` | teacher | useTeacherClasses.ts |
| GET | `/teachers/{teacherId}/schedule` | - | `TeacherScheduleEntry[]` | teacher | useTeacherSchedule.ts |
| GET | `/teachers/{teacherId}/attendance-records` | Query: `TeacherAttendanceFilter` | `{ items: TeacherAttendanceRecord[], total: number }` | teacher | useTeacherAttendance.ts |
| GET | `/attendance/check` | Query: `{ sectionId, date }` | `{ alreadyTaken: boolean, allowEdit: boolean }` | teacher | useTeacherAttendance.ts |
| POST | `/attendance/bulk` | `TeacherAttendanceSubmitPayload` | - | teacher | useTeacherAttendance.ts |
| GET | `/teachers/{teacherId}/assessments` | Query: `TeacherAssessmentFilter` | `{ items: TeacherAssessment[], total: number }` | teacher | useTeacherGrades.ts |
| GET | `/assessments/{assessmentId}/grades` | - | `TeacherAssessmentGrade[]` | teacher | useTeacherGrades.ts |
| POST | `/assessments/{assessmentId}/grades/bulk` | `{ grades: TeacherGradeSubmitItem[] }` | - | teacher | useTeacherGrades.ts |
| GET | `/api/students/{studentId}/dashboard` | - | `StudentDashboardData` | student-portal | useStudentPortalDashboard.ts |
| GET | `/api/students/{studentId}/attendance/summary` | - | `AttendanceSummary` | student-portal | useMyAttendance.ts |
| GET | `/api/students/{studentId}/attendance/calendar` | Query: `{ month, year }` | `AttendanceCalendarResponse` | student-portal | useMyAttendance.ts |
| GET | `/api/students/{studentId}/attendance/records` | Query: `{ month?, year?, status?, page, size }` | `PaginatedResponse<AttendanceRecord>` | student-portal | useMyAttendance.ts |
| GET | `/api/students/{studentId}/grades/summary` | Query: `{ termId? }` | `GradesSummaryResponse` | student-portal | useMyGrades.ts |
| GET | `/api/students/{studentId}/grades/assessments` | Query: `{ termId?, subjectId?, page, size }` | `PaginatedResponse<AssessmentGradeRecord>` | student-portal | useMyGrades.ts |
| GET | `/api/students/{studentId}/grades/report-card` | Query: `{ termId }` | `ReportCardData` | student-portal | useMyGrades.ts |
| GET | `/api/students/{studentId}/profile` | - | `StudentProfile` | student-portal | useMyProfile.ts |
| PATCH | `/api/students/{studentId}/photo` | `FormData` (multipart/form-data) | - | student-portal | useMyProfile.ts |
| GET | `/api/students/{studentId}/schedule` | - | `ScheduleResponse` | student-portal | useMySchedule.ts |
| GET | `/api/settings/academic` | - | `AcademicSettings` | student-portal | useAcademicSettings.ts |
| POST | `/api/auth/change-password` | `{ currentPassword: string, newPassword: string }` | - | student-portal | ChangePasswordForm.tsx |
| GET | `/api/guardians/{guardianId}/dashboard` | - | `GuardianDashboardData` | guardian-portal | useGuardianDashboard.ts |
| GET | `/api/guardians/{guardianId}/students` | - | `ChildSummary[]` | guardian-portal | useMyChildren.ts |
| GET | `/api/students/{studentId}/guardian-view` | - | `ChildDetails` | guardian-portal | useChildDetails.ts |
| GET | `/api/students/{studentId}/attendance/records` | Query: filters | `PaginatedResponse<AttendanceRecord>` | guardian-portal | useChildDetails.ts |
| GET | `/api/students/{studentId}/grades` | Query: filters | - | guardian-portal | useChildDetails.ts |
| GET | `/api/students/{studentId}/schedule` | - | - | guardian-portal | useChildDetails.ts |
| GET | `/api/students/{studentId}/fees/balance` | - | `ChildFeeBalance` | guardian-portal | useGuardianPayments.ts |
| GET | `/api/students/{studentId}/payments` | - | `PaymentRecord[]` | guardian-portal | useGuardianPayments.ts |
| POST | `/api/payments/initiate` | `{ studentId: string, amount: number, method: string }` | - | guardian-portal | useGuardianPayments.ts |
| GET | `/api/guardians/{guardianId}/notifications` | Query: filters | `PaginatedResponse<GuardianNotification>` | guardian-portal | useGuardianNotifications.ts |
| PATCH | `/api/notifications/{notificationId}/read` | - | - | guardian-portal | useGuardianNotifications.ts |
| PATCH | `/api/guardians/{guardianId}/notifications/read-all` | - | - | guardian-portal | useGuardianNotifications.ts |
| GET | `/schedule/section/{sectionId}` | Query: `{ term_id }` | `ScheduleEntry[]` | schedule | useSchedule.ts |
| GET | `/schedule/teacher/{teacherId}` | Query: `{ term_id }` | `ScheduleEntry[]` | schedule | useSchedule.ts |
| POST | `/schedule` | `CreateScheduleEntryPayload` | - | schedule | useSchedule.ts |
| DELETE | `/schedule/{id}` | - | - | schedule | useSchedule.ts |
| GET | `/guardians/{guardianId}/dashboard` | - | `GuardianDashboardData` | payments | usePayments.ts |
| GET | `/students/{studentId}/fees` | - | `StudentFee[]` | payments | usePayments.ts |
| GET | `/students/{studentId}/payments` | - | `PaymentTransaction[]` | payments | usePayments.ts |
| GET | `/guardians/{guardianId}/payments` | - | `PaymentTransaction[]` | payments | usePayments.ts |
| POST | `/payments/chapa/initialize` | `ChapaPaymentPayload & { fee_id: string }` | - | payments | usePayments.ts |
| POST | `/payments/chapa/verify` | `{ reference: string }` | - | payments | usePayments.ts |
| POST | `/payments` | `CreatePaymentRequest` | - | payments | usePayments.ts |
| GET | `/notifications` | - | `Notification[]` | notifications | useNotifications.ts |
| GET | `/notifications/unread/count` | - | `{ count: number }` | notifications | useNotifications.ts |
| POST | `/notifications/{notificationId}/read` | - | - | notifications | useNotifications.ts |
| POST | `/notifications/read-all` | - | - | notifications | useNotifications.ts |
| GET | `/notifications/preferences` | - | `NotificationPreferences` | notifications | useNotifications.ts |
| PATCH | `/notifications/preferences` | `Partial<NotificationPreferences>` | - | notifications | useNotifications.ts |
| POST | `/notifications` | `CreateNotificationPayload` | - | notifications | useNotifications.ts |
| DELETE | `/notifications/{notificationId}` | - | - | notifications | useNotifications.ts |
| GET | `/notifications/history` | Query: filters | `{ items: NotificationHistory[], total: number }` | notifications | useNotificationHistory.ts |
| GET | `/notifications/{notificationId}/detail` | - | `NotificationDetail` | notifications | useNotificationHistory.ts |
| POST | `/notifications/{notificationId}/retry` | - | - | notifications | useNotificationHistory.ts |
| POST | `/notifications/preview-recipients` | `{ targetType: string, targetIds: string[] }` | `{ count: number, sampleNames: string[] }` | notifications | useNotificationComposer.ts |
| POST | `/notifications/send` | `CreateNotificationPayload` | - | notifications | useNotificationComposer.ts |
| GET | `/notification-rules` | - | `AlertRule[]` | notifications | useAlertRules.ts |
| PATCH | `/notification-rules/{ruleId}` | `Partial<AlertRule> & { ruleId: string }` | - | notifications | useAlertRules.ts |
| PATCH | `/notification-rules/{ruleId}/toggle` | `{ ruleId: string, enabled: boolean }` | - | notifications | useAlertRules.ts |
| GET | `/assessments` | Query: `{ class_id, subject_id }` | `Assessment[]` | grades | useGrades.ts |
| POST | `/assessments` | `Omit<Assessment, 'id' | 'created_at' | 'subject_name' | 'class_name' | 'term_name'>` | - | grades | useGrades.ts |
| GET | `/grades/assessment/{assessmentId}` | - | `Grade[]` | grades | useGrades.ts |
| POST | `/grades/bulk` | `BulkGradePayload` | - | grades | useGrades.ts |
| GET | `/grades/report-card/{studentId}` | Query: `{ term_id }` | `ReportCard` | grades | useGrades.ts |
| GET | `/attendance/section/{sectionId}` | Query: `{ date }` | `AttendanceRecord[]` | attendance | useAttendance.ts |
| GET | `/attendance/student/{studentId}` | Query: `{ page, size }` | `{ items: AttendanceRecord[], total: number }` | attendance | useAttendance.ts |
| GET | `/attendance/student/{studentId}/stats` | - | `StudentAttendanceStats` | attendance | useAttendance.ts |
| POST | `/attendance/bulk` | `BulkAttendancePayload` | - | attendance | useAttendance.ts |
| GET | `/sections/{sectionId}/students` | - | `{ items: SectionStudent[] }` | attendance | useSectionStudents.ts |
| GET | `/face-recognition/descriptors` | Query: `{ sectionId }` | `FaceDescriptor[]` | attendance | useFaceAttendance.ts |
| POST | `/attendance/mark-by-face` | `MarkAttendanceByFacePayload` | - | attendance | useFaceAttendance.ts |
| POST | `/face-recognition/unknown-face` | `{ sectionId: string, capturedImage: string, confidence: number }` | - | attendance | useFaceAttendance.ts |
| GET | `/face-recognition/enrollment-status` | Query: `{ sectionId }` | `EnrollmentStatus[]` | attendance | useFaceEnrollment.ts |
| POST | `/face-recognition/enroll` | `{ studentId: string, descriptors: number[][] }` | - | attendance | useFaceEnrollment.ts |
| DELETE | `/face-recognition/enroll/{studentId}` | - | - | attendance | useFaceEnrollment.ts |
| GET | `/academics/years` | Query: `{ page, size }` | `PaginatedResponse<AcademicYear>` | academics | useAcademicYears.ts |
| GET | `/academics/years/{id}` | - | `AcademicYear` | academics | useAcademicYears.ts |
| POST | `/academics/years` | `AcademicYearForm` | - | academics | useAcademicYears.ts |
| PATCH | `/academics/years/{id}` | `Partial<AcademicYearForm> & { is_current?: boolean, status?: string }` | - | academics | useAcademicYears.ts |
| GET | `/academics/years/{yearId}/classes` | Query: `{ page, size }` | `PaginatedResponse<Class>` | academics | useClasses.ts |
| GET | `/academics/classes/{classId}` | - | `Class` | academics | useClasses.ts |
| POST | `/academics/years/{yearId}/classes` | `ClassForm` | - | academics | useClasses.ts |
| PATCH | `/academics/classes/{id}` | `Partial<ClassForm>` | - | academics | useClasses.ts |
| POST | `/academics/classes/{classId}/sections` | `SectionForm` | - | academics | useClasses.ts |
| PATCH | `/academics/sections/{id}` | `Partial<SectionForm>` | - | academics | useClasses.ts |
| GET | `/academics/sections/{sectionId}` | - | `Section` | academics | useClasses.ts |
| GET | `/academics/classes/{classId}/subjects` | - | `Subject[]` | academics | useClasses.ts |
| POST | `/academics/classes/{classId}/subjects` | `{ subject_id: string }` | - | academics | useClasses.ts |
| DELETE | `/academics/classes/{classId}/subjects/{subjectId}` | - | - | academics | useClasses.ts |
| GET | `/academics/sections/{sectionId}/students` | Query: `{ page, size }` | `PaginatedResponse<Student>` | academics | useSectionStudents.ts |
| GET | `/academics/subjects` | Query: `SubjectFilters` | `PaginatedResponse<Subject>` | academics | useSubjects.ts |
| POST | `/academics/subjects` | `SubjectForm` | - | academics | useSubjects.ts |
| PATCH | `/academics/subjects/{id}` | `{ id: string, data: Partial<SubjectForm> }` | - | academics | useSubjects.ts |
| DELETE | `/academics/subjects/{id}` | - | - | academics | useSubjects.ts |
| GET | `/academics/years/{yearId}/terms` | Query: `{ page, size }` | `PaginatedResponse<Term>` | academics | useTerms.ts |
| POST | `/academics/years/{yearId}/terms` | `TermForm` | - | academics | useTerms.ts |
| PATCH | `/academics/terms/{id}` | `Partial<TermForm> & { is_active?: boolean }` | - | academics | useTerms.ts |
| DELETE | `/academics/terms/{id}` | - | - | academics | useTerms.ts |
| GET | `/enrollments` | Query: filters | `PaginatedResponse<Enrollment>` | enrollments | useEnrollments.ts |
| GET | `/students/{studentId}/enrollments` | - | `Enrollment[]` | enrollments | useEnrollments.ts |
| POST | `/enrollments` | `EnrollmentForm` | - | enrollments | useEnrollments.ts |
| POST | `/enrollments/{enrollmentId}/transfer` | `TransferForm` | - | enrollments | useEnrollments.ts |
| POST | `/enrollments/{enrollmentId}/withdraw` | `WithdrawalForm` | - | enrollments | useEnrollments.ts |
| GET | `/analytics/summary` | Query: `{ termId?, classId?, teacherId? }` | `AnalyticsSummary` | analytics | useAnalyticsDashboard.ts |
| GET | `/analytics/enrollment-trends` | - | `{ year: string, students: number }[]` | analytics | useAnalyticsDashboard.ts |
| GET | `/analytics/recent-activity` | - | `any[]` | analytics | useAnalyticsDashboard.ts |
| GET | `/analytics/at-risk-students` | Query: `{ riskLevel?, classId?, sectionId?, termId? }` | `{ students: StudentRisk[], total: number }` | analytics | useAtRiskStudents.ts |
| POST | `/notifications/send-to-guardian` | `{ studentId: string, message: string, type: 'intervention' }` | - | analytics | useAtRiskStudents.ts |
| POST | `/students/{studentId}/intervention-notes` | `{ note: string, date: string }` | - | analytics | useAtRiskStudents.ts |
| GET | `/analytics/attendance-trend` | Query: `{ days, classId?, sectionId? }` | `AttendanceTrendEntry[]` | analytics | useAttendanceTrend.ts |
| GET | `/analytics/class-performance` | Query: `{ termId }` | `ClassPerformanceEntry[]` | analytics | useClassPerformance.ts |
| GET | `/analytics/grade-distribution` | Query: `{ termId, subjectId?, classId? }` | `GradeDistributionEntry[]` | analytics | useGradeDistribution.ts |

---

## EXTERNAL — CHAPA API

| Method | Endpoint | Request Body | Response Shape | Feature | Hook File |
|--------|----------|-------------|----------------|---------|-----------|
| POST | `https://api.chapa.co/v1/transaction/initialize` | `ChapaPaymentPayload` | `{ checkout_url: string }` | payments | ChapaPaymentModal.tsx |
| POST | `https://api.chapa.co/v1/transaction/verify/{tx_ref}` | - | `{ status: string }` | payments | ChapaPaymentModal.tsx |

---

## Notes

- All internal API endpoints are relative to the base URL configured in the frontend
- Query parameters are shown in the "Request Body" column with a "Query:" prefix
- TypeScript interface shapes are shown for Request Body and Response Shape
- Some endpoints return paginated responses with `{ items: T[], total: number }` structure
- Chapa endpoints are external to the application and require API key authentication
