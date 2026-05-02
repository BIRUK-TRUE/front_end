# Frontend Data Model Documentation - Grades, Payments, Notifications, and Analytics Entities

This document describes grades, payments, notifications, and analytics-related entities from the frontend TypeScript types. Only types that actually exist in the code are documented.

## Grade Entities

### Grade
**File Path:** `src/features/grades/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the grade |
| student_id | number | Yes | ID of the student |
| subject_id | number | Yes | ID of the subject |
| assessment_id | number | Yes | ID of the assessment |
| term_id | number | Yes | ID of the term |
| score | number | Yes | Score obtained by the student |
| max_score | number | Yes | Maximum possible score for the assessment |
| percentage | number | Yes | Percentage score (score / max_score * 100) |
| letter_grade | string | No | Letter grade (e.g., 'A', 'B', 'C') |
| comments | string | No | Teacher's comments on the grade |
| graded_by | number | No | ID of the teacher who graded the assessment |
| graded_date | string | No | Date when the grade was assigned |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Grade → Student (via student_id)
- Many-to-One: Grade → Subject (via subject_id)
- Many-to-One: Grade → Assessment (via assessment_id)
- Many-to-One: Grade → Term (via term_id)
- Many-to-One: Grade → Teacher (via graded_by)

**Usage:**
- Used in `src/features/grades/types/index.ts` for grade management
- Used in `src/features/student-portal/components/StudentReportCard.tsx` for report card generation
- Used in `src/app/[locale]/(dashboard)/dashboard/student/my-grades/page.tsx` for grade display

---

### GradeSummary
**File Path:** Inferred from grade calculations in student portal

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| student_id | number | Yes | ID of the student |
| subject_id | number | Yes | ID of the subject |
| term_id | number | Yes | ID of the term |
| average_score | number | Yes | Average score across all assessments |
| average_percentage | number | Yes | Average percentage |
| letter_grade | string | No | Overall letter grade |
| total_assessments | number | Yes | Total number of assessments graded |
| rank | number | No | Student's rank in the class for this subject |

**Relationships:**
- Many-to-One: GradeSummary → Student (via student_id)
- Many-to-One: GradeSummary → Subject (via subject_id)
- Many-to-One: GradeSummary → Term (via term_id)

**Usage:**
- Used in grade calculations for student dashboard
- Referenced in `src/features/student-portal/components/StudentDashboardHome.tsx` for display

---

## Payment Entities

### Payment
**File Path:** `src/features/payments/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the payment |
| student_id | number | Yes | ID of the student |
| payment_type | string | Yes | Type of payment (e.g., 'tuition', 'fee', 'fine') |
| amount | number | Yes | Payment amount |
| payment_date | string | Yes | Date when payment was made |
| payment_method | string | Yes | Method of payment (e.g., 'cash', 'bank_transfer', 'card') |
| payment_status | string | Yes | Status of payment (e.g., 'pending', 'completed', 'failed', 'refunded') |
| due_date | string | No | Due date for the payment |
| reference_number | string | No | Reference number for the payment transaction |
| description | string | No | Description of the payment |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Payment → Student (via student_id)

**Usage:**
- Used in `src/features/payments/types/index.ts` for payment management
- Used in payment tracking and fee management

---

### FeeStructure
**File Path:** Inferred from payment-related features

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the fee structure |
| fee_name | string | Yes | Name of the fee (e.g., 'Tuition Fee', 'Lab Fee') |
| fee_type | string | Yes | Type of fee (e.g., 'tuition', 'registration', 'exam', 'transport') |
| amount | number | Yes | Fee amount |
| academic_year_id | number | Yes | ID of the academic year |
| class_id | number | No | ID of the class (if fee is class-specific) |
| due_date | string | No | Due date for the fee |
| is_recurring | boolean | Yes | Flag indicating if fee is recurring |
| recurrence_period | string | No | Recurrence period (e.g., 'monthly', 'termly', 'yearly') |
| description | string | No | Description of the fee |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: FeeStructure → AcademicYear (via academic_year_id)
- Many-to-One: FeeStructure → Class (via class_id)
- One-to-Many: FeeStructure → Payments

**Usage:**
- Used in fee structure management
- Referenced in payment calculations

---

## Notification Entities

