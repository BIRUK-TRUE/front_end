# Frontend Data Model Documentation - Zod Schema Form Types

This document describes Zod schema form types used for validation and form handling. Only types that actually exist in the code are documented.

## Academic Form Types

### AcademicYearForm
**File Path:** `src/features/academics/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the academic year (min 4, max 20 characters) |
| start_date | string | Yes | Start date of the academic year |
| end_date | string | Yes | End date of the academic year (must be after start_date) |
| description | string \| null | No | Description of the academic year (max 500 characters) |

**Usage:**
- Used in academic year creation/editing forms
- Validated by `academicYearSchema` with date range validation

---

### TermForm
**File Path:** `src/features/academics/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the term (min 2, max 50 characters) |
| term_number | number | Yes | Term number (1-4) |
| start_date | string | Yes | Start date of the term |
| end_date | string | Yes | End date of the term (must be after start_date) |

**Usage:**
- Used in term creation/editing forms
- Validated by `termSchema` with date range validation

---

### SubjectForm
**File Path:** `src/features/academics/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Subject code (min 2, max 20 characters, auto-uppercased by backend) |
| name | string | Yes | Subject name (min 2, max 100 characters) |
| category | 'core' \| 'elective' \| 'vocational' \| 'extracurricular' | Yes | Subject category (default: 'core') |
| description | string \| null | No | Description of the subject (max 500 characters) |

**Usage:**
- Used in subject creation/editing forms
- Validated by `subjectSchema`

---

### ClassForm
**File Path:** `src/features/academics/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Class name (min 2, max 50 characters) |
| grade_level | number | Yes | Grade level (0-12, where 0 is for KG) |
| description | string \| null | No | Description of the class (max 255 characters) |
| capacity | number \| null | No | Maximum capacity (must be positive if provided) |

**Usage:**
- Used in class creation/editing forms
- Validated by `classSchema`

---

### SectionForm
**File Path:** `src/features/academics/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Section name (min 1, max 10 characters) |
| capacity | number | Yes | Maximum capacity (default: 40, must be positive) |
| room_number | string \| null | No | Room number (max 20 characters) |
| homeroom_teacher_id | string \| null | No | UUID of the homeroom teacher |

**Usage:**
- Used in section creation/editing forms
- Validated by `sectionSchema`

---

## Enrollment Form Types

### EnrollmentForm
**File Path:** `src/features/enrollments/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| student_id | string | Yes | UUID of the student to enroll |
| academic_year_id | string | Yes | UUID of the academic year |
| class_id | string | Yes | UUID of the class |
| section_id | string | Yes | UUID of the section |
| enrollment_date | string | Yes | Date of enrollment |

**Usage:**
- Used in student enrollment forms
- Validated by `enrollmentSchema`

---

### TransferForm
**File Path:** `src/features/enrollments/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| new_section_id | string | Yes | UUID of the destination section for transfer |
| transfer_date | string | Yes | Date of transfer |
| reason | string | No | Reason for transfer |

**Usage:**
- Used in student transfer forms
- Validated by `transferSchema`

---

### WithdrawalForm
**File Path:** `src/features/enrollments/types/schemas.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| withdrawal_date | string | Yes | Date of withdrawal |
| reason | string | Yes | Reason for withdrawal (min 5 characters) |

**Usage:**
- Used in student withdrawal forms
- Validated by `withdrawalSchema`

---

## Enums

### SubjectCategory
**File Path:** Inferred from SubjectForm.category

**Values:**
- `core` - Core subject
- `elective` - Elective subject
- `vocational` - Vocational subject
- `extracurricular` - Extracurricular activity

**Usage:**
- Used in subject categorization
- Referenced in `subjectSchema`

---

### TermNumber
**File Path:** Inferred from TermForm.term_number

**Values:**
- 1 - First term
- 2 - Second term
- 3 - Third term
- 4 - Fourth term

**Usage:**
- Used in term numbering
- Referenced in `termSchema`
