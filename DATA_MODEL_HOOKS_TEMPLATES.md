# Frontend Data Model Documentation - Hook and Template Types

This document describes types defined in custom hooks and notification templates. Only types that actually exist in the code are documented.

## Attendance Hook Types

### SectionStudent
**File Path:** `src/features/attendance/hooks/useSectionStudents.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier for the student |
| name | string | Yes | Student's full name |
| registration_number | string | Yes | Student's registration number |
| email | string | No | Student's email address |
| phone | string | No | Student's phone number |

**Relationships:**
- None directly (simplified view for section listing)

**Usage:**
- Used in `useSectionStudents` hook for fetching students in a section
- Used in attendance marking interfaces

---

### EnrollmentStatus
**File Path:** `src/features/attendance/hooks/useFaceEnrollment.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| studentId | string | Yes | Unique identifier for the student |
| enrolled | boolean | Yes | Whether the student is enrolled in face recognition |
| enrolledAt | string | No | Timestamp when face enrollment was completed |

**Relationships:**
- None directly (status tracking for face recognition)

**Usage:**
- Used in `useFaceEnrollment` hook for tracking face recognition enrollment status
- Used in face enrollment management UI

---

### FaceDescriptor
**File Path:** `src/features/attendance/hooks/useFaceAttendance.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| student_id | string | Yes | Unique identifier for the student |
| descriptors | number[][] | Yes | Array of face descriptor vectors for recognition |

**Relationships:**
- None directly (biometric data for face recognition)

**Usage:**
- Used in `useFaceAttendance` hook for loading face recognition data
- Used in face recognition attendance marking

---

### MarkAttendanceByFacePayload
**File Path:** `src/features/attendance/hooks/useFaceAttendance.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| studentId | string | Yes | Unique identifier for the student |
| sectionId | string | Yes | Unique identifier for the section |
| timestamp | string | Yes | Timestamp when attendance was marked |
| confidence | number | Yes | Confidence score of face recognition (0-1) |
| method | 'face_recognition' | Yes | Attendance marking method (fixed value) |
| capturedImage | string | No | Base64 encoded captured image (optional) |

**Relationships:**
- None directly (payload for API call)

**Usage:**
- Used in `useFaceAttendance` hook for marking attendance via face recognition
- Sent to `/attendance/mark-by-face` endpoint

---

## Notification Template Types

### NotificationTemplate
**File Path:** `src/features/notifications/constants/templates.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Template name (e.g., 'Absence Alert', 'Fee Reminder') |
| type | NotificationType | Yes | Type of notification (from NotificationType enum) |
| title | string | Yes | Notification title |
| message | string | Yes | Notification message template with variable placeholders |
| priority | NotificationPriority | Yes | Priority level (from NotificationPriority enum) |
| variables | string[] | Yes | Array of variable names used in the message template |

**Relationships:**
- None directly (template definition)

**Usage:**
- Used in `NOTIFICATION_TEMPLATES` constant for predefined notification templates
- Used for generating notifications with variable substitution

---

## Predefined Notification Templates

The following templates are defined in `NOTIFICATION_TEMPLATES` constant:

### Absence Alert
- **Type:** ATTENDANCE_ALERT
- **Title:** Student Absence Notice
- **Message:** Dear Guardian, your child {student_name} was absent from school on {date}. Please contact the school if this was not planned.
- **Priority:** HIGH
- **Variables:** student_name, date

### Fee Reminder
- **Type:** FEE_REMINDER
- **Title:** Fee Payment Reminder
- **Message:** Dear Guardian, school fees for {student_name} are due on {due_date}. Amount: {amount} ETB. Please make payment to avoid penalties.
- **Priority:** MEDIUM
- **Variables:** student_name, due_date, amount

### Low Grade Alert
- **Type:** GRADE_ALERT
- **Title:** Academic Performance Alert
- **Message:** Dear Guardian, {student_name} has received a grade of {grade} in {subject}. Please encourage them to improve their performance.
- **Priority:** HIGH
- **Variables:** student_name, grade, subject

### Low Attendance Alert
- **Type:** ATTENDANCE_ALERT
- **Title:** Attendance Warning
- **Message:** Dear Guardian, {student_name}'s attendance rate is {percentage}%. Please ensure regular attendance for better academic performance.
- **Priority:** HIGH
- **Variables:** student_name, percentage

### Schedule Change
- **Type:** SCHEDULE
- **Title:** Class Schedule Updated
- **Message:** Dear Student, the schedule for {subject} on {day} has been changed. New time: {new_time}. Please check your updated timetable.
- **Priority:** MEDIUM
- **Variables:** subject, day, new_time

### General Announcement
- **Type:** ANNOUNCEMENT
- **Title:** School Announcement
- **Message:** {message_content}. Please contact the administration for more information.
- **Priority:** MEDIUM
- **Variables:** message_content

### Emergency Alert
- **Type:** SYSTEM
- **Title:** Emergency Notification
- **Message:** {emergency_message}. Please follow the instructions provided by school authorities.
- **Priority:** URGENT
- **Variables:** emergency_message

### Exam Schedule
- **Type:** ANNOUNCEMENT
- **Title:** Exam Schedule Published
- **Message:** The exam schedule for {term} has been published. Exams will begin on {start_date}. Please prepare accordingly.
- **Priority:** MEDIUM
- **Variables:** term, start_date

### Parent Meeting
- **Type:** ANNOUNCEMENT
- **Title:** Parent-Teacher Meeting
- **Message:** A parent-teacher meeting is scheduled for {date} at {time}. Your attendance is important for your child's progress.
- **Priority:** MEDIUM
- **Variables:** date, time

### Holiday Notice
- **Type:** ANNOUNCEMENT
- **Title:** School Holiday
- **Message:** The school will be closed from {start_date} to {end_date} for {holiday_name}. Classes will resume on {resume_date}.
- **Priority:** LOW
- **Variables:** start_date, end_date, holiday_name, resume_date

---

## Enums

### AttendanceMethod
**File Path:** Inferred from MarkAttendanceByFacePayload.method

**Values:**
- `face_recognition` - Attendance marked via face recognition

**Usage:**
- Used in attendance marking to specify the method
- Referenced in `MarkAttendanceByFacePayload`