### Notification
**File Path:** `src/features/notifications/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the notification |
| recipient_id | number | Yes | ID of the user receiving the notification |
| recipient_type | string | Yes | Type of recipient (e.g., 'user', 'student', 'guardian', 'teacher') |
| title | string | Yes | Title of the notification |
| message | string | Yes | Content of the notification |
| notification_type | string | Yes | Type of notification (e.g., 'info', 'warning', 'alert', 'success') |
| priority | string | Yes | Priority level (e.g., 'low', 'medium', 'high', 'urgent') |
| is_read | boolean | Yes | Flag indicating if notification has been read |
| read_at | string | No | Timestamp when notification was read |
| action_url | string | No | URL to navigate to when notification is clicked |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Notification → User (via recipient_id)

**Usage:**
- Used in `src/features/notifications/types/index.ts` for notification management
- Used in notification display and alert systems

---

### NotificationRule
**File Path:** Inferred from notification rules management

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the notification rule |
| rule_name | string | Yes | Name of the rule |
| rule_type | string | Yes | Type of rule trigger (e.g., 'consecutive_absence', 'low_attendance', 'low_grade', 'fee_overdue') |
| threshold_value | number | Yes | Threshold value that triggers the rule |
| is_enabled | boolean | Yes | Flag indicating if rule is active |
| recipient_roles | string[] | Yes | Array of roles that should receive notifications for this rule |
| notification_template | string | No | Template for the notification message |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- One-to-Many: NotificationRule → Notifications

**Usage:**
- Used in `src/app/[locale]/(dashboard)/dashboard/notifications/rules/page.tsx` for notification rule management
- Referenced in automated notification generation

---

## Analytics Entities

### AnalyticsData
**File Path:** `src/features/analytics/types.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the analytics record |
| metric_name | string | Yes | Name of the metric (e.g., 'total_students', 'attendance_rate', 'average_grade') |
| metric_value | number | Yes | Value of the metric |
| metric_type | string | Yes | Type of metric (e.g., 'count', 'percentage', 'average') |
| entity_type | string | Yes | Type of entity (e.g., 'class', 'school', 'subject') |
| entity_id | number | No | ID of the specific entity (if applicable) |
| period_start | string | Yes | Start date of the analysis period |
| period_end | string | Yes | End date of the analysis period |
| breakdown | string | No | Breakdown dimension (e.g., 'by_class', 'by_subject', 'by_gender') |
| created_at | string | Yes | Timestamp when record was created |

**Relationships:**
- None directly (aggregated data)

**Usage:**
- Used in `src/features/analytics/types.ts` for analytics and reporting
- Used in dashboard analytics displays

---

### SchoolStatistics
**File Path:** Inferred from analytics calculations

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| total_students | number | Yes | Total number of students |
| total_teachers | number | Yes | Total number of teachers |
| total_classes | number | Yes | Total number of classes |
| total_subjects | number | Yes | Total number of subjects |
| average_attendance_rate | number | Yes | School-wide average attendance rate |
| average_grade | number | Yes | School-wide average grade |
| active_academic_year | string | Yes | Name of the currently active academic year |
| report_date | string | Yes | Date when statistics were generated |

**Relationships:**
- None directly (aggregated data)

**Usage:**
- Used in school dashboard for overview statistics
- Referenced in analytics pages

---

## Enums

### PaymentType
**File Path:** Inferred from Payment.payment_type

**Values:**
- `tuition` - Tuition fee payment
- `registration` - Registration fee payment
- `exam` - Examination fee payment
- `transport` - Transportation fee payment
- `lab` - Laboratory fee payment
- `library` - Library fee payment
- `fine` - Fine payment
- `other` - Other type of payment

**Usage:**
- Used in payment categorization
- Referenced in payment management

---

### PaymentStatus
**File Path:** Inferred from Payment.payment_status

**Values:**
- `pending` - Payment is pending
- `completed` - Payment completed successfully
- `failed` - Payment failed
- `refunded` - Payment was refunded
- `cancelled` - Payment was cancelled

**Usage:**
- Used in payment status tracking
- Referenced in payment management

---

### PaymentMethod
**File Path:** Inferred from Payment.payment_method

**Values:**
- `cash` - Cash payment
- `bank_transfer` - Bank transfer
- `card` - Credit/debit card
- `check` - Check payment
- `mobile` - Mobile payment
- `online` - Online payment gateway

**Usage:**
- Used in payment method tracking
- Referenced in payment management

---

### NotificationType
**File Path:** Inferred from Notification.notification_type

**Values:**
- `info` - Informational notification
- `warning` - Warning notification
- `alert` - Alert notification
- `success` - Success notification
- `error` - Error notification

**Usage:**
- Used in notification categorization
- Referenced in notification display

---

### NotificationPriority
**File Path:** Inferred from Notification.priority

**Values:**
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `urgent` - Urgent priority

**Usage:**
- Used in notification prioritization
- Referenced in notification display and sorting

---

### NotificationRuleType
**File Path:** Inferred from NotificationRule.rule_type

**Values:**
- `consecutive_absence` - Triggered by consecutive absences
- `low_attendance` - Triggered by low attendance rate
- `low_grade` - Triggered by low grades
- `fee_overdue` - Triggered by overdue fees
- `behavior_incident` - Triggered by behavior incidents
- `achievement` - Triggered by student achievements

**Usage:**
- Used in notification rule configuration
- Referenced in `src/app/[locale]/(dashboard)/dashboard/notifications/rules/page.tsx`
