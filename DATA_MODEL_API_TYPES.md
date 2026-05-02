# Frontend Data Model Documentation - API Service Inline Types

This document describes inline types defined in API service files for request/response payloads and filters. Only types that actually exist in the code are documented.

## User Service Types

### UserFilters
**File Path:** `src/lib/api/users.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number for pagination |
| size | number | No | Number of items per page |
| search | string | No | Search query string |
| is_active | boolean | No | Filter by active status |
| role | string | No | Filter by role name |
| sort_by | 'created_at' \| 'full_name' \| 'email' | No | Field to sort by |
| sort_order | 'asc' \| 'desc' | No | Sort direction |
| [key: string] | any | No | Additional filter parameters |

**Usage:**
- Used in `usersService.getAll()` for filtering and pagination

---

### UserCreatePayload
**File Path:** `src/lib/api/users.service.ts` (inline in create method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| full_name | string | Yes | User's full name |
| password | string | No | User's password (optional for existing users) |
| phone_number | string | No | User's phone number |
| address | string | No | User's address |
| role_names | string[] | Yes | Array of role names to assign |

**Usage:**
- Used in `usersService.create()` for creating new users

---

### UserUpdatePayload
**File Path:** `src/lib/api/users.service.ts` (inline in update method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | No | User's full name |
| phone_number | string | No | User's phone number |
| address | string | No | User's address |
| profile_image_url | string | No | URL to user's profile image |
| is_active | boolean | No | User's active status |

**Usage:**
- Used in `usersService.update()` for updating user information

---

## Student Service Types

### StudentFilters
**File Path:** `src/lib/api/students.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number for pagination |
| size | number | No | Number of items per page |
| search | string | No | Search query string |
| status | 'active' \| 'graduated' \| 'transferred' \| 'expelled' \| 'withdrawn' | No | Filter by enrollment status |
| is_active | boolean | No | Filter by active status |
| sex | 'M' \| 'F' | No | Filter by gender |
| nationality | string | No | Filter by nationality |
| sort_by | 'created_at' \| 'full_name' \| 'registration_number' \| 'admission_date' | No | Field to sort by |
| sort_order | 'asc' \| 'desc' | No | Sort direction |
| [key: string] | any | No | Additional filter parameters |

**Usage:**
- Used in `studentsService.getAll()` for filtering and pagination

---

