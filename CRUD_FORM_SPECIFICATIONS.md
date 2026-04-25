# CRUD Form Specifications

This document contains detailed specifications for all Create/Edit forms needed in the School Management System.

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE: Create User
ROUTE: /dashboard/users/create
FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/users/create/page.tsx
STATUS: ✅ ALREADY EXISTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE:
  Allow admin to create a new user account in the system

WHO CAN ACCESS:
  - Admin ✅
  - Director ❌
  - Registrar ❌
  - Teacher ❌
  - Student ❌
  - Guardian ❌

FORM SECTIONS & FIELDS:
(Extracted from src/lib/api/users.service.ts and existing page)

  SECTION 1: Account Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: email                                         │
  │ Label: "Email"                                       │
  │ Type: email input                                   │
  │ Required: YES                                       │
  │ Validation: Valid email format                      │
  │ Error Message: "Email is required" / "Invalid email" │
  │ API Field Name: email                                │
  ├─────────────────────────────────────────────────────┤
  │ Field: full_name                                     │
  │ Label: "Full Name"                                   │
  │ Type: text input                                    │
  │ Required: YES                                       │
  │ Min Length: 2                                       │
  │ Max Length: 100                                     │
  │ Placeholder: "Enter full name"                      │
  │ Error Message: "Name must be at least 2 characters" │
  │ API Field Name: full_name                           │
  ├─────────────────────────────────────────────────────┤
  │ Field: password                                     │
  │ Label: "Password"                                   │
  │ Type: password input                                │
  │ Required: NO (optional)                             │
  │ Note: Auto-generated if empty                       │
  │ Placeholder: "Leave empty for auto-generated"       │
  │ API Field Name: password                            │
  └─────────────────────────────────────────────────────┘

  SECTION 2: Contact Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: phone_number                                  │
  │ Label: "Phone Number"                               │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter phone number"                   │
  │ API Field Name: phone_number                        │
  ├─────────────────────────────────────────────────────┤
  │ Field: address                                       │
  │ Label: "Address"                                    │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter address"                        │
  │ API Field Name: address                             │
  └─────────────────────────────────────────────────────┘

  SECTION 3: Role Assignment
  ┌─────────────────────────────────────────────────────┐
  │ Field: role_names                                   │
  │ Label: "Roles"                                      │
  │ Type: checkbox group (multi-select)                 │
  │ Required: YES (at least one)                        │
  │ Options:                                            │
  │   - "admin" → value: "admin"                        │
  │   - "director" → value: "director"                  │
  │   - "registrar" → value: "registrar"                │
  │   - "teacher" → value: "teacher"                  │
  │   - "student" → value: "student"                  │
  │   - "guardian" → value: "guardian"                  │
  │ Error Message: "At least one role must be selected" │
  │ API Field Name: role_names (array of strings)       │
  └─────────────────────────────────────────────────────┘

COMPLETE API PAYLOAD (what gets sent when form is submitted):
{
  "email": "string - required, valid email format",
  "full_name": "string - required, min 2 characters",
  "password": "string - optional, auto-generated if empty",
  "phone_number": "string - optional",
  "address": "string - optional",
  "role_names": ["string"] - required, at least one role"
}

API ENDPOINT CALLED ON SUBMIT:
  POST /users

ON SUCCESS:
  - Show success toast "User created successfully"
  - Redirect to /dashboard/users
  - Invalidate users list query

