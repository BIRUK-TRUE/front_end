# API Specifications for Missing Endpoints

> **Quick reference for backend developers**  
> **Format:** Method `Path` - Description

---

## Critical Priority

### Face Recognition

#### 1. POST `/face-recognition/enroll` - Enroll Student Face
```yaml
Authentication: Bearer Token (Admin/Director/Registrar)
Request:
  body:
    student_id: UUID          # Required
    photo_base64: string      # Required - Base64 encoded image
    quality_check: boolean    # Optional - default: true

Response 200:
  student_id: UUID
  enrollment_status: "enrolled" | "updated"
  quality_score: number     # 0.00 - 1.00
  enrolled_at: ISO8601
  message: string

Response 400:
  detail: "Photo quality too low: 0.45. Please retake."

Response 404:
  detail: "Student not found"
```

#### 2. POST `/face-recognition/attendance/mark-by-face` - Mark Attendance via Face
```yaml
Authentication: Bearer Token (Any authenticated user)
Request:
  body:
    photo_base64: string      # Required - Captured face photo
    section_id: UUID         # Required
    confidence_threshold: number  # Optional - default: 0.85

Response 200:
  student_id: UUID
  student_name: string
  attendance_marked: boolean
  confidence: number         # Match confidence 0-1
  message: string
  recognition_status: "success"

Response 404:
  student_id: null
  student_name: null
  attendance_marked: false
  confidence: number
  message: "Face not recognized (confidence: 0.42)"
  recognition_status: "unknown_face"

Response 409:
  message: "Attendance already marked for today"
```

#### 3. GET `/face-recognition/descriptors` - Get Enrolled Face Descriptors
```yaml
Authentication: Bearer Token (Admin/Director/Registrar)
Request:
  query:
    sectionId: UUID          # Optional - filter by section

Response 200:
  - student_id: UUID
    student_name: string
    registration_number: string
    descriptor: number[128]   # Face embedding vector
    quality_score: number
    enrolled_at: ISO8601
```

### Student Portal Endpoints

#### 4. GET `/students/{id}/dashboard` - Student Dashboard
```yaml
Authentication: Bearer Token (Student - own data only)

Response 200:
  student:
    id: UUID
    name: string
    registration_number: string
  current_enrollment:
    class_name: string
    section_name: string
    academic_year: string
    term_name: string
  upcoming_classes:
    - subject_name: string
      teacher_name: string
      start_time: "HH:MM"
      end_time: "HH:MM"
      room_number: string
  attendance_summary:
    percentage: number
    present_days: integer
    total_days: integer
  recent_grades:
    - subject: string
      assessment: string
      score: number
      max_score: number
  unread_notifications: integer

Response 403:
  detail: "Can only access own dashboard"
```

#### 5. GET `/students/{id}/schedule` - Student Timetable
```yaml
Authentication: Bearer Token (Student)
Request:
  query:
    week_offset: integer     # -4 to +4, default: 0

Response 200:
  schedule:
    - id: UUID
      day_of_week: 0-6       # 0=Sunday
      start_time: "HH:MM"
      end_time: "HH:MM"
      subject_name: string
      teacher_name: string
      room_number: string
  week_offset: integer
  section_name: string
  class_name: string
```

#### 6. GET `/students/{id}/grades/summary` - Grade Summary
```yaml
Authentication: Bearer Token (Student)
Request:
  query:
    term_id: UUID           # Optional - current term if not provided

Response 200:
  term_name: string
  subjects:
    - subject_name: string
      average: number
      letter_grade: "A" | "B" | "C" | "D" | "F"
  gpa: number              # 0.00 - 4.00
  overall_average: number
```

#### 7. GET `/students/{id}/attendance/calendar` - Attendance Calendar
```yaml
Authentication: Bearer Token (Student)
Request:
  query:
    month: integer          # Required 1-12
    year: integer           # Required 2020-2030

Response 200:
  month: integer
  year: integer
  days:
    - date: "YYYY-MM-DD"
      status: "present" | "absent" | "late" | "excused" | null
      is_holiday: boolean
      has_assessment: boolean
```

