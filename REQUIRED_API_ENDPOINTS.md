# Required API Endpoints — Backend Specification

> Auto-generated from front-end code analysis.  
> Base URL: `{API_BASE_URL}` (default `http://localhost:8000/api`)  
> All endpoints require `Authorization: Bearer <access_token>` unless marked public.  
> All paginated list endpoints return `{ items: T[], total: number, page: number, size: number }`.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Students](#3-students)
4. [Teachers](#4-teachers)
5. [Guardians](#5-guardians)
6. [Academics — Academic Years](#61-academic-years)
7. [Academics — Terms](#62-terms)
8. [Academics — Subjects](#63-subjects)
9. [Academics — Classes](#64-classes)
10. [Academics — Sections](#65-sections)
11. [Enrollments](#7-enrollments)
12. [Attendance](#8-attendance)
13. [Face Recognition](#9-face-recognition)
14. [Grades & Assessments](#10-grades--assessments)
15. [Schedule](#11-schedule)
16. [Payments & Fees](#12-payments--fees)
17. [Notifications](#13-notifications)
18. [Analytics](#14-analytics)
19. [Settings](#15-settings)
20. [Features Without API Integration (Gaps)](#16-features-without-api-integration-gaps)

---

## 1. Authentication

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `POST` | `/auth/login` | Public | Login with email & password |
| 2 | `POST` | `/auth/refresh` | Refresh token | Refresh access token |
| 3 | `POST` | `/auth/change-password` | Bearer | Change current user's password |
| 4 | `POST` | `/auth/forgot-password` | Public | Request password reset email |
| 5 | `POST` | `/auth/reset-password` | Public | Reset password with token |
| 6 | `GET` | `/auth/me` | Bearer | Get current authenticated user |
| 7 | `GET` | `/auth/verify` | Bearer | Verify if token is still valid |

### Request/Response Details

**POST /auth/login**
```json
// Request
{ "email": "string", "password": "string" }
// Response
{ "access_token": "string", "refresh_token": "string", "token_type": "bearer", "user": { "id": "string", "email": "string", "full_name": "string", "roles": ["string"], "student_id": "string|null", "teacher_id": "string|null", "guardian_id": "string|null" } }
```

**POST /auth/refresh**
```json
// Request
{ "refresh_token": "string" }
// Response
{ "access_token": "string", "refresh_token": "string" }
```

**POST /auth/change-password**
```json
// Request
{ "current_password": "string", "new_password": "string", "new_password_confirm": "string" }
```

**POST /auth/forgot-password**
```json
// Request
{ "email": "string" }
```

**POST /auth/reset-password**
```json
// Request
{ "token": "string", "new_password": "string", "new_password_confirm": "string" }
```

---

## 2. Users

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/users` | Bearer | List users with filters & pagination |
| 2 | `GET` | `/users/{id}` | Bearer | Get user by ID |
| 3 | `GET` | `/users/me` | Bearer | Get current user (alias for /auth/me) |
| 4 | `GET` | `/users/roles/all` | Bearer | Get all available roles |
| 5 | `GET` | `/users/stats/summary` | Bearer | Get user statistics summary |
| 6 | `POST` | `/users` | Bearer | Create a new user |
| 7 | `PATCH` | `/users/{id}` | Bearer | Update user profile |
| 8 | `DELETE` | `/users/{id}` | Bearer | Soft-delete user |
| 9 | `POST` | `/users/{id}/restore` | Bearer | Restore soft-deleted user |
| 10 | `PUT` | `/users/{id}/roles` | Bearer | Update user's roles |

### Request/Response Details

**GET /users** — Query params:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `size` | number | Page size |
| `search` | string | Search by name/email |
| `is_active` | boolean | Filter by active status |
| `role` | string | Filter by role name |
| `sort_by` | `"created_at" \| "full_name" \| "email"` | Sort field |
| `sort_order` | `"asc" \| "desc"` | Sort direction |

**POST /users**
```json
{ "email": "string", "full_name": "string", "password": "string?", "phone_number": "string?", "address": "string?", "role_names": ["string"] }
```

**PATCH /users/{id}**
```json
{ "full_name": "string?", "phone_number": "string?", "address": "string?", "profile_image_url": "string?", "is_active": "boolean?" }
```

**PUT /users/{id}/roles**
```json
{ "role_names": ["string"] }
```

**GET /users/stats/summary** — Expected response:
```json
{ "total_users": "number", "active_users": "number", "inactive_users": "number", "by_role": { "role_name": "count" } }
```

---

## 3. Students

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/students` | Bearer | List students with filters & pagination |
| 2 | `GET` | `/students/{id}` | Bearer | Get student by ID |
| 3 | `GET` | `/students/registration/{regNumber}` | Bearer | Get student by registration number |
| 4 | `GET` | `/students/stats/summary` | Bearer | Student statistics summary |
| 5 | `POST` | `/students` | Bearer | Create a new student |
| 6 | `PATCH` | `/students/{id}` | Bearer | Update student |
| 7 | `DELETE` | `/students/{id}` | Bearer | Soft-delete student |
| 8 | `POST` | `/students/{id}/restore` | Bearer | Restore soft-deleted student |
| 9 | `GET` | `/students/{id}/profile` | Bearer | Get student profile (student portal) |
| 10 | `PATCH` | `/students/{id}/profile` | Bearer | Update student profile (student portal) |
| 11 | `PATCH` | `/students/{id}/photo` | Bearer | Upload/update student photo (multipart/form-data) |
| 12 | `GET` | `/students/{id}/dashboard` | Bearer | Student portal dashboard data |
| 13 | `GET` | `/students/{id}/guardian-view` | Bearer | Student detail for guardian portal |
| 14 | `GET` | `/students/{id}/schedule` | Bearer | Student's weekly schedule |
| 15 | `GET` | `/students/{id}/fees` | Bearer | List student's fees |
| 16 | `GET` | `/students/{id}/fees/balance` | Bearer | Student fee balance summary |
| 17 | `GET` | `/students/{id}/payments` | Bearer | List student's payment transactions |
| 18 | `GET` | `/students/{id}/attendance/summary` | Bearer | Student attendance summary |
| 19 | `GET` | `/students/{id}/attendance/calendar` | Bearer | Student attendance calendar data |
| 20 | `GET` | `/students/{id}/attendance/records` | Bearer | Student attendance records (paginated) |
| 21 | `GET` | `/students/{id}/grades/summary` | Bearer | Student grades summary |
| 22 | `GET` | `/students/{id}/grades/assessments` | Bearer | Student assessment grades (paginated) |
| 23 | `GET` | `/students/{id}/grades/report-card` | Bearer | Student report card for a term |
| 24 | `GET` | `/students/{id}/grades` | Bearer | Student grades (guardian view, with filters) |

### Request/Response Details

**GET /students** — Query params:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `size` | number | Page size |
| `search` | string | Search by name/email |
| `status` | `"active" \| "graduated" \| "transferred" \| "expelled" \| "withdrawn"` | Filter by status |
| `is_active` | boolean | Filter by active status |
| `sex` | `"M" \| "F"` | Filter by sex |
| `nationality` | string | Filter by nationality |
| `sort_by` | `"created_at" \| "full_name" \| "registration_number" \| "admission_date"` | Sort field |
| `sort_order` | `"asc" \| "desc"` | Sort direction |

**POST /students**
```json
{ "email": "string", "full_name": "string", "phone_number": "string?", "address": "string?", "password": "string?", "admission_date": "date", "date_of_birth": "date", "sex": "M|F", "nationality": "string?", "previous_school": "string?", "ministry_exam_result": "number?", "guardian_id": "string?", "profile_image_url": "string?" }
```

**PATCH /students/{id}**
```json
{ "full_name": "string?", "phone_number": "string?", "address": "string?", "profile_image_url": "string?", "is_active": "boolean?", "status": "string?", "nationality": "string?", "previous_school": "string?", "ministry_exam_result": "number?" }
```

**GET /students/{id}/dashboard** — Expected response (Student Portal):
```json
{ "student_name": "string", "registration_number": "string", "class_name": "string", "section_name": "string", "attendance_rate": "number", "current_gpa": "number", "upcoming_assessments": [...], "today_schedule": [...], "unread_notifications": "number" }
```

**GET /students/{id}/attendance/summary** — Expected response:
```json
{ "total_days": "number", "present_days": "number", "absent_days": "number", "late_days": "number", "excused_days": "number", "attendance_rate": "number" }
```

**GET /students/{id}/attendance/calendar** — Query params: `month`, `year`  
Expected response:
```json
{ "days": [{ "date": "string", "status": "present|absent|late|excused|null" }] }
```

**GET /students/{id}/grades/report-card** — Query params: `termId`  
Expected response:
```json
{ "student": { "name": "string", "registration_number": "string", "class": "string", "section": "string" }, "term": { "name": "string" }, "subjects": [{ "subject_name": "string", "assessment_scores": [...], "total_score": "number", "grade_letter": "string", "teacher_remark": "string" }], "overall_average": "number", "class_rank": "number|null", "attendance_summary": { ... }, "teacher_comment": "string", "principal_comment": "string" }
```

**PATCH /students/{id}/photo** — Content-Type: `multipart/form-data`  
Body: FormData with photo file

---

## 4. Teachers

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/teachers` | Bearer | List teachers with filters & pagination |
| 2 | `GET` | `/teachers/{id}` | Bearer | Get teacher by ID |
| 3 | `GET` | `/teachers/employee/{employeeId}` | Bearer | Get teacher by employee ID |
| 4 | `GET` | `/teachers/stats/summary` | Bearer | Teacher statistics summary |
| 5 | `POST` | `/teachers` | Bearer | Create a new teacher |
| 6 | `PATCH` | `/teachers/{id}` | Bearer | Update teacher |
| 7 | `DELETE` | `/teachers/{id}` | Bearer | Soft-delete teacher |
| 8 | `POST` | `/teachers/{id}/restore` | Bearer | Restore soft-deleted teacher |
| 9 | `GET` | `/teachers/{id}/dashboard-stats` | Bearer | Teacher portal dashboard stats |
| 10 | `GET` | `/teachers/{id}/classes` | Bearer | Teacher's assigned classes/sections |
| 11 | `GET` | `/teachers/{id}/schedule` | Bearer | Teacher's weekly schedule |
| 12 | `GET` | `/teachers/{id}/assessments` | Bearer | Teacher's assessments (with filters) |
| 13 | `GET` | `/teachers/{id}/attendance-records` | Bearer | Teacher's attendance records (with filters) |

### Request/Response Details

**GET /teachers** — Query params:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `size` | number | Page size |
| `search` | string | Search by name/email |
| `status` | `"active" \| "on_leave" \| "suspended" \| "resigned" \| "retired"` | Filter by status |
| `is_active` | boolean | Filter by active status |
| `specialization` | string | Filter by specialization |
| `sort_by` | `"created_at" \| "full_name" \| "employee_id" \| "hire_date"` | Sort field |
| `sort_order` | `"asc" \| "desc"` | Sort direction |

**POST /teachers**
```json
{ "email": "string", "full_name": "string", "phone_number": "string?", "address": "string?", "password": "string?", "hire_date": "date", "date_of_birth": "date", "sex": "M|F", "qualification": "string?", "specialization": "string?", "emergency_contact_name": "string?", "emergency_contact_phone": "string?", "office_location": "string?" }
```

**PATCH /teachers/{id}**
```json
{ "full_name": "string?", "phone_number": "string?", "address": "string?", "profile_image_url": "string?", "is_active": "boolean?", "status": "string?", "qualification": "string?", "specialization": "string?", "emergency_contact_name": "string?", "emergency_contact_phone": "string?", "office_location": "string?" }
```

**GET /teachers/{id}/dashboard-stats** — Expected response:
```json
{ "total_sections": "number", "total_students": "number", "today_classes": "number", "pending_grades": "number", "attendance_taken_today": "boolean" }
```

**GET /teachers/{id}/classes** — Expected response:
```json
{ "teacher_id": "string", "classes": [{ "section_id": "string", "class_name": "string", "section_name": "string", "subject_name": "string", "studentCount": "number", "todayAttendanceTaken": "boolean" }] }
```

**GET /teachers/{id}/schedule** — Query params: `week_offset` (number)  
Expected response: Array of schedule entries

**GET /teachers/{id}/assessments** — Query params: `page`, `size`, `sectionId`, `type`  
Expected response:
```json
{ "assessments": [{ "id": "string", "section_id": "string", "class_name": "string", "section_name": "string", "subject_name": "string", "term_name": "string", "assessment_name": "string", "type": "string", "date": "string", "total_marks": "number", "grades_entered": "boolean" }] }
```

---

## 5. Guardians

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/guardians` | Bearer | List guardians with filters & pagination |
| 2 | `GET` | `/guardians/{id}` | Bearer | Get guardian by ID |
| 3 | `GET` | `/guardians/stats/summary` | Bearer | Guardian statistics summary |
| 4 | `GET` | `/guardians/student/{studentId}/guardians` | Bearer | Get guardians for a student |
| 5 | `POST` | `/guardians` | Bearer | Create a new guardian |
| 6 | `PATCH` | `/guardians/{id}` | Bearer | Update guardian |
| 7 | `DELETE` | `/guardians/{id}` | Bearer | Soft-delete guardian |
| 8 | `POST` | `/guardians/{guardianId}/students` | Bearer | Link a student to guardian |
| 9 | `DELETE` | `/guardians/{guardianId}/students/{studentId}` | Bearer | Unlink student from guardian |
| 10 | `GET` | `/guardians/{guardianId}/dashboard` | Bearer | Guardian portal dashboard |
| 11 | `GET` | `/guardians/{guardianId}/students` | Bearer | Get guardian's children list |
| 12 | `GET` | `/guardians/{guardianId}/payments` | Bearer | Get guardian's payment history |
| 13 | `GET` | `/guardians/{guardianId}/notifications` | Bearer | Get guardian's notifications (paginated) |

### Request/Response Details

**GET /guardians** — Query params:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `size` | number | Page size |
| `search` | string | Search by name/email |
| `is_active` | boolean | Filter by active status |
| `has_students` | boolean | Filter by whether they have linked students |
| `sort_by` | `"created_at" \| "full_name" \| "email"` | Sort field |
| `sort_order` | `"asc" \| "desc"` | Sort direction |

**POST /guardians**
```json
{ "email": "string", "full_name": "string", "phone_number": "string?", "address": "string?", "password": "string?", "occupation": "string?", "workplace": "string?", "student_links": [{ "student_id": "string", "relationship_type": "father|mother|guardian|uncle|aunt|grandparent|sibling|other", "is_primary": "boolean?", "is_emergency_contact": "boolean?", "can_pickup": "boolean?" }] }
```

**PATCH /guardians/{id}**
```json
{ "full_name": "string?", "phone_number": "string?", "address": "string?", "profile_image_url": "string?", "is_active": "boolean?", "occupation": "string?", "workplace": "string?" }
```

**POST /guardians/{guardianId}/students**
```json
{ "student_id": "string", "relationship_type": "father|mother|guardian|uncle|aunt|grandparent|sibling|other", "is_primary": "boolean?", "is_emergency_contact": "boolean?", "can_pickup": "boolean?" }
```

**GET /guardians/{guardianId}/dashboard** — Expected response:
```json
{ "guardian_name": "string", "children_count": "number", "children": [{ "student_id": "string", "student_name": "string", "class_name": "string", "attendance_rate": "number", "current_gpa": "number", "fee_balance": "number" }], "unread_notifications": "number", "total_fee_balance": "number" }
```

**GET /guardians/{guardianId}/students** — Expected response: Array of `ChildSummary`
```json
[{ "student_id": "string", "student_name": "string", "registration_number": "string", "class_name": "string", "section_name": "string", "photo_url": "string|null", "relationship_type": "string" }]
```

**GET /guardians/{guardianId}/notifications** — Query params: `page`, `size`, `is_read`, `type`

---

## 6. Academics

### 6.1 Academic Years

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/academics/years` | Bearer | List academic years (paginated) |
| 2 | `GET` | `/academics/years/{id}` | Bearer | Get academic year by ID |
| 3 | `POST` | `/academics/years` | Bearer | Create academic year |
| 4 | `PATCH` | `/academics/years/{id}` | Bearer | Update academic year |
| 5 | `DELETE` | `/academics/years/{id}` | Bearer | Delete academic year |

**POST /academics/years**
```json
{ "name": "string", "start_date": "date", "end_date": "date", "description": "string|null" }
```
*Validation: end_date > start_date*

**PATCH /academics/years/{id}**
```json
{ "name": "string?", "start_date": "date?", "end_date": "date?", "description": "string|null?", "is_current": "boolean?", "status": "planning|active|completed|archived" }
```

**Response shape:**
```json
{ "id": "string", "name": "string", "start_date": "string", "end_date": "string", "is_current": "boolean", "status": "string", "description": "string|null", "class_count": "number", "term_count": "number", "created_at": "string", "updated_at": "string" }
```

### 6.2 Terms

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/academics/years/{yearId}/terms` | Bearer | List terms for an academic year |
| 2 | `POST` | `/academics/years/{yearId}/terms` | Bearer | Create term under academic year |
| 3 | `PATCH` | `/academics/terms/{id}` | Bearer | Update term |
| 4 | `DELETE` | `/academics/terms/{id}` | Bearer | Delete term |

**POST /academics/years/{yearId}/terms**
```json
{ "name": "string", "term_number": "number (1-4)", "start_date": "date", "end_date": "date" }
```

**PATCH /academics/terms/{id}**
```json
{ "name": "string?", "term_number": "number?", "start_date": "date?", "end_date": "date?", "is_active": "boolean?" }
```

### 6.3 Subjects

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/academics/subjects` | Bearer | List subjects (paginated) |
| 2 | `POST` | `/academics/subjects` | Bearer | Create subject |
| 3 | `PATCH` | `/academics/subjects/{id}` | Bearer | Update subject |
| 4 | `DELETE` | `/academics/subjects/{id}` | Bearer | Delete subject |

**GET /academics/subjects** — Query params: `page`, `size`, `search`, `category`

**POST /academics/subjects**
```json
{ "code": "string (auto-uppercased)", "name": "string", "category": "core|elective|vocational|extracurricular", "description": "string|null" }
```

### 6.4 Classes

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/academics/years/{yearId}/classes` | Bearer | List classes for academic year |
| 2 | `GET` | `/academics/classes/{id}` | Bearer | Get class by ID |
| 3 | `POST` | `/academics/years/{yearId}/classes` | Bearer | Create class under academic year |
| 4 | `PATCH` | `/academics/classes/{id}` | Bearer | Update class |
| 5 | `DELETE` | `/academics/classes/{id}` | Bearer | Delete class |
| 6 | `GET` | `/academics/classes/{classId}/subjects` | Bearer | Get subjects assigned to a class |
| 7 | `POST` | `/academics/classes/{classId}/subjects` | Bearer | Assign subject to class |
| 8 | `DELETE` | `/academics/classes/{classId}/subjects/{subjectId}` | Bearer | Remove subject from class |

**POST /academics/years/{yearId}/classes**
```json
{ "name": "string", "grade_level": "number (0-12)", "description": "string|null", "capacity": "number|null" }
```

**POST /academics/classes/{classId}/subjects**
```json
{ "subject_id": "string" }
```

### 6.5 Sections

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/academics/sections/{sectionId}` | Bearer | Get section by ID |
| 2 | `GET` | `/academics/sections/{sectionId}/students` | Bearer | Get students in a section |
| 3 | `POST` | `/academics/classes/{classId}/sections` | Bearer | Create section under class |
| 4 | `PATCH` | `/academics/sections/{id}` | Bearer | Update section |
| 5 | `DELETE` | `/academics/sections/{id}` | Bearer | Delete section |

**POST /academics/classes/{classId}/sections**
```json
{ "name": "string", "capacity": "number (default 40)", "room_number": "string|null", "homeroom_teacher_id": "string|null (UUID)" }
```

**GET /academics/sections/{sectionId}/students** — Expected response:
```json
{ "items": [{ "id": "string", "full_name": "string", "registration_number": "string", "email": "string?", "phone": "string?" }], "total": "number" }
```

---

## 7. Enrollments

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/enrollments` | Bearer | List enrollments (paginated, filtered) |
| 2 | `GET` | `/enrollments/student/{studentId}` | Bearer | Get enrollment history for a student |
| 3 | `POST` | `/enrollments` | Bearer | Enroll a student |
| 4 | `POST` | `/enrollments/{id}/transfer` | Bearer | Transfer student to another section/class |
| 5 | `POST` | `/enrollments/{id}/withdraw` | Bearer | Withdraw student |
| 6 | `PATCH` | `/enrollments/{id}` | Bearer | Update enrollment |
| 7 | `DELETE` | `/enrollments/{id}` | Bearer | Delete enrollment |
| 8 | `GET` | `/enrollments/historical-stats` | Bearer | Historical enrollment statistics |

**GET /enrollments** — Query params: `page`, `size`, `studentId`, `classId`, `sectionId`, `status`, `yearId`

**POST /enrollments** — EnrollmentForm payload (based on Zod schema):
```json
{ "student_id": "string", "section_id": "string", "academic_year_id": "string", "enrollment_date": "date", "status": "string?" }
```

**POST /enrollments/{id}/transfer** — TransferForm:
```json
{ "to_section_id": "string", "transfer_date": "date", "reason": "string?" }
```

**POST /enrollments/{id}/withdraw** — WithdrawalForm:
```json
{ "withdrawal_date": "date", "reason": "string?" }
```

**GET /enrollments/historical-stats** — Expected response:
```json
[{ "year": "string", "students": "number" }]
```

---

## 8. Attendance

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/attendance/sections/{sectionId}/students` | Bearer | Get attendance by section & date |
| 2 | `GET` | `/attendance/section/{sectionId}` | Bearer | Get section attendance records |
| 3 | `GET` | `/attendance/student/{studentId}` | Bearer | Get student attendance records (paginated) |
| 4 | `GET` | `/attendance/student/{studentId}/stats` | Bearer | Get student attendance statistics |
| 5 | `POST` | `/attendance/bulk` | Bearer | Submit bulk attendance for a section |
| 6 | `POST` | `/attendance/mark-by-face` | Bearer | Mark attendance via face recognition |

### Request/Response Details

**GET /attendance/sections/{sectionId}/students** — Query params: `date`

**GET /attendance/student/{studentId}** — Query params: `page`, `size`

**GET /attendance/student/{studentId}/stats** — Expected response:
```json
{ "total_days": "number", "present_days": "number", "absent_days": "number", "late_days": "number", "excused_days": "number", "attendance_rate": "number", "consecutive_absences": "number" }
```

**POST /attendance/bulk**
```json
{ "section_id": "string", "date": "date", "entries": [{ "student_id": "string", "status": "present|absent|late|excused", "note": "string?" }] }
```

**POST /attendance/mark-by-face**
```json
{ "studentId": "string", "sectionId": "string", "timestamp": "ISO datetime", "confidence": "number", "method": "face_recognition", "capturedImage": "string? (Base64)" }
```

---

## 9. Face Recognition

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/face-recognition/descriptors?sectionId={id}` | Bearer | Get face descriptors for students in section |
| 2 | `GET` | `/face-recognition/enrollment-status?sectionId={id}` | Bearer | Get face enrollment status for section |
| 3 | `POST` | `/face-recognition/enroll` | Bearer | Enroll a student's face descriptors |
| 4 | `DELETE` | `/face-recognition/enroll/{studentId}` | Bearer | Delete a student's face enrollment |
| 5 | `POST` | `/face-recognition/unknown-face` | Bearer | Log an unknown/unrecognized face |

### Request/Response Details

**GET /face-recognition/descriptors** — Expected response:
```json
[{ "student_id": "string", "descriptors": "number[][] (multiple 128-dim face descriptors)" }]
```

**GET /face-recognition/enrollment-status** — Expected response:
```json
[{ "studentId": "string", "enrolled": "boolean", "enrolledAt": "string|null" }]
```

**POST /face-recognition/enroll**
```json
{ "studentId": "string", "descriptors": "number[][] (128-dim face descriptor arrays)" }
```

**POST /face-recognition/unknown-face**
```json
{ "sectionId": "string", "capturedImage": "string (Base64)", "confidence": "number" }
```

---

## 10. Grades & Assessments

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/assessments` | Bearer | List assessments (filtered by class_id, subject_id) |
| 2 | `POST` | `/assessments` | Bearer | Create assessment |
| 3 | `GET` | `/assessments/{assessmentId}/grades` | Bearer | Get grades for an assessment |
| 4 | `POST` | `/assessments/{assessmentId}/grades/bulk` | Bearer | Submit bulk grades for an assessment |
| 5 | `GET` | `/assessments/grades/report-card/{studentId}` | Bearer | Get report card for student |
| 6 | `GET` | `/api/grades/report-card/{studentId}` | Bearer | Alias for report card (used in BatchReportCards) |

### Request/Response Details

**GET /assessments** — Query params: `class_id`, `subject_id`

**POST /assessments**
```json
{ "section_id": "string", "subject_id": "string", "term_id": "string", "assessment_name": "string", "type": "quiz|assignment|project|exam", "date": "date", "total_marks": "number" }
```

**GET /assessments/{assessmentId}/grades** — Expected response:
```json
[{ "student_id": "string", "student_name": "string", "registration_number": "string", "score": "number", "comment": "string?" }]
```

**POST /assessments/{assessmentId}/grades/bulk**
```json
{ "entries": [{ "student_id": "string", "score": "number", "comment": "string?" }] }
```

**GET /assessments/grades/report-card/{studentId}** — Query params: `termId`

---

## 11. Schedule

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/schedule/section/{sectionId}` | Bearer | Get schedule for a section |
| 2 | `GET` | `/schedule/teacher/{teacherId}` | Bearer | Get schedule for a teacher |
| 3 | `POST` | `/schedule` | Bearer | Create schedule entry |
| 4 | `PATCH` | `/schedule/{id}` | Bearer | Update schedule entry |
| 5 | `DELETE` | `/schedule/{id}` | Bearer | Delete schedule entry |

### Request/Response Details

**GET /schedule/section/{sectionId}** — Query params: `term_id`

**GET /schedule/teacher/{teacherId}** — Query params: `term_id`

**POST /schedule** — CreateScheduleEntryPayload:
```json
{ "section_id": "string", "subject_id": "string", "teacher_id": "string", "term_id": "string", "day_of_week": "number (0-6)", "start_time": "string (HH:mm)", "end_time": "string (HH:mm)", "room": "string?" }
```

---

## 12. Payments & Fees

### Fees Management (Admin)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/fees` | Bearer | List fee configurations |
| 2 | `GET` | `/fees/{id}` | Bearer | Get fee configuration by ID |
| 3 | `POST` | `/fees` | Bearer | Create fee configuration |
| 4 | `PATCH` | `/fees/{id}` | Bearer | Update fee configuration |
| 5 | `DELETE` | `/fees/{id}` | Bearer | Delete fee configuration |

**GET /fees** — Query params: `academic_year_id`, `term_id`, `is_active`

**POST /fees** — CreateFeeConfig:
```json
{ "name": "string", "amount": "number", "academic_year_id": "string", "term_id": "string?", "class_id": "string?", "description": "string?", "due_date": "date?", "is_active": "boolean" }
```

### Payments

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `POST` | `/payments` | Bearer | Create manual payment (admin/registrar) |
| 2 | `POST` | `/payments/initiate` | Bearer | Initiate payment (guardian portal) |
| 3 | `POST` | `/payments/chapa/initialize` | Bearer | Initialize Chapa payment gateway |
| 4 | `POST` | `/payments/chapa/verify/{reference}` | Bearer | Verify Chapa payment |

**POST /payments** — CreatePaymentRequest:
```json
{ "student_id": "string", "fee_id": "string", "amount": "number", "payment_method": "string", "reference_number": "string?", "notes": "string?" }
```

**POST /payments/initiate**
```json
{ "student_id": "string", "amount": "number", "payment_method": "string" }
```

**POST /payments/chapa/initialize**
```json
{ "fee_id": "string", "amount": "number", "currency": "ETB", "email": "string", "first_name": "string", "last_name": "string", "tx_ref": "string?", "return_url": "string?", "customization": "object?" }
```

**POST /payments/chapa/verify/{reference}** — Expected response:
```json
{ "status": "success|failed", "reference": "string", "amount": "number", "verified_at": "string" }
```

---

## 13. Notifications

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/notifications` | Bearer | Get current user's notifications |
| 2 | `GET` | `/notifications/unread/count` | Bearer | Get unread notification count |
| 3 | `GET` | `/notifications/history` | Bearer | Get notification history (with filters) |
| 4 | `GET` | `/notifications/history/{id}` | Bearer | Get notification detail |
| 5 | `PATCH` | `/notifications/{id}/read` | Bearer | Mark notification as read |
| 6 | `PATCH` | `/notifications/me/read-all` | Bearer | Mark all notifications as read |
| 7 | `DELETE` | `/notifications/{id}` | Bearer | Delete notification |
| 8 | `GET` | `/notifications/preferences` | Bearer | Get notification preferences |
| 9 | `PATCH` | `/notifications/preferences` | Bearer | Update notification preferences |
| 10 | `POST` | `/notifications/send` | Bearer | Send notification to target audience |
| 11 | `POST` | `/notifications/preview-recipients` | Bearer | Preview recipient count before sending |
| 12 | `POST` | `/notifications/send-to-guardian` | Bearer | Send notification to a student's guardian |
| 13 | `GET` | `/notifications/alert-rules` | Bearer | Get all alert rules |
| 14 | `POST` | `/notifications/alert-rules` | Bearer | Create alert rule |
| 15 | `PATCH` | `/notifications/alert-rules/{id}` | Bearer | Update alert rule |
| 16 | `DELETE` | `/notifications/alert-rules/{id}` | Bearer | Delete alert rule |

### Request/Response Details

**GET /notifications/history** — Query params: `type`, `dateFrom`, `dateTo`, `channel`, `target`

**POST /notifications/send** — CreateNotificationPayload:
```json
{ "title": "string", "message": "string", "type": "string", "channel": "in_app|email|sms", "targetType": "all|class|section|student|guardian", "targetIds": ["string"], "scheduledAt": "string?" }
```

**POST /notifications/preview-recipients**
```json
{ "targetType": "string", "targetIds": ["string"] }
```
Expected response:
```json
{ "count": "number", "sampleNames": ["string"] }
```

**POST /notifications/send-to-guardian**
```json
{ "studentId": "string", "message": "string", "type": "intervention" }
```

**POST /notifications/alert-rules** — AlertRule payload:
```json
{ "name": "string", "type": "attendance|grade|consecutive_absence", "threshold": "number", "channel": "in_app|email|sms", "is_active": "boolean", "target_roles": ["string"] }
```

---

## 14. Analytics

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/analytics/summary` | Bearer | Analytics summary dashboard |
| 2 | `GET` | `/analytics/at-risk-students` | Bearer | List at-risk students |
| 3 | `GET` | `/analytics/attendance-trend` | Bearer | Attendance trend over time |
| 4 | `GET` | `/analytics/grade-distribution` | Bearer | Grade distribution chart data |
| 5 | `GET` | `/analytics/class-performance` | Bearer | Class performance comparison |
| 6 | `GET` | `/analytics/enrollment-trends` | Bearer | Enrollment trends over years |
| 7 | `GET` | `/analytics/recent-activity` | Bearer | Recent activity feed |
| 8 | `GET` | `/analytics/interventions` | Bearer | List interventions (filtered by student_id) |
| 9 | `POST` | `/analytics/interventions` | Bearer | Create intervention note |
| 10 | `PATCH` | `/analytics/interventions/{id}` | Bearer | Update intervention |
| 11 | `DELETE` | `/analytics/interventions/{id}` | Bearer | Delete intervention |

### Request/Response Details

**GET /analytics/summary** — Query params: `termId`, `classId`, `teacherId`, `sectionId`, `dateFrom`, `dateTo`  
Expected response:
```json
{ "totalStudents": "number", "schoolAttendanceRate": "number", "schoolGradeAverage": "number", "atRiskCounts": { "critical": "number", "high": "number", "medium": "number", "low": "number" } }
```

**GET /analytics/at-risk-students** — Query params: `riskLevel`, `classId`, `sectionId`, `termId`, `teacherId`  
Expected response:
```json
{ "students": [{ "studentId": "string", "studentName": "string", "registrationNumber": "string", "className": "string", "sectionName": "string", "level": "critical|high|medium|low", "factors": [{ "type": "attendance|grade|consecutive_absence", "value": "number", "threshold": "number", "message": "string" }], "score": "number", "attendanceRate": "number", "gradeAverage": "number", "lastAbsenceDate": "string|null", "consecutiveAbsences": "number", "guardianInfo": { "name": "string", "phone": "string", "id": "string" } }], "total": "number" }
```

**GET /analytics/attendance-trend** — Query params: `days`, `classId`, `sectionId`, `teacherId`  
Expected response:
```json
[{ "date": "string", "present": "number", "absent": "number", "late": "number", "excused": "number", "rate": "number" }]
```

**GET /analytics/grade-distribution** — Query params: `termId`, `subjectId`, `classId`  
Expected response:
```json
[{ "grade_letter": "string", "count": "number", "percentage": "number" }]
```

**GET /analytics/class-performance** — Query params: `termId`  
Expected response:
```json
[{ "classId": "string", "className": "string", "sectionName": "string", "avgAttendance": "number", "avgGrade": "number", "atRiskCount": "number", "onTrackCount": "number", "totalStudents": "number" }]
```

**GET /analytics/enrollment-trends** — Expected response:
```json
[{ "year": "string", "students": "number" }]
```

**GET /analytics/recent-activity** — Expected response:
```json
[{ "id": "string", "type": "string", "description": "string", "timestamp": "string", "user": { "id": "string", "name": "string" } }]
```

**POST /analytics/interventions**
```json
{ "student_id": "string", "note": "string", "type": "counseling|parent_contact|academic_support|other", "date": "ISO datetime" }
```

**GET /analytics/interventions** — Query params: `student_id`

---

## 15. Settings

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/settings/school-info` | Bearer | Get school information |
| 2 | `PATCH` | `/settings/school-info` | Bearer | Update school information |
| 3 | `GET` | `/settings/academic` | Bearer | Get academic settings |
| 4 | `PATCH` | `/settings/academic` | Bearer | Update academic settings |
| 5 | `GET` | `/settings/notifications` | Bearer | Get notification settings |
| 6 | `PATCH` | `/settings/notifications` | Bearer | Update notification settings |

### Request/Response Details

**GET/PATCH /settings/school-info**
```json
{ "school_name": "string", "address": "string", "phone": "string", "email": "string", "logo_url": "string|null", "school_code": "string|null", "website": "string|null", "region": "string|null", "zone": "string|null", "woreda": "string|null" }
```

**GET/PATCH /settings/academic**
```json
{ "grading_scale": { "A": 90, "B": 80, "C": 70, "D": 60, "F": 0 }, "passing_mark": "number", "attendance_warning_threshold": "number", "confidence_threshold": "number" }
```

**GET/PATCH /settings/notifications**
```json
{ "absence_alert": "boolean", "low_grade_alert": "boolean", "fee_reminder": "boolean", "consecutive_absence_threshold": "number" }
```

---

## 16. Features Without API Integration (Gaps)

These are front-end features/components that exist in the codebase but **do not yet have corresponding API service calls**. The backend team needs to build these endpoints as well.

### 16.1 Section Roster (Teacher Portal)

The front-end calls `GET /sections/{sectionId}/roster` in `useTeacherClasses.ts` but this endpoint is **not defined in any service file**. It's a standalone call.

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/sections/{sectionId}/roster` | Bearer | Get section roster with attendance summary |

Expected response:
```json
{ "students": [{ "id": "string", "fullName": "string", "studentId": "string", "photoUrl": "string|null" }], "summary": { "presentPercent": "number", "absentPercent": "number", "latePercent": "number" } }
```

### 16.2 Batch Report Cards PDF Generation

The `BatchReportCards.tsx` component calls `GET /api/grades/report-card/{studentId}?term_id={termId}` using native `fetch` (not axios). This appears to be a **Next.js API route** or a direct backend call that needs clarification.

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/api/grades/report-card/{studentId}?term_id={termId}` | Bearer | Fetch report card data for PDF generation |

### 16.3 Daily Attendance Summary (Admin View)

The attendance admin module references `DailyAttendanceSummary` type but no dedicated endpoint is called. The admin dashboard likely needs:

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/attendance/daily-summary` | Bearer | School-wide daily attendance summary |
| 2 | `GET` | `/attendance/section/{sectionId}/summary` | Bearer | Section-level attendance summary |

Expected response for daily-summary:
```json
{ "date": "string", "total_students": "number", "present": "number", "absent": "number", "late": "number", "excused": "number", "attendance_rate": "number", "by_section": [{ "section_id": "string", "section_name": "string", "present": "number", "absent": "number", "rate": "number" }] }
```

### 16.4 Assessment Management (Admin/Registrar View)

The grades module has `useGrades.ts` with admin-level assessment CRUD, but there's no dedicated endpoint for **updating or deleting** assessments:

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `PATCH` | `/assessments/{id}` | Bearer | Update assessment details |
| 2 | `DELETE` | `/assessments/{id}` | Bearer | Delete assessment |

### 16.5 File/Document Upload

The front-end supports profile photo upload (`PATCH /students/{id}/photo` with multipart/form-data). The backend should also support:

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `POST` | `/upload/image` | Bearer | General image upload endpoint (returns URL) |
| 2 | `POST` | `/upload/document` | Bearer | Document upload (for future features) |

Expected response:
```json
{ "url": "string", "filename": "string", "size": "number" }
```

### 16.6 Dashboard Data (Admin Portal)

The admin portal dashboard likely needs aggregated data, but no dedicated admin dashboard endpoint was found in the front-end code. The analytics summary partially covers this, but a dedicated endpoint may be needed:

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/admin/dashboard` | Bearer | Admin portal dashboard aggregated data |

Expected response:
```json
{ "total_students": "number", "total_teachers": "number", "total_guardians": "number", "total_sections": "number", "attendance_rate_today": "number", "pending_fees": "number", "recent_activities": [...], "at_risk_count": "number" }
```

### 16.7 WebSocket / Real-time Updates

The notification system uses polling (30s for list, 10s for unread count). For a better UX, consider:

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `WS` | `/ws/notifications` | Bearer | WebSocket for real-time notification delivery |
| 2 | `WS` | `/ws/attendance` | Bearer | WebSocket for real-time attendance updates (face recognition) |

### 16.8 Export/Report Endpoints

The front-end has PDF generation for report cards and batch report cards. The backend should support:

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/exports/report-card/{studentId}?term_id={id}&format=pdf` | Bearer | Server-side PDF report card generation |
| 2 | `GET` | `/exports/attendance?section_id={id}&date_from={d}&date_to={d}&format=xlsx` | Bearer | Export attendance records |
| 3 | `GET` | `/exports/grades?section_id={id}&term_id={id}&format=xlsx` | Bearer | Export grades |
| 4 | `GET` | `/exports/students?format=xlsx` | Bearer | Export student list |

---

## Summary Statistics

| Category | Endpoints |
|----------|-----------|
| Authentication | 7 |
| Users | 10 |
| Students | 24 |
| Teachers | 13 |
| Guardians | 13 |
| Academic Years | 5 |
| Terms | 4 |
| Subjects | 4 |
| Classes | 8 |
| Sections | 5 |
| Enrollments | 8 |
| Attendance | 6 |
| Face Recognition | 5 |
| Grades & Assessments | 6 |
| Schedule | 5 |
| Payments & Fees | 9 |
| Notifications | 16 |
| Analytics | 11 |
| Settings | 6 |
| **Gaps / Missing** | **14** |
| **Total** | **~175** |

---

## General Backend Requirements

### Authentication & Authorization
- JWT-based auth with access + refresh tokens
- Role-based access control (RBAC) with roles: `admin`, `director`, `registrar`, `teacher`, `student`, `guardian`
- Soft-delete with restore capability for users, students, teachers, guardians
- Token refresh with concurrency control (only one refresh at a time)

### Pagination Convention
All list endpoints must support:
```
?page=1&size=20
```
Response:
```json
{ "items": [...], "total": 100, "page": 1, "size": 20 }
```

### Error Response Format
```json
{ "detail": "Error message describing what went wrong" }
```

### HTTP Status Codes
- `200` — Success
- `201` — Created
- `204` — No Content (successful delete)
- `400` — Bad Request / Validation Error
- `401` — Unauthorized
- `403` — Forbidden (insufficient role)
- `404` — Not Found
- `409` — Conflict (e.g., already marked attendance)
- `422` — Unprocessable Entity (validation)
- `500` — Internal Server Error

### Soft-Delete Pattern
Entities (users, students, teachers, guardians) should use soft-delete:
- `DELETE /{resource}/{id}` → sets `is_active = false` / `deleted_at = now()`
- `POST /{resource}/{id}/restore` → restores the entity
- List endpoints should exclude soft-deleted by default; support `is_active=false` filter to see deleted
