# SCHOOL MANAGEMENT SYSTEM - BACKEND DEVELOPMENT SPECIFICATION

This document provides complete specifications for building the backend API for the School Management System. The frontend is already built and expects the backend to match these specifications exactly.

---

## TABLE OF CONTENTS

- [Section A: Database Tables](#section-a-database-tables)
- [Section B: API Endpoints](#section-b-api-endpoints)
- [Section C: Authentication Requirements](#section-c-authentication-requirements)
- [Section D: Role-Based Access Control Matrix](#section-d-role-based-access-control-matrix)
- [Section E: Business Rules Backend Must Enforce](#section-e-business-rules-backend-must-enforce)
- [Section F: Background Jobs](#section-f-background-jobs)
- [Section G: File Storage Requirements](#section-g-file-storage-requirements)
- [Section H: Third-Party Integrations](#section-h-third-party-integrations)
- [Section I: Environment Variables](#section-i-environment-variables)
- [Section J: Priority Build Order](#section-j-priority-build-order)

---

## SECTION A: DATABASE TABLES

### TABLE: users
PURPOSE: Stores all system users regardless of role
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name      | Data Type     | Nullable | Default | Constraints              |
|------------------|---------------|----------|---------|--------------------------|
| id               | UUID          | NO       | uuid()  | PRIMARY KEY              |
| full_name        | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| email            | VARCHAR(255)  | NO       | -       | UNIQUE, NOT NULL         |
| password_hash    | VARCHAR(255)  | NO       | -       | NOT NULL                 |
| phone_number     | VARCHAR(20)   | YES      | NULL    | -                        |
| address          | TEXT          | YES      | NULL    | -                        |
| profile_image_url| VARCHAR(500)  | YES      | NULL    | -                        |
| must_change_pwd  | BOOLEAN       | NO       | false   | NOT NULL                 |
| is_active        | BOOLEAN       | NO       | true    | NOT NULL (soft delete)   |
| deleted_at       | TIMESTAMP     | YES      | NULL    | Soft delete timestamp    |
| created_at       | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at       | TIMESTAMP     | NO       | now()   | NOT NULL                 |

RELATIONSHIPS:
  users → user_roles: one-to-many
  users → students: one-to-one
  users → teachers: one-to-one
  users → guardians: one-to-one

INDEXES:
  - idx_users_email (email) - UNIQUE
  - idx_users_is_active (is_active)
  - idx_users_deleted_at (deleted_at)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: user_roles
PURPOSE: Junction table for many-to-many relationship between users and roles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name  | Data Type | Nullable | Default | Constraints              |
|--------------|-----------|----------|---------|--------------------------|
| id           | UUID      | NO       | uuid()  | PRIMARY KEY              |
| user_id      | UUID      | NO       | -       | FOREIGN KEY → users.id   |
| role_name    | VARCHAR(50)| NO       | -       | NOT NULL                 |
| created_at   | TIMESTAMP | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_user_roles_user_id (user_id)
  - UNIQUE(user_id, role_name)

CONSTRAINTS:
  - role_name IN ('admin', 'director', 'registrar', 'teacher', 'student', 'guardian')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: students
PURPOSE: Stores student-specific information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name           | Data Type     | Nullable | Default | Constraints              |
|-----------------------|---------------|----------|---------|--------------------------|
| id                    | UUID          | NO       | uuid()  | PRIMARY KEY              |
| user_id               | UUID          | YES      | NULL    | FOREIGN KEY → users.id   |
| registration_number   | VARCHAR(50)   | NO       | -       | UNIQUE, NOT NULL         |
| full_name             | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| sex                   | CHAR(1)       | NO       | -       | CHECK(sex IN ('M','F'))  |
| date_of_birth         | DATE          | NO       | -       | NOT NULL                 |
| admission_date        | DATE          | NO       | -       | NOT NULL                 |
| phone_number          | VARCHAR(20)   | YES      | NULL    | -                        |
| address               | TEXT          | YES      | NULL    | -                        |
| nationality           | VARCHAR(100)  | YES      | NULL    | -                        |
| previous_school       | VARCHAR(255)  | YES      | NULL    | -                        |
| ministry_exam_result  | DECIMAL(5,2)  | YES      | NULL    | CHECK(>=0 AND <=100)     |
| status                | VARCHAR(20)   | NO       | 'active'| NOT NULL                 |
| is_active             | BOOLEAN       | NO       | true    | NOT NULL                 |
| deleted_at            | TIMESTAMP     | YES      | NULL    | -                        |
| created_at            | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at            | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_students_registration_number (registration_number) - UNIQUE
  - idx_students_user_id (user_id) - UNIQUE
  - idx_students_status (status)

CONSTRAINTS:
  - status IN ('active', 'graduated', 'transferred', 'expelled', 'withdrawn')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: teachers
PURPOSE: Stores teacher-specific information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name              | Data Type     | Nullable | Default | Constraints              |
|--------------------------|---------------|----------|---------|--------------------------|
| id                       | UUID          | NO       | uuid()  | PRIMARY KEY              |
| user_id                  | UUID          | YES      | NULL    | FOREIGN KEY → users.id   |
| employee_id              | VARCHAR(50)   | NO       | -       | UNIQUE, NOT NULL         |
| full_name                | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| sex                      | CHAR(1)       | NO       | -       | CHECK(sex IN ('M','F'))  |
| date_of_birth            | DATE          | NO       | -       | NOT NULL                 |
| hire_date                | DATE          | NO       | -       | NOT NULL                 |
| phone_number             | VARCHAR(20)   | YES      | NULL    | -                        |
| address                  | TEXT          | YES      | NULL    | -                        |
| qualification           | VARCHAR(100)  | YES      | NULL    | -                        |
| specialization           | VARCHAR(100)  | YES      | NULL    | -                        |
| office_location          | VARCHAR(100)  | YES      | NULL    | -                        |
| emergency_contact_name    | VARCHAR(100)  | YES      | NULL    | -                        |
| emergency_contact_phone   | VARCHAR(20)   | YES      | NULL    | -                        |
| status                   | VARCHAR(20)   | NO       | 'active'| NOT NULL                 |
| is_active                | BOOLEAN       | NO       | true    | NOT NULL                 |
| deleted_at               | TIMESTAMP     | YES      | NULL    | -                        |
| created_at               | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at               | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_teachers_employee_id (employee_id) - UNIQUE
  - idx_teachers_user_id (user_id) - UNIQUE
  - idx_teachers_status (status)

CONSTRAINTS:
  - status IN ('active', 'on_leave', 'suspended', 'resigned', 'retired')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: guardians
PURPOSE: Stores guardian/parent information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| user_id        | UUID          | YES      | NULL    | FOREIGN KEY → users.id   |
| full_name      | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| phone_number   | VARCHAR(20)   | YES      | NULL    | -                        |
| address        | TEXT          | YES      | NULL    | -                        |
| occupation     | VARCHAR(100)  | YES      | NULL    | -                        |
| workplace      | VARCHAR(255)  | YES      | NULL    | -                        |
| is_active      | BOOLEAN       | NO       | true    | NOT NULL                 |
| deleted_at     | TIMESTAMP     | YES      | NULL    | -                        |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_guardians_user_id (user_id) - UNIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: guardian_students
PURPOSE: Junction table linking guardians to students
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name             | Data Type | Nullable | Default | Constraints              |
|-------------------------|-----------|----------|---------|--------------------------|
| id                      | UUID      | NO       | uuid()  | PRIMARY KEY              |
| guardian_id             | UUID      | NO       | -       | FOREIGN KEY → guardians.id |
| student_id              | UUID      | NO       | -       | FOREIGN KEY → students.id |
| relationship_type       | VARCHAR(20)| NO       | -       | NOT NULL                 |
| is_primary             | BOOLEAN   | NO       | false   | NOT NULL                 |
| is_emergency_contact   | BOOLEAN   | NO       | false   | NOT NULL                 |
| can_pickup             | BOOLEAN   | NO       | false   | NOT NULL                 |
| created_at              | TIMESTAMP | NO       | now()   | NOT NULL                 |

INDEXES:
  - UNIQUE(guardian_id, student_id)

CONSTRAINTS:
  - relationship_type IN ('father', 'mother', 'guardian', 'uncle', 'aunt', 'grandparent', 'sibling', 'other')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: academic_years
PURPOSE: Stores academic year information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| name           | VARCHAR(20)   | NO       | -       | NOT NULL                 |
| start_date     | DATE          | NO       | -       | NOT NULL                 |
| end_date       | DATE          | NO       | -       | NOT NULL                 |
| description    | TEXT          | YES      | NULL    | -                        |
| is_current     | BOOLEAN       | NO       | false   | NOT NULL                 |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_academic_years_name (name) - UNIQUE
  - idx_academic_years_is_current (is_current)

CONSTRAINTS:
  - end_date > start_date
  - Only one is_current = true
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: terms
PURPOSE: Stores term/semester information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name        | Data Type     | Nullable | Default | Constraints              |
|--------------------|---------------|----------|---------|--------------------------|
| id                 | UUID          | NO       | uuid()  | PRIMARY KEY              |
| academic_year_id    | UUID          | NO       | -       | FOREIGN KEY → academic_years.id |
| name               | VARCHAR(50)   | NO       | -       | NOT NULL                 |
| term_number        | INTEGER       | NO       | -       | CHECK(term_number BETWEEN 1 AND 4) |
| start_date         | DATE          | NO       | -       | NOT NULL                 |
| end_date           | DATE          | NO       | -       | NOT NULL                 |
| is_current         | BOOLEAN       | NO       | false   | NOT NULL                 |
| created_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_terms_academic_year_id (academic_year_id)
  - idx_terms_is_current (is_current)

CONSTRAINTS:
  - end_date > start_date
  - Term dates within academic year dates
  - Only one is_current per academic_year
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: classes
PURPOSE: Stores class/grade level information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| name           | VARCHAR(50)   | NO       | -       | NOT NULL                 |
| grade_level    | INTEGER       | NO       | -       | CHECK(grade_level BETWEEN 0 AND 12) |
| description    | VARCHAR(255)  | YES      | NULL    | -                        |
| capacity       | INTEGER       | YES      | NULL    | CHECK(capacity > 0)      |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: sections
PURPOSE: Stores section information within classes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name          | Data Type     | Nullable | Default | Constraints              |
|----------------------|---------------|----------|---------|--------------------------|
| id                   | UUID          | NO       | uuid()  | PRIMARY KEY              |
| class_id             | UUID          | NO       | -       | FOREIGN KEY → classes.id |
| name                 | VARCHAR(10)   | NO       | -       | NOT NULL                 |
| capacity             | INTEGER       | NO       | 40      | CHECK(capacity > 0)      |
| room_number          | VARCHAR(20)   | YES      | NULL    | -                        |
| homeroom_teacher_id  | UUID          | YES      | NULL    | FOREIGN KEY → teachers.id |
| created_at           | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at           | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_sections_class_id (class_id)
  - idx_sections_homeroom_teacher_id (homeroom_teacher_id)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: subjects
PURPOSE: Stores subject information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| code           | VARCHAR(20)   | NO       | -       | UNIQUE, NOT NULL         |
| name           | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| category       | VARCHAR(20)   | NO       | 'core'  | NOT NULL                 |
| description    | TEXT          | YES      | NULL    | -                        |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_subjects_code (code) - UNIQUE

CONSTRAINTS:
  - category IN ('core', 'elective', 'vocational', 'extracurricular')
  - code stored as uppercase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: section_subjects
PURPOSE: Junction table linking sections to subjects with teachers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type | Nullable | Default | Constraints              |
|----------------|-----------|----------|---------|--------------------------|
| id             | UUID      | NO       | uuid()  | PRIMARY KEY              |
| section_id     | UUID      | NO       | -       | FOREIGN KEY → sections.id |
| subject_id     | UUID      | NO       | -       | FOREIGN KEY → subjects.id |
| teacher_id     | UUID      | NO       | -       | FOREIGN KEY → teachers.id |
| term_id        | UUID      | NO       | -       | FOREIGN KEY → terms.id   |
| created_at     | TIMESTAMP | NO       | now()   | NOT NULL                 |

INDEXES:
  - UNIQUE(section_id, subject_id, term_id)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: enrollments
PURPOSE: Stores student enrollment records
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name        | Data Type     | Nullable | Default | Constraints              |
|--------------------|---------------|----------|---------|--------------------------|
| id                 | UUID          | NO       | uuid()  | PRIMARY KEY              |
| student_id         | UUID          | NO       | -       | FOREIGN KEY → students.id |
| academic_year_id   | UUID          | NO       | -       | FOREIGN KEY → academic_years.id |
| class_id           | UUID          | NO       | -       | FOREIGN KEY → classes.id |
| section_id         | UUID          | NO       | -       | FOREIGN KEY → sections.id |
| enrollment_date    | DATE          | NO       | -       | NOT NULL                 |
| status             | VARCHAR(20)   | NO       | 'active'| NOT NULL                 |
| withdrawal_date    | DATE          | YES      | NULL    | -                        |
| withdrawal_reason  | TEXT          | YES      | NULL    | -                        |
| created_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_enrollments_student_id (student_id)
  - idx_enrollments_academic_year_id (academic_year_id)
  - idx_enrollments_section_id (section_id)
  - idx_enrollments_status (status)

CONSTRAINTS:
  - status IN ('active', 'withdrawn', 'transferred', 'completed')
  - withdrawal_reason required if status = withdrawn
  - One active enrollment per student per academic_year
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: attendance_records
PURPOSE: Stores daily attendance records
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| student_id     | UUID          | NO       | -       | FOREIGN KEY → students.id |
| section_id     | UUID          | NO       | -       | FOREIGN KEY → sections.id |
| date           | DATE          | NO       | -       | NOT NULL                 |
| status         | VARCHAR(10)   | NO       | -       | NOT NULL                 |
| note           | TEXT          | YES      | NULL    | -                        |
| marked_by      | UUID          | NO       | -       | FOREIGN KEY → users.id   |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - UNIQUE(student_id, date, section_id)

CONSTRAINTS:
  - status IN ('present', 'absent', 'late', 'excused')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: assessments
PURPOSE: Stores assessment/examination information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| section_id     | UUID          | NO       | -       | FOREIGN KEY → sections.id |
| subject_id     | UUID          | NO       | -       | FOREIGN KEY → subjects.id |
| term_id        | UUID          | NO       | -       | FOREIGN KEY → terms.id   |
| name           | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| type           | VARCHAR(20)   | NO       | -       | NOT NULL                 |
| date           | DATE          | YES      | NULL    | -                        |
| max_score      | DECIMAL(10,2) | NO       | -       | CHECK(max_score > 0)      |
| weight         | DECIMAL(5,2)  | NO       | 1.0     | CHECK(weight > 0)         |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_assessments_section_id (section_id)
  - idx_assessments_subject_id (subject_id)
  - idx_assessments_term_id (term_id)

CONSTRAINTS:
  - type IN ('quiz', 'test', 'midterm', 'final', 'assignment', 'project')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: grades
PURPOSE: Stores student grades for assessments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name        | Data Type     | Nullable | Default | Constraints              |
|--------------------|---------------|----------|---------|--------------------------|
| id                 | UUID          | NO       | uuid()  | PRIMARY KEY              |
| assessment_id      | UUID          | NO       | -       | FOREIGN KEY → assessments.id |
| student_id         | UUID          | NO       | -       | FOREIGN KEY → students.id |
| score              | DECIMAL(10,2) | YES      | NULL    | CHECK(score >= 0)        |
| percentage         | DECIMAL(5,2)  | YES      | NULL    | CHECK(percentage BETWEEN 0 AND 100) |
| letter_grade       | CHAR(2)       | YES      | NULL    | -                        |
| comment            | TEXT          | YES      | NULL    | -                        |
| graded_by          | UUID          | YES      | NULL    | FOREIGN KEY → users.id   |
| graded_at          | TIMESTAMP     | YES      | NULL    | -                        |
| created_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - UNIQUE(assessment_id, student_id)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: schedule_entries
PURPOSE: Stores class schedule information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| section_id     | UUID          | NO       | -       | FOREIGN KEY → sections.id |
| subject_id     | UUID          | NO       | -       | FOREIGN KEY → subjects.id |
| term_id        | UUID          | NO       | -       | FOREIGN KEY → terms.id   |
| day_of_week    | INTEGER       | NO       | -       | CHECK(day_of_week BETWEEN 1 AND 7) |
| period         | INTEGER       | NO       | -       | CHECK(period > 0)         |
| start_time     | TIME          | NO       | -       | NOT NULL                 |
| end_time       | TIME          | NO       | -       | NOT NULL                 |
| room_number    | VARCHAR(20)   | YES      | NULL    | -                        |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - UNIQUE(section_id, day_of_week, period)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: notifications
PURPOSE: Stores user notifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| user_id        | UUID          | NO       | -       | FOREIGN KEY → users.id   |
| type           | VARCHAR(30)   | NO       | -       | NOT NULL                 |
| priority       | VARCHAR(10)   | NO       | 'medium'| NOT NULL                 |
| title          | VARCHAR(255)  | NO       | -       | NOT NULL                 |
| message        | TEXT          | NO       | -       | NOT NULL                 |
| data           | JSONB         | YES      | NULL    | -                        |
| link           | VARCHAR(500)  | YES      | NULL    | -                        |
| icon           | VARCHAR(50)   | YES      | NULL    | -                        |
| is_automated   | BOOLEAN       | NO       | false   | NOT NULL                 |
| read_at        | TIMESTAMP     | YES      | NULL    | -                        |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_notifications_user_id (user_id)
  - idx_notifications_read_at (read_at)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: student_fees
PURPOSE: Stores fee information for students
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name        | Data Type     | Nullable | Default | Constraints              |
|--------------------|---------------|----------|---------|--------------------------|
| id                 | UUID          | NO       | uuid()  | PRIMARY KEY              |
| student_id         | UUID          | NO       | -       | FOREIGN KEY → students.id |
| academic_year_id   | UUID          | NO       | -       | FOREIGN KEY → academic_years.id |
| type               | VARCHAR(50)   | NO       | -       | NOT NULL                 |
| name               | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| amount             | DECIMAL(12,2)  | NO       | -       | CHECK(amount > 0)        |
| due_date           | DATE          | NO       | -       | NOT NULL                 |
| status             | VARCHAR(20)   | NO       | 'unpaid'| NOT NULL                 |
| amount_paid        | DECIMAL(12,2)  | NO       | 0.00    | NOT NULL                 |
| balance            | DECIMAL(12,2)  | NO       | -       | NOT NULL                 |
| created_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_student_fees_student_id (student_id)
  - idx_student_fees_status (status)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: payment_transactions
PURPOSE: Stores payment transaction records
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name        | Data Type     | Nullable | Default | Constraints              |
|--------------------|---------------|----------|---------|--------------------------|
| id                 | UUID          | NO       | uuid()  | PRIMARY KEY              |
| student_id         | UUID          | NO       | -       | FOREIGN KEY → students.id |
| student_fee_id     | UUID          | YES      | NULL    | FOREIGN KEY → student_fees.id |
| payment_reference  | VARCHAR(50)   | NO       | -       | UNIQUE, NOT NULL         |
| amount             | DECIMAL(12,2)  | NO       | -       | CHECK(amount > 0)        |
| payment_method     | VARCHAR(30)   | NO       | -       | NOT NULL                 |
| status             | VARCHAR(20)   | NO       | 'pending'| NOT NULL                 |
| gateway_response   | JSONB         | YES      | NULL    | -                        |
| created_at         | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| completed_at       | TIMESTAMP     | YES      | NULL    | -                        |

INDEXES:
  - idx_payment_transactions_payment_reference (payment_reference) - UNIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: settings
PURPOSE: Stores system-wide settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| category       | VARCHAR(50)   | NO       | -       | NOT NULL                 |
| key            | VARCHAR(100)  | NO       | -       | NOT NULL                 |
| value          | JSONB         | YES      | NULL    | -                        |
| description    | TEXT          | YES      | NULL    | -                        |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - UNIQUE(category, key)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### TABLE: face_recognition_data
PURPOSE: Stores face recognition data for attendance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Column Name    | Data Type     | Nullable | Default | Constraints              |
|----------------|---------------|----------|---------|--------------------------|
| id             | UUID          | NO       | uuid()  | PRIMARY KEY              |
| student_id     | UUID          | NO       | -       | FOREIGN KEY → students.id, UNIQUE |
| face_vector    | BYTEA         | NO       | -       | NOT NULL                 |
| confidence_threshold | DECIMAL(3,2)| NO       | 0.85    | NOT NULL                 |
| created_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |
| updated_at     | TIMESTAMP     | NO       | now()   | NOT NULL                 |

INDEXES:
  - idx_face_recognition_data_student_id (student_id) - UNIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## SECTION B: API ENDPOINTS

**Reference:** See `API_SPECIFICATION_COMPLETE.md` for complete specifications of all 120 API endpoints.

The backend must implement ALL endpoints exactly as specified, including request/response schemas, HTTP methods, authentication, permissions, error responses, and business rules.

---

## SECTION C: AUTHENTICATION REQUIREMENTS

### JWT Implementation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Token Type:** JWT (JSON Web Token)
**Algorithm:** HS256 (HMAC SHA-256)

**Access Token:**
- Expiry: 15 minutes (900 seconds)
- Contains: user_id, email, roles, iat, exp
- Format: Bearer {access_token}

**Refresh Token:**
- Expiry: 7 days (604800 seconds)
- Contains: user_id, token_id, iat, exp
- Stored in database for revocation tracking

**Password Hashing:**
- Algorithm: bcrypt with cost factor 12

**Token Refresh Flow:**
1. Frontend sends expired access token + refresh token
2. Backend validates refresh token (not revoked, not expired)
3. Backend generates new access token
4. Backend returns new access token

---

## SECTION D: ROLE-BASED ACCESS CONTROL MATRIX

**Full matrix available in API specification. Key permissions:**

- **Admin:** Full access to all endpoints except student/guardian portals
- **Director:** Full access except user management (no admin edits), settings (admin only)
- **Registrar:** User creation (non-admin), student/guardian management, attendance, enrollments
- **Teacher:** Own classes only - attendance, grades, schedule
- **Student:** Own data only - portal endpoints
- **Guardian:** Linked children only - portal endpoints

---

## SECTION E: BUSINESS RULES BACKEND MUST ENFORCE

### Authentication Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BR-AUTH-001:** Email must be unique across all user types (409 Conflict)
**BR-AUTH-002:** Password minimum 8 characters (400 Bad Request)
**BR-AUTH-003:** Only admin can assign admin role (403 Forbidden)

### Student Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BR-STU-001:** Minimum age 5 years for enrollment (400 Bad Request)
**BR-STU-002:** Registration number unique (409 Conflict)
**BR-STU-003:** Single active enrollment per academic year (400 Bad Request)
**BR-STU-004:** Withdrawal requires reason (min 5 chars) (400 Bad Request)
**BR-STU-005:** Cannot withdraw with outstanding fees (400 Bad Request)

### Teacher Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BR-TCH-001:** Minimum age 18 years for employment (400 Bad Request)
**BR-TCH-002:** Employee ID unique (409 Conflict)

### Academic Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BR-ACD-001:** Academic year end_date > start_date (400 Bad Request)
**BR-ACD-002:** Only one current academic year (400 Bad Request)
**BR-ACD-003:** Term end_date > start_date (400 Bad Request)
**BR-ACD-004:** Term dates within academic year (400 Bad Request)
**BR-ACD-005:** Maximum 4 terms per year (400 Bad Request)
**BR-ACD-006:** Subject code unique (409 Conflict)
**BR-ACD-007:** Section capacity check before enrollment (400 Bad Request)
**BR-ACD-008:** No schedule conflicts (409 Conflict)
**BR-ACD-009:** Teacher schedule conflict prevention (409 Conflict)

### Attendance Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BR-ATT-001:** Single attendance record per student per day (409 Conflict)
**BR-ATT-002:** Attendance already taken for section/date (409 Conflict)

### Grade Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BR-GRD-001:** Score cannot exceed max_score (400 Bad Request)
**BR-GRD-002:** Student must be enrolled in section (400 Bad Request)
**BR-GRD-003:** Auto-calculate percentage and letter_grade

### Payment Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BR-PAY-001:** Payment reference unique (409 Conflict)
**BR-PAY-002:** Amount must match fee balance (400 Bad Request)

---

## SECTION F: BACKGROUND JOBS

### Scheduled Jobs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Job 1: Fee Overdue Check**
- Frequency: Daily at 8:00 AM
- Check: student_fees where due_date < today AND balance > 0
- Action: Update status to 'overdue', send notification to guardian
- Endpoint: Uses notification system

**Job 2: Attendance Risk Alert**
- Frequency: Daily at 6:00 PM
- Check: Students with attendance_rate < threshold
- Action: Send notification to guardians if enabled
- Settings: attendance_warning_threshold from settings

**Job 3: Consecutive Absence Alert**
- Frequency: Daily at 6:00 PM
- Check: Students with consecutive_absences >= threshold
- Action: Send notification to guardians immediately
- Settings: consecutive_absence_threshold from settings

**Job 4: Grade Alert**
- Frequency: After grade entry (triggered, not scheduled)
- Check: Students with grade_average < passing_mark
- Action: Send notification to guardians if enabled
- Settings: passing_mark from settings

**Job 5: Payment Status Update**
- Frequency: Every 5 minutes
- Check: Pending payment transactions with Chapa
- Action: Query Chapa API, update status to completed/failed
- Integration: Chapa payment gateway

---

## SECTION G: FILE STORAGE REQUIREMENTS

### File Types and Limits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Profile Photos:**
- Types: JPG, PNG, WEBP
- Max size: 5MB
- Storage: Local filesystem or S3
- Path: /uploads/profiles/{user_id}.{ext}

**Face Recognition Data:**
- Types: Binary face vectors
- Storage: Database (BYTEA column)
- No file system storage

**Recommended Storage:**
- Development: Local filesystem (/var/www/uploads)
- Production: AWS S3 or similar object storage
- Environment variable: STORAGE_TYPE (local/s3)
- S3 credentials: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET

---

## SECTION H: THIRD-PARTY INTEGRATIONS

### Chapa Payment Gateway
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Required:**
- Chapa API Key: CHAPA_SECRET_KEY
- Chapa Public Key: CHAPA_PUBLIC_KEY
- Mode: test or production (CHAPA_MODE)

**Integration Flow:**
1. Frontend calls POST /payments/initiate
2. Backend creates payment transaction (status: pending)
3. Backend calls Chapa API to initialize payment
4. Chapa returns checkout_url and payment_reference
5. Backend returns checkout_url to frontend
6. User completes payment on Chapa
7. Chapa webhook calls backend endpoint
8. Backend updates transaction status to completed
9. Backend updates student_fees amount_paid and balance

**Webhook Endpoint:** POST /webhooks/chapa/callback

### SMS Service
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Required:**
- SMS API provider (e.g., Twilio, Africa's Talking)
- API credentials
- Sender ID

**Notification Types via SMS:**
- Urgent notifications
- Absence alerts
- Fee overdue alerts

### Email Service
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Required:**
- SMTP server or email API (e.g., SendGrid, Mailgun)
- SMTP credentials or API key
- From email address

**Notification Types via Email:**
- All notification types
- Password reset emails

---

## SECTION I: ENVIRONMENT VARIABLES

### Backend Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/school_db
DATABASE_POOL_SIZE=10

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Chapa Payment Gateway
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_PUBLIC_KEY=your-chapa-public-key
CHAPA_MODE=test

# SMS Service
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=SchoolSMS

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@school.com

# File Storage
STORAGE_TYPE=local
UPLOAD_PATH=/var/www/uploads
# OR for S3:
# AWS_ACCESS_KEY_ID=your-aws-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret
# AWS_S3_BUCKET=your-bucket-name
# AWS_REGION=us-east-1

# Face Recognition
FACE_RECOGNITION_ENABLED=true
FACE_RECOGNITION_CONFIDENCE_THRESHOLD=0.85

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## SECTION J: PRIORITY BUILD ORDER

### Week 1 - Authentication & User Management (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Database:**
- users table
- user_roles table
- refresh_tokens table

**Endpoints:**
1. POST /auth/login
2. POST /auth/logout
3. POST /auth/refresh
4. POST /auth/forgot-password
5. POST /auth/reset-password
6. GET /users/me
7. POST /users
8. GET /users
9. GET /users/{id}
10. PATCH /users/{id}
11. PUT /users/{id}/roles

**Dependencies:** None (first to build)

---

### Week 2 - Core Entity Management (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Database:**
- students table
- teachers table
- guardians table
- guardian_students table

**Endpoints:**
1. POST /students
2. GET /students
3. GET /students/{id}
4. PATCH /students/{id}
5. DELETE /students/{id}
6. POST /teachers
7. GET /teachers
8. GET /teachers/{id}
9. PATCH /teachers/{id}
10. DELETE /teachers/{id}
11. POST /guardians
12. GET /guardians
13. GET /guardians/{id}
14. PATCH /guardians/{id}
15. DELETE /guardians/{id}
16. POST /guardians/{id}/students
17. DELETE /guardians/{id}/students/{studentId}

**Dependencies:** Week 1 (authentication)

---

### Week 3 - Academic Structure (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Database:**
- academic_years table
- terms table
- classes table
- sections table
- subjects table
- section_subjects table

**Endpoints:**
1. POST /academics/years
2. GET /academics/years
3. GET /academics/years/{id}
4. PATCH /academics/years/{id}
5. DELETE /academics/years/{id}
6. POST /academics/terms
7. GET /academics/terms
8. PATCH /academics/terms/{id}
9. DELETE /academics/terms/{id}
10. POST /academics/classes
11. GET /academics/classes
12. PATCH /academics/classes/{id}
13. DELETE /academics/classes/{id}
14. POST /academics/sections
15. GET /academics/sections
16. PATCH /academics/sections/{id}
17. DELETE /academics/sections/{id}
18. POST /academics/subjects
19. GET /academics/subjects
20. PATCH /academics/subjects/{id}
21. DELETE /academics/subjects/{id}

**Dependencies:** Week 2 (entities)

---

### Week 4 - Enrollment & Attendance (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Database:**
- enrollments table
- attendance_records table

**Endpoints:**
1. POST /enrollments
2. GET /enrollments
3. PATCH /enrollments/{id}
4. DELETE /enrollments/{id}
5. PATCH /enrollments/{id}/transfer
6. PATCH /enrollments/{id}/withdraw
7. GET /attendance/section/{id}
8. POST /attendance/bulk
9. GET /attendance/student/{id}/summary
10. GET /attendance/stats/summary

**Dependencies:** Week 3 (academic structure)

---

### Week 5 - Grades & Schedule (IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Database:**
- assessments table
- grades table
- schedule_entries table

**Endpoints:**
1. POST /academics/assessments
2. GET /academics/assessments
3. GET /grades/assessment/{id}
4. POST /grades/bulk
5. GET /grades/student/{id}/summary
6. GET /grades/report-card/{id}
7. GET /schedule/section/{id}
8. POST /schedule/entries

**Dependencies:** Week 4 (enrollment, attendance)

---

### Week 6 - Payments & Portals (IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Database:**
- student_fees table
- payment_transactions table
- settings table
- notifications table

**Endpoints:**
1. GET /payments/student/{id}/fees
2. POST /payments/initiate
3. GET /payments/transactions
4. GET /student-portal/dashboard
5. GET /student-portal/attendance
6. GET /student-portal/grades
7. GET /student-portal/schedule
8. GET /guardian-portal/dashboard
9. GET /guardian-portal/children/{id}/attendance
10. GET /guardian-portal/children/{id}/grades
11. GET /guardian-portal/children/{id}/fees
12. GET /settings/school
13. PATCH /settings/school
14. GET /settings/academic
15. PATCH /settings/academic
16. GET /notifications
17. POST /notifications/send
18. PATCH /notifications/{id}/read

**Dependencies:** Week 5 (grades, schedule)
**Integrations:** Chapa payment gateway

---

### Week 7-8 - Advanced Features (NICE TO HAVE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Database:**
- face_recognition_data table
- notification_logs table
- notification_recipients table
- alert_rules table

**Endpoints:**
1. Analytics endpoints
2. Background job implementations
3. Face recognition integration
4. Notification history
5. Webhook handlers

**Dependencies:** All previous weeks

---

## DOCUMENT STATUS

**Total Tables:** 20 database tables
**Total Endpoints:** 120 API endpoints
**Total Business Rules:** 25+ backend-enforced rules
**Estimated Development Time:** 8 weeks

**Next Steps:**
1. Set up database with all tables
2. Implement authentication (Week 1)
3. Build endpoints in priority order
4. Implement business rules
5. Set up third-party integrations
6. Test with frontend