#### 8. GET `/students/{id}/attendance/records` - Detailed Attendance
```yaml
Authentication: Bearer Token (Student)
Request:
  query:
    page: integer           # default: 1
    size: integer           # default: 20
    month: integer          # Optional
    year: integer          # Optional
    status: string         # Optional - filter by status

Response 200:
  items:
    - date: "YYYY-MM-DD"
      status: "present" | "absent" | "late" | "excused"
      subject_name: string
      teacher_name: string
      marked_at: ISO8601
  total: integer
  page: integer
  size: integer
  pages: integer
```

### Report Card Generation

#### 9. GET `/assessments/grades/report-card/{student_id}` - Generate Report Card
```yaml
Authentication: Bearer Token (Admin/Director/Registrar/Teacher/Student own)
Request:
  query:
    academic_year_id: UUID  # Optional - current year if not provided

Response 200:
  student:
    id: UUID
    full_name: string
    registration_number: string
    photo_url: string
    date_of_birth: "YYYY-MM-DD"
    sex: "M" | "F"
  school:
    name: string
    address: string
    phone: string
    logo_url: string
  academic_year: string
  term:
    name: string
    start_date: "YYYY-MM-DD"
    end_date: "YYYY-MM-DD"
  class_name: string
  section_name: string
  subjects:
    - subject_name: string
      subject_category: string
      teacher_name: string
      assessments:
        - name: string
          type: string
          score: number
          max_score: number
          weight: number
      total_score: number
      max_total: number
      percentage: number
      letter_grade: string
      passed: boolean
      remarks: string
  summary:
    total_subjects: integer
    subjects_passed: integer
    subjects_failed: integer
    overall_average: number
    overall_letter_grade: string
    rank: integer           # Optional
    total_students: integer # Optional
    attendance_rate: number
    total_school_days: integer
    days_present: integer
    days_absent: integer
    teacher_remarks: string
    director_remarks: string
  promotion_status: "promoted" | "retained" | "pending"
  generated_at: ISO8601
```

---

## High Priority

### Interventions System

#### 10. POST `/analytics/interventions` - Create Intervention
```yaml
Authentication: Bearer Token (Admin/Director/Registrar)
Request:
  body:
    student_id: UUID         # Required
    type: "attendance" | "academic" | "behavioral" | "financial" | "other"
    severity: "low" | "medium" | "high" | "critical"
    description: string       # Required
    action_plan: string       # Optional
    assigned_to: UUID         # Optional - user ID
    follow_up_date: "YYYY-MM-DD"  # Optional

Response 201:
  id: UUID
  student_id: UUID
  student_name: string      # From actual student record
  type: string
  severity: string
  description: string
  action_plan: string
  assigned_to: UUID
  assigned_to_name: string   # Resolved from user record
  follow_up_date: "YYYY-MM-DD"
  status: "open"
  created_at: ISO8601
  updated_at: ISO8601
```

#### 11. GET `/analytics/interventions` - List Interventions
```yaml
Authentication: Bearer Token (Admin/Director/Registrar)
Request:
  query:
    student_id: UUID         # Optional - filter by student
    type: string            # Optional
    status: string          # Optional - "open", "in_progress", "completed", "cancelled"
    assigned_to: UUID       # Optional
    page: integer           # default: 1
    size: integer           # default: 20

Response 200:
  data:
    - id: UUID
      student_id: UUID
      student_name: string
      type: string
      severity: string
      description: string
      action_plan: string
      assigned_to: UUID
      assigned_to_name: string
      follow_up_date: "YYYY-MM-DD"
      status: string
      created_at: ISO8601
      updated_at: ISO8601
  total_count: integer
```

#### 12. PATCH `/analytics/interventions/{id}` - Update Intervention
```yaml
Authentication: Bearer Token (Admin/Director/Registrar)
Request:
  body:
    note: string            # Required
    type: string           # Optional

Response 200:
  id: UUID
  ...full intervention object
```

#### 13. DELETE `/analytics/interventions/{id}` - Delete Intervention
```yaml
Authentication: Bearer Token (Admin/Director)
Response 200:
  message: "Intervention deleted"
```

### Alert Rules System

