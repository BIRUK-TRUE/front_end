# Frontend Data Model Documentation - Academic Entities

This document describes academic-related entities from the frontend TypeScript types. Only types that actually exist in the code are documented.

## Academic Entities

### AcademicYear
**File Path:** `src/features/academics/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the academic year |
| year_name | string | Yes | Name of the academic year (e.g., '2024-2025') |
| start_date | string | Yes | Start date of the academic year |
| end_date | string | Yes | End date of the academic year |
| is_active | boolean | Yes | Flag indicating if this is the currently active academic year |
| description | string | No | Description of the academic year |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- One-to-Many: AcademicYear → Terms
- One-to-Many: AcademicYear → Classes
- One-to-Many: AcademicYear → Enrollments
- One-to-Many: AcademicYear → Students (via academic_year_id)

**Usage:**
- Used in `src/features/academics/types/index.ts` for academic management
- Used in `src/app/[locale]/(dashboard)/dashboard/academics/years/[yearId]/page.tsx` for academic year details

---

### Term
**File Path:** `src/features/academics/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the term |
| term_name | string | Yes | Name of the term (e.g., 'Term 1', 'Semester 1') |
| academic_year_id | number | Yes | ID of the academic year this term belongs to |
| start_date | string | Yes | Start date of the term |
| end_date | string | Yes | End date of the term |
| is_active | boolean | Yes | Flag indicating if this is the currently active term |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Term → AcademicYear (via academic_year_id)
- One-to-Many: Term → Assessments
- One-to-Many: Term → Grades

**Usage:**
- Used in `src/features/academics/types/index.ts` for academic management
- Used in academic year management pages for term CRUD operations

---

### Subject
**File Path:** `src/features/academics/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the subject |
| subject_code | string | Yes | Unique code for the subject (e.g., 'MATH101') |
| subject_name | string | Yes | Name of the subject |
| description | string | No | Description of the subject |
| credit_hours | number | No | Number of credit hours for the subject |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- One-to-Many: Subject → SubjectAssignments
- One-to-Many: Subject → Assessments
- One-to-Many: Subject → Grades

**Usage:**
- Used in `src/features/academics/types/index.ts` for academic management
- Used in subject management and assignment pages

---

### SubjectAssignment
**File Path:** `src/features/academics/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the subject assignment |
| class_id | number | Yes | ID of the class this subject is assigned to |
| subject_id | number | Yes | ID of the subject being assigned |
| teacher_id | number | Yes | ID of the teacher assigned to teach this subject |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: SubjectAssignment → Class (via class_id)
- Many-to-One: SubjectAssignment → Subject (via subject_id)
- Many-to-One: SubjectAssignment → Teacher (via teacher_id)
- One-to-Many: SubjectAssignment → Schedules

**Usage:**
- Used in `src/features/academics/types/index.ts` for academic management
- Used in class management for assigning subjects and teachers

---

### Assessment
**File Path:** `src/features/academics/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the assessment |
| assessment_name | string | Yes | Name of the assessment (e.g., 'Midterm Exam', 'Quiz 1') |
| subject_id | number | Yes | ID of the subject this assessment belongs to |
| term_id | number | Yes | ID of the term this assessment belongs to |
| assessment_type | string | Yes | Type of assessment (e.g., 'exam', 'quiz', 'assignment', 'project') |
| max_score | number | Yes | Maximum possible score for this assessment |
| weight | number | Yes | Weight of this assessment in final grade calculation (percentage) |
| assessment_date | string | Yes | Date when the assessment is scheduled |
| description | string | No | Description of the assessment |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Assessment → Subject (via subject_id)
- Many-to-One: Assessment → Term (via term_id)
- One-to-Many: Assessment → Grades

**Usage:**
- Used in `src/features/academics/types/index.ts` for academic management
- Used in grade book and assessment management

---

### Schedule
**File Path:** `src/features/schedule/types/index.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the schedule |
| class_id | number | Yes | ID of the class |
| section_id | number | No | ID of the section (if applicable) |
| subject_id | number | Yes | ID of the subject |
| teacher_id | number | Yes | ID of the teacher |
| day_of_week | string | Yes | Day of the week (e.g., 'Monday', 'Tuesday') |
| start_time | string | Yes | Start time of the class (e.g., '08:00') |
| end_time | string | Yes | End time of the class (e.g., '09:00') |
| room_number | string | No | Room number where the class is held |
| created_at | string | Yes | Timestamp when record was created |
| updated_at | string | Yes | Timestamp when record was last updated |

**Relationships:**
- Many-to-One: Schedule → Class (via class_id)
- Many-to-One: Schedule → Section (via section_id)
- Many-to-One: Schedule → Subject (via subject_id)
- Many-to-One: Schedule → Teacher (via teacher_id)

**Usage:**
- Used in `src/features/schedule/types/index.ts` for schedule management
- Used in timetable generation and display

---

## Enums

### AssessmentType
**File Path:** Inferred from Assessment.assessment_type

**Values:**
- `exam` - Formal examination
- `quiz` - Short quiz or test
- `assignment` - Homework or assignment
- `project` - Project work
- `practical` - Practical examination
- `oral` - Oral examination

**Usage:**
- Used in assessment management
- Referenced in grade calculation logic

---

### DayOfWeek
**File Path:** Inferred from Schedule.day_of_week

**Values:**
- `Monday`
- `Tuesday`
- `Wednesday`
- `Thursday`
- `Friday`
- `Saturday`
- `Sunday`

**Usage:**
- Used in schedule management
- Referenced in timetable generation
