# Required API Endpoints — Backend Specification

> Auto-generated from front-end code analysis and backend audit.  
> Base URL: `{API_BASE_URL}` (default `http://localhost:8000/api`)  
> All endpoints require `Authorization: Bearer <access_token>` unless marked public.  
> All paginated list endpoints return `{ items: T[], total: number, page: number, size: number, pages: number }`.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users & Role Management](#2-users--role-management)
3. [Student Management (Admin/Registrar)](#3-student-management-adminregistrar)
4. [Teacher Management (Admin/Director)](#4-teacher-management-admindirector)
5. [Guardian Management (Admin/Registrar)](#5-guardian-management-adminregistrar)
6. [Academics Structure](#6-academics-structure)
7. [Enrollment Management](#7-enrollment-management)
8. [Attendance Tracking](#8-attendance-tracking)
9. [Biometric Attendance (Face Recognition)](#9-biometric-attendance-face-recognition)
10. [Assessments & Grading](#10-assessments--grading)
11. [Schedule & Timetable](#11-schedule--timetable)
12. [Payments & Fee Management](#12-payments--fee-management)
13. [Smart Notifications & Alerts](#13-smart-notifications--alerts)
14. [Portal Endpoints (Self-Service)](#14-portal-endpoints-self-service)
15. [System Settings & Analytics](#15-system-settings--analytics)
16. [Unimplemented Features (Backlog)](#16-unimplemented-features-backlog)

---

## 1. Authentication

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `POST` | `/auth/login` | Public | Login with email & password |
| 2 | `POST` | `/auth/refresh` | Refresh token | Refresh access token |
| 3 | `POST` | `/auth/change-password` | Bearer | Change current user's password |
| 4 | `POST` | `/auth/forgot-password` | Public | Request password reset email |
| 5 | `POST` | `/auth/reset-password` | Public | Reset password with token |
| 6 | `GET` | `/auth/me` | Bearer | Get current authenticated user profile |
| 7 | `GET` | `/auth/verify` | Bearer | Verify token validity |

### Request/Response Details

**POST /auth/login**
```json
// Request
{ "email": "string", "password": "string" }
// Response
{ 
  "access_token": "string", 
  "refresh_token": "string", 
  "token_type": "bearer", 
  "user": { 
    "id": "string", 
    "email": "string", 
    "full_name": "string", 
    "roles": ["string"], 
    "student_id": "string|null", 
    "teacher_id": "string|null", 
    "guardian_id": "string|null" 
  } 
}
```

---

## 2. Users & Role Management

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/users` | Bearer | List users with filters & pagination |
| 2 | `GET` | `/users/{id}` | Bearer | Get user by ID |
| 3 | `POST` | `/users` | Bearer | Create a new user (Director/Admin) |
| 4 | `PATCH` | `/users/{id}` | Bearer | Update user profile |
| 5 | `DELETE` | `/users/{id}` | Bearer | Soft-delete user |
| 6 | `GET` | `/users/roles/all` | Bearer | Get all available roles |
| 7 | `PUT` | `/users/{id}/roles` | Bearer | Update user's roles (Admin only) |
| 8 | `GET` | `/users/stats/summary` | Bearer | User statistics for Admin Dashboard |

**GET /users/stats/summary** Response:
```json
{ 
  "total": 1250, 
  "active": 1200, 
  "inactive": 50, 
  "growth": 5.2,
  "by_role": { "admin": 2, "director": 1, "registrar": 3, "teacher": 45, "student": 1000, "guardian": 200 } 
}
```

---

## 3. Student Management (Admin/Registrar)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/students` | Bearer | List students with filters |
| 2 | `GET` | `/students/{id}` | Bearer | Get student by ID |
| 3 | `POST` | `/students` | Bearer | Register new student |
| 4 | `PATCH` | `/students/{id}` | Bearer | Update student profile |
| 5 | `DELETE` | `/students/{id}` | Bearer | Remove/Withdraw student |
| 6 | `GET` | `/students/registration/{regNumber}` | Bearer | Find student by ID number |
| 7 | `GET` | `/students/stats/summary` | Bearer | Student demographic stats |

**POST /students** Payload:
```json
{ 
  "email": "string", 
  "full_name": "string", 
  "sex": "M|F", 
  "date_of_birth": "YYYY-MM-DD",
  "admission_date": "YYYY-MM-DD",
  "guardian_id": "string (optional)",
  "previous_school": "string",
  "ministry_exam_result": 85.5
}
```

---

## 4. Teacher Management (Admin/Director)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/teachers` | Bearer | List teachers |
| 2 | `GET` | `/teachers/{id}` | Bearer | Get teacher details |
| 3 | `POST` | `/teachers` | Bearer | Register new teacher |
| 4 | `PATCH` | `/teachers/{id}` | Bearer | Update teacher record |
| 5 | `GET` | `/teachers/stats/summary` | Bearer | Teacher employment stats |

---

## 5. Guardian Management (Admin/Registrar)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/guardians` | Bearer | List guardians |
| 2 | `POST` | `/guardians` | Bearer | Create guardian |
| 3 | `POST` | `/guardians/{guardianId}/students` | Bearer | Link child to guardian |
| 4 | `DELETE` | `/guardians/{guardianId}/students/{studentId}` | Bearer | Remove parent-child link |
| 5 | `GET` | `/guardians/student/{studentId}/guardians` | Bearer | Get parent info for a student |

---

## 6. Academics Structure

### 6.1 Academic Years & Terms
| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/academics/years` | Bearer | List academic years |
| 2 | `POST` | `/academics/years` | Bearer | Create new academic year |
| 3 | `GET` | `/academics/years/{yearId}/terms` | Bearer | List terms for a year |
| 4 | `POST` | `/academics/years/{yearId}/terms` | Bearer | Create a term |

### 6.2 Classes & Sections
| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/academics/years/{yearId}/classes` | Bearer | List classes in a year |
| 2 | `POST` | `/academics/years/{yearId}/classes` | Bearer | Add Grade level (e.g. Grade 9) |
| 3 | `POST` | `/academics/classes/{classId}/sections` | Bearer | Add Section (e.g. 9-A) |
| 4 | `GET` | `/academics/sections/{sectionId}` | Bearer | Get section detail |
| 5 | `GET` | `/academics/sections/{sectionId}/students` | Bearer | List students in a section |

---

## 7. Enrollment Management

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/enrollments` | Bearer | Search active enrollments |
| 2 | `POST` | `/enrollments` | Bearer | Create enrollment (assign student to section) |
| 3 | `POST` | `/enrollments/{id}/transfer` | Bearer | Transfer to different section |
| 4 | `POST` | `/enrollments/{id}/withdraw` | Bearer | Student withdrawal |
| 5 | `GET` | `/enrollments/historical-stats` | Bearer | Multi-year enrollment growth chart |

---

## 8. Attendance Tracking

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/attendance/sections/{sectionId}/students` | Bearer | Get roster for attendance taking |
| 2 | `POST` | `/attendance/bulk` | Bearer | Submit daily attendance |
| 3 | `GET` | `/attendance/section/{sectionId}` | Bearer | History of attendance for a section |
| 4 | `GET` | `/attendance/student/{studentId}/stats` | Bearer | Individual attendance % and trends |

---

## 9. Biometric Attendance (Face Recognition)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/face-recognition/descriptors` | Bearer | Get all descriptors (filtered by sectionId) |
| 2 | `GET` | `/face-recognition/enrollment-status` | Bearer | Get enrollment status list for section |
| 3 | `POST` | `/face-recognition/enroll` | Bearer | Store face embeddings for student |
| 4 | `POST` | `/face-recognition/attendance/mark-by-face` | Bearer | Live check-in via face scan |
| 5 | `POST` | `/face-recognition/unknown-face` | Bearer | Log unrecognized face event |

**GET /face-recognition/enrollment-status** Response:
```json
[
  { "studentId": "uuid", "enrolled": true, "enrolledAt": "2024-05-01T..." },
  { "studentId": "uuid", "enrolled": false }
]
```

---

## 10. Assessments & Grading

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/assessments` | Bearer | List assessments (by class/subject) |
| 2 | `POST` | `/assessments` | Bearer | Create Assessment (Quiz, Exam, etc.) |
| 3 | `GET` | `/assessments/{id}/grades` | Bearer | Get score sheet for assessment |
| 4 | `POST` | `/assessments/{id}/grades/bulk` | Bearer | Submit bulk scores |
| 5 | `GET` | `/assessments/grades/report-card/{studentId}`| Bearer | Generate full Report Card |

---

## 11. Schedule & Timetable

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/schedule/section/{sectionId}` | Bearer | Timetable for a section |
| 2 | `GET` | `/schedule/teacher/{teacherId}` | Bearer | Timetable for a teacher |
| 3 | `POST` | `/schedule` | Bearer | Assign period to timetable |
| 4 | `DELETE` | `/schedule/{id}` | Bearer | Remove period |

---

## 12. Payments & Fee Management

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/fees` | Bearer | List fee structures (Grade based) |
| 2 | `POST` | `/fees` | Bearer | Configure new fee |
| 3 | `GET` | `/payments/history` | Bearer | Global payment transaction log |
| 4 | `POST` | `/payments/manual` | Bearer | Record cash/bank payment |
| 5 | `POST` | `/payments/chapa/initialize` | Bearer | Start online checkout |
| 6 | `POST` | `/payments/chapa/verify/{tx_ref}` | Bearer | Confirm online payment status |

---

## 13. Smart Notifications & Alerts

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/notifications` | Bearer | Current user's notifications |
| 2 | `GET` | `/notifications/history` | Bearer | Admin view of all sent alerts |
| 3 | `PATCH` | `/notifications/{id}/read` | Bearer | Mark as read |
| 4 | `POST` | `/notifications/{id}/retry` | Bearer | Retry failed SMS/Email |
| 5 | `GET` | `/notifications/preferences` | Bearer | Notification toggle settings |

---

## 14. Portal Endpoints (Self-Service)

These endpoints are optimized for the specific dashboard views of each user role.

### 14.1 Student Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/students/{id}/dashboard` | Summary of attendance, grades, and schedule |
| `GET` | `/students/{id}/schedule` | Personal weekly timetable |
| `GET` | `/students/{id}/grades/summary` | Term-wise GPA and subject averages |
| `GET` | `/students/{id}/attendance/calendar` | Monthly view of presence/absence |

### 14.2 Teacher Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/teachers/{id}/dashboard-stats` | Summary of today's classes and pending tasks |
| `GET` | `/teachers/{id}/classes` | List of assigned sections and student counts |
| `GET` | `/teachers/{id}/assessments` | History of assessments created by teacher |

### 14.3 Guardian Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/guardians/{id}/dashboard` | Multi-student overview (summary cards per child) |
| `GET` | `/students/{studentId}/guardian-view` | Deep-dive into a specific child's performance |
| `GET` | `/students/{studentId}/payments` | List of invoices and receipts for the child |

---

## 15. System Settings & Analytics

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `GET` | `/settings/school-info` | Bearer | Get school name, logo, contact |
| 2 | `PATCH` | `/settings/school-info` | Bearer | Update school details |
| 3 | `GET` | `/settings/academic` | Bearer | System-wide academic config |
| 4 | `GET` | `/analytics/enrollment-trends` | Bearer | Data for multi-year charts |
| 5 | `GET` | `/analytics/attendance-heat-map` | Bearer | School-wide attendance overview |

---

## 16. Unimplemented Features (Backlog)

The following features are designed in the frontend but require backend development:

1.  **Batch Report Card Generation**: `GET /assessments/grades/report-cards/batch?sectionId=...`
2.  **Bulk Student Import**: `POST /students/import` (Excel/CSV upload)
3.  **Library Module**: `GET /library/books`, `POST /library/issue`
4.  **Hostel Management**: `GET /hostel/rooms`, `POST /hostel/assign`
5.  **Transport/Bus Tracking**: `GET /transport/routes`
6.  **Real-time Activity Feed**: A unified activity log for Admin dashboard (currently mocked via notifications).
7.  **Dynamic Grading Scales**: Support for different GPA systems (e.g., 4.0, 5.0, or Letter based).