#### 14. GET `/notifications/alert-rules` - List Alert Rules
```yaml
Authentication: Bearer Token (Admin/Director)
Request:
  query:
    is_active: boolean      # Optional
    rule_type: string       # Optional

Response 200:
  - id: UUID
    name: string
    description: string
    rule_type: "attendance" | "grade" | "payment" | "behavior" | "system"
    condition: "less_than" | "greater_than" | "equals" | "between" | "changed"
    threshold: number
    threshold_max: number   # For "between" condition
    time_window_days: integer
    action: "notify_admin" | "notify_guardian" | "notify_teacher" | "notify_student"
    target_roles: [string]
    target_users: [UUID]
    notification_title_template: string
    notification_body_template: string
    priority: "low" | "normal" | "high" | "critical"
    is_active: boolean
    cooldown_minutes: integer
    max_notifications_per_day: integer
    created_at: ISO8601
    updated_at: ISO8601
```

#### 15. POST `/notifications/alert-rules` - Create Alert Rule
```yaml
Authentication: Bearer Token (Admin/Director)
Request:
  body:
    name: string            # Required
    description: string     # Optional
    rule_type: string       # Required
    condition: string      # Required
    threshold: number       # Required
    threshold_max: number  # Required if condition = "between"
    time_window_days: integer  # Optional
    action: string         # Required
    target_roles: [string] # Required
    target_users: [UUID]   # Optional
    notification_title_template: string  # Required
    notification_body_template: string   # Required
    priority: string       # Optional - default: "normal"
    cooldown_minutes: integer  # Optional - default: 60
    max_notifications_per_day: integer  # Optional

Response 201:
  ...full alert rule object
```

#### 16. PATCH `/notifications/alert-rules/{id}` - Update Alert Rule
```yaml
Authentication: Bearer Token (Admin/Director)
Request:
  body:  # All fields optional
    name: string
    is_active: boolean
    threshold: number
    # ... other fields

Response 200:
  ...full alert rule object
```

#### 17. DELETE `/notifications/alert-rules/{id}` - Delete Alert Rule
```yaml
Authentication: Bearer Token (Admin/Director)
Response 200:
  message: "Alert rule deleted"
```

### Attendance Student Endpoints

#### 18. GET `/attendance/student/{student_id}` - Get Student Attendance Records
```yaml
Authentication: Bearer Token (Admin/Director/Registrar/Teacher/Student own)
Request:
  query:
    start_date: "YYYY-MM-DD"  # Optional
    end_date: "YYYY-MM-DD"    # Optional
    page: integer             # default: 1
    size: integer             # default: 50

Response 200:
  - date: "YYYY-MM-DD"
    status: "present" | "absent" | "late" | "excused"
    section_name: string
    subject_name: string
    marked_by: string
    marked_at: ISO8601
    notes: string
```

#### 19. GET `/attendance/student/{student_id}/stats` - Get Student Attendance Stats
```yaml
Authentication: Bearer Token (Admin/Director/Registrar/Teacher/Student own)
Response 200:
  student_id: UUID
  student_name: string
  registration_number: string
  total_days: integer       # School days in period
  present_days: integer
  absent_days: integer
  late_days: integer
  excused_days: integer
  attendance_percentage: number
  current_streak: integer   # Consecutive present days
  longest_streak: integer
  by_subject:              # Optional breakdown
    - subject_name: string
      percentage: number
```

### Teacher Portal Endpoints

#### 20. GET `/teachers/{id}/dashboard-stats` - Teacher Dashboard
```yaml
Authentication: Bearer Token (Teacher - own data only)
Response 200:
  today_classes:
    - subject_name: string
      section_name: string
      start_time: "HH:MM"
      end_time: "HH:MM"
      room_number: string
      student_count: integer
  classes_today_count: integer
  pending_tasks:
    - type: "grade_entry" | "attendance" | "assessment"
      description: string
      due_date: "YYYY-MM-DD"
      priority: "high" | "medium" | "low"
  unread_notifications: integer
  current_term:
    name: string
    start_date: "YYYY-MM-DD"
    end_date: "YYYY-MM-DD"
  recent_activity:
    - id: UUID
      type: string
      description: string
      timestamp: ISO8601
```

#### 21. GET `/teachers/{id}/classes` - Teacher's Classes
```yaml
Authentication: Bearer Token (Teacher)
Response 200:
  - section_id: UUID
    section_name: string
    class_name: string
    grade_level: integer
    student_count: integer
    subjects: [string]
    is_homeroom: boolean
```