### StudentCreatePayload
**File Path:** `src/lib/api/students.service.ts` (inline in create method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Student's email address |
| full_name | string | Yes | Student's full name |
| phone_number | string | No | Student's phone number |
| address | string | No | Student's address |
| password | string | No | Student's password |
| admission_date | string | Yes | Date of admission |
| date_of_birth | string | Yes | Student's date of birth |
| sex | 'M' \| 'F' | Yes | Student's gender |
| nationality | string | No | Student's nationality |
| previous_school | string | No | Previous school attended |
| ministry_exam_result | number | No | Ministry exam result score |

**Usage:**
- Used in `studentsService.create()` for creating new students

---

### StudentUpdatePayload
**File Path:** `src/lib/api/students.service.ts` (inline in update method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | No | Student's full name |
| phone_number | string | No | Student's phone number |
| address | string | No | Student's address |
| profile_image_url | string | No | URL to student's photo |
| is_active | boolean | No | Student's active status |
| status | string | No | Student's enrollment status |
| nationality | string | No | Student's nationality |
| previous_school | string | No | Previous school attended |
| ministry_exam_result | number | No | Ministry exam result score |

**Usage:**
- Used in `studentsService.update()` for updating student information

---

## Teacher Service Types

### TeacherFilters
**File Path:** `src/lib/api/teachers.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number for pagination |
| size | number | No | Number of items per page |
| search | string | No | Search query string |
| status | 'active' \| 'on_leave' \| 'suspended' \| 'resigned' \| 'retired' | No | Filter by employment status |
| is_active | boolean | No | Filter by active status |
| specialization | string | No | Filter by subject specialization |
| sort_by | 'created_at' \| 'full_name' \| 'employee_id' \| 'hire_date' | No | Field to sort by |
| sort_order | 'asc' \| 'desc' | No | Sort direction |
| [key: string] | any | No | Additional filter parameters |

**Usage:**
- Used in `teachersService.getAll()` for filtering and pagination

---

### TeacherCreatePayload
**File Path:** `src/lib/api/teachers.service.ts` (inline in create method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Teacher's email address |
| full_name | string | Yes | Teacher's full name |
| phone_number | string | No | Teacher's phone number |
| address | string | No | Teacher's address |
| password | string | No | Teacher's password |
| hire_date | string | Yes | Date of hire |
| date_of_birth | string | Yes | Teacher's date of birth |
| sex | 'M' \| 'F' | Yes | Teacher's gender |
| qualification | string | No | Academic qualification |
| specialization | string | No | Subject specialization |
| emergency_contact_name | string | No | Emergency contact name |
| emergency_contact_phone | string | No | Emergency contact phone |
| office_location | string | No | Office location |

**Usage:**
- Used in `teachersService.create()` for creating new teachers

---

### TeacherUpdatePayload
**File Path:** `src/lib/api/teachers.service.ts` (inline in update method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | No | Teacher's full name |
| phone_number | string | No | Teacher's phone number |
| address | string | No | Teacher's address |
| profile_image_url | string | No | URL to teacher's photo |
| is_active | boolean | No | Teacher's active status |
| status | string | No | Teacher's employment status |
| qualification | string | No | Academic qualification |
| specialization | string | No | Subject specialization |
| emergency_contact_name | string | No | Emergency contact name |
| emergency_contact_phone | string | No | Emergency contact phone |
| office_location | string | No | Office location |

**Usage:**
- Used in `teachersService.update()` for updating teacher information

---

## Guardian Service Types

### GuardianFilters
**File Path:** `src/lib/api/guardians.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number for pagination |
| size | number | No | Number of items per page |
| search | string | No | Search query string |
| is_active | boolean | No | Filter by active status |
| has_students | boolean | No | Filter by whether guardian has linked students |
| sort_by | 'created_at' \| 'full_name' \| 'email' | No | Field to sort by |
| sort_order | 'asc' \| 'desc' | No | Sort direction |
| [key: string] | any | No | Additional filter parameters |

**Usage:**
- Used in `guardiansService.getAll()` for filtering and pagination

---

### StudentLinkPayload
**File Path:** `src/lib/api/guardians.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| student_id | string | Yes | UUID of the student to link |
| relationship_type | 'father' \| 'mother' \| 'guardian' \| 'uncle' \| 'aunt' \| 'grandparent' \| 'sibling' \| 'other' | Yes | Relationship type to the student |
| is_primary | boolean | No | Whether this is the primary guardian |
| is_emergency_contact | boolean | No | Whether this is an emergency contact |
| can_pickup | boolean | No | Whether this guardian can pick up the student |

**Usage:**
- Used in `guardiansService.linkStudent()` for linking guardians to students
- Used in `guardiansService.create()` as part of student_links array

---

### GuardianCreatePayload
**File Path:** `src/lib/api/guardians.service.ts` (inline in create method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Guardian's email address |
| full_name | string | Yes | Guardian's full name |
| phone_number | string | No | Guardian's phone number |
| address | string | No | Guardian's address |
| password | string | No | Guardian's password |
| occupation | string | No | Guardian's occupation |
| workplace | string | No | Guardian's workplace |
| student_links | StudentLinkPayload[] | No | Array of student links to create |

**Usage:**
- Used in `guardiansService.create()` for creating new guardians

---

### GuardianUpdatePayload
**File Path:** `src/lib/api/guardians.service.ts` (inline in update method)

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | No | Guardian's full name |
| phone_number | string | No | Guardian's phone number |
| address | string | No | Guardian's address |
| profile_image_url | string | No | URL to guardian's photo |
| is_active | boolean | No | Guardian's active status |
| occupation | string | No | Guardian's occupation |
| workplace | string | No | Guardian's workplace |

**Usage:**
- Used in `guardiansService.update()` for updating guardian information

---

## Settings Service Types

### SchoolInfo
**File Path:** `src/lib/api/settings.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| school_name | string | Yes | Name of the school |
| address | string | Yes | School address |
| phone | string | Yes | School phone number |
| email | string | Yes | School email address |
| logo_url | string \| null | No | URL to school logo |

**Usage:**
- Used in `settingsService.getSchoolInfo()` and `settingsService.updateSchoolInfo()`

---

### AcademicSettings
**File Path:** `src/lib/api/settings.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| grading_scale | Record<string, number> | Yes | Grading scale mapping letter grades to percentage thresholds |
| passing_mark | number | Yes | Minimum passing mark percentage |
| attendance_warning_threshold | number | Yes | Attendance rate threshold for warnings |
| confidence_threshold | number | Yes | Confidence threshold for face recognition |

**Usage:**
- Used in `settingsService.getAcademicSettings()` and `settingsService.updateAcademicSettings()`

---

### NotificationSettings
**File Path:** `src/lib/api/settings.service.ts`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| absence_alert | boolean | Yes | Enable/disable absence alerts |
| low_grade_alert | boolean | Yes | Enable/disable low grade alerts |
| fee_reminder | boolean | Yes | Enable/disable fee reminders |
| consecutive_absence_threshold | number | Yes | Threshold for consecutive absence alerts |

**Usage:**
- Used in `settingsService.getNotificationSettings()` and `settingsService.updateNotificationSettings()`

---

## Enums

### StudentStatus
**File Path:** Inferred from StudentFilters.status

**Values:**
- `active` - Student is currently active
- `graduated` - Student has graduated
- `transferred` - Student has transferred
- `expelled` - Student has been expelled
- `withdrawn` - Student has withdrawn

**Usage:**
- Used in student status filtering
- Referenced in `StudentFilters`

---

### TeacherStatus
**File Path:** Inferred from TeacherFilters.status

**Values:**
- `active` - Teacher is currently active
- `on_leave` - Teacher is on leave
- `suspended` - Teacher is suspended
- `resigned` - Teacher has resigned
- `retired` - Teacher has retired

**Usage:**
- Used in teacher status filtering
- Referenced in `TeacherFilters`

---

### RelationshipType
**File Path:** Inferred from StudentLinkPayload.relationship_type

**Values:**
- `father` - Father
- `mother` - Mother
- `guardian` - Legal guardian
- `uncle` - Uncle
- `aunt` - Aunt
- `grandparent` - Grandparent
- `sibling` - Sibling
- `other` - Other relationship

**Usage:**
- Used in guardian-student linking
- Referenced in `StudentLinkPayload`

---

### Gender
**File Path:** Inferred from StudentCreatePayload.sex and TeacherCreatePayload.sex

**Values:**
- `M` - Male
- `F` - Female

**Usage:**
- Used in student and teacher gender specification
- Referenced in create payloads

---

### SortField
**File Path:** Inferred from various filter sort_by fields

**Values (User):**
- `created_at` - Sort by creation date
- `full_name` - Sort by full name
- `email` - Sort by email

**Values (Student):**
- `created_at` - Sort by creation date
- `full_name` - Sort by full name
- `registration_number` - Sort by registration number
- `admission_date` - Sort by admission date

**Values (Teacher):**
- `created_at` - Sort by creation date
- `full_name` - Sort by full name
- `employee_id` - Sort by employee ID
- `hire_date` - Sort by hire date

**Values (Guardian):**
- `created_at` - Sort by creation date
- `full_name` - Sort by full name
- `email` - Sort by email

**Usage:**
- Used in sorting results across various services
- Referenced in filter interfaces
