# USER WORKFLOWS DOCUMENTATION

This document provides complete user workflow specifications for the School Management System, combining user-facing instructions with technical implementation details.

---

## TABLE OF CONTENTS

- [Authentication Workflows](#authentication-workflows)
- [User Management Workflows](#user-management-workflows)
- [Student Management Workflows](#student-management-workflows)
- [Teacher Management Workflows](#teacher-management-workflows)
- [Guardian Management Workflows](#guardian-management-workflows)
- [Enrollment Workflows](#enrollment-workflows)
- [Attendance Workflows](#attendance-workflows)
- [Grade Entry Workflows](#grade-entry-workflows)
- [Payment Workflows](#payment-workflows)
- [Student Portal Workflows](#student-portal-workflows)
- [Guardian Portal Workflows](#guardian-portal-workflows)
- [Academic Structure Workflows](#academic-structure-workflows)
- [Schedule Management Workflows](#schedule-management-workflows)
- [Notification Workflows](#notification-workflows)
- [Analytics Workflows](#analytics-workflows)
- [Settings Workflows](#settings-workflows)

---

## AUTHENTICATION WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: User Registration (Self-Registration)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: New users (Guardians, Teachers, Students - if enabled)
WHEN: Creating their own account
WHERE: /register
CURRENT STATUS: ❌ NOT IMPLEMENTED

PRECONDITIONS: Self-registration enabled in settings, backend API running

STEP 1 - User navigates to registration page
  USER ACTION: Clicks "Register" link on login page
  SYSTEM ACTION: Navigates to /register
  SYSTEM CALLS: None (client-side navigation)
  USER SEES: Registration form with user type selection
  IMPLEMENTATION: ❌ NOT BUILT
  FILE TO CREATE: src/app/[locale]/(auth)/register/page.tsx

STEP 2 - User selects user type
  USER ACTION: Selects user type (Guardian/Teacher/Student)
  SYSTEM ACTION: Shows form fields based on user type
  SYSTEM CALLS: None (client-side)
  USER SEES: Form with fields relevant to selected user type
  IMPLEMENTATION: ❌ NOT BUILT

STEP 3 - User fills registration details
  USER ACTION: 
    1. Enters email (required)
    2. Enters full name (required)
    3. Enters password (required, min 8 chars)
    4. Confirms password (required)
    5. Fills additional fields based on user type (phone, address, etc.)
  SYSTEM ACTION: Validates form in real-time
  SYSTEM CALLS: None (client-side validation)
  USER SEES: Form with validation messages
  IMPLEMENTATION: ❌ NOT BUILT
  VALIDATION: 
    - Email format
    - Password min 8 chars
    - Passwords match
    - Required fields

STEP 4 - User submits registration
  USER ACTION: Clicks "Register" button
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /auth/register
  REQUEST BODY: { email, full_name, password, user_type, additional_fields }
  USER SEES: Loading spinner
  IMPLEMENTATION: ❌ NOT BUILT

STEP 5 - System processes response
  SUCCESS:
    USER SEES: "Registration successful. Please check your email to verify your account."
    SYSTEM DOES: 
      - Creates user account with status: pending_verification
      - Sends verification email
      - Creates role-specific record (guardian/teacher/student)
    USER REDIRECTS TO: /login (after showing success message)
    IMPLEMENTATION: ❌ NOT BUILT
  ERROR - Email Exists:
    USER SEES: "Email already registered. Please login."
    IMPLEMENTATION: ❌ NOT BUILT
  ERROR - Validation:
    USER SEES: Field-specific error messages
    IMPLEMENTATION: ❌ NOT BUILT

STEP 6 - User verifies email (if required)
  USER ACTION: Clicks verification link in email
  SYSTEM ACTION: Verifies email token
  SYSTEM CALLS: POST /auth/verify-email
  REQUEST BODY: { token }
  USER SEES: "Email verified successfully. You can now login."
  IMPLEMENTATION: ❌ NOT BUILT

BUSINESS RULES:
  BR-AUTH-010: Self-registration must be enabled in settings
  BR-AUTH-011: Email verification required before account activation
  BR-AUTH-012: Newly registered accounts have status: pending_verification
  BR-AUTH-013: Admin must approve self-registered accounts (if approval required)

MISSING PIECES: Registration page, user type selection, email verification, approval workflow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: User Login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: All users
WHEN: First access to system
WHERE: /login
CURRENT STATUS: ✅ 100% Implemented

PRECONDITIONS: User account exists, backend API running

STEP 1 - User navigates to login page
  USER ACTION: Opens browser, goes to application URL
  SYSTEM ACTION: Redirects to /login if not authenticated
  SYSTEM CALLS: None (client-side route check)
  USER SEES: Login form with email and password fields
  IMPLEMENTATION: ✅ Built and working
  FILE: src/app/[locale]/(auth)/login/page.tsx

STEP 2 - User enters credentials
  USER ACTION: Enters email, password, clicks "Sign In"
  SYSTEM ACTION: Validates form inputs
  SYSTEM CALLS: None (client-side validation)
  USER SEES: Email format validation, password show/hide toggle
  IMPLEMENTATION: ✅ Built and working

STEP 3 - System authenticates user
  USER ACTION: Clicks "Sign In" button
  SYSTEM ACTION: Calls login API
  SYSTEM CALLS: POST /auth/login
  REQUEST BODY: { "email": "user@example.com", "password": "plaintext" }
  USER SEES: Loading spinner on button
  IMPLEMENTATION: ✅ Built and working
  FILE: src/lib/api/auth.service.ts

STEP 4 - System processes response
  SUCCESS:
    USER SEES: Redirected to dashboard
    SYSTEM DOES: Stores tokens, user data in auth store, sets isAuthenticated = true
    SYSTEM CALLS: GET /users/me
    USER REDIRECTS TO: /dashboard (or role-specific dashboard)
    IMPLEMENTATION: ✅ Built and working
    FILE: src/lib/store/auth-store.ts
  ERROR - Invalid Credentials:
    USER SEES: Red error message "Invalid email or password"
    IMPLEMENTATION: ✅ Built and working

BUSINESS RULES:
  BR-AUTH-001: Password minimum 8 characters
  BR-AUTH-002: Email must be unique
  BR-AUTH-003: Access token expires after 15 minutes
  BR-AUTH-004: Refresh token expires after 7 days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: User Logout
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: All authenticated users
WHEN: User wants to end session
WHERE: Any page (via sidebar logout)
CURRENT STATUS: ✅ 100% Implemented

STEP 1 - User clicks logout
  USER ACTION: Clicks "Logout" in sidebar menu
  SYSTEM ACTION: Shows confirmation dialog
  USER SEES: "Are you sure you want to logout?" confirmation
  IMPLEMENTATION: ✅ Built and working

STEP 2 - User confirms logout
  USER ACTION: Clicks "Yes, logout"
  SYSTEM ACTION: Calls logout API
  SYSTEM CALLS: POST /auth/logout
  USER SEES: Loading indicator
  IMPLEMENTATION: ✅ Built and working

STEP 3 - System processes response
  SUCCESS:
    USER SEES: Redirected to login page
    SYSTEM DOES: Clears tokens, user data, invalidates all queries
    USER REDIRECTS TO: /login
    IMPLEMENTATION: ✅ Built and working

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Password Reset Request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: All users (when they forget password)
WHEN: User cannot remember password
WHERE: /forgot-password
CURRENT STATUS: ✅ 100% Implemented

STEP 1 - User navigates to forgot password page
  USER ACTION: Clicks "Forgot password?" link on login page
  SYSTEM ACTION: Navigates to /forgot-password
  USER SEES: Form with email field only
  IMPLEMENTATION: ✅ Built and working
  FILE: src/app/[locale]/(auth)/forgot-password/page.tsx

STEP 2 - User enters email
  USER ACTION: Enters email, clicks "Send Reset Link"
  SYSTEM ACTION: Validates email format
  SYSTEM CALLS: POST /auth/forgot-password
  REQUEST BODY: { "email": "user@example.com" }
  USER SEES: Loading spinner
  IMPLEMENTATION: ✅ Built and working

STEP 3 - System processes response
  SUCCESS:
    USER SEES: "Reset link sent to your email"
    SYSTEM DOES: Backend generates reset token, sends email with link
    IMPLEMENTATION: ✅ Built and working
  ERROR - Email Not Found:
    USER SEES: "If an account exists, a reset link will be sent" (security)
    IMPLEMENTATION: ✅ Built and working

BUSINESS RULES:
  BR-AUTH-005: Reset token expires after 1 hour
  BR-AUTH-006: Reset token can only be used once
  BR-AUTH-007: Don't reveal if email exists (security)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Password Reset (with Token)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: All users (after requesting reset)
WHEN: User clicks reset link from email
WHERE: /reset-password?token={token}
CURRENT STATUS: ✅ 100% Implemented

STEP 1 - User clicks reset link from email
  USER ACTION: Clicks link in email
  SYSTEM ACTION: Navigates to /reset-password with token in URL
  USER SEES: Form with new password and confirm password fields
  IMPLEMENTATION: ✅ Built and working
  FILE: src/app/[locale]/(auth)/reset-password/page.tsx

STEP 2 - User enters new password
  USER ACTION: Enters new password, confirms, clicks "Reset Password"
  SYSTEM ACTION: Validates passwords match and meet requirements
  SYSTEM CALLS: POST /auth/reset-password
  REQUEST BODY: { "token": "reset_token", "new_password": "new_password" }
  USER SEES: Password strength indicator, match validation
  IMPLEMENTATION: ✅ Built and working

STEP 3 - System processes response
  SUCCESS:
    USER SEES: "Password reset successfully"
    SYSTEM DOES: Hashes password, updates user, marks token used, revokes refresh tokens
    USER REDIRECTS TO: /login (after 3 seconds)
    IMPLEMENTATION: ✅ Built and working
  ERROR - Invalid Token:
    USER SEES: "Invalid or expired reset link"
    IMPLEMENTATION: ✅ Built and working

BUSINESS RULES:
  BR-AUTH-008: New password must be different from old password
  BR-AUTH-009: All refresh tokens revoked after password reset

---

## USER MANAGEMENT WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Admin Managing Users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin
WHEN: Managing system users
WHERE: /dashboard/users
CURRENT STATUS: ⚠️ PARTIALLY (users page exists, management unclear)

PRECONDITIONS: User logged in as Admin

STEP 1 - Admin navigates to users page
  USER ACTION: Clicks "Users" in sidebar
  SYSTEM ACTION: Navigates to /dashboard/users
  SYSTEM CALLS: GET /users
  USER SEES: List of all users with filters
  IMPLEMENTATION: ⚠️ Users page exists
  FILE: src/app/[locale]/(dashboard)/dashboard/users/page.tsx

STEP 2 - Admin filters users
  USER ACTION: 
    1. Selects role filter (All/Admin/Director/Registrar/Teacher/Student/Guardian)
    2. Selects status filter (All/Active/Inactive)
    3. Enters search term (name or email)
  SYSTEM ACTION: Filters user list
  SYSTEM CALLS: GET /users?role={role}&status={status}&search={search}
  USER SEES: Filtered user list
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - Admin views user details
  USER ACTION: Clicks on user row
  SYSTEM ACTION: Shows user detail modal
  SYSTEM CALLS: GET /users/{id}
  USER SEES: 
    - User information (name, email, phone, address)
    - Assigned roles
    - Account status (active/inactive)
    - Last login date
    - Related records (student/teacher/guardian profile)
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - Admin activates/deactivates user
  USER ACTION: Toggles "Active" switch
  SYSTEM ACTION: Updates user status
  SYSTEM CALLS: PATCH /users/{id}
  REQUEST BODY: { is_active: true/false }
  USER SEES: Switch updates, toast confirmation
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - Admin manages user roles
  USER ACTION: Clicks "Manage Roles" button
  SYSTEM ACTION: Shows role management modal
  SYSTEM CALLS: GET /roles
  USER SEES: Checkbox list of available roles
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 6 - Admin updates user roles
  USER ACTION: 
    1. Checks/unchecks role checkboxes
    2. Clicks "Save Roles"
  SYSTEM ACTION: Updates user roles
  SYSTEM CALLS: PATCH /users/{id}/roles
  REQUEST BODY: { role_names: ["admin", "teacher"] }
  USER SEES: Roles updated successfully
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 7 - Admin resets user password
  USER ACTION: Clicks "Reset Password" button
  SYSTEM ACTION: Shows password reset confirmation
  USER SEES: "Send password reset email to this user?"
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 8 - Admin confirms password reset
  USER ACTION: Clicks "Yes, send reset email"
  SYSTEM ACTION: Sends password reset email
  SYSTEM CALLS: POST /auth/admin-reset-password
  REQUEST BODY: { user_id }
  USER SEES: "Password reset email sent"
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 9 - Admin deletes user (if needed)
  USER ACTION: Clicks "Delete User" button
  SYSTEM ACTION: Shows confirmation dialog
  USER SEES: "Are you sure you want to delete this user? This action cannot be undone."
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 10 - Admin confirms deletion
  USER ACTION: Clicks "Yes, delete"
  SYSTEM ACTION: Deletes user (soft delete)
  SYSTEM CALLS: DELETE /users/{id}
  USER SEES: "User deleted successfully"
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-USR-001: Only Admin can manage users
  BR-USR-002: Admin cannot delete themselves
  BR-USR-003: At least one Admin must exist in system
  BR-USR-004: Password reset email uses same flow as forgot password
  BR-USR-005: Role changes take effect immediately (no re-login required)
  BR-USR-006: Deactivated users cannot login

MISSING PIECES: User filtering, role management modal, password reset, user deletion, detail view

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create New Student
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Registrar
WHEN: New student enrolls in school
WHERE: /dashboard/students/create
CURRENT STATUS: ❌ NOT IMPLEMENTED

PRECONDITIONS: User logged in as Admin/Registrar, academic year exists

STEP 1 - User navigates to create student page
  USER ACTION: Clicks "Students" → "Create Student"
  SYSTEM ACTION: Navigates to /dashboard/students/create
  USER SEES: Empty student creation form
  IMPLEMENTATION: ❌ NOT BUILT
  FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/students/create/page.tsx

STEP 2 - User fills personal information
  USER ACTION: Enters email (required), full name (required, min 2), gender (M/F), DOB (required)
  SYSTEM ACTION: Validates fields in real-time
  USER SEES: Email validation, name length validation, date picker, gender radio buttons
  IMPLEMENTATION: ❌ NOT BUILT
  VALIDATION: Email format, name min 2 chars, DOB >= 5 years before admission

STEP 3 - User fills contact information
  USER ACTION: Enters phone number (optional), address (optional)
  SYSTEM ACTION: No validation for optional fields
  USER SEES: Text input fields
  IMPLEMENTATION: ❌ NOT BUILT

STEP 4 - User fills academic information
  USER ACTION: Selects admission date (required, defaults today), nationality (optional), previous school (optional), ministry exam result (optional, 0-100)
  SYSTEM ACTION: Validates required fields
  USER SEES: Date picker, text inputs
  IMPLEMENTATION: ❌ NOT BUILT

STEP 5 - User sets account password (optional)
  USER ACTION: Enters password or leaves empty for auto-generation
  SYSTEM ACTION: Will auto-generate if empty
  USER SEES: Password field with helper text
  IMPLEMENTATION: ❌ NOT BUILT

STEP 6 - User submits form
  USER ACTION: Clicks "Create Student"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /students
  REQUEST BODY: { email, full_name, sex, date_of_birth, phone_number, address, admission_date, nationality, previous_school, ministry_exam_result, password }
  USER SEES: Loading spinner
  IMPLEMENTATION: ❌ NOT BUILT

STEP 7 - System processes response
  SUCCESS:
    USER SEES: Green toast "Student created successfully"
    SYSTEM DOES: Creates user account, student record, generates registration number (auto)
    USER REDIRECTS TO: /dashboard/students
    IMPLEMENTATION: ❌ NOT BUILT
  ERROR - Email Exists:
    USER SEES: "Email already exists"
    IMPLEMENTATION: ❌ NOT BUILT

BUSINESS RULES:
  BR-STU-001: Minimum age 5 years for enrollment
  BR-STU-002: Registration number auto-generated by backend
  BR-STU-003: Email must be unique

MISSING PIECES: Create student page, form validation, success/error handling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Edit Student
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Registrar
WHEN: Student information needs updating
WHERE: /dashboard/students/{id}/edit
CURRENT STATUS: ❌ NOT IMPLEMENTED

PRECONDITIONS: User logged in as Admin/Registrar, student record exists

STEP 1 - User navigates to student edit page
  USER ACTION: Clicks "Students" → student row → "Edit"
  SYSTEM ACTION: Navigates to /dashboard/students/{id}/edit
  SYSTEM CALLS: GET /students/{id}
  USER SEES: Pre-populated edit form
  IMPLEMENTATION: ❌ NOT BUILT
  FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/students/{id}/edit/page.tsx

STEP 2 - System loads student data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches student details
  SYSTEM CALLS: GET /students/{id}
  USER SEES: All fields pre-populated with existing data
  IMPLEMENTATION: ❌ NOT BUILT

STEP 3 - User modifies fields
  USER ACTION: Updates any editable fields
  SYSTEM ACTION: Tracks changes
  USER SEES: Form with current values
  READ-ONLY FIELDS: email, date_of_birth, admission_date, registration_number
  IMPLEMENTATION: ❌ NOT BUILT

STEP 4 - User submits changes
  USER ACTION: Clicks "Save Changes"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: PATCH /students/{id}
  REQUEST BODY: { full_name, phone_number, address, nationality, previous_school, ministry_exam_result, status, is_active }
  USER SEES: Loading spinner
  IMPLEMENTATION: ❌ NOT BUILT

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Student updated successfully"
    USER REDIRECTS TO: /dashboard/students/{id}
    IMPLEMENTATION: ❌ NOT BUILT

BUSINESS RULES:
  BR-STU-004: Email, DOB, admission_date cannot be edited
  BR-STU-005: Registration number is read-only
  BR-STU-006: Status can be changed (active/graduated/transferred/expelled/withdrawn)

MISSING PIECES: Edit student page, read-only field enforcement, status dropdown

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Delete Student (Soft Delete)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin only
WHEN: Student record needs to be removed
WHERE: /dashboard/students/{id}
CURRENT STATUS: ⚠️ PARTIALLY (delete button exists, implementation unclear)

PRECONDITIONS: User logged in as Admin, student record exists

STEP 1 - User navigates to student detail page
  USER ACTION: Clicks "Students" → student row
  SYSTEM ACTION: Navigates to /dashboard/students/{id}
  SYSTEM CALLS: GET /students/{id}
  USER SEES: Student detail page with actions
  IMPLEMENTATION: ⚠️ Student detail page exists
  FILE: src/app/[locale]/(dashboard)/dashboard/students/{id}/page.tsx

STEP 2 - User clicks delete button
  USER ACTION: Clicks "Delete" button
  SYSTEM ACTION: Shows confirmation dialog
  USER SEES: "Are you sure you want to delete this student?"
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User confirms deletion
  USER ACTION: Clicks "Yes, delete"
  SYSTEM ACTION: Calls delete API
  SYSTEM CALLS: DELETE /students/{id}
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - System processes response
  SUCCESS:
    USER SEES: Green toast "Student deleted successfully"
    SYSTEM DOES: Sets is_active = false, deleted_at = current timestamp (soft delete)
    USER REDIRECTS TO: /dashboard/students
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-STU-007: Only Admin can delete students
  BR-STU-008: Deletion is soft delete (is_active = false, deleted_at set)
  BR-STU-009: Deleted students can be restored via restore endpoint

MISSING PIECES: Delete confirmation dialog, delete API call, success/error handling

---

## TEACHER MANAGEMENT WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create New Teacher
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: New teacher hired
WHERE: /dashboard/teachers/create
CURRENT STATUS: ❌ NOT IMPLEMENTED

PRECONDITIONS: User logged in as Admin/Director

STEP 1 - User navigates to create teacher page
  USER ACTION: Clicks "Teachers" → "Create Teacher"
  SYSTEM ACTION: Navigates to /dashboard/teachers/create
  USER SEES: Empty teacher creation form
  IMPLEMENTATION: ❌ NOT BUILT
  FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/teachers/create/page.tsx

STEP 2 - User fills personal information
  USER ACTION: Enters email (required), full name (required, min 2), gender (M/F), DOB (required)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ❌ NOT BUILT
  VALIDATION: Email format, name min 2 chars, DOB >= 18 years before hire date

STEP 3 - User fills contact information
  USER ACTION: Enters phone number (optional), address (optional)
  SYSTEM ACTION: No validation
  USER SEES: Text input fields
  IMPLEMENTATION: ❌ NOT BUILT

STEP 4 - User fills employment information
  USER ACTION: Selects hire date (required, defaults today), qualification (optional), specialization (optional), office location (optional)
  SYSTEM ACTION: Validates required fields
  USER SEES: Date picker, text inputs
  IMPLEMENTATION: ❌ NOT BUILT

STEP 5 - User fills emergency contact
  USER ACTION: Enters emergency contact name (optional), emergency contact phone (optional)
  SYSTEM ACTION: No validation
  USER SEES: Text input fields
  IMPLEMENTATION: ❌ NOT BUILT

STEP 6 - User sets account password (optional)
  USER ACTION: Enters password or leaves empty
  SYSTEM ACTION: Will auto-generate if empty
  USER SEES: Password field with helper text
  IMPLEMENTATION: ❌ NOT BUILT

STEP 7 - User submits form
  USER ACTION: Clicks "Create Teacher"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /teachers
  REQUEST BODY: { email, full_name, sex, date_of_birth, phone_number, address, hire_date, qualification, specialization, office_location, emergency_contact_name, emergency_contact_phone, password }
  USER SEES: Loading spinner
  IMPLEMENTATION: ❌ NOT BUILT

STEP 8 - System processes response
  SUCCESS:
    USER SEES: Green toast "Teacher created successfully"
    SYSTEM DOES: Creates user account, teacher record, generates employee ID (auto)
    USER REDIRECTS TO: /dashboard/teachers
    IMPLEMENTATION: ❌ NOT BUILT

BUSINESS RULES:
  BR-TCH-001: Minimum age 18 years for employment
  BR-TCH-002: Employee ID auto-generated by backend
  BR-TCH-003: Email must be unique

MISSING PIECES: Create teacher page, form validation, success/error handling

---

## GUARDIAN MANAGEMENT WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create New Guardian
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Registrar
WHEN: New guardian needs account
WHERE: /dashboard/guardians/create
CURRENT STATUS: ❌ NOT IMPLEMENTED

PRECONDITIONS: User logged in as Admin/Registrar, student records exist

STEP 1 - User navigates to create guardian page
  USER ACTION: Clicks "Guardians" → "Create Guardian"
  SYSTEM ACTION: Navigates to /dashboard/guardians/create
  USER SEES: Empty guardian creation form
  IMPLEMENTATION: ❌ NOT BUILT
  FILE TO CREATE: src/app/[locale]/(dashboard)/dashboard/guardians/create/page.tsx

STEP 2 - User fills personal information
  USER ACTION: Enters email (required), full name (required, min 2)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ❌ NOT BUILT

STEP 3 - User fills contact information
  USER ACTION: Enters phone number (optional), address (optional)
  SYSTEM ACTION: No validation
  USER SEES: Text input fields
  IMPLEMENTATION: ❌ NOT BUILT

STEP 4 - User fills work information
  USER ACTION: Enters occupation (optional), workplace (optional)
  SYSTEM ACTION: No validation
  USER SEES: Text input fields
  IMPLEMENTATION: ❌ NOT BUILT

STEP 5 - User links students (optional)
  USER ACTION: Clicks "Add Student", selects student, selects relationship type, toggles flags
  SYSTEM ACTION: Builds student_links array
  SYSTEM CALLS: GET /students (to populate dropdown)
  USER SEES: Dynamic list of linked students
  IMPLEMENTATION: ❌ NOT BUILT
  RELATIONSHIP OPTIONS: father, mother, guardian, uncle, aunt, grandparent, sibling, other

STEP 6 - User sets account password (optional)
  USER ACTION: Enters password or leaves empty
  SYSTEM ACTION: Will auto-generate if empty
  USER SEES: Password field with helper text
  IMPLEMENTATION: ❌ NOT BUILT

STEP 7 - User submits form
  USER ACTION: Clicks "Create Guardian"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /guardians
  REQUEST BODY: { email, full_name, phone_number, address, occupation, workplace, student_links: [{ student_id, relationship_type, is_primary, is_emergency_contact, can_pickup }], password }
  USER SEES: Loading spinner
  IMPLEMENTATION: ❌ NOT BUILT

STEP 8 - System processes response
  SUCCESS:
    USER SEES: Green toast "Guardian created successfully"
    SYSTEM DOES: Creates user account, guardian record, links students
    USER REDIRECTS TO: /dashboard/guardians
    IMPLEMENTATION: ❌ NOT BUILT

BUSINESS RULES:
  BR-GUA-001: Email must be unique
  BR-GUA-002: Student linking is optional
  BR-GUA-003: One guardian can be linked to multiple students
  BR-GUA-004: One student can have multiple guardians

MISSING PIECES: Create guardian page, student linking UI, success/error handling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Link Student to Guardian
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Registrar
WHEN: Guardian needs to be linked to additional student
WHERE: /dashboard/guardians/{id}
CURRENT STATUS: ❌ NOT IMPLEMENTED

PRECONDITIONS: User logged in as Admin/Registrar, guardian and student records exist

STEP 1 - User navigates to guardian detail page
  USER ACTION: Clicks "Guardians" → guardian row
  SYSTEM ACTION: Navigates to /dashboard/guardians/{id}
  SYSTEM CALLS: GET /guardians/{id}
  USER SEES: Guardian detail with linked students list
  IMPLEMENTATION: ⚠️ Guardian detail page exists
  FILE: src/app/[locale]/(dashboard)/dashboard/guardians/{id}/page.tsx

STEP 2 - User clicks "Link Student" button
  USER ACTION: Clicks "Link Student"
  SYSTEM ACTION: Shows link student modal
  SYSTEM CALLS: GET /students (to populate dropdown)
  USER SEES: Modal with student dropdown and relationship type
  IMPLEMENTATION: ❌ NOT BUILT

STEP 3 - User selects student and relationship
  USER ACTION: Selects student, relationship type, toggles flags, clicks "Link"
  SYSTEM ACTION: Calls link student API
  SYSTEM CALLS: POST /guardians/{guardianId}/students
  REQUEST BODY: { student_id, relationship_type, is_primary, is_emergency_contact, can_pickup }
  USER SEES: Loading indicator
  IMPLEMENTATION: ❌ NOT BUILT

STEP 4 - System processes response
  SUCCESS:
    USER SEES: Green toast "Student linked successfully"
    SYSTEM DOES: Creates guardian_students record
    USER STAYS ON: Same page
    IMPLEMENTATION: ❌ NOT BUILT

BUSINESS RULES:
  BR-GUA-005: Same student cannot be linked twice to same guardian
  BR-GUA-006: Relationship type is required

MISSING PIECES: Link student modal, API call, success/error handling

---

## ENROLLMENT WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Enroll Student in Class
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Registrar
WHEN: Student needs to be enrolled in a class
WHERE: /dashboard/enrollments
CURRENT STATUS: ⚠️ PARTIALLY (enrollments page exists, enrollment flow unclear)

PRECONDITIONS: User logged in as Admin/Registrar, student, academic year, class, section exist

STEP 1 - User navigates to enrollments page
  USER ACTION: Clicks "Enrollments" in sidebar
  SYSTEM ACTION: Navigates to /dashboard/enrollments
  SYSTEM CALLS: GET /enrollments
  USER SEES: List of all enrollments
  IMPLEMENTATION: ⚠️ Enrollments page exists
  FILE: src/app/[locale]/(dashboard)/dashboard/enrollments/page.tsx

STEP 2 - User clicks "Enroll Student" button
  USER ACTION: Clicks "Enroll Student"
  SYSTEM ACTION: Shows enrollment form modal
  SYSTEM CALLS: GET /academic-years, GET /students
  USER SEES: Modal with dropdowns
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User selects enrollment details
  USER ACTION: Selects academic year, student, class (filtered by year), section (filtered by class), enrollment date (defaults today)
  SYSTEM ACTION: Cascading dropdown filtering
  SYSTEM CALLS: GET /classes?academicYearId={id}, GET /sections?classId={id}
  USER SEES: Filtered dropdowns
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - User submits enrollment
  USER ACTION: Clicks "Enroll"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /enrollments
  REQUEST BODY: { student_id, academic_year_id, class_id, section_id, enrollment_date }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Student enrolled successfully"
    SYSTEM DOES: Creates enrollment record
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Already Enrolled:
    USER SEES: "Student already enrolled in this academic year"
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Section Full:
    USER SEES: "Section is at full capacity"
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ENR-001: Student can have only one active enrollment per academic year
  BR-ENR-002: Section capacity check before enrollment
  BR-ENR-003: Enrollment date defaults to today

MISSING PIECES: Enrollment modal, cascading dropdown filtering, capacity check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Transfer Student
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Registrar
WHEN: Student moves to different class/section
WHERE: /dashboard/enrollments (via enrollment actions)
CURRENT STATUS: ⚠️ PARTIALLY (transfer schema exists in types)

PRECONDITIONS: User logged in as Admin/Registrar, student has active enrollment

STEP 1 - User navigates to enrollment
  USER ACTION: Clicks "Enrollments", finds student's enrollment
  SYSTEM ACTION: Shows enrollment list
  SYSTEM CALLS: GET /enrollments
  USER SEES: Enrollment list with actions
  IMPLEMENTATION: ⚠️ Enrollments page exists

STEP 2 - User clicks "Transfer" button
  USER ACTION: Clicks "Transfer" on enrollment row
  SYSTEM ACTION: Shows transfer modal
  SYSTEM CALLS: GET /classes, GET /sections
  USER SEES: Modal with new class/section selection and reason field
  IMPLEMENTATION: ⚠️ Transfer schema exists
  FILE: src/features/enrollments/types/schemas.ts

STEP 3 - User enters transfer details
  USER ACTION: 
    1. Selects new class (required)
    2. Selects new section (required, filtered by class)
    3. Selects transfer date (required, defaults to today)
    4. Enters transfer reason (optional)
  SYSTEM ACTION: Validates selections
  SYSTEM CALLS: GET /sections?classId={id}
  USER SEES: Date picker, filtered dropdowns, text area for reason
  IMPLEMENTATION: ⚠️ Schema exists, UI unclear

STEP 4 - User confirms transfer
  USER ACTION: Clicks "Transfer" button
  SYSTEM ACTION: Calls transfer API
  SYSTEM CALLS: PATCH /enrollments/{id}/transfer
  REQUEST BODY: { new_class_id, new_section_id, transfer_date, reason }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Student transferred successfully"
    SYSTEM DOES: 
      - Updates enrollment with new class/section
      - Sets transfer_date
      - Sets transfer_reason
      - Records previous class/section in history
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Outstanding Fees:
    USER SEES: "Cannot transfer student with outstanding fees"
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Section Full:
    USER SEES: "Target section is at full capacity"
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ENR-007: Transfer date defaults to today
  BR-ENR-008: Cannot transfer with outstanding fee balance
  BR-ENR-009: Target section must have capacity
  BR-ENR-010: Transfer history is preserved

MISSING PIECES: Transfer modal UI, API call, fee check, capacity check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Withdraw Student
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Registrar
WHEN: Student leaves school voluntarily
WHERE: /dashboard/enrollments
CURRENT STATUS: ⚠️ PARTIALLY (withdrawal schema exists in types)

PRECONDITIONS: User logged in as Admin/Registrar, student has active enrollment

STEP 1 - User navigates to enrollment
  USER ACTION: Clicks "Enrollments", finds student's enrollment
  SYSTEM ACTION: Shows enrollment list
  SYSTEM CALLS: GET /enrollments
  USER SEES: Enrollment list with actions
  IMPLEMENTATION: ⚠️ Enrollments page exists

STEP 2 - User clicks "Withdraw" button
  USER ACTION: Clicks "Withdraw" on enrollment row
  SYSTEM ACTION: Shows withdrawal modal
  USER SEES: Modal with withdrawal date and reason fields
  IMPLEMENTATION: ⚠️ Withdrawal schema exists
  FILE: src/features/enrollments/types/schemas.ts

STEP 3 - User enters withdrawal details
  USER ACTION: Selects withdrawal date (defaults today), enters withdrawal reason (required, min 5 chars)
  SYSTEM ACTION: Validates reason length
  USER SEES: Date picker and text area
  IMPLEMENTATION: ⚠️ Schema exists, UI unclear

STEP 4 - User confirms withdrawal
  USER ACTION: Clicks "Withdraw"
  SYSTEM ACTION: Calls withdrawal API
  SYSTEM CALLS: PATCH /enrollments/{id}/withdraw
  REQUEST BODY: { withdrawal_date, reason }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Student withdrawn successfully"
    SYSTEM DOES: Updates enrollment status to 'withdrawn', sets withdrawal_date and withdrawal_reason
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Outstanding Fees:
    USER SEES: "Cannot withdraw student with outstanding fees"
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ENR-004: Withdrawal reason required (min 5 characters)
  BR-ENR-005: Cannot withdraw with outstanding fee balance
  BR-ENR-006: Withdrawal date defaults to today

MISSING PIECES: Withdrawal modal UI, API call, fee check

---

## ATTENDANCE WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Taking Attendance for a Class (Manual)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Teacher
WHEN: Every class period
WHERE: /dashboard/attendance
CURRENT STATUS: ⚠️ 70% Implemented

PRECONDITIONS: Teacher logged in, academic year active, students enrolled, teacher assigned to section

STEP 1 - Teacher navigates to Attendance page
  USER ACTION: Clicks "Attendance" in sidebar
  SYSTEM ACTION: Loads /dashboard/attendance page
  USER SEES: Attendance method selector (Manual / Face Scan / Barcode)
  IMPLEMENTATION: ✅ Built and working
  FILE: src/app/[locale]/(dashboard)/dashboard/attendance/page.tsx

STEP 2 - Teacher selects "Manual Entry" method
  USER ACTION: Clicks "Manual Entry" tab
  SYSTEM ACTION: Shows filter dropdowns
  SYSTEM CALLS: GET /academic-years, GET /classes?yearId={id}
  USER SEES: Dropdowns for Academic Year, Class, Section, Date
  IMPLEMENTATION: ✅ Built and working
  FILE: src/features/attendance/components/ManualAttendance.tsx

STEP 3 - Teacher selects class and section
  USER ACTION: Selects Academic Year, Class, Section, Date
  SYSTEM ACTION: Cascading dropdown filtering, loads student roster
  SYSTEM CALLS: GET /sections?classId={id}, GET /attendance/section/{sectionId}?date={date}
  USER SEES: List of students with status buttons, pre-populated if attendance exists
  IMPLEMENTATION: ✅ Built and working
  BUSINESS RULE: If attendance exists, load existing records (edit mode)

STEP 4 - Teacher marks attendance for each student
  USER ACTION: Clicks Present/Absent/Late/Excused for each student OR clicks "Mark All Present"
  SYSTEM ACTION: Updates local state only
  USER SEES: Selected status highlights, real-time stats update, progress indicator
  IMPLEMENTATION: ✅ Built and working
  COLORS: Present=Green, Absent=Red, Late=Yellow, Excused=Blue

STEP 5 - Teacher submits attendance
  USER ACTION: Clicks "Save Attendance"
  SYSTEM ACTION: Validates all students have status
  SYSTEM CALLS: POST /attendance/bulk
  REQUEST BODY: { sectionId, date, academicYearId, termId, records: [{ studentId, status, note }] }
  USER SEES: Loading spinner
  IMPLEMENTATION: ✅ Built and working

STEP 6 - System processes response
  SUCCESS:
    USER SEES: Green toast "Attendance saved successfully"
    SYSTEM DOES: Invalidates attendance cache
    USER STAYS ON: Same page
    IMPLEMENTATION: ✅ Built and working
  ERROR - Validation:
    USER SEES: "Please mark all students before submitting"
    IMPLEMENTATION: ✅ Built and working
  ERROR - Already Submitted:
    EXPECTED: System should handle duplicate submission
    IMPLEMENTATION: ⚠️ Unclear - needs verification

ALTERNATIVE FLOW A - Face Recognition (Currently Broken):
  STATUS: ❌ UI exists but face-api.js not connected
  BLOCKED BY: face-api.js integration incomplete

MISSING PIECES: Face recognition implementation, attendance edit after submission clarification, barcode scanner, PDF export

BUSINESS RULES:
  BR-ATT-001: Only teachers assigned to section can submit attendance
  BR-ATT-002: Attendance only for past dates and today
  BR-ATT-003: Late threshold configurable in settings (default 8AM)
  BR-ATT-004: Rate calculation: (present + excused) / total * 100

---

## GRADE ENTRY WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Teacher, Admin
WHEN: Teacher needs to create new test/quiz/exam
WHERE: /dashboard/grades (teacher portal)
CURRENT STATUS: ⚠️ PARTIALLY (teacher portal has grade entry, assessment creation unclear)

PRECONDITIONS: User logged in as Teacher/Admin, section, subject, term exist

STEP 1 - Teacher navigates to grades page
  USER ACTION: Clicks "Grades" in teacher sidebar
  SYSTEM ACTION: Loads teacher grades page
  SYSTEM CALLS: GET /teacher/classes
  USER SEES: List of assigned classes and assessments
  IMPLEMENTATION: ⚠️ Teacher grade entry exists
  FILE: src/features/teacher/components/TeacherGradeEntry.tsx

STEP 2 - Teacher clicks "Create Assessment" button
  USER ACTION: Clicks "Create Assessment"
  SYSTEM ACTION: Shows assessment creation modal
  SYSTEM CALLS: GET /subjects, GET /terms
  USER SEES: Modal with assessment fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - Teacher fills assessment details
  USER ACTION: Enters name (required), selects type (quiz/test/midterm/final/assignment/project), selects subject (required), selects term (required), selects date (optional), enters max score (required), enters weight (required, default 1.0)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - Teacher submits assessment
  USER ACTION: Clicks "Create Assessment"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /academics/assessments
  REQUEST BODY: { section_id, subject_id, term_id, name, type, date, max_score, weight }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Assessment created successfully"
    SYSTEM DOES: Creates assessment record
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-GRD-001: Assessment type: quiz, test, midterm, final, assignment, project
  BR-GRD-002: Max score must be positive
  BR-GRD-003: Weight must be positive
  BR-GRD-004: Assessment date within term dates if provided

MISSING PIECES: Assessment creation modal, form validation, success/error handling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Generate Report Card
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director, Teacher, Student, Guardian
WHEN: End of term or on demand
WHERE: /dashboard/grades/report-card or /student/my-grades
CURRENT STATUS: ⚠️ PARTIALLY (report card component exists)

PRECONDITIONS: Student has grades for current term, term is active

STEP 1 - User navigates to report card generation
  USER ACTION: 
    - Admin/Director/Teacher: Clicks "Report Cards" in sidebar
    - Student: Clicks "My Grades" → "View Report Card"
    - Guardian: Clicks child → "Grades" → "View Report Card"
  SYSTEM ACTION: Navigates to report card page
  SYSTEM CALLS: GET /grades/report-card?studentId={id}&termId={id}
  USER SEES: Report card selection form
  IMPLEMENTATION: ⚠️ Report card component exists
  FILE: src/features/student-portal/components/StudentReportCard.tsx

STEP 2 - User selects report card parameters
  USER ACTION: 
    1. Selects student (if Admin/Director/Teacher)
    2. Selects term (required)
    3. Selects academic year (required)
  SYSTEM ACTION: Filters available options
  SYSTEM CALLS: GET /students, GET /terms, GET /academic-years
  USER SEES: Dropdowns for selection
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User generates report card
  USER ACTION: Clicks "Generate Report Card" button
  SYSTEM ACTION: Fetches report card data
  SYSTEM CALLS: GET /grades/report-card/{studentId}?termId={termId}
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - System loads report card data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Aggregates grades, calculates averages
  SYSTEM CALLS: GET /grades/student/{id}/summary, GET /grades/report-card/{id}
  USER SEES: 
    - Student information (name, class, section, term)
    - Subject-wise grades with letter grades
    - Overall average and letter grade
    - Attendance summary
    - Teacher remarks
    - Principal remarks
  IMPLEMENTATION: ⚠️ Report card component exists

STEP 5 - User exports/print report card
  USER ACTION: Clicks "Download PDF" or "Print" button
  SYSTEM ACTION: Generates PDF or opens print dialog
  SYSTEM CALLS: GET /grades/report-card/{id}/pdf
  USER SEES: PDF download or print dialog
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 6 - Admin adds remarks (if Admin/Director)
  USER ACTION: 
    1. Enters teacher remarks (optional)
    2. Enters principal remarks (optional)
    3. Clicks "Save Remarks"
  SYSTEM ACTION: Saves remarks to report card
  SYSTEM CALLS: PATCH /grades/report-card/{id}/remarks
  REQUEST BODY: { teacher_remarks, principal_remarks }
  USER SEES: Remarks saved successfully
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-GRD-009: Report card shows grades for selected term only
  BR-GRD-010: Overall average calculated from all subject averages
  BR-GRD-011: Letter grade assigned based on grading scale settings
  BR-GRD-012: Attendance summary included on report card
  BR-GRD-013: Students can only view their own report cards
  BR-GRD-014: Guardians can only view report cards for linked children

MISSING PIECES: Report card parameter selection, PDF generation, remarks saving, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Enter Grades for Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Teacher, Admin
WHEN: Assessment completed and needs grading
WHERE: /dashboard/grades (teacher portal)
CURRENT STATUS: ⚠️ PARTIALLY (grade entry grid exists)

PRECONDITIONS: User logged in as Teacher/Admin, assessment exists, students enrolled

STEP 1 - Teacher navigates to grades page
  USER ACTION: Clicks "Grades" in teacher sidebar
  SYSTEM ACTION: Loads teacher grades page
  SYSTEM CALLS: GET /teacher/assessments
  USER SEES: List of assessments
  IMPLEMENTATION: ⚠️ Teacher grade entry exists

STEP 2 - Teacher selects assessment
  USER ACTION: Clicks on assessment row
  SYSTEM ACTION: Loads grade entry grid
  SYSTEM CALLS: GET /grades/assessment/{assessmentId}
  USER SEES: List of students with score inputs, max score displayed
  IMPLEMENTATION: ⚠️ Grade entry grid exists
  FILE: src/features/grades/components/GradeEntryGrid.tsx

STEP 3 - Teacher enters scores
  USER ACTION: Enters score for each student, optionally enters comment
  SYSTEM ACTION: Validates scores against max_score
  USER SEES: Score inputs with validation, percentage auto-calculated, letter grade auto-calculated
  IMPLEMENTATION: ⚠️ Grade entry grid exists
  VALIDATION: Score cannot exceed max_score

STEP 4 - Teacher submits grades
  USER ACTION: Clicks "Save Grades"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /grades/bulk
  REQUEST BODY: { assessment_id, entries: [{ student_id, score, comment }] }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Grades saved successfully"
    SYSTEM DOES: Creates grade records, calculates percentage, calculates letter grade
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Score Exceeds Max:
    USER SEES: "Score cannot exceed maximum score"
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-GRD-005: Score cannot exceed assessment max_score
  BR-GRD-006: Percentage = (score / max_score) * 100
  BR-GRD-007: Letter grade from grading_scale settings
  BR-GRD-008: Only teachers assigned to section can enter grades

MISSING PIECES: Grade submission API, auto-calculation of percentage/letter grade, success/error handling

---

## PAYMENT WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: View Student Fees (Guardian)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Guardian
WHEN: Guardian wants to see child's fee status
WHERE: /guardian/payments
CURRENT STATUS: ⚠️ PARTIALLY (guardian payments page exists)

PRECONDITIONS: Guardian logged in, linked to student

STEP 1 - Guardian navigates to payments page
  USER ACTION: Clicks "Payments" in guardian sidebar
  SYSTEM ACTION: Loads guardian payments page
  SYSTEM CALLS: GET /guardian-portal/children
  USER SEES: List of linked children with fee summary
  IMPLEMENTATION: ⚠️ Guardian payments page exists
  FILE: src/features/guardian-portal/components/GuardianPaymentsPage.tsx

STEP 2 - Guardian selects child
  USER ACTION: Clicks on child row
  SYSTEM ACTION: Loads child's fee details
  SYSTEM CALLS: GET /payments/student/{studentId}/fees
  USER SEES: List of fees for current academic year, fee type, amount, due date, status, total balance
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - Guardian views fee details
  USER ACTION: Clicks on fee row
  SYSTEM ACTION: Shows fee breakdown
  SYSTEM CALLS: GET /payments/transactions?studentId={id}
  USER SEES: Payment history, amount paid, payment method, date
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-PAY-001: Guardians can only view fees for linked children
  BR-PAY-002: Fee status: paid, partial, unpaid, overdue
  BR-PAY-003: Overdue if due_date < today AND balance > 0

MISSING PIECES: Child selection, fee details display, payment history display

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Initiate Payment via Chapa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Guardian
WHEN: Guardian wants to pay fees
WHERE: /guardian/payments
CURRENT STATUS: ⚠️ PARTIALLY (Chapa modal exists)

PRECONDITIONS: Guardian logged in, linked to student, student has unpaid fees, Chapa configured

STEP 1 - Guardian clicks "Pay Now" button
  USER ACTION: Clicks "Pay Now" on fee row
  SYSTEM ACTION: Opens Chapa payment modal
  USER SEES: Payment modal with amount and payment methods
  IMPLEMENTATION: ⚠️ Chapa modal exists
  FILE: src/features/payments/components/ChapaPaymentModal.tsx

STEP 2 - Guardian selects payment method
  USER ACTION: Selects payment method (Telebirr, CBE Birr, M-Pesa), enters phone number if required
  SYSTEM ACTION: Validates phone number format
  USER SEES: Payment method options
  IMPLEMENTATION: ⚠️ Chapa modal exists

STEP 3 - Guardian confirms payment
  USER ACTION: Clicks "Pay Now"
  SYSTEM ACTION: Initiates Chapa payment
  SYSTEM CALLS: POST /payments/initiate
  REQUEST BODY: { student_id, student_fee_id, amount, payment_method, phone_number }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - System processes response
  SUCCESS:
    USER SEES: Redirected to Chapa checkout page
    SYSTEM DOES: Creates payment transaction (status: pending), calls Chapa API, returns checkout_url
    CHAPA RESPONSE: { checkout_url, payment_reference }
    USER REDIRECTS TO: Chapa checkout_url
    IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - User completes payment on Chapa
  USER ACTION: Completes payment on Chapa checkout
  SYSTEM ACTION: Chapa webhook calls backend
  SYSTEM CALLS (Webhook): POST /webhooks/chapa/callback
  CHAPA PAYLOAD: { payment_reference, status, amount }
  SYSTEM DOES: Updates transaction status to completed, updates student_fee amount_paid and balance, updates student_fee status
  IMPLEMENTATION: ❌ Webhook not implemented

STEP 6 - Guardian redirected back
  USER ACTION: Chapa redirects back to app
  SYSTEM ACTION: Shows payment success page
  SYSTEM CALLS: GET /payments/transactions/{reference}
  USER SEES: "Payment successful" confirmation
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-PAY-004: Payment reference must be unique
  BR-PAY-005: Payment amount must match fee balance
  BR-PAY-006: Webhook must verify Chapa signature
  BR-PAY-007: Transaction status: pending, completed, failed, refunded

MISSING PIECES: Payment initiation API, Chapa redirect handling, webhook endpoint, payment success confirmation

---

## STUDENT PORTAL WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Student View Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Student
WHEN: Student logs in to portal
WHERE: /student
CURRENT STATUS: ⚠️ PARTIALLY (student portal exists)

PRECONDITIONS: Student logged in, has active enrollment

STEP 1 - Student logs in
  USER ACTION: Enters credentials, clicks Sign In
  SYSTEM ACTION: Authenticates and redirects to student portal
  SYSTEM CALLS: POST /auth/login, GET /users/me
  USER SEES: Student dashboard
  IMPLEMENTATION: ⚠️ Student portal exists
  FILE: src/features/student-portal/components/StudentDashboardHome.tsx

STEP 2 - System loads dashboard data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches dashboard data
  SYSTEM CALLS: GET /student-portal/dashboard
  USER SEES: Welcome message, attendance summary card, grades summary card, upcoming schedule, recent announcements
  IMPLEMENTATION: ⚠️ Dashboard components exist

STEP 3 - Student views attendance summary
  USER ACTION: Views attendance card
  SYSTEM ACTION: Displays attendance rate
  SYSTEM CALLS: GET /attendance/student/{id}/summary
  USER SEES: Attendance percentage, total days, present, absent, late, excused, warning if below threshold
  IMPLEMENTATION: ⚠️ Attendance summary card exists
  FILE: src/features/student-portal/components/AttendanceSummaryCard.tsx

STEP 4 - Student views grades summary
  USER ACTION: Views grades card
  SYSTEM ACTION: Displays grade average
  SYSTEM CALLS: GET /grades/student/{id}/summary
  USER SEES: Overall average, subject-wise averages, letter grades
  IMPLEMENTATION: ⚠️ Grades summary exists

BUSINESS RULES:
  BR-PORT-001: Students can only view their own data
  BR-PORT-002: Attendance warning if below threshold (75% default)
  BR-PORT-003: Grades show for current term only

MISSING PIECES: Dashboard API integration, real-time data updates, error handling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Student View Detailed Attendance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Student
WHEN: Student wants to see detailed attendance history
WHERE: /student/my-attendance
CURRENT STATUS: ⚠️ PARTIALLY (attendance page exists)

PRECONDITIONS: Student logged in

STEP 1 - Student navigates to attendance page
  USER ACTION: Clicks "My Attendance" in sidebar
  SYSTEM ACTION: Loads attendance page
  SYSTEM CALLS: GET /student-portal/attendance
  USER SEES: Attendance calendar or list view
  IMPLEMENTATION: ⚠️ Attendance page exists
  FILE: src/app/[locale]/(dashboard)/dashboard/student/my-attendance/page.tsx

STEP 2 - System loads attendance data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches attendance records
  SYSTEM CALLS: GET /attendance/student/{id}/summary
  USER SEES: Monthly calendar with attendance marks, list view with date, status, note, statistics summary
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - Student filters attendance
  USER ACTION: Selects date range, selects term
  SYSTEM ACTION: Filters attendance records
  SYSTEM CALLS: GET /attendance/student/{id}/summary?fromDate={}&toDate={}&termId={}
  USER SEES: Filtered attendance data
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-PORT-004: Students can only view their own attendance
  BR-PORT-005: Attendance data shows for current academic year by default

MISSING PIECES: Calendar/list view implementation, filtering, date range selection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Student View Grades
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Student
WHEN: Student wants to see their grades
WHERE: /student/my-grades
CURRENT STATUS: ⚠️ PARTIALLY (grades page exists)

PRECONDITIONS: Student logged in

STEP 1 - Student navigates to grades page
  USER ACTION: Clicks "My Grades" in sidebar
  SYSTEM ACTION: Loads grades page
  SYSTEM CALLS: GET /student-portal/grades
  USER SEES: Grades summary by subject
  IMPLEMENTATION: ⚠️ Grades page exists
  FILE: src/app/[locale]/(dashboard)/dashboard/student/my-grades/page.tsx

STEP 2 - System loads grades data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches grades summary
  SYSTEM CALLS: GET /grades/student/{id}/summary
  USER SEES: Subject-wise averages, letter grades, assessment breakdown
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - Student views report card
  USER ACTION: Clicks "View Report Card" button
  SYSTEM ACTION: Opens report card view
  SYSTEM CALLS: GET /grades/report-card/{id}
  USER SEES: Formal report card with all subjects, grades, remarks
  IMPLEMENTATION: ⚠️ Report card component exists
  FILE: src/features/student-portal/components/StudentReportCard.tsx

BUSINESS RULES:
  BR-PORT-006: Students can only view their own grades
  BR-PORT-007: Report card shows for current term

MISSING PIECES: Grades summary display, report card API integration, PDF export

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Student View Schedule
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Student
WHEN: Student wants to see their class schedule
WHERE: /student/my-schedule
CURRENT STATUS: ⚠️ PARTIALLY (schedule page exists)

PRECONDITIONS: Student logged in, has active enrollment

STEP 1 - Student navigates to schedule page
  USER ACTION: Clicks "My Schedule" in sidebar
  SYSTEM ACTION: Loads schedule page
  SYSTEM CALLS: GET /student-portal/schedule
  USER SEES: Weekly schedule grid
  IMPLEMENTATION: ⚠️ Schedule page exists
  FILE: src/app/[locale]/(dashboard)/dashboard/student/my-schedule/page.tsx

STEP 2 - System loads schedule data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches schedule
  SYSTEM CALLS: GET /schedule/section/{sectionId}
  USER SEES: Schedule organized by day and period, with subject, room, teacher
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-PORT-008: Students can only view their own section's schedule
  BR-PORT-009: Schedule shows for current term

MISSING PIECES: Schedule grid display, day/period organization, room/teacher info

---

## GUARDIAN PORTAL WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Guardian View Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Guardian
WHEN: Guardian logs in to portal
WHERE: /guardian
CURRENT STATUS: ⚠️ PARTIALLY (guardian portal exists)

PRECONDITIONS: Guardian logged in, linked to students

STEP 1 - Guardian logs in
  USER ACTION: Enters credentials, clicks Sign In
  SYSTEM ACTION: Authenticates and redirects to guardian portal
  SYSTEM CALLS: POST /auth/login, GET /users/me
  USER SEES: Guardian dashboard
  IMPLEMENTATION: ⚠️ Guardian portal exists
  FILE: src/features/guardian-portal/components/GuardianDashboardHome.tsx

STEP 2 - System loads dashboard data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches dashboard data
  SYSTEM CALLS: GET /guardian-portal/dashboard
  USER SEES: Welcome message, list of linked children with summary cards
  IMPLEMENTATION: ⚠️ Dashboard components exist

STEP 3 - Guardian views child summary
  USER ACTION: Views child summary card
  SYSTEM ACTION: Displays child's attendance, grades, fees summary
  SYSTEM CALLS: GET /guardian-portal/children/{id}/summary
  USER SEES: Attendance rate, grade average, fee balance for each child
  IMPLEMENTATION: ⚠️ Child summary card exists
  FILE: src/features/guardian-portal/components/ChildSummaryCard.tsx

BUSINESS RULES:
  BR-GUA-007: Guardians can only view data for linked children
  BR-GUA-008: Dashboard shows summary for all linked children

MISSING PIECES: Dashboard API integration, real-time data updates, error handling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Guardian View Child Attendance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Guardian
WHEN: Guardian wants to see child's attendance
WHERE: /guardian/children/{id}/attendance
CURRENT STATUS: ⚠️ PARTIALLY (child detail tabs exist)

PRECONDITIONS: Guardian logged in, linked to student

STEP 1 - Guardian navigates to child detail
  USER ACTION: Clicks on child in dashboard
  SYSTEM ACTION: Loads child detail page
  SYSTEM CALLS: GET /guardian-portal/children/{id}
  USER SEES: Child detail with tabs (Overview, Attendance, Grades, Fees)
  IMPLEMENTATION: ⚠️ Child detail tabs exist
  FILE: src/features/guardian-portal/components/ChildDetailTabs.tsx

STEP 2 - Guardian clicks Attendance tab
  USER ACTION: Clicks "Attendance" tab
  SYSTEM ACTION: Loads child's attendance
  SYSTEM CALLS: GET /guardian-portal/children/{id}/attendance
  USER SEES: Child's attendance summary, calendar/list view
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - Guardian views attendance details
  USER ACTION: Views attendance data
  SYSTEM ACTION: Displays attendance records
  USER SEES: Attendance percentage, total days, present, absent, late, excused, warning if below threshold
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-GUA-009: Guardians can only view attendance for linked children
  BR-GUA-010: Attendance warning if below threshold (75% default)

MISSING PIECES: Attendance tab implementation, data display, filtering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Guardian View Child Grades
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Guardian
WHEN: Guardian wants to see child's grades
WHERE: /guardian/children/{id}/grades
CURRENT STATUS: ⚠️ PARTIALLY (child detail tabs exist)

PRECONDITIONS: Guardian logged in, linked to student

STEP 1 - Guardian navigates to child detail
  USER ACTION: Clicks on child in dashboard
  SYSTEM ACTION: Loads child detail page
  SYSTEM CALLS: GET /guardian-portal/children/{id}
  USER SEES: Child detail with tabs
  IMPLEMENTATION: ⚠️ Child detail tabs exist

STEP 2 - Guardian clicks Grades tab
  USER ACTION: Clicks "Grades" tab
  SYSTEM ACTION: Loads child's grades
  SYSTEM CALLS: GET /guardian-portal/children/{id}/grades
  USER SEES: Child's grades summary by subject, letter grades
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - Guardian views report card
  USER ACTION: Clicks "View Report Card"
  SYSTEM ACTION: Opens report card
  SYSTEM CALLS: GET /grades/report-card/{id}
  USER SEES: Formal report card
  IMPLEMENTATION: ⚠️ Report card component exists

BUSINESS RULES:
  BR-GUA-011: Guardians can only view grades for linked children
  BR-GUA-012: Report card shows for current term

MISSING PIECES: Grades tab implementation, report card API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Guardian View Child Fees
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Guardian
WHEN: Guardian wants to see child's fees
WHERE: /guardian/children/{id}/fees
CURRENT STATUS: ⚠️ PARTIALLY (child detail tabs exist, fees view exists)

PRECONDITIONS: Guardian logged in, linked to student

STEP 1 - Guardian navigates to child detail
  USER ACTION: Clicks on child in dashboard
  SYSTEM ACTION: Loads child detail page
  SYSTEM CALLS: GET /guardian-portal/children/{id}
  USER SEES: Child detail with tabs
  IMPLEMENTATION: ⚠️ Child detail tabs exist

STEP 2 - Guardian clicks Fees tab
  USER ACTION: Clicks "Fees" tab
  SYSTEM ACTION: Loads child's fees
  SYSTEM CALLS: GET /guardian-portal/children/{id}/fees
  USER SEES: List of fees, payment history, total balance, "Pay Now" buttons
  IMPLEMENTATION: ⚠️ Fees view exists
  FILE: src/features/guardian-portal/components/GuardianFeesView.tsx

STEP 3 - Guardian initiates payment
  USER ACTION: Clicks "Pay Now" on fee
  SYSTEM ACTION: Opens Chapa payment modal
  SYSTEM CALLS: POST /payments/initiate
  USER SEES: Chapa payment modal
  IMPLEMENTATION: ⚠️ Chapa modal exists

BUSINESS RULES:
  BR-GUA-013: Guardians can only view fees for linked children
  BR-GUA-014: Guardians can only pay fees for linked children

MISSING PIECES: Fees tab data integration, payment initiation

---

## WORKFLOW IMPLEMENTATION STATUS SUMMARY

### Authentication Workflows
- User Registration (Self-Registration): ❌ NOT IMPLEMENTED
- User Login: ✅ 100% Implemented
- User Logout: ✅ 100% Implemented
- Password Reset Request: ✅ 100% Implemented
- Password Reset (with Token): ✅ 100% Implemented

### User Management Workflows
- Admin Managing Users: ⚠️ PARTIALLY (users page exists, management unclear)

### Student Management Workflows
- Create Student: ❌ NOT IMPLEMENTED
- Edit Student: ❌ NOT IMPLEMENTED
- Delete Student: ⚠️ PARTIALLY (delete button exists, implementation unclear)

### Teacher Management Workflows
- Create Teacher: ❌ NOT IMPLEMENTED
- Edit Teacher: ❌ NOT IMPLEMENTED
- Delete Teacher: ❌ NOT IMPLEMENTED

### Guardian Management Workflows
- Create Guardian: ❌ NOT IMPLEMENTED
- Edit Guardian: ❌ NOT IMPLEMENTED
- Delete Guardian: ❌ NOT IMPLEMENTED
- Link Student to Guardian: ❌ NOT IMPLEMENTED

### Enrollment Workflows
- Enroll Student: ⚠️ PARTIALLY (enrollments page exists, enrollment flow unclear)
- Transfer Student: ⚠️ PARTIALLY (transfer schema exists, UI unclear)
- Withdraw Student: ⚠️ PARTIALLY (withdrawal schema exists, UI unclear)

### Attendance Workflows
- Manual Attendance: ⚠️ 70% Implemented (main flow works, face recognition broken)
- Face Recognition: ❌ NOT IMPLEMENTED (UI exists, face-api.js not connected)
- Barcode Scanner: ❌ NOT IMPLEMENTED

### Grade Entry Workflows
- Create Assessment: ⚠️ PARTIALLY (teacher portal exists, assessment creation unclear)
- Enter Grades: ⚠️ PARTIALLY (grade entry grid exists, submission unclear)
- Generate Report Card: ⚠️ PARTIALLY (report card component exists, generation unclear)

### Payment Workflows
- View Student Fees: ⚠️ PARTIALLY (payments page exists, details unclear)
- Initiate Payment via Chapa: ⚠️ PARTIALLY (Chapa modal exists, integration unclear)
- Chapa Webhook: ❌ NOT IMPLEMENTED

### Student Portal Workflows
- Student Dashboard: ⚠️ PARTIALLY (portal exists, API integration unclear)
- View Detailed Attendance: ⚠️ PARTIALLY (page exists, data display unclear)
- View Grades: ⚠️ PARTIALLY (page exists, data display unclear)
- View Schedule: ⚠️ PARTIALLY (page exists, data display unclear)

### Guardian Portal Workflows
- Guardian Dashboard: ⚠️ PARTIALLY (portal exists, API integration unclear)
- View Child Attendance: ⚠️ PARTIALLY (tabs exist, data display unclear)
- View Child Grades: ⚠️ PARTIALLY (tabs exist, data display unclear)
- View Child Fees: ⚠️ PARTIALLY (tabs exist, data display unclear)

---

## ACADEMIC STRUCTURE WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create Academic Year
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Setting up new academic year
WHERE: /dashboard/academics/years
CURRENT STATUS: ⚠️ PARTIALLY (academics pages exist)

PRECONDITIONS: User logged in as Admin/Director

STEP 1 - User navigates to academic years page
  USER ACTION: Clicks "Academics" → "Academic Years"
  SYSTEM ACTION: Navigates to /dashboard/academics/years
  SYSTEM CALLS: GET /academic-years
  USER SEES: List of academic years
  IMPLEMENTATION: ⚠️ Academics pages exist
  FILE: src/app/[locale]/(dashboard)/dashboard/academics/years/page.tsx

STEP 2 - User clicks "Create Academic Year" button
  USER ACTION: Clicks "Create Academic Year"
  SYSTEM ACTION: Shows creation modal
  USER SEES: Modal with year fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User fills year details
  USER ACTION: Enters name (required, min 4, max 20), selects start date (required), selects end date (required)
  SYSTEM ACTION: Validates fields
  SYSTEM CALLS: None
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Name: min 4, max 20 chars
    - End date must be after start date
    - No overlapping dates with existing years

STEP 4 - User submits
  USER ACTION: Clicks "Create"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /academic-years
  REQUEST BODY: { name, start_date, end_date }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Academic year created successfully"
    SYSTEM DOES: Creates academic year record
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ACD-001: Academic year name min 4, max 20 characters
  BR-ACD-002: End date must be after start date
  BR-ACD-003: No overlapping dates with existing years
  BR-ACD-004: Only one year can be active at a time

MISSING PIECES: Creation modal, validation, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create Term
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Setting up term within academic year
WHERE: /dashboard/academics/terms
CURRENT STATUS: ⚠️ PARTIALLY (academics pages exist)

PRECONDITIONS: User logged in as Admin/Director, academic year exists

STEP 1 - User navigates to terms page
  USER ACTION: Clicks "Academics" → "Terms"
  SYSTEM ACTION: Navigates to /dashboard/academics/terms
  SYSTEM CALLS: GET /terms
  USER SEES: List of terms
  IMPLEMENTATION: ⚠️ Academics pages exist

STEP 2 - User clicks "Create Term" button
  USER ACTION: Clicks "Create Term"
  SYSTEM ACTION: Shows creation modal
  SYSTEM CALLS: GET /academic-years (to populate dropdown)
  USER SEES: Modal with term fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User fills term details
  USER ACTION: Enters name (required, min 2, max 50), selects academic year (required), enters term number (required, 1-4), selects start date (required), selects end date (required)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Name: min 2, max 50 chars
    - Term number: 1-4
    - End date after start date
    - Dates within academic year dates

STEP 4 - User submits
  USER ACTION: Clicks "Create"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /terms
  REQUEST BODY: { name, academic_year_id, term_number, start_date, end_date }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ACD-005: Term name min 2, max 50 characters
  BR-ACD-006: Term number must be 1-4
  BR-ACD-007: Term dates must be within academic year dates
  BR-ACD-008: No overlapping dates with other terms in same year

MISSING PIECES: Creation modal, validation, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create Class
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Setting up new class (e.g., Grade 10)
WHERE: /dashboard/academics/classes
CURRENT STATUS: ⚠️ PARTIALLY (academics pages exist)

PRECONDITIONS: User logged in as Admin/Director, academic year exists

STEP 1 - User navigates to classes page
  USER ACTION: Clicks "Academics" → "Classes"
  SYSTEM ACTION: Navigates to /dashboard/academics/classes
  SYSTEM CALLS: GET /classes
  USER SEES: List of classes
  IMPLEMENTATION: ⚠️ Academics pages exist

STEP 2 - User clicks "Create Class" button
  USER ACTION: Clicks "Create Class"
  SYSTEM ACTION: Shows creation modal
  SYSTEM CALLS: GET /academic-years (to populate dropdown)
  USER SEES: Modal with class fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User fills class details
  USER ACTION: Enters name (required, min 2, max 50), selects academic year (required), enters grade level (required, 0-12), enters capacity (required, positive number)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Name: min 2, max 50 chars
    - Grade level: 0-12
    - Capacity: positive number

STEP 4 - User submits
  USER ACTION: Clicks "Create"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /classes
  REQUEST BODY: { name, academic_year_id, grade_level, capacity }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ACD-009: Class name min 2, max 50 characters
  BR-ACD-010: Grade level must be 0-12
  BR-ACD-011: Capacity must be positive number

MISSING PIECES: Creation modal, validation, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create Section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Setting up new section within class (e.g., Grade 10 Section A)
WHERE: /dashboard/academics/sections
CURRENT STATUS: ⚠️ PARTIALLY (academics pages exist)

PRECONDITIONS: User logged in as Admin/Director, class exists

STEP 1 - User navigates to sections page
  USER ACTION: Clicks "Academics" → "Sections"
  SYSTEM ACTION: Navigates to /dashboard/academics/sections
  SYSTEM CALLS: GET /sections
  USER SEES: List of sections
  IMPLEMENTATION: ⚠️ Academics pages exist

STEP 2 - User clicks "Create Section" button
  USER ACTION: Clicks "Create Section"
  SYSTEM ACTION: Shows creation modal
  SYSTEM CALLS: GET /classes (to populate dropdown)
  USER SEES: Modal with section fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User fills section details
  USER ACTION: Enters name (required, min 1, max 10), selects class (required), enters capacity (required, positive, default 40)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Name: min 1, max 10 chars
    - Capacity: positive number

STEP 4 - User submits
  USER ACTION: Clicks "Create"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /sections
  REQUEST BODY: { name, class_id, capacity }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ACD-012: Section name min 1, max 10 characters
  BR-ACD-013: Capacity must be positive number
  BR-ACD-014: Default capacity is 40

MISSING PIECES: Creation modal, validation, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create Subject
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Setting up new subject
WHERE: /dashboard/academics/subjects
CURRENT STATUS: ⚠️ PARTIALLY (academics pages exist)

PRECONDITIONS: User logged in as Admin/Director

STEP 1 - User navigates to subjects page
  USER ACTION: Clicks "Academics" → "Subjects"
  SYSTEM ACTION: Navigates to /dashboard/academics/subjects
  SYSTEM CALLS: GET /subjects
  USER SEES: List of subjects
  IMPLEMENTATION: ⚠️ Academics pages exist

STEP 2 - User clicks "Create Subject" button
  USER ACTION: Clicks "Create Subject"
  SYSTEM ACTION: Shows creation modal
  USER SEES: Modal with subject fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User fills subject details
  USER ACTION: Enters code (required, min 2, max 20), enters name (required, min 2, max 100), selects category (required: core/elective/vocational/extracurricular)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Code: min 2, max 20 chars
    - Name: min 2, max 100 chars
    - Category: core, elective, vocational, extracurricular

STEP 4 - User submits
  USER ACTION: Clicks "Create"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /subjects
  REQUEST BODY: { code, name, category }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ACD-015: Subject code min 2, max 20 characters
  BR-ACD-016: Subject name min 2, max 100 characters
  BR-ACD-017: Category must be core, elective, vocational, or extracurricular
  BR-ACD-018: Subject code must be unique

MISSING PIECES: Creation modal, validation, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Assign Teacher to Section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Assigning teacher to teach a section
WHERE: /dashboard/academics/section-teachers
CURRENT STATUS: ⚠️ PARTIALLY (academics pages exist)

PRECONDITIONS: User logged in as Admin/Director, section, teacher exist

STEP 1 - User navigates to section-teachers page
  USER ACTION: Clicks "Academics" → "Section Teachers"
  SYSTEM ACTION: Navigates to /dashboard/academics/section-teachers
  SYSTEM CALLS: GET /section-teachers
  USER SEES: List of teacher-section assignments
  IMPLEMENTATION: ⚠️ Academics pages exist

STEP 2 - User clicks "Assign Teacher" button
  USER ACTION: Clicks "Assign Teacher"
  SYSTEM ACTION: Shows assignment modal
  SYSTEM CALLS: GET /sections, GET /teachers
  USER SEES: Modal with dropdowns
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User selects assignment details
  USER ACTION: Selects section (required), selects teacher (required)
  SYSTEM ACTION: Validates selections
  USER SEES: Filtered dropdowns
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - User submits
  USER ACTION: Clicks "Assign"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /section-teachers
  REQUEST BODY: { section_id, teacher_id }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Teacher assigned successfully"
    SYSTEM DOES: Creates section_teacher record
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Already Assigned:
    USER SEES: "Teacher already assigned to this section"
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ACD-021: Same teacher cannot be assigned twice to same section
  BR-ACD-022: Teacher must be active to be assigned

MISSING PIECES: Assignment modal, validation, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Assign Subject to Section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Assigning teacher and subject to section
WHERE: /dashboard/academics/section-subjects
CURRENT STATUS: ⚠️ PARTIALLY (academics pages exist)

PRECONDITIONS: User logged in as Admin/Director, section, subject, teacher exist

STEP 1 - User navigates to section-subjects page
  USER ACTION: Clicks "Academics" → "Section Subjects"
  SYSTEM ACTION: Navigates to /dashboard/academics/section-subjects
  SYSTEM CALLS: GET /section-subjects
  USER SEES: List of section-subject assignments
  IMPLEMENTATION: ⚠️ Academics pages exist

STEP 2 - User clicks "Assign Subject" button
  USER ACTION: Clicks "Assign Subject"
  SYSTEM ACTION: Shows assignment modal
  SYSTEM CALLS: GET /sections, GET /subjects, GET /teachers
  USER SEES: Modal with dropdowns
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User selects assignment details
  USER ACTION: Selects section (required), selects subject (required), selects teacher (required)
  SYSTEM ACTION: Validates selections
  USER SEES: Filtered dropdowns
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - User submits
  USER ACTION: Clicks "Assign"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /section-subjects
  REQUEST BODY: { section_id, subject_id, teacher_id }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ACD-019: Same subject cannot be assigned twice to same section
  BR-ACD-020: Teacher must be assigned to section before assigning subject

MISSING PIECES: Assignment modal, validation, API integration

---

## SCHEDULE MANAGEMENT WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Create Schedule Entry
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Creating class schedule
WHERE: /dashboard/schedule
CURRENT STATUS: ⚠️ PARTIALLY (schedule pages exist)

PRECONDITIONS: User logged in as Admin/Director, section, subject, teacher exist

STEP 1 - User navigates to schedule page
  USER ACTION: Clicks "Schedule" in sidebar
  SYSTEM ACTION: Navigates to /dashboard/schedule
  SYSTEM CALLS: GET /schedule
  USER SEES: Schedule grid
  IMPLEMENTATION: ⚠️ Schedule pages exist
  FILE: src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx

STEP 2 - User clicks "Add Schedule Entry" button
  USER ACTION: Clicks "Add Schedule Entry"
  SYSTEM ACTION: Shows creation modal
  SYSTEM CALLS: GET /sections, GET /subjects, GET /teachers
  USER SEES: Modal with schedule fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User fills schedule details
  USER ACTION: Selects section (required), selects subject (required), selects teacher (required), selects day of week (required: Monday-Friday), selects period (required: 1-8), selects room (optional)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Day: Monday, Tuesday, Wednesday, Thursday, Friday
    - Period: 1-8
    - No conflict: same section, same day, same period

STEP 4 - User submits
  USER ACTION: Clicks "Add"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /schedule
  REQUEST BODY: { section_id, subject_id, teacher_id, day_of_week, period, room }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Schedule entry added successfully"
    SYSTEM DOES: Creates schedule entry
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented
  ERROR - Conflict:
    USER SEES: "Section already has a class at this time"
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-SCH-001: Day of week must be Monday-Friday
  BR-SCH-002: Period must be 1-8
  BR-SCH-003: No schedule conflicts: same section, same day, same period
  BR-SCH-004: Teacher cannot be in two places at same time (if enforced)

MISSING PIECES: Creation modal, conflict validation, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: View Schedule by Section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director, Teacher, Student
WHEN: Viewing class schedule
WHERE: /dashboard/schedule
CURRENT STATUS: ⚠️ PARTIALLY (schedule pages exist)

PRECONDITIONS: User logged in

STEP 1 - User navigates to schedule page
  USER ACTION: Clicks "Schedule" in sidebar
  SYSTEM ACTION: Navigates to /dashboard/schedule
  SYSTEM CALLS: GET /schedule
  USER SEES: Schedule grid with filter
  IMPLEMENTATION: ⚠️ Schedule pages exist

STEP 2 - User filters by section
  USER ACTION: Selects section from dropdown
  SYSTEM ACTION: Filters schedule
  SYSTEM CALLS: GET /schedule/section/{sectionId}
  USER SEES: Schedule for selected section
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User views schedule
  USER ACTION: Views schedule grid
  SYSTEM ACTION: Displays schedule
  USER SEES: Grid organized by day and period, with subject, teacher, room
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-SCH-005: Users can only view schedules they have access to
  BR-SCH-006: Students see only their section's schedule
  BR-SCH-007: Teachers see only their assigned sections' schedules

MISSING PIECES: Section filter, schedule grid display

---

## NOTIFICATION WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Send Notification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director, Registrar
WHEN: Sending announcement or alert
WHERE: /dashboard/notifications
CURRENT STATUS: ⚠️ PARTIALLY (notifications pages exist)

PRECONDITIONS: User logged in as Admin/Director/Registrar

STEP 1 - User navigates to notifications page
  USER ACTION: Clicks "Notifications" in sidebar
  SYSTEM ACTION: Navigates to /dashboard/notifications
  SYSTEM CALLS: GET /notifications
  USER SEES: Notifications list and "Send Notification" button
  IMPLEMENTATION: ⚠️ Notifications pages exist
  FILE: src/app/[locale]/(dashboard)/dashboard/notifications/page.tsx

STEP 2 - User clicks "Send Notification" button
  USER ACTION: Clicks "Send Notification"
  SYSTEM ACTION: Shows send modal
  SYSTEM CALLS: GET /users (to populate recipient dropdown)
  USER SEES: Modal with notification fields
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User fills notification details
  USER ACTION: 
    1. Selects recipient type (all/students/teachers/guardians/specific users)
    2. If specific users, selects recipients
    3. Enters title (required)
    4. Enters message (required)
    5. Selects priority (low/medium/high/urgent)
    6. Selects channels (email/sms/in-app)
  SYSTEM ACTION: Validates fields
  USER SEES: Form with validation
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Title: required
    - Message: required
    - Priority: low, medium, high, urgent
    - Channels: email, sms, in-app

STEP 4 - User submits
  USER ACTION: Clicks "Send"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: POST /notifications
  REQUEST BODY: { recipient_type, recipient_ids, title, message, priority, channels }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Notification sent successfully"
    SYSTEM DOES: 
      - Creates notification records
      - Sends emails (if email channel selected)
      - Sends SMS (if SMS channel selected)
      - Creates in-app notifications
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-NOT-001: Title and message are required
  BR-NOT-002: Priority: low, medium, high, urgent
  BR-NOT-003: Channels: email, sms, in-app
  BR-NOT-004: SMS requires valid phone number for recipients
  BR-NOT-005: Email requires valid email for recipients

MISSING PIECES: Send modal, recipient selection, API integration, email/SMS sending

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: View Notification History
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director, Registrar
WHEN: Reviewing sent notifications
WHERE: /dashboard/notifications
CURRENT STATUS: ⚠️ PARTIALLY (notifications pages exist)

PRECONDITIONS: User logged in as Admin/Director/Registrar

STEP 1 - User navigates to notifications page
  USER ACTION: Clicks "Notifications" in sidebar
  SYSTEM ACTION: Navigates to /dashboard/notifications
  SYSTEM CALLS: GET /notifications
  USER SEES: Notifications list with filters
  IMPLEMENTATION: ⚠️ Notifications pages exist

STEP 2 - User filters notifications
  USER ACTION: 
    1. Selects date range
    2. Selects recipient type
    3. Selects priority
  SYSTEM ACTION: Filters notifications
  SYSTEM CALLS: GET /notifications?fromDate={}&toDate={}&recipientType={}&priority={}
  USER SEES: Filtered notifications list
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User views notification details
  USER ACTION: Clicks on notification row
  SYSTEM ACTION: Shows notification details
  SYSTEM CALLS: GET /notifications/{id}
  USER SEES: 
    - Notification title, message, priority
    - Recipients list
    - Delivery status per recipient
    - Sent timestamp
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-NOT-006: Delivery status: pending, sent, failed
  BR-NOT-007: Only Admin/Director/Registrar can view notification history

MISSING PIECES: Filtering, detail view, delivery status display

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: View My Notifications (Student/Guardian/Teacher)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Student, Guardian, Teacher
WHEN: Checking received notifications
WHERE: Dashboard (notification bell icon)
CURRENT STATUS: ⚠️ PARTIALLY (notification bell exists)

PRECONDITIONS: User logged in

STEP 1 - User clicks notification bell
  USER ACTION: Clicks bell icon in header
  SYSTEM ACTION: Shows notification dropdown
  SYSTEM CALLS: GET /notifications/my
  USER SEES: List of unread notifications
  IMPLEMENTATION: ⚠️ Notification bell exists
  FILE: src/components/layout/header.tsx

STEP 2 - User clicks notification
  USER ACTION: Clicks on notification item
  SYSTEM ACTION: Marks as read, shows details
  SYSTEM CALLS: PATCH /notifications/{id}/read
  USER SEES: Notification details
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 3 - User marks all as read
  USER ACTION: Clicks "Mark all as read"
  SYSTEM ACTION: Marks all notifications as read
  SYSTEM CALLS: PATCH /notifications/mark-all-read
  USER SEES: All notifications marked as read
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-NOT-008: Users can only view their own notifications
  BR-NOT-009: Notifications are marked as read when clicked

MISSING PIECES: Notification dropdown, mark as read, detail view

---

## ANALYTICS WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: View Analytics Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Reviewing school-wide statistics
WHERE: /dashboard/analytics
CURRENT STATUS: ⚠️ PARTIALLY (analytics pages exist)

PRECONDITIONS: User logged in as Admin/Director

STEP 1 - User navigates to analytics page
  USER ACTION: Clicks "Analytics" in sidebar
  SYSTEM ACTION: Navigates to /dashboard/analytics
  SYSTEM CALLS: GET /analytics/overview
  USER SEES: Analytics dashboard with charts
  IMPLEMENTATION: ⚠️ Analytics pages exist
  FILE: src/app/[locale]/(dashboard)/dashboard/analytics/page.tsx

STEP 2 - System loads analytics data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches analytics data
  SYSTEM CALLS: 
    GET /analytics/overview
    GET /analytics/attendance-summary
    GET /analytics/grade-summary
    GET /analytics/enrollment-summary
  USER SEES: 
    - Total students, teachers, guardians
    - Attendance rate chart
    - Grade distribution chart
    - Enrollment by grade level
  IMPLEMENTATION: ⚠️ Analytics components exist
  FILE: src/features/analytics/components/GradeDistributionChart.tsx

STEP 3 - User filters by academic year
  USER ACTION: Selects academic year from dropdown
  SYSTEM ACTION: Refreshes analytics for selected year
  SYSTEM CALLS: GET /analytics/overview?academicYearId={id}
  USER SEES: Updated analytics
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ANA-001: Only Admin/Director can view school-wide analytics
  BR-ANA-002: Analytics data aggregates for selected academic year

MISSING PIECES: Academic year filter, API integration, chart rendering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: View At-Risk Students
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director, Registrar
WHEN: Identifying students needing intervention
WHERE: /dashboard/analytics/at-risk
CURRENT STATUS: ⚠️ PARTIALLY (analytics pages exist)

PRECONDITIONS: User logged in as Admin/Director/Registrar

STEP 1 - User navigates to at-risk students page
  USER ACTION: Clicks "Analytics" → "At-Risk Students"
  SYSTEM ACTION: Navigates to /dashboard/analytics/at-risk
  SYSTEM CALLS: GET /analytics/at-risk
  USER SEES: List of at-risk students with risk level
  IMPLEMENTATION: ⚠️ Analytics pages exist
  FILE: src/features/analytics/utils/calculateRisk.ts

STEP 2 - System loads at-risk data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Calculates risk for all students
  SYSTEM CALLS: GET /analytics/at-risk
  USER SEES: 
    - Student name, section
    - Risk level (low/medium/high/critical)
    - Attendance rate
    - Grade average
    - Consecutive absences
  IMPLEMENTATION: ⚠️ Risk calculation exists
  FILE: src/features/analytics/utils/calculateRisk.ts

STEP 3 - User filters by risk level
  USER ACTION: Selects risk level from dropdown
  SYSTEM ACTION: Filters student list
  SYSTEM CALLS: GET /analytics/at-risk?riskLevel={level}
  USER SEES: Filtered at-risk students
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - User views student details
  USER ACTION: Clicks on student row
  SYSTEM ACTION: Shows student detail with risk factors
  SYSTEM CALLS: GET /students/{id}, GET /attendance/student/{id}/summary, GET /grades/student/{id}/summary
  USER SEES: 
    - Detailed attendance records
    - Detailed grades
    - Risk factor breakdown
  IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-ANA-003: Risk levels: low, medium, high, critical
  BR-ANA-004: Risk calculated based on:
    - Attendance rate (threshold configurable)
    - Grade average (passing mark configurable)
    - Consecutive absences (threshold configurable)
  BR-ANA-005: Risk calculation from src/features/analytics/utils/calculateRisk.ts

MISSING PIECES: Risk level filter, student detail view, API integration

---

## SETTINGS WORKFLOWS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Update School Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Updating school details
WHERE: /dashboard/settings/school
CURRENT STATUS: ⚠️ PARTIALLY (settings pages exist)

PRECONDITIONS: User logged in as Admin/Director

STEP 1 - User navigates to school settings page
  USER ACTION: Clicks "Settings" → "School Information"
  SYSTEM ACTION: Navigates to /dashboard/settings/school
  SYSTEM CALLS: GET /settings/school
  USER SEES: School information form
  IMPLEMENTATION: ⚠️ Settings pages exist
  FILE: src/lib/api/settings.service.ts

STEP 2 - System loads school data
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches school settings
  SYSTEM CALLS: GET /settings/school
  USER SEES: Pre-populated form with school name, address, phone, email, logo
  IMPLEMENTATION: ⚠️ Settings service exists

STEP 3 - User updates school information
  USER ACTION: 
    1. Updates school name
    2. Updates address
    3. Updates phone number
    4. Updates email
    5. Uploads new logo (optional)
  SYSTEM ACTION: Tracks changes
  USER SEES: Form with current values
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - User submits changes
  USER ACTION: Clicks "Save Changes"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: PATCH /settings/school
  REQUEST BODY: { name, address, phone, email, logo_url }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "School information updated successfully"
    SYSTEM DOES: Updates school settings
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-SET-001: School name is required
  BR-SET-002: Email must be valid format if provided
  BR-SET-003: Phone number must be valid format if provided

MISSING PIECES: School settings form, file upload for logo, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Update Academic Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Configuring academic policies
WHERE: /dashboard/settings/academic
CURRENT STATUS: ⚠️ PARTIALLY (settings pages exist)

PRECONDITIONS: User logged in as Admin/Director

STEP 1 - User navigates to academic settings page
  USER ACTION: Clicks "Settings" → "Academic Settings"
  SYSTEM ACTION: Navigates to /dashboard/settings/academic
  SYSTEM CALLS: GET /settings/academic
  USER SEES: Academic settings form
  IMPLEMENTATION: ⚠️ Settings pages exist
  FILE: src/lib/api/settings.service.ts

STEP 2 - System loads academic settings
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches academic settings
  SYSTEM CALLS: GET /settings/academic
  USER SEES: Pre-populated form with grading scale, passing mark, attendance threshold
  IMPLEMENTATION: ⚠️ Settings service exists

STEP 3 - User updates academic settings
  USER ACTION: 
    1. Updates grading scale (A: 90-100, B: 80-89, etc.)
    2. Updates passing mark (default 50)
    3. Updates attendance warning threshold (default 75%)
    4. Updates consecutive absence threshold (default 3)
  SYSTEM ACTION: Validates inputs
  USER SEES: Form with current values
  IMPLEMENTATION: ⚠️ Unclear if implemented
  VALIDATION: 
    - Passing mark: 0-100
    - Attendance threshold: 0-100
    - Consecutive absence: positive integer

STEP 4 - User submits changes
  USER ACTION: Clicks "Save Changes"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: PATCH /settings/academic
  REQUEST BODY: { grading_scale, passing_mark, attendance_warning_threshold, consecutive_absence_threshold }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Academic settings updated successfully"
    SYSTEM DOES: Updates academic settings
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-SET-004: Passing mark must be 0-100
  BR-SET-005: Attendance threshold must be 0-100
  BR-SET-006: Consecutive absence threshold must be positive integer
  BR-SET-007: Grading scale must cover 0-100 range

MISSING PIECES: Academic settings form, grading scale editor, API integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW: Update Notification Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO DOES THIS: Admin, Director
WHEN: Configuring notification policies
WHERE: /dashboard/settings/notifications
CURRENT STATUS: ⚠️ PARTIALLY (settings pages exist)

PRECONDITIONS: User logged in as Admin/Director

STEP 1 - User navigates to notification settings page
  USER ACTION: Clicks "Settings" → "Notification Settings"
  SYSTEM ACTION: Navigates to /dashboard/settings/notifications
  SYSTEM CALLS: GET /settings/notifications
  USER SEES: Notification settings form
  IMPLEMENTATION: ⚠️ Settings pages exist
  FILE: src/lib/api/settings.service.ts

STEP 2 - System loads notification settings
  USER ACTION: None (automatic)
  SYSTEM ACTION: Fetches notification settings
  SYSTEM CALLS: GET /settings/notifications
  USER SEES: Pre-populated form with alert rules, fee reminder settings
  IMPLEMENTATION: ⚠️ Settings service exists

STEP 3 - User updates notification settings
  USER ACTION: 
    1. Toggles absence alert (enabled/disabled)
    2. Toggles low grade alert (enabled/disabled)
    3. Toggles fee reminder (enabled/disabled)
    4. Sets fee reminder days before due date
    5. Updates SMS API credentials
    6. Updates SMTP credentials
  SYSTEM ACTION: Validates inputs
  USER SEES: Form with toggles and inputs
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 4 - User submits changes
  USER ACTION: Clicks "Save Changes"
  SYSTEM ACTION: Validates and submits
  SYSTEM CALLS: PATCH /settings/notifications
  REQUEST BODY: { absence_alert, low_grade_alert, fee_reminder, fee_reminder_days, sms_api_key, smtp_config }
  USER SEES: Loading indicator
  IMPLEMENTATION: ⚠️ Unclear if implemented

STEP 5 - System processes response
  SUCCESS:
    USER SEES: Green toast "Notification settings updated successfully"
    SYSTEM DOES: Updates notification settings
    USER STAYS ON: Same page
    IMPLEMENTATION: ⚠️ Unclear if implemented

BUSINESS RULES:
  BR-SET-008: Fee reminder days must be positive integer
  BR-SET-009: SMS API key required for SMS notifications
  BR-SET-010: SMTP credentials required for email notifications

MISSING PIECES: Notification settings form, credential inputs, API integration

---

## WORKFLOW IMPLEMENTATION STATUS SUMMARY

### Authentication Workflows
- User Registration (Self-Registration): ❌ NOT IMPLEMENTED
- User Login: ✅ 100% Implemented
- User Logout: ✅ 100% Implemented
- Password Reset Request: ✅ 100% Implemented
- Password Reset (with Token): ✅ 100% Implemented

### User Management Workflows
- Admin Managing Users: ⚠️ PARTIALLY (users page exists, management unclear)

### Student Management Workflows
- Create Student: ❌ NOT IMPLEMENTED
- Edit Student: ❌ NOT IMPLEMENTED
- Delete Student: ⚠️ PARTIALLY (delete button exists, implementation unclear)

### Teacher Management Workflows
- Create Teacher: ❌ NOT IMPLEMENTED
- Edit Teacher: ❌ NOT IMPLEMENTED
- Delete Teacher: ❌ NOT IMPLEMENTED

### Guardian Management Workflows
- Create Guardian: ❌ NOT IMPLEMENTED
- Edit Guardian: ❌ NOT IMPLEMENTED
- Delete Guardian: ❌ NOT IMPLEMENTED
- Link Student to Guardian: ❌ NOT IMPLEMENTED

### Enrollment Workflows
- Enroll Student: ⚠️ PARTIALLY (enrollments page exists, enrollment flow unclear)
- Withdraw Student: ⚠️ PARTIALLY (withdrawal schema exists, UI unclear)

### Attendance Workflows
- Manual Attendance: ⚠️ 70% Implemented (main flow works, face recognition broken)
- Face Recognition: ❌ NOT IMPLEMENTED (UI exists, face-api.js not connected)
- Barcode Scanner: ❌ NOT IMPLEMENTED

### Grade Entry Workflows
- Create Assessment: ⚠️ PARTIALLY (teacher portal exists, assessment creation unclear)
- Enter Grades: ⚠️ PARTIALLY (grade entry grid exists, submission unclear)

### Payment Workflows
- View Student Fees: ⚠️ PARTIALLY (payments page exists, details unclear)
- Initiate Payment via Chapa: ⚠️ PARTIALLY (Chapa modal exists, integration unclear)
- Chapa Webhook: ❌ NOT IMPLEMENTED

### Student Portal Workflows
- Student Dashboard: ⚠️ PARTIALLY (portal exists, API integration unclear)
- View Detailed Attendance: ⚠️ PARTIALLY (page exists, data display unclear)
- View Grades: ⚠️ PARTIALLY (page exists, data display unclear)
- View Schedule: ⚠️ PARTIALLY (page exists, data display unclear)

### Guardian Portal Workflows
- Guardian Dashboard: ⚠️ PARTIALLY (portal exists, API integration unclear)
- View Child Attendance: ⚠️ PARTIALLY (tabs exist, data display unclear)
- View Child Grades: ⚠️ PARTIALLY (tabs exist, data display unclear)
- View Child Fees: ⚠️ PARTIALLY (tabs exist, data display unclear)

### Academic Structure Workflows
- Create Academic Year: ⚠️ PARTIALLY (pages exist, modal unclear)
- Create Term: ⚠️ PARTIALLY (pages exist, modal unclear)
- Create Class: ⚠️ PARTIALLY (pages exist, modal unclear)
- Create Section: ⚠️ PARTIALLY (pages exist, modal unclear)
- Create Subject: ⚠️ PARTIALLY (pages exist, modal unclear)
- Assign Teacher to Section: ⚠️ PARTIALLY (pages exist, modal unclear)
- Assign Subject to Section: ⚠️ PARTIALLY (pages exist, modal unclear)

### Schedule Management Workflows
- Create Schedule Entry: ⚠️ PARTIALLY (pages exist, modal unclear)
- View Schedule by Section: ⚠️ PARTIALLY (pages exist, filter unclear)

### Notification Workflows
- Send Notification: ⚠️ PARTIALLY (pages exist, modal unclear)
- View Notification History: ⚠️ PARTIALLY (pages exist, detail view unclear)
- View My Notifications: ⚠️ PARTIALLY (bell exists, dropdown unclear)

### Analytics Workflows
- View Analytics Overview: ⚠️ PARTIALLY (pages exist, API integration unclear)
- View At-Risk Students: ⚠️ PARTIALLY (pages exist, filter unclear)

### Settings Workflows
- Update School Information: ⚠️ PARTIALLY (service exists, form unclear)
- Update Academic Settings: ⚠️ PARTIALLY (service exists, form unclear)
- Update Notification Settings: ⚠️ PARTIALLY (service exists, form unclear)

---

## PRIORITY FIXES NEEDED

### CRITICAL (Blocking Core Functionality)
1. Create Student page - NOT IMPLEMENTED
2. Create Teacher page - NOT IMPLEMENTED
3. Create Guardian page - NOT IMPLEMENTED
4. Edit Student page - NOT IMPLEMENTED
5. Edit Teacher page - NOT IMPLEMENTED
6. Edit Guardian page - NOT IMPLEMENTED

### HIGH (Important Features)
1. User Registration page - NOT IMPLEMENTED
2. Link Student to Guardian - NOT IMPLEMENTED
3. Enrollment modal - UNCLEAR IMPLEMENTATION
4. Transfer modal - UNCLEAR IMPLEMENTATION
5. Withdrawal modal - UNCLEAR IMPLEMENTATION
6. Grade submission API - UNCLEAR IMPLEMENTATION
7. Report card generation - UNCLEAR IMPLEMENTATION
8. Payment initiation API - UNCLEAR IMPLEMENTATION
9. Chapa webhook - NOT IMPLEMENTED
10. Academic structure creation modals - UNCLEAR IMPLEMENTATION
11. Schedule entry creation modal - UNCLEAR IMPLEMENTATION
12. Send notification modal - UNCLEAR IMPLEMENTATION
13. User management (roles, password reset, deletion) - UNCLEAR IMPLEMENTATION

### MEDIUM (Nice to Have)
1. Face recognition integration - face-api.js not connected
2. Barcode scanner - NOT IMPLEMENTED
3. Student/Guardian portal API integration - UNCLEAR
4. Report card generation - UNCLEAR
5. PDF export for attendance - NOT IMPLEMENTED
6. Analytics API integration - UNCLEAR
7. Settings forms - UNCLEAR
8. Notification detail views - UNCLEAR
