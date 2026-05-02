# Front End Project File Inventory

front_end/
├── .env.local
├── .git/
├── .gitignore
├── .next/
├── README.md
├── build_output.txt
├── components.json
├── eslint.config.mjs
├── lint_errors.txt
├── lint_errors_phase3.txt
├── lint_results_final.txt
├── lint_results_utf8.txt
├── live_errors.txt
├── messages/
│   ├── am-untranslated-keys.txt
│   ├── am.json
│   └── en.json
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── models/
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts/
│   ├── sync-amharic-placeholders.js
│   └── update-locales.js
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/
│   │   │   │   ├── change-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reset-password/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── academics/
│   │   │   │   │   │   ├── classes/
│   │   │   │   │   │   │   └── [classId]/
│   │   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │   │       └── sections/
│   │   │   │   │   │   │           └── [sectionId]/
│   │   │   │   │   │   │               └── page.tsx
│   │   │   │   │   │   ├── subjects/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── years/
│   │   │   │   │   │       └── [yearId]/
│   │   │   │   │   │           └── page.tsx
│   │   │   │   │   ├── analytics/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── attendance/
│   │   │   │   │   │   ├── face-enrollment/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── face-scan/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── change-password/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── directors/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── enrollments/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── grades/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── guardian/
│   │   │   │   │   │   ├── GuardianPageClient.tsx
│   │   │   │   │   │   ├── children/
│   │   │   │   │   │   │   └── [studentId]/
│   │   │   │   │   │   │       └── page.tsx
│   │   │   │   │   │   ├── layout.tsx
│   │   │   │   │   │   ├── notifications/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── payments/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── profile/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── guardians/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── create/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── notifications/
│   │   │   │   │   │   ├── alert-rules/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── compose/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── history/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── rules/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── schedule/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── student/
│   │   │   │   │   │   ├── layout.tsx
│   │   │   │   │   │   ├── my-attendance/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── my-grades/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── my-profile/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── my-schedule/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── students/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── create/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── teacher/
│   │   │   │   │   │   ├── analytics/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── attendance/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── grades/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── layout.tsx
│   │   │   │   │   │   ├── my-classes/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── schedule/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── teachers/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── create/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── users/
│   │   │   │   │       ├── [id]/
│   │   │   │   │       │   ├── edit/
│   │   │   │   │       │   │   └── page.tsx
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       ├── create/
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── guardian/
│   │   │   │   │   ├── GuardianPageClient.tsx
│   │   │   │   │   ├── children/
│   │   │   │   │   │   └── [studentId]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── notifications/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── payments/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── profile/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── teacher/
│   │   │   │       ├── attendance/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── grades/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── layout.tsx
│   │   │   │       ├── my-classes/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── page.tsx
│   │   │   │       └── schedule/
│   │   │   │           └── page.tsx
│   │   │   ├── [...rest]/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── page.tsx
│   │   │   └── unauthorized/
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── RoleGuard.tsx
│   │   │   ├── language-switcher.tsx
│   │   │   ├── password-strength.tsx
│   │   │   └── protected-route.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── top-bar.tsx
│   │   ├── notifications/
│   │   │   └── NotificationListener.tsx
│   │   ├── providers.tsx
│   │   ├── shared/
│   │   │   ├── activity-feed.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── data-table/
│   │   │   │   ├── data-table-column-header.tsx
│   │   │   │   ├── data-table-pagination.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   └── index.ts
│   │   │   ├── empty-state.tsx
│   │   │   ├── enrollment-chart.tsx
│   │   │   ├── forbidden-page.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── stats-card.tsx
│   │   │   └── status-badge.tsx
│   │   └── ui/
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── command.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       └── tooltip.tsx
│   ├── features/
│   │   ├── academics/
│   │   │   ├── api/
│   │   │   │   ├── useAcademicYears.ts
│   │   │   │   ├── useClasses.ts
│   │   │   │   ├── useSectionStudents.ts
│   │   │   │   ├── useSubjects.ts
│   │   │   │   └── useTerms.ts
│   │   │   ├── components/
│   │   │   │   ├── AcademicYearModal.tsx
│   │   │   │   ├── ClassModal.tsx
│   │   │   │   ├── ClassSubjectModal.tsx
│   │   │   │   ├── SectionModal.tsx
│   │   │   │   ├── SubjectModal.tsx
│   │   │   │   └── TermModal.tsx
│   │   │   └── types/
│   │   │       ├── index.ts
│   │   │       └── schemas.ts
│   │   ├── analytics/
│   │   │   ├── components/
│   │   │   │   ├── AnalyticsOverview.tsx
│   │   │   │   ├── AtRiskStudentsTable.tsx
│   │   │   │   ├── AtRiskSummaryChart.tsx
│   │   │   │   ├── AttendanceTrendChart.tsx
│   │   │   │   ├── ClassPerformanceTable.tsx
│   │   │   │   ├── GradeDistributionChart.tsx
│   │   │   │   ├── InterventionNoteModal.tsx
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   ├── NotifyGuardianModal.tsx
│   │   │   │   ├── RiskBadge.tsx
│   │   │   │   └── TeacherAnalyticsView.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAnalyticsDashboard.ts
│   │   │   │   ├── useAtRiskStudents.ts
│   │   │   │   ├── useAttendanceTrend.ts
│   │   │   │   ├── useClassPerformance.ts
│   │   │   │   └── useGradeDistribution.ts
│   │   │   ├── types.ts
│   │   │   └── utils/
│   │   │       └── calculateRisk.ts
│   │   ├── attendance/
│   │   │   ├── api/
│   │   │   │   └── useAttendance.ts
│   │   │   ├── components/
│   │   │   │   ├── AttendanceMethodBadge.tsx
│   │   │   │   ├── AttendanceMethodSelector.tsx
│   │   │   │   ├── AttendancePDFReport.tsx
│   │   │   │   ├── AttendanceSessionSummary.tsx
│   │   │   │   ├── BarcodeScanner.tsx
│   │   │   │   ├── FaceAttendanceStation.tsx
│   │   │   │   ├── FaceEnrollmentFlow.tsx
│   │   │   │   ├── FaceRecognitionScanner.tsx
│   │   │   │   ├── LiveAttendanceLog.tsx
│   │   │   │   └── ManualOverrideSearch.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFaceAttendance.ts
│   │   │   │   ├── useFaceEnrollment.ts
│   │   │   │   ├── useFaceModels.ts
│   │   │   │   └── useSectionStudents.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── enrollments/
│   │   │   ├── api/
│   │   │   │   └── useEnrollments.ts
│   │   │   ├── components/
│   │   │   │   ├── EnrollmentWizard.tsx
│   │   │   │   ├── TransferModal.tsx
│   │   │   │   └── WithdrawModal.tsx
│   │   │   └── types/
│   │   │       ├── index.ts
│   │   │       └── schemas.ts
│   │   ├── grades/
│   │   │   ├── api/
│   │   │   │   └── useGrades.ts
│   │   │   ├── components/
│   │   │   │   ├── BatchReportCards.tsx
│   │   │   │   ├── GradeEntryGrid.tsx
│   │   │   │   ├── ReportCardGenerator.tsx
│   │   │   │   └── ReportCardPreview.tsx
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       └── exportReportCardPDF.ts
│   │   ├── guardian-portal/
│   │   │   ├── components/
│   │   │   │   ├── ChildDetailTabs.tsx
│   │   │   │   ├── ChildSummaryCard.tsx
│   │   │   │   ├── GuardianAlertBanner.tsx
│   │   │   │   ├── GuardianAttendanceView.tsx
│   │   │   │   ├── GuardianDashboardHome.tsx
│   │   │   │   ├── GuardianFeesView.tsx
│   │   │   │   ├── GuardianGradesView.tsx
│   │   │   │   ├── GuardianNotificationList.tsx
│   │   │   │   ├── GuardianPaymentsPage.tsx
│   │   │   │   └── GuardianScheduleView.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useChildDetails.ts
│   │   │   │   ├── useGuardianDashboard.ts
│   │   │   │   ├── useGuardianNotifications.ts
│   │   │   │   ├── useGuardianPayments.ts
│   │   │   │   └── useMyChildren.ts
│   │   │   └── types.ts
│   │   ├── notifications/
│   │   │   ├── api/
│   │   │   │   ├── useAlertRules.ts
│   │   │   │   ├── useNotificationComposer.ts
│   │   │   │   ├── useNotificationHistory.ts
│   │   │   │   └── useNotifications.ts
│   │   │   ├── components/
│   │   │   │   ├── AlertRuleCard.tsx
│   │   │   │   ├── AlertRuleEditModal.tsx
│   │   │   │   ├── AlertRuleFormModal.tsx
│   │   │   │   ├── AlertRulesManager.tsx
│   │   │   │   ├── AudienceSelector.tsx
│   │   │   │   ├── NotificationCenter.tsx
│   │   │   │   ├── NotificationComposer.tsx
│   │   │   │   ├── NotificationHistory.tsx
│   │   │   │   └── NotificationHistoryDetail.tsx
│   │   │   ├── constants/
│   │   │   │   └── templates.ts
│   │   │   ├── hooks/
│   │   │   │   └── useRealtimeToasts.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── payments/
│   │   │   ├── api/
│   │   │   │   └── usePayments.ts
│   │   │   ├── components/
│   │   │   │   ├── ChapaPaymentModal.tsx
│   │   │   │   └── GuardianDashboard.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── schedule/
│   │   │   ├── api/
│   │   │   │   └── useSchedule.ts
│   │   │   ├── components/
│   │   │   │   ├── AddPeriodModal.tsx
│   │   │   │   ├── EditPeriodModal.tsx
│   │   │   │   ├── ScheduleEntryModal.tsx
│   │   │   │   └── TimetableGrid.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── student-portal/
│   │   │   ├── api/
│   │   │   │   ├── useAcademicSettings.ts
│   │   │   │   ├── useMyAttendance.ts
│   │   │   │   ├── useMyGrades.ts
│   │   │   │   ├── useMyProfile.ts
│   │   │   │   ├── useMySchedule.ts
│   │   │   │   └── useStudentPortalDashboard.ts
│   │   │   ├── components/
│   │   │   │   ├── AssessmentDetailsTable.tsx
│   │   │   │   ├── AttendanceCalendar.tsx
│   │   │   │   ├── AttendanceDayPopover.tsx
│   │   │   │   ├── AttendanceRecordsTable.tsx
│   │   │   │   ├── AttendanceSummaryCard.tsx
│   │   │   │   ├── AttendanceWarningBanner.tsx
│   │   │   │   ├── ChangePasswordForm.tsx
│   │   │   │   ├── GradeFilters.tsx
│   │   │   │   ├── ProfilePhotoUpload.tsx
│   │   │   │   ├── StudentAnnouncements.tsx
│   │   │   │   ├── StudentDashboardHome.tsx
│   │   │   │   ├── StudentProfileCard.tsx
│   │   │   │   ├── StudentRecentGrades.tsx
│   │   │   │   ├── StudentReportCard.tsx
│   │   │   │   ├── StudentStatCard.tsx
│   │   │   │   ├── StudentTodaySchedule.tsx
│   │   │   │   ├── StudentWeeklyTimetable.tsx
│   │   │   │   └── SubjectScoreSummaryTable.tsx
│   │   │   └── types.ts
│   │   ├── teacher/
│   │   │   ├── components/
│   │   │   │   ├── TeacherAttendanceForm.tsx
│   │   │   │   ├── TeacherClassCard.tsx
│   │   │   │   ├── TeacherClassRoster.tsx
│   │   │   │   ├── TeacherDashboardHome.tsx
│   │   │   │   ├── TeacherGradeEntry.tsx
│   │   │   │   ├── TeacherTodaySchedule.tsx
│   │   │   │   └── TeacherWeeklyTimetable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useTeacherAttendance.ts
│   │   │   │   ├── useTeacherClasses.ts
│   │   │   │   ├── useTeacherDashboard.ts
│   │   │   │   ├── useTeacherGrades.ts
│   │   │   │   └── useTeacherSchedule.ts
│   │   │   └── types.ts
│   │   └── teachers/
│   │       └── api/
│   │           └── useTeachers.ts
│   ├── hooks/
│   │   ├── use-guardians.ts
│   │   ├── use-permissions.ts
│   │   ├── use-settings.ts
│   │   ├── use-students.ts
│   │   ├── use-teachers.ts
│   │   ├── use-users.ts
│   │   └── useSettings.ts
│   ├── i18n/
│   │   ├── navigation.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   └── lib/
│       ├── api/
│       │   ├── auth.service.ts
│       │   ├── axios.ts
│       │   ├── guardians.service.ts
│       │   ├── query-keys.ts
│       │   ├── settings.service.ts
│       │   ├── students.service.ts
│       │   ├── teachers.service.ts
│       │   └── users.service.ts
│       ├── permissions.ts
│       ├── store/
│       │   └── auth-store.ts
│       └── utils.ts
├── ts_errors.txt
├── ts_errors_2.txt
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── tsc_current.txt
├── tsc_errors.txt
├── tsc_errors_v2.txt
├── tsc_errors_v3.txt
├── tsc_live_errors.txt
├── tsc_output.txt
└── tsc_output_2.txt

## File Counts

- **Total folders:** 127
- **Total files:** 243
- **Total .tsx files:** 147
- **Total .ts files:** 66
- **Total page/route files:** 76
- **Total component files:** 95
- **Total hook files:** 30
- **Total API service files:** 27
