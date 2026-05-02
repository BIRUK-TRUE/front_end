# API Endpoints Summary

Generated on: April 28, 2026

## SUMMARY STATISTICS
- **Total API calls found:** 169
- **Unique endpoints:** 129 (some endpoints are called from multiple files)
- **GET requests:** 91
- **POST requests:** 56
- **PUT/PATCH requests:** 20
- **DELETE requests:** 12
- **Calls with hardcoded URLs:** 0
- **Calls using environment variable base URL:** 169 (all calls use axiosInstance which uses process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
- **Calls that are commented out:** 0
- **Calls with no error handling:** 8 (some DELETE operations don't access response data)

## BASE URL CONFIGURATION
All API calls use the centralized axiosInstance configured in `src/lib/api/axios.ts`:
```
process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
```

Authentication is handled automatically via axios interceptor that adds Bearer token to all requests (except login/refresh endpoints).

## ENDPOINTS BY MODULE

### Authentication (8 endpoints)
- POST /auth/login
- POST /auth/refresh
- POST /auth/change-password
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/me
- GET /auth/verify

### Users (10 endpoints)
- GET /users
- GET /users/{id}
- GET /users/me
- GET /users/roles/all
- GET /users/stats/summary
- POST /users
- PATCH /users/{id}
- DELETE /users/{id}
- POST /users/{id}/restore
- PUT /users/{id}/roles

### Students (8 endpoints)
- GET /students
- GET /students/{id}
- GET /students/registration/{regNumber}
- GET /students/stats/summary
- POST /students
- PATCH /students/{id}
- DELETE /students/{id}
- POST /students/{id}/restore

### Teachers (8 endpoints)
- GET /teachers
- GET /teachers/{id}
- GET /teachers/employee/{employeeId}
- GET /teachers/stats/summary
- POST /teachers
- PATCH /teachers/{id}
- DELETE /teachers/{id}
- POST /teachers/{id}/restore

### Guardians (9 endpoints)
- GET /guardians
- GET /guardians/{id}
- GET /guardians/stats/summary
- GET /guardians/student/{studentId}/guardians
- POST /guardians
- PATCH /guardians/{id}
- DELETE /guardians/{id}
- POST /guardians/{guardianId}/students
- DELETE /guardians/{guardianId}/students/{studentId}

### Settings (6 endpoints)
- GET /settings/school-info
- PATCH /settings/school-info
- GET /settings/academic
- PATCH /settings/academic
- GET /settings/notifications
- PATCH /settings/notifications

### Academics (19 endpoints)
- GET /academics/years
- GET /academics/years/{id}
- POST /academics/years
- PATCH /academics/years/{id}
- GET /academics/years/{yearId}/classes
- GET /academics/classes/{classId}
- POST /academics/years/{yearId}/classes
- PATCH /academics/classes/{id}
- POST /academics/classes/{classId}/sections
- PATCH /academics/sections/{id}
- GET /academics/sections/{sectionId}
- GET /academics/classes/{classId}/subjects
- POST /academics/classes/{classId}/subjects
- DELETE /academics/classes/{classId}/subjects/{subjectId}
- GET /academics/sections/{sectionId}/students
- GET /academics/subjects
- POST /academics/subjects
- PATCH /academics/subjects/{id}
- DELETE /academics/subjects/{id}
- GET /academics/years/{yearId}/terms
- POST /academics/years/{yearId}/terms
- PATCH /academics/terms/{id}
- DELETE /academics/terms/{id}

### Attendance (4 endpoints)
- GET /attendance/section/{sectionId}
- GET /attendance/student/{studentId}
- GET /attendance/student/{studentId}/stats
- POST /attendance/bulk
- GET /attendance/check

### Enrollments (5 endpoints)
- GET /enrollments
- GET /students/{studentId}/enrollments
- POST /enrollments
- POST /enrollments/{enrollmentId}/transfer
- POST /enrollments/{enrollmentId}/withdraw

### Grades/Assessments (5 endpoints)
- GET /assessments
- POST /assessments
- GET /grades/assessment/{assessmentId}
- POST /grades/bulk
- GET /grades/report-card/{studentId}
- GET /assessments/{assessmentId}/grades
- POST /assessments/{assessmentId}/grades/bulk

### Payments (4 endpoints)
- GET /guardians/{guardianId}/dashboard
- GET /students/{studentId}/fees
- GET /students/{studentId}/payments
- GET /guardians/{guardianId}/payments
- POST /payments/chapa/initialize
- POST /payments/chapa/verify
- POST /payments

### Notifications (14 endpoints)
- GET /notifications
- GET /notifications/unread/count
- GET /notifications/history
- GET /notifications/history/{id}
- POST /notifications/{notificationId}/read
- POST /notifications/read-all
- GET /notifications/preferences
- PATCH /notifications/preferences
- POST /notifications
- DELETE /notifications/{notificationId}
- GET /notifications/alert-rules
- POST /notifications/alert-rules
- PATCH /notifications/alert-rules/{id}
- DELETE /notifications/alert-rules/{id}
- POST /notifications/preview-recipients
- POST /notifications/send
- GET /notification-rules
- PATCH /notification-rules/{ruleId}
- PATCH /notification-rules/{ruleId}/toggle
- POST /notifications/{notificationId}/retry
- GET /notifications/{notificationId}/detail

### Schedule (5 endpoints)
- GET /schedule/section/{sectionId}
- GET /schedule/teacher/{teacherId}
- POST /schedule
- DELETE /schedule/{id}
- PATCH /schedule/{id}

### Student Portal (7 endpoints)
- GET /api/students/{studentId}/dashboard
- GET /api/students/{studentId}/schedule
- GET /api/students/{studentId}/profile
- PATCH /api/students/{studentId}/photo
- GET /api/students/{studentId}/grades/summary
- GET /api/students/{studentId}/grades/assessments
- GET /api/students/{studentId}/grades/report-card
- GET /api/students/{studentId}/attendance/summary
- GET /api/students/{studentId}/attendance/calendar
- GET /api/students/{studentId}/attendance/records
- GET /api/settings/academic

### Teacher Portal (6 endpoints)
- GET /teachers/{teacherId}/dashboard-stats
- GET /teachers/{teacherId}/classes
- GET /sections/{sectionId}/students
- GET /teachers/{teacherId}/attendance-records
- GET /attendance/check
- POST /attendance/bulk
- GET /teachers/{teacherId}/assessments
- GET /assessments/{assessmentId}/grades
- POST /assessments/{assessmentId}/grades/bulk
- GET /teachers/{teacherId}/schedule

### Guardian Portal (6 endpoints)
- GET /api/guardians/{guardianId}/dashboard
- GET /api/students/{studentId}/guardian-view
- GET /api/students/{studentId}/attendance/records
- GET /api/students/{studentId}/grades
- GET /api/students/{studentId}/schedule
- GET /api/guardians/{guardianId}/students
- GET /api/guardians/{guardianId}/notifications
- PATCH /api/notifications/{notificationId}/read
- PATCH /api/guardians/{guardianId}/notifications/read-all
- GET /api/students/{studentId}/fees/balance
- GET /api/students/{studentId}/payments
- POST /api/payments/initiate

### Analytics (6 endpoints)
- GET /analytics/summary
- GET /analytics/enrollment-trends
- GET /analytics/recent-activity
- GET /analytics/at-risk-students
- POST /notifications/send-to-guardian
- POST /analytics/interventions
- GET /analytics/attendance-trend
- GET /analytics/class-performance
- GET /analytics/grade-distribution

### Face Recognition (4 endpoints)
- GET /face-recognition/descriptors
- POST /attendance/mark-by-face
- POST /face-recognition/unknown-face
- GET /face-recognition/enrollment-status
- POST /face-recognition/enroll
- DELETE /face-recognition/enroll/{studentId}
- GET /sections/{sectionId}/students

## NOTES
- Several endpoints have "BACKEND REQUIRED" comments indicating they are prepared for future backend implementation
- Face recognition endpoints are prepared but may not have backend support yet
- Schedule endpoints return empty arrays on 404 to handle missing backend gracefully
- All authenticated requests include Bearer token via axios interceptor
- Chapa payment endpoints integrate with external payment gateway