#### 22. GET `/teachers/{id}/assessments` - Teacher's Assessments
```yaml
Authentication: Bearer Token (Teacher)
Request:
  query:
    page: integer
    size: integer
    status: string  # "draft", "published", "completed"

Response 200:
  items:
    - id: UUID
      name: string
      type: string
      subject_name: string
      section_name: string
      class_name: string
      date: "YYYY-MM-DD"
      max_score: number
      status: string
      grades_entered_count: integer
      total_students: integer
      grades_complete: boolean
  total: integer
  page: integer
  size: integer
  pages: integer
```

#### 23. GET `/teachers/{id}/schedule` - Teacher Schedule
```yaml
Authentication: Bearer Token (Teacher)
Request:
  query:
    week_offset: integer

Response 200:
  Same as `/schedule/teacher/{teacher_id}`
```

#### 24. GET `/teachers/{id}/attendance-records` - Teacher Attendance History
```yaml
Authentication: Bearer Token (Teacher)
Request:
  query:
    from_date: "YYYY-MM-DD"
    to_date: "YYYY-MM-DD"
    section_id: UUID
    page: integer
    size: integer

Response 200:
  items:
    - date: "YYYY-MM-DD"
      section_name: string
      class_name: string
      present_count: integer
      absent_count: integer
      late_count: integer
      marked_at: ISO8601
  total: integer
  page: integer
  size: integer
  pages: integer
```

### Guardian Portal Endpoints

#### 25. GET `/guardians/{id}/dashboard` - Guardian Dashboard
```yaml
Authentication: Bearer Token (Guardian - own data only)
Response 200:
  children:
    - student_id: UUID
      student_name: string
      registration_number: string
      class_name: string
      section_name: string
      photo_url: string
      recent_grades:
        - subject: string
          assessment: string
          score: number
      attendance_summary:
        percentage: number
        present_days: integer
        total_days: integer
      pending_payments:
        - description: string
          amount: number
          due_date: "YYYY-MM-DD"
      recent_notifications:
        - id: UUID
          title: string
          message: string
          type: string
          sent_at: ISO8601
  unread_notifications: integer
```

#### 26. GET `/students/{studentId}/guardian-view` - Student Performance (Guardian)
```yaml
Authentication: Bearer Token (Guardian of this student)
Response 200:
  student:
    id: UUID
    name: string
    registration_number: string
    class_name: string
    section_name: string
  academic_summary:
    current_term_gpa: number
    overall_average: number
    subjects_passing: integer
    subjects_failing: integer
  recent_assessments:
    - subject: string
      assessment_name: string
      score: number
      max_score: number
      date: "YYYY-MM-DD"
  attendance_summary:
    this_month_percentage: number
    year_to_date_percentage: number
    days_absent_this_month: integer
  upcoming_events:
    - type: "assessment" | "holiday" | "meeting"
      title: string
      date: "YYYY-MM-DD"
  behavior_notes: [string]
```

#### 27. GET `/students/{studentId}/payments` - Student Payments (Guardian)
```yaml
Authentication: Bearer Token (Guardian of this student)
Response 200:
  summary:
    total_outstanding: number
    total_paid_this_year: number
    next_payment_due:
      description: string
      amount: number
      due_date: "YYYY-MM-DD"
  invoices:
    - id: UUID
      description: string
      amount: number
      paid_amount: number
      balance: number
      status: "pending" | "partial" | "paid" | "overdue"
      due_date: "YYYY-MM-DD"
      paid_at: ISO8601
      payment_method: string
  receipts:
    - id: UUID
      invoice_id: UUID
      amount: number
      paid_at: ISO8601
      payment_method: string
      transaction_reference: string
```

---

## Medium Priority

### Activity Log System

#### 28. GET `/analytics/recent-activity` - Real Activity Feed
```yaml
Authentication: Bearer Token (Admin/Director)
Request:
  query:
    limit: integer          # default: 20, max: 100
    category: string        # Optional - "enrollment", "grade", "attendance", "user", "system"
    section_id: UUID        # Optional
    days: integer           # default: 7

Response 200:
  data:
    - id: UUID
      type: string          # Category type
      description: string
      timestamp: ISO8601
      user:
        id: UUID
        name: string
      entity:
        type: string
        id: UUID
        name: string
      section_name: string
      class_name: string
      metadata: object       # Additional context
```

