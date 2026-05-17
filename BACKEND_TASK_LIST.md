# Backend Implementation Task List

Send this document directly to the backend team.

---

## Critical Priority (Must Fix First)

### 1. Activity Log System
**API:** `GET /analytics/recent-activity?limit=20&category=&days=7`

**Frontend Sends:** Query params (all optional): limit, category, section_id, days

**Backend Must Send:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "enrollment",
      "description": "Student John Doe enrolled in Grade 9A",
      "timestamp": "2024-05-01T10:30:00Z",
      "user": {"id": "uuid", "name": "Admin User"}
    }
  ]
}
```

**Rules:** Create `activity_logs` table. Log on: student creation, enrollment, grade submission, attendance marking. Query from activity_logs NOT notifications. Return actual user who performed action.

---

### 2. Interventions - Create (Currently Mock)
**API:** `POST /analytics/interventions`

**Frontend Sends:**
```json
{
  "student_id": "uuid",
  "type": "attendance",
  "severity": "high",
  "description": "Student has missed 8 days",
  "action_plan": "Contact guardian",
  "assigned_to": "uuid",
  "follow_up_date": "2024-05-15"
}
```

**Backend Must Send:** Real student_name from DB, real assigned_to_name from DB. Create `interventions` table. Status workflow: open → in_progress → completed → cancelled.

---

### 3. Interventions - List
**API:** `GET /analytics/interventions?student_id=&type=&status=&page=1&size=20`

**Backend Must Send:** Array of interventions with student_name and assigned_to_name from DB joins.

---

### 4. Face Recognition - Enroll
**API:** `POST /face-recognition/enroll`

**Frontend Sends:** `{student_id, photo_base64, quality_check}`

**Backend Must Send:** `{student_id, enrollment_status, quality_score, enrolled_at, message}`

**Rules:** Accept base64 photo. Detect face (reject if no face). Extract 128-d embedding. Reject if quality < 0.70. Store in `face_descriptors` table. Update existing if already enrolled.

---

### 5. Face Recognition - Mark Attendance
**API:** `POST /face-recognition/attendance/mark-by-face`

**Frontend Sends:** `{photo_base64, section_id, confidence_threshold}`

**Backend Must Send (Success):** `{student_id, student_name, attendance_marked: true, confidence, message, recognition_status: "success"}`

**Backend Must Send (Not Recognized):** `{student_id: null, attendance_marked: false, confidence, message, recognition_status: "unknown_face"}`

**Rules:** Extract embedding. Compare with enrolled faces using cosine similarity. Find best match. If confidence >= 0.85: mark attendance. If < 0.85: return unknown_face. If already marked today: return already_marked (HTTP 409). Log in `face_recognition_logs`.

---

### 6. Face Recognition - Get Descriptors
**API:** `GET /face-recognition/descriptors?sectionId=`

**Backend Must Send:** Array of `{student_id, student_name, descriptor[128], quality_score, enrolled_at}`

---

### 7. Student Portal - Dashboard
**API:** `GET /students/{id}/dashboard`

**Backend Must Send:** `{student, current_enrollment, upcoming_classes[], attendance_summary{}, recent_grades[], unread_notifications}`

**Rules:** Student can ONLY access own data. Query current enrollment, today's classes from schedule, attendance stats, notification count.

---

### 8. Student Portal - Schedule
**API:** `GET /students/{id}/schedule?week_offset=0`

**Backend Must Send:** `{schedule[], week_offset, section_name, class_name}`

---

### 9. Student Portal - Grades Summary
**API:** `GET /students/{id}/grades/summary?term_id=`

**Backend Must Send:** `{term_name, subjects[], gpa, overall_average}`

**Rules:** Calculate subject averages from assessment_scores. Map to letter grades (A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: <60). Calculate GPA (A=4, B=3, C=2, D=1, F=0).

---

### 10. Student Portal - Attendance Calendar
**API:** `GET /students/{id}/attendance/calendar?month=5&year=2024`

**Backend Must Send:** `{month, year, days: [{date, status, is_holiday, has_assessment}]}`

---

### 11. Report Card Generation (Currently Placeholder)
**API:** `GET /assessments/grades/report-card/{student_id}?academic_year_id=`

**Backend Must Send:** Full report card with real data: student info, school info, all subjects with assessments, summary with GPA, rank, attendance. NO hardcoded data like `class_name: "Class Name"`. Query actual tables.

---

### 12. Teacher Portal - Dashboard
**API:** `GET /teachers/{id}/dashboard-stats`

**Backend Must Send:** `{today_classes[], classes_today_count, pending_tasks[], unread_notifications, current_term{}, recent_activity[]}`

**Rules:** Teacher can only access own data. Query schedule for today, check for pending grade entries, count notifications.

---

### 13. Teacher Portal - Classes
**API:** `GET /teachers/{id}/classes`

**Backend Must Send:** Array of `{section_id, section_name, class_name, grade_level, student_count, subjects[], is_homeroom}`

---

### 14. Teacher Portal - Assessments
**API:** `GET /teachers/{id}/assessments?page=1&size=20&status=`

**Backend Must Send:** Paginated list with `grades_entered_count`, `total_students`, `grades_complete`.

---

### 15. Guardian Portal - Dashboard
**API:** `GET /guardians/{id}/dashboard`

**Backend Must Send:** `{children[], unread_notifications}`

**Rules:** Guardian can only see own linked children. Return data for ALL linked children.

---

### 16. Guardian Portal - Student View
**API:** `GET /students/{id}/guardian-view`

**Backend Must Send:** `{student{}, academic_summary{}, recent_assessments[], attendance_summary{}, upcoming_events[], behavior_notes[]}`

---

### 17. Guardian Portal - Payments
**API:** `GET /students/{id}/payments`

**Backend Must Send:** `{summary{}, invoices[], receipts[]}`

**Rules:** Query `payment_schedules` table. Calculate outstanding balance.

---

### 18. Alert Rules - Create (Currently Mock)
**API:** `POST /notifications/alert-rules`

**Frontend Sends:** `{name, description, rule_type, condition, threshold, action, target_roles, priority, cooldown_minutes}`

**Backend Must Send:** Created rule with real UUID from `alert_rules` table. Validate: rule_type in [attendance, grade, payment, behavior, system]. Validate: condition in [less_than, greater_than, equals, between, changed].

---

### 19. Alert Rules - List
**API:** `GET /notifications/alert-rules?is_active=&rule_type=`

**Backend Must Send:** Array of rules from `alert_rules` table (currently returns empty array).

---

### 20. Alert Rules - Update
**API:** `PATCH /notifications/alert-rules/{id}`

**Backend Must Send:** Updated rule from database (currently returns mock).

---

### 21. Alert Rules - Delete
**API:** `DELETE /notifications/alert-rules/{id}`

**Backend Must Send:** `{message: "Alert rule deleted"}` (currently returns mock).

---

### 22. Alert Rules - Evaluation Engine (MISSING ENTIRELY)
**API:** Internal scheduled task

**Rules:** Create daily job to evaluate all active rules. For each student: calculate attendance % (last 7 days), calculate average grade, check payment balance. Compare with rule thresholds. If triggered AND cooldown period elapsed: send notification. Log execution in `alert_rule_executions`.

---

## Database Tables Required

```sql
-- Activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    title VARCHAR(255),
    description TEXT,
    activity_category VARCHAR(50),
    created_at TIMESTAMP
);