ON ERROR:
  - Show error message
  - Keep form data (don't reset)
  - Highlight failed fields if validation errors returned

EDIT PAGE DIFFERENCES:
  - Route: /dashboard/users/[id]/edit
  - Pre-populate all fields with existing data
  - API: PATCH /users/{id} (not POST /users)
  - Email field is NOT editable (read-only)
  - Role assignment is NOT in edit form (separate endpoint)
  - Add is_active toggle switch
  - Add profile_image_url field (optional)

EDIT API PAYLOAD:
{
  "full_name": "string - optional",
  "phone_number": "string - optional",
  "address": "string - optional",
  "profile_image_url": "string - optional",
  "is_active": "boolean - optional"
}

EDIT API ENDPOINT:
  PATCH /users/{id}

NOTES & QUESTIONS FOR BUSINESS:
  ❓ Should password be editable in edit form (with change password flow)?
  ❓ Should role assignment be moved to edit form instead of separate endpoint?

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE: Create Student
ROUTE: /dashboard/students/create
FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx
STATUS: ❌ MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE:
  Allow registrar to create a new student record in the system

WHO CAN ACCESS:
  - Admin ✅
  - Registrar ✅
  - Director ❌
  - Teacher ❌
  - Student ❌
  - Guardian ❌

FORM SECTIONS & FIELDS:
(Extracted from src/lib/api/students.service.ts)

  SECTION 1: Personal Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: email                                         │
  │ Label: "Email"                                       │
  │ Type: email input                                   │
  │ Required: YES                                       │
  │ Validation: Valid email format                      │
  │ Error Message: "Email is required" / "Invalid email" │
  │ API Field Name: email                                │
  ├─────────────────────────────────────────────────────┤
  │ Field: full_name                                     │
  │ Label: "Full Name"                                   │
  │ Type: text input                                    │
  │ Required: YES                                       │
  │ Min Length: 2                                       │
  │ Max Length: 100                                     │
  │ Placeholder: "Enter full name"                      │
  │ Error Message: "Name must be at least 2 characters" │
  │ API Field Name: full_name                           │
  ├─────────────────────────────────────────────────────┤
  │ Field: sex                                          │
  │ Label: "Gender"                                     │
  │ Type: dropdown/radio                                │
  │ Required: YES                                       │
  │ Options:                                            │
  │   - "Male" → value: "M"                            │
  │   - "Female" → value: "F"                          │
  │ Error Message: "Please select gender"               │
  │ API Field Name: sex                                 │
  ├─────────────────────────────────────────────────────┤
  │ Field: date_of_birth                                 │
  │ Label: "Date of Birth"                              │
  │ Type: date picker                                   │
  │ Required: YES                                       │
  │ Max Date: today minus 5 years (minimum age)         │
  │ Format sent to API: YYYY-MM-DD                      │
  │ Error Message: "Date of birth is required"          │
  │ API Field Name: date_of_birth                       │
  └─────────────────────────────────────────────────────┘

  SECTION 2: Contact Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: phone_number                                  │
  │ Label: "Phone Number"                               │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter phone number"                   │
  │ API Field Name: phone_number                        │
  ├─────────────────────────────────────────────────────┤
  │ Field: address                                       │
  │ Label: "Address"                                    │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter address"                        │
  │ API Field Name: address                             │
  └─────────────────────────────────────────────────────┘

  SECTION 3: Academic Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: admission_date                                │
  │ Label: "Admission Date"                             │
  │ Type: date picker                                   │
  │ Required: YES                                       │
  │ Default: Today                                     │
  │ Format sent to API: YYYY-MM-DD                      │
  │ Error Message: "Admission date is required"          │
  │ API Field Name: admission_date                      │
  ├─────────────────────────────────────────────────────┤
  │ Field: nationality                                   │
  │ Label: "Nationality"                                │
  │ Type: text input / dropdown                         │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter nationality"                    │
  │ API Field Name: nationality                         │
  ├─────────────────────────────────────────────────────┤
  │ Field: previous_school                               │
  │ Label: "Previous School"                            │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter previous school name"           │
  │ API Field Name: previous_school                     │
  ├─────────────────────────────────────────────────────┤
  │ Field: ministry_exam_result                          │
  │ Label: "Ministry Exam Result"                       │
  │ Type: number input                                  │
  │ Required: NO (optional)                             │
  │ Min: 0                                             │
  │ Max: 100                                           │
  │ Placeholder: "Enter exam score (0-100)"            │
  │ API Field Name: ministry_exam_result                │
  └─────────────────────────────────────────────────────┘

  SECTION 4: Account Setup
  ┌─────────────────────────────────────────────────────┐
  │ Field: password                                     │
  │ Label: "Password"                                   │
  │ Type: password input                                │
  │ Required: NO (optional)                             │
  │ Note: Auto-generated if empty                       │
  │ Placeholder: "Leave empty for auto-generated"       │
  │ API Field Name: password                            │
  └─────────────────────────────────────────────────────┘

COMPLETE API PAYLOAD (what gets sent when form is submitted):
{
  "email": "string - required, valid email format",
  "full_name": "string - required, min 2 characters",
  "sex": "M | F - required",
  "date_of_birth": "YYYY-MM-DD - required",
  "phone_number": "string - optional",
  "address": "string - optional",
  "admission_date": "YYYY-MM-DD - required",
  "nationality": "string - optional",
  "previous_school": "string - optional",
  "ministry_exam_result": "number (0-100) - optional",
  "password": "string - optional, auto-generated if empty"
}

API ENDPOINT CALLED ON SUBMIT:
  POST /students

ON SUCCESS:
  - Show success toast "Student created successfully"
  - Redirect to /dashboard/students OR to /dashboard/students/[newId]
  - Invalidate students list query

ON ERROR:
  - Show error message
  - Keep form data (don't reset)
  - Highlight failed fields if validation errors returned

EDIT PAGE DIFFERENCES:
  - Route: /dashboard/students/[id]/edit
  - Pre-populate all fields with existing data
  - API: PATCH /students/{id} (not POST /students)
  - Email field is NOT editable (read-only)
  - date_of_birth is NOT editable (read-only)
  - admission_date is NOT editable (read-only)
  - Add status dropdown (active | graduated | transferred | expelled | withdrawn)
  - Add is_active toggle switch
  - Add profile_image_url field (optional)

EDIT API PAYLOAD:
{
  "full_name": "string - optional",
  "phone_number": "string - optional",
  "address": "string - optional",
  "profile_image_url": "string - optional",
  "is_active": "boolean - optional",
  "status": "string - optional (active|graduated|transferred|expelled|withdrawn)",
  "nationality": "string - optional",
  "previous_school": "string - optional",
  "ministry_exam_result": "number (0-100) - optional"
}

EDIT API ENDPOINT:
  PATCH /students/{id}

NOTES & QUESTIONS FOR BUSINESS:
  ❓ Is registration_number auto-generated or manually entered? (Not in create payload, likely auto)
  ❓ What is the minimum age for student enrollment?
  ❓ Should creating a student automatically create a user account?
  ❓ Are there any fields that cannot be edited after creation?

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE: Create Teacher
ROUTE: /dashboard/teachers/create
FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx
STATUS: ❌ MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE:
  Allow admin to create a new teacher record in the system

WHO CAN ACCESS:
  - Admin ✅
  - Director ❌
  - Registrar ❌
  - Teacher ❌
  - Student ❌
  - Guardian ❌

FORM SECTIONS & FIELDS:
(Extracted from src/lib/api/teachers.service.ts)

  SECTION 1: Personal Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: email                                         │
  │ Label: "Email"                                       │
  │ Type: email input                                   │
  │ Required: YES                                       │
  │ Validation: Valid email format                      │
  │ Error Message: "Email is required" / "Invalid email" │
  │ API Field Name: email                                │
  ├─────────────────────────────────────────────────────┤
  │ Field: full_name                                     │
  │ Label: "Full Name"                                   │
  │ Type: text input                                    │
  │ Required: YES                                       │
  │ Min Length: 2                                       │
  │ Max Length: 100                                     │
  │ Placeholder: "Enter full name"                      │
  │ Error Message: "Name must be at least 2 characters" │
  │ API Field Name: full_name                           │
  ├─────────────────────────────────────────────────────┤
  │ Field: sex                                          │
  │ Label: "Gender"                                     │
  │ Type: dropdown/radio                                │
  │ Required: YES                                       │
  │ Options:                                            │
  │   - "Male" → value: "M"                            │
  │   - "Female" → value: "F"                          │
  │ Error Message: "Please select gender"               │
  │ API Field Name: sex                                 │
  ├─────────────────────────────────────────────────────┤
  │ Field: date_of_birth                                 │
  │ Label: "Date of Birth"                              │
  │ Type: date picker                                   │
  │ Required: YES                                       │
  │ Max Date: today minus 18 years (minimum age)        │
  │ Format sent to API: YYYY-MM-DD                      │
  │ Error Message: "Date of birth is required"          │
  │ API Field Name: date_of_birth                       │
  └─────────────────────────────────────────────────────┘

  SECTION 2: Contact Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: phone_number                                  │
  │ Label: "Phone Number"                               │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter phone number"                   │
  │ API Field Name: phone_number                        │
  ├─────────────────────────────────────────────────────┤
  │ Field: address                                       │
  │ Label: "Address"                                    │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter address"                        │
  │ API Field Name: address                             │
  └─────────────────────────────────────────────────────┘

  SECTION 3: Employment Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: hire_date                                     │
  │ Label: "Hire Date"                                  │
  │ Type: date picker                                   │
  │ Required: YES                                       │
  │ Default: Today                                     │
  │ Format sent to API: YYYY-MM-DD                      │
  │ Error Message: "Hire date is required"               │
  │ API Field Name: hire_date                           │
  ├─────────────────────────────────────────────────────┤
  │ Field: qualification                                 │
  │ Label: "Qualification"                              │
  │ Type: text input / dropdown                        │
  │ Required: NO (optional)                             │
  │ Placeholder: "e.g., BA, BSc, MA, PhD"               │
  │ API Field Name: qualification                       │
  ├─────────────────────────────────────────────────────┤
  │ Field: specialization                                │
  │ Label: "Specialization"                             │
  │ Type: text input / dropdown                        │
  │ Required: NO (optional)                             │
  │ Placeholder: "e.g., Mathematics, Science, English"  │
  │ API Field Name: specialization                      │
  ├─────────────────────────────────────────────────────┤
  │ Field: office_location                               │
  │ Label: "Office Location"                            │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "e.g., Room 101, Building A"          │
  │ API Field Name: office_location                     │
  └─────────────────────────────────────────────────────┘

  SECTION 4: Emergency Contact
  ┌─────────────────────────────────────────────────────┐
  │ Field: emergency_contact_name                        │
  │ Label: "Emergency Contact Name"                     │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter emergency contact name"         │
  │ API Field Name: emergency_contact_name              │
  ├─────────────────────────────────────────────────────┤
  │ Field: emergency_contact_phone                       │
  │ Label: "Emergency Contact Phone"                    │
  │ Type: text input / phone input                     │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter emergency contact phone"       │
  │ API Field Name: emergency_contact_phone             │
  └─────────────────────────────────────────────────────┘

  SECTION 5: Account Setup
  ┌─────────────────────────────────────────────────────┐
  │ Field: password                                     │
  │ Label: "Password"                                   │
  │ Type: password input                                │
  │ Required: NO (optional)                             │
  │ Note: Auto-generated if empty                       │
  │ Placeholder: "Leave empty for auto-generated"       │
  │ API Field Name: password                            │
  └─────────────────────────────────────────────────────┘

COMPLETE API PAYLOAD (what gets sent when form is submitted):
{
  "email": "string - required, valid email format",
  "full_name": "string - required, min 2 characters",
  "sex": "M | F - required",
  "date_of_birth": "YYYY-MM-DD - required",
  "phone_number": "string - optional",
  "address": "string - optional",
  "hire_date": "YYYY-MM-DD - required",
  "qualification": "string - optional",
  "specialization": "string - optional",
  "office_location": "string - optional",
  "emergency_contact_name": "string - optional",
  "emergency_contact_phone": "string - optional",
  "password": "string - optional, auto-generated if empty"
}

API ENDPOINT CALLED ON SUBMIT:
  POST /teachers

ON SUCCESS:
  - Show success toast "Teacher created successfully"
  - Redirect to /dashboard/teachers OR to /dashboard/teachers/[newId]
  - Invalidate teachers list query

ON ERROR:
  - Show error message
  - Keep form data (don't reset)
  - Highlight failed fields if validation errors returned

EDIT PAGE DIFFERENCES:
  - Route: /dashboard/teachers/[id]/edit
  - Pre-populate all fields with existing data
  - API: PATCH /teachers/{id} (not POST /teachers)
  - Email field is NOT editable (read-only)
  - date_of_birth is NOT editable (read-only)
  - hire_date is NOT editable (read-only)
  - Add status dropdown (active | on_leave | suspended | resigned | retired)
  - Add is_active toggle switch
  - Add profile_image_url field (optional)

EDIT API PAYLOAD:
{
  "full_name": "string - optional",
  "phone_number": "string - optional",
  "address": "string - optional",
  "profile_image_url": "string - optional",
  "is_active": "boolean - optional",
  "status": "string - optional (active|on_leave|suspended|resigned|retired)",
  "qualification": "string - optional",
  "specialization": "string - optional",
  "office_location": "string - optional",
  "emergency_contact_name": "string - optional",
  "emergency_contact_phone": "string - optional"
}

EDIT API ENDPOINT:
  PATCH /teachers/{id}

NOTES & QUESTIONS FOR BUSINESS:
  ❓ Is employee_id auto-generated or manually entered? (Not in create payload, likely auto)
  ❓ What is the minimum age for teacher employment?
  ❓ Should creating a teacher automatically create a user account?
  ❓ Are there any fields that cannot be edited after creation?

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE: Create Guardian
ROUTE: /dashboard/guardians/create
FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx
STATUS: ❌ MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE:
  Allow admin to create a new guardian record in the system

WHO CAN ACCESS:
  - Admin ✅
  - Registrar ✅
  - Director ❌
  - Teacher ❌
  - Student ❌
  - Guardian ❌

FORM SECTIONS & FIELDS:
(Extracted from src/lib/api/guardians.service.ts)

  SECTION 1: Personal Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: email                                         │
  │ Label: "Email"                                       │
  │ Type: email input                                   │
  │ Required: YES                                       │
  │ Validation: Valid email format                      │
  │ Error Message: "Email is required" / "Invalid email" │
  │ API Field Name: email                                │
  ├─────────────────────────────────────────────────────┤
  │ Field: full_name                                     │
  │ Label: "Full Name"                                   │
  │ Type: text input                                    │
  │ Required: YES                                       │
  │ Min Length: 2                                       │
  │ Max Length: 100                                     │
  │ Placeholder: "Enter full name"                      │
  │ Error Message: "Name must be at least 2 characters" │
  │ API Field Name: full_name                           │
  └─────────────────────────────────────────────────────┘

  SECTION 2: Contact Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: phone_number                                  │
  │ Label: "Phone Number"                               │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter phone number"                   │
  │ API Field Name: phone_number                        │
  ├─────────────────────────────────────────────────────┤
  │ Field: address                                       │
  │ Label: "Address"                                    │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter address"                        │
  │ API Field Name: address                             │
  └─────────────────────────────────────────────────────┘

  SECTION 3: Work Information
  ┌─────────────────────────────────────────────────────┐
  │ Field: occupation                                    │
  │ Label: "Occupation"                                 │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter occupation"                    │
  │ API Field Name: occupation                          │
  ├─────────────────────────────────────────────────────┤
  │ Field: workplace                                     │
  │ Label: "Workplace"                                  │
  │ Type: text input                                    │
  │ Required: NO (optional)                             │
  │ Placeholder: "Enter workplace name/location"       │
  │ API Field Name: workplace                           │
  └─────────────────────────────────────────────────────┘

  SECTION 4: Student Links (Optional - Can link students now or later)
  ┌─────────────────────────────────────────────────────┐
  │ Field: student_links                                 │
  │ Label: "Link Students"                               │
  │ Type: dynamic list / multi-select                   │
  │ Required: NO (optional)                             │
  │ Description: Array of student links                 │
  │ Structure per link:                                 │
  │   - student_id: string/uuid (required)              │
  │   - relationship_type: string (required)             │
  │     Options: father, mother, guardian, uncle,      │
  │              aunt, grandparent, sibling, other      │
  │   - is_primary: boolean (optional, default false)  │
  │   - is_emergency_contact: boolean (optional)       │
  │   - can_pickup: boolean (optional)                  │
  │ API Field Name: student_links (array)              │
  │ Note: Can be done later via separate endpoint       │
  └─────────────────────────────────────────────────────┘

  SECTION 5: Account Setup
  ┌─────────────────────────────────────────────────────┐
  │ Field: password                                     │
  │ Label: "Password"                                   │
  │ Type: password input                                │
  │ Required: NO (optional)                             │
  │ Note: Auto-generated if empty                       │
  │ Placeholder: "Leave empty for auto-generated"       │
  │ API Field Name: password                            │
  └─────────────────────────────────────────────────────┘

COMPLETE API PAYLOAD (what gets sent when form is submitted):
{
  "email": "string - required, valid email format",
  "full_name": "string - required, min 2 characters",
  "phone_number": "string - optional",
  "address": "string - optional",
  "occupation": "string - optional",
  "workplace": "string - optional",
  "student_links": [
    {
      "student_id": "string/uuid - required",
      "relationship_type": "father|mother|guardian|uncle|aunt|grandparent|sibling|other - required",
      "is_primary": "boolean - optional, default false",
      "is_emergency_contact": "boolean - optional",
      "can_pickup": "boolean - optional"
    }
  ] - optional array,
  "password": "string - optional, auto-generated if empty"
}

API ENDPOINT CALLED ON SUBMIT:
  POST /guardians

ON SUCCESS:
  - Show success toast "Guardian created successfully"
  - Redirect to /dashboard/guardians OR to /dashboard/guardians/[newId]
  - Invalidate guardians list query

ON ERROR:
  - Show error message
  - Keep form data (don't reset)
  - Highlight failed fields if validation errors returned

EDIT PAGE DIFFERENCES:
  - Route: /dashboard/guardians/[id]/edit
  - Pre-populate all fields with existing data
  - API: PATCH /guardians/{id} (not POST /guardians)
  - Email field is NOT editable (read-only)
  - student_links is NOT in edit form (use separate link/unlink endpoints)
  - Add is_active toggle switch
  - Add profile_image_url field (optional)

EDIT API PAYLOAD:
{
  "full_name": "string - optional",
  "phone_number": "string - optional",
  "address": "string - optional",
  "profile_image_url": "string - optional",
  "is_active": "boolean - optional",
  "occupation": "string - optional",
  "workplace": "string - optional"
}

EDIT API ENDPOINT:
  PATCH /guardians/{id}

STUDENT LINKING (Separate Endpoints):
  - Link student: POST /guardians/{guardianId}/students
  - Unlink student: DELETE /guardians/{guardianId}/students/{studentId}

NOTES & QUESTIONS FOR BUSINESS:
  ❓ Should student linking be part of create form or done separately?
  ❓ Should creating a guardian automatically create a user account?
  ❓ Are there any fields that cannot be edited after creation?
  ❓ Can a guardian be linked to multiple students? (Yes, based on array structure)

---

# SUMMARY

| Page | Status | Create Route | Edit Route |
|------|--------|--------------|------------|
| User | ✅ EXISTS | /dashboard/users/create | /dashboard/users/[id]/edit |
| Student | ❌ MISSING | /dashboard/students/create | /dashboard/students/[id]/edit |
| Teacher | ❌ MISSING | /dashboard/teachers/create | /dashboard/teachers/[id]/edit |
| Guardian | ❌ MISSING | /dashboard/guardians/create | /dashboard/guardians/[id]/edit |

**Total Missing Pages: 3 (Student, Teacher, Guardian - both create and edit for each)**