#### 29. GET `/analytics/activity/{id}` - Activity Detail
```yaml
Authentication: Bearer Token (Admin/Director)
Response 200:
  id: UUID
  action: string
  actor:
    id: UUID
    name: string
    type: string
  entity:
    type: string
    id: UUID
    name: string
  title: string
  description: string
  category: string
  importance: string
  metadata: object
  section:
    id: UUID
    name: string
  academic_year:
    id: UUID
    name: string
  created_at: ISO8601
```

### Bulk Operations

#### 30. POST `/enrollments/import` - Bulk Import Enrollments
```yaml
Authentication: Bearer Token (Admin/Director/Registrar)
Request:
  content-type: multipart/form-data
  body:
    file: File              # Excel/CSV file
    academic_year_id: UUID  # Required
    dry_run: boolean       # Optional - validate without importing

Response 200 (dry_run=true):
  valid_rows: integer
  invalid_rows: integer
  errors:
    - row: integer
      field: string
      value: string
      message: string
  sample:                  # Preview first 5 rows
    - row_number: integer
      student_name: string
      registration_number: string
      class_name: string
      section_name: string
      status: "valid" | "invalid"

Response 201 (dry_run=false):
  imported: integer
  failed: integer
  errors: [...same as above...]
```

---

## Data Models Reference

### Face Descriptor
```python
{
    id: UUID
    student_id: UUID
    descriptor_vector: float[128]  # Face embedding
    photo_url: string
    photo_hash: string            # For deduplication
    quality_score: float          # 0.00 - 1.00
    confidence: float
    is_active: boolean
    enrolled_at: datetime
    last_verified_at: datetime
}
```

### Intervention
```python
{
    id: UUID
    student_id: UUID
    type: "attendance" | "academic" | "behavioral" | "financial" | "other"
    severity: "low" | "medium" | "high" | "critical"
    description: string
    action_plan: string
    assigned_to: UUID
    created_by: UUID
    follow_up_date: date
    status: "open" | "in_progress" | "completed" | "cancelled"
    resolution_notes: string
    resolved_at: datetime
    resolved_by: UUID
    # Risk snapshot at creation
    attendance_percentage: float
    average_grade: float
    payment_balance: float
    created_at: datetime
    updated_at: datetime
}
```

### Alert Rule
```python
{
    id: UUID
    name: string
    description: string
    rule_type: "attendance" | "grade" | "payment" | "behavior" | "system"
    condition: "less_than" | "greater_than" | "equals" | "between" | "changed"
    threshold: float
    threshold_max: float        # For "between"
    time_window_days: int        # e.g., 7 for weekly attendance
    action: "notify_admin" | "notify_guardian" | "notify_teacher" | "notify_student"
    target_roles: [string]
    target_users: [UUID]
    notification_title_template: string
    notification_body_template: string
    priority: "low" | "normal" | "high" | "critical"
    is_active: boolean
    cooldown_minutes: int
    max_notifications_per_day: int
    metadata: object
    created_by: UUID
    created_at: datetime
    updated_at: datetime
}
```

### Activity Log
```python
{
    id: UUID
    actor_id: UUID
    actor_type: "user" | "system" | "api"
    action: string               # e.g., "student_created", "grade_submitted"
    entity_type: string          # "student", "assessment", "enrollment", etc.
    entity_id: UUID
    section_id: UUID
    academic_year_id: UUID
    title: string
    description: string
    activity_category: "enrollment" | "grade" | "attendance" | "user" | "system"
    importance: "low" | "normal" | "high" | "critical"
    metadata: object            # Additional context
    created_at: datetime
}
```

---

## Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "detail": "Detailed error information",
  "field_errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Paginated Response
```json
{
  "items": [ ... ],
  "total": 100,
  "page": 1,
  "size": 20,
  "pages": 5
}
```

---

**Total Endpoints in this spec:** 30  
**Critical:** 1-9  
**High:** 10-27  
**Medium:** 28-30