-- Interventions
CREATE TABLE interventions (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    type VARCHAR(50),
    severity VARCHAR(20),
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    status VARCHAR(20),
    follow_up_date DATE,
    created_at TIMESTAMP
);

-- Face recognition
CREATE TABLE face_descriptors (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    descriptor_vector FLOAT[128],
    quality_score DECIMAL,
    is_active BOOLEAN,
    enrolled_at TIMESTAMP
);

-- Alert rules
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    rule_type VARCHAR(50),
    condition VARCHAR(50),
    threshold DECIMAL,
    action VARCHAR(100),
    target_roles TEXT[],
    is_active BOOLEAN,
    created_at TIMESTAMP
);
```

---

## Critical Rules Summary

1. **NO hardcoded data** - Query actual database records
2. **Authorization checks** - Users can only access their own data (students, teachers, guardians)
3. **Real UUIDs** - Generate actual UUIDs, never use "mock-id"
4. **Join tables** - Get names from related tables (students, users)
5. **Pagination** - Support page/size for list endpoints
6. **Error handling** - Return proper HTTP status codes (404, 403, 409)

---

**Total Critical Tasks: 22**  
**Estimated Duration: 6-8 weeks**  
**Priority Order: 1-5 (Foundation), 6-11 (Face Recognition), 12-17 (Portals), 18-22 (Alert System)**
