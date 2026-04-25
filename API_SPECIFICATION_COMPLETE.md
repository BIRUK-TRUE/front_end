# COMPLETE API SPECIFICATION
## School Management System (SMS) - Backend Requirements

**Version:** 1.0  
**Date:** 2025-01-XX  
**Total Endpoints:** 114  
**Target Audience:** Backend Developers

---

# TABLE OF CONTENTS

1. [Authentication Endpoints (API-001 to API-006)](#authentication-endpoints)
2. [User Management Endpoints (API-007 to API-015)](#user-management-endpoints)
3. [Student Management Endpoints (API-016 to API-023)](#student-management-endpoints)
4. [Teacher Management Endpoints (API-024 to API-031)](#teacher-management-endpoints)
5. [Guardian Management Endpoints (API-032 to API-040)](#guardian-management-endpoints)
6. [Academic Structure Endpoints (API-041 to API-060)](#academic-structure-endpoints)
7. [Attendance Endpoints (API-061 to API-066)](#attendance-endpoints)
8. [Grade Management Endpoints (API-067 to API-074)](#grade-management-endpoints)
9. [Schedule Management Endpoints (API-075 to API-078)](#schedule-management-endpoints)
10. [Enrollment Management Endpoints (API-079 to API-083)](#enrollment-management-endpoints)
11. [Analytics Endpoints (API-084 to API-088)](#analytics-endpoints)
12. [Notification Endpoints (API-089 to API-095)](#notification-endpoints)
13. [Payment Endpoints (API-096 to API-101)](#payment-endpoints)
14. [Student Portal Endpoints (API-102 to API-107)](#student-portal-endpoints)
15. [Guardian Portal Endpoints (API-108 to API-114)](#guardian-portal-endpoints)
16. [Settings Endpoints (API-115 to API-120)](#settings-endpoints)

---

# AUTHENTICATION ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /auth/login
PURPOSE:        Authenticate user and return tokens
PRIORITY:       🔴 CRITICAL
USED BY:        Login page, src/app/[locale]/(auth)/login/page.tsx
WORKFLOW STEP:  Step 3 of Login Flow

AUTH REQUIRED:  No

REQUEST HEADERS:
  Content-Type: application/json

REQUEST BODY:
{
  "email": {
    "type": "string",
    "required": true,
    "format": "email",
    "validation": "Must be valid email format",
    "example": "admin@sms.edu.et",
    "where_user_enters": "Email input field on login form",
    "error_if_missing": "Email is required",
    "error_if_invalid": "Please enter a valid email"
  },
  "password": {
    "type": "string", 
    "required": true,
    "min_length": 8,
    "validation": "Required, minimum 8 characters",
    "example": "admin123",
    "where_user_enters": "Password input field on login form",
    "error_if_missing": "Password is required"
  }
}

SUCCESS RESPONSE (200):
{
  "access_token": {
    "type": "string",
    "description": "JWT access token for API calls",
    "used_for": "Sent in Authorization header for all protected API calls",
    "stored_in": "Zustand auth store + sessionStorage",
    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "refresh_token": {
    "type": "string",
    "description": "JWT refresh token to get new access token",
    "used_for": "Sent to POST /auth/refresh when access token expires",
    "stored_in": "Zustand auth store + sessionStorage",
    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "type": "object",
    "description": "Authenticated user data",
    "fields": {
      "id": { "type": "string/uuid", "example": "550e8400-e29b-41d4-a716-446655440000" },
      "full_name": { "type": "string", "example": "John Doe" },
      "email": { "type": "string", "example": "admin@sms.edu.et" },
      "roles": { 
        "type": "array of strings", 
        "allowed_values": ["admin","director","registrar","teacher","student","guardian"],
        "example": ["admin"] 
      },
      "phone_number": { "type": "string", "nullable": true },
      "address": { "type": "string", "nullable": true },
      "must_change_password": { 
        "type": "boolean", 
        "description": "If true, redirect user to change password page immediately after login",
        "example": false 
      }
    }
  }
}

ERROR RESPONSES:
  400 Bad Request:
    { "message": "Validation error", "errors": { "email": "Invalid email" } }
    → Frontend action: Display field-level errors on form
    
  401 Unauthorized:
    { "message": "Invalid credentials" }
    → Frontend action: Show "Invalid email or password" toast/error
    
  403 Forbidden:
    { "message": "Account is deactivated" }
    → Frontend action: Show "Your account has been deactivated" message
    
  429 Too Many Requests:
    { "message": "Too many login attempts. Try again in X minutes" }
    → Frontend action: Show rate limit message, disable submit button

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-001: Email must exist in system
  BR-002: Password must match hashed password
  BR-003: Account must be active (not soft-deleted)
  BR-004: If must_change_password = true, still issue tokens but flag it
  BR-005: Log failed login attempts
  BR-006: Lock account after X failed attempts (configurable)

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Stores access_token and refresh_token in Zustand + sessionStorage
    2. Stores user object in Zustand auth store
    3. If must_change_password = true → redirect to /change-password
    4. If must_change_password = false → redirect to /dashboard
  
  Failure:
    1. Shows error message to user
    2. Clears password field
    3. Keeps email field populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-002
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /auth/refresh
PURPOSE:        Refresh access token using refresh token
PRIORITY:       🔴 CRITICAL
USED BY:        Axios interceptor, src/lib/api/axios.ts
WORKFLOW STEP:  Automatic on 401 response

AUTH REQUIRED:  No (refresh token is sent in request body)

REQUEST HEADERS:
  Content-Type: application/json

REQUEST BODY:
{
  "refresh_token": {
    "type": "string",
    "required": true,
    "description": "Refresh token obtained from login",
    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

SUCCESS RESPONSE (200):
{
  "access_token": {
    "type": "string",
    "description": "New JWT access token",
    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "refresh_token": {
    "type": "string",
    "description": "New refresh token (backend may rotate this)",
    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Invalid or expired refresh token" }
    → Frontend action: Clear auth state, redirect to /login
    
  403 Forbidden:
    { "message": "Refresh token revoked" }
    → Frontend action: Clear auth state, redirect to /login

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-007: Validate refresh token signature and expiration
  BR-008: Check if refresh token is not revoked
  BR-009: Optionally rotate refresh tokens on refresh
  BR-010: Revoke old refresh token if rotating

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Updates access_token and refresh_token in Zustand + sessionStorage
    2. Retries original failed request
  
  Failure:
    1. Clears all auth state from Zustand + sessionStorage
    2. Redirects user to /login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-003
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /auth/forgot-password
PURPOSE:        Initiate password reset by sending email
PRIORITY:       🟡 HIGH
USED BY:        Forgot password page, src/app/[locale]/(auth)/forgot-password/page.tsx
WORKFLOW STEP:  Step 1 of Password Reset Flow

AUTH REQUIRED:  No

REQUEST HEADERS:
  Content-Type: application/json

REQUEST BODY:
{
  "email": {
    "type": "string",
    "required": true,
    "format": "email",
    "validation": "Must be valid email format",
    "example": "user@sms.edu.et",
    "where_user_enters": "Email input field on forgot password form",
    "error_if_missing": "Email is required",
    "error_if_invalid": "Please enter a valid email"
  }
}

SUCCESS RESPONSE (200):
{
  "message": {
    "type": "string",
    "description": "Confirmation message (don't reveal if email exists)",
    "example": "If an account with this email exists, a password reset link has been sent."
  }
}

ERROR RESPONSES:
  400 Bad Request:
    { "message": "Validation error", "errors": { "email": "Invalid email" } }
    → Frontend action: Display field-level errors on form
    
  429 Too Many Requests:
    { "message": "Too many reset attempts. Try again in X minutes" }
    → Frontend action: Show rate limit message

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-011: Always return success even if email doesn't exist (security)
  BR-012: Generate password reset token with expiration (e.g., 1 hour)
  BR-013: Send email with reset link containing token
  BR-014: Log password reset request
  BR-015: Rate limit password reset requests per email

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Shows success message to user
    2. Displays "Reset email sent" state
    3. Shows "Back to login" link
  
  Failure:
    1. Shows error message to user
    2. Keeps email field populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-004
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /auth/reset-password
PURPOSE:        Reset password using token from email
PRIORITY:       🟡 HIGH
USED BY:        Reset password page (not yet implemented)
WORKFLOW STEP:  Step 2 of Password Reset Flow

AUTH REQUIRED:  No

REQUEST HEADERS:
  Content-Type: application/json

REQUEST BODY:
{
  "token": {
    "type": "string",
    "required": true,
    "description": "Password reset token from email link",
    "example": "reset-token-here"
  },
  "new_password": {
    "type": "string",
    "required": true,
    "min_length": 8,
    "validation": "Minimum 8 characters",
    "example": "NewSecurePassword123"
  }
}

SUCCESS RESPONSE (200):
{
  "message": {
    "type": "string",
    "example": "Password has been reset successfully"
  }
}

ERROR RESPONSES:
  400 Bad Request:
    { "message": "Validation error", "errors": { "new_password": "Password too short" } }
    → Frontend action: Display field-level errors on form
    
  401 Unauthorized:
    { "message": "Invalid or expired token" }
    → Frontend action: Show error, redirect to forgot-password
    
  404 Not Found:
    { "message": "Token not found" }
    → Frontend action: Show error, redirect to forgot-password

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-016: Validate reset token signature and expiration
  BR-017: Validate new password strength (backend-side)
  BR-018: Hash new password before storing
  BR-019: Invalidate reset token after use
  BR-020: Clear must_change_password flag if set

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Shows success message
    2. Redirects to /login
  
  Failure:
    1. Shows error message
    2. Keeps form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-005
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /auth/logout
PURPOSE:        Invalidate refresh token and logout user
PRIORITY:       🟡 HIGH
USED BY:        Logout action (not yet implemented in UI)
WORKFLOW STEP:  Step 1 of Logout Flow

AUTH REQUIRED:  Yes (Bearer token)

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
  None (empty)

SUCCESS RESPONSE (200):
{
  "message": {
    "type": "string",
    "example": "Logged out successfully"
  }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Invalid token" }
    → Frontend action: Clear auth state anyway, redirect to login

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-021: Invalidate refresh token
  BR-022: Log logout event
  BR-023: Add access token to blacklist if using blacklist strategy

WHAT FRONTEND DOES WITH RESPONSE:
  Success or Failure:
    1. Clears access_token and refresh_token from Zustand + sessionStorage
    2. Clears user object from Zustand auth store
    3. Redirects to /login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-006
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /users/me
PURPOSE:        Get current authenticated user's information
PRIORITY:       🔴 CRITICAL
USED BY:        Auth store initialization, profile page
WORKFLOW STEP:  Step 1 of User Data Fetch

AUTH REQUIRED:  Yes (Bearer token)

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

QUERY PARAMETERS:
  None

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid", "example": "550e8400-e29b-41d4-a716-446655440000" },
  "full_name": { "type": "string", "example": "John Doe" },
  "email": { "type": "string", "example": "admin@sms.edu.et" },
  "roles": { 
    "type": "array of strings", 
    "allowed_values": ["admin","director","registrar","teacher","student","guardian"],
    "example": ["admin"] 
  },
  "phone_number": { "type": "string", "nullable": true, "example": "+251911234567" },
  "address": { "type": "string", "nullable": true, "example": "Addis Ababa, Ethiopia" },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean", "example": true },
  "created_at": { "type": "string (ISO 8601)", "example": "2024-01-01T00:00:00Z" }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Invalid token" }
    → Frontend action: Trigger token refresh, redirect to login if fails
    
  404 Not Found:
    { "message": "User not found" }
    → Frontend action: Clear auth state, redirect to login

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-024: Return user based on access token subject
  BR-025: Include all roles for permission checking

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Updates user object in Zustand auth store
    2. Uses roles for permission calculations
  
  Failure:
    1. Triggers token refresh or logout
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# USER MANAGEMENT ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-007
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /users
PURPOSE:        List users with pagination and filtering
PRIORITY:       🟢 MEDIUM
USED BY:        Users list page, src/app/[locale]/(dashboard)/dashboard/users/page.tsx
WORKFLOW STEP:  Step 1 of User List Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewUsers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "page": {
    "type": "integer",
    "required": false,
    "default": 1,
    "example": 1
  },
  "size": {
    "type": "integer",
    "required": false,
    "default": 20,
    "example": 20
  },
  "search": {
    "type": "string",
    "required": false,
    "description": "Search by name or email",
    "example": "john"
  },
  "role": {
    "type": "string",
    "required": false,
    "allowed_values": ["admin","director","registrar","teacher","student","guardian"],
    "example": "teacher"
  },
  "is_active": {
    "type": "boolean",
    "required": false,
    "example": true
  }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "description": "Array of user objects",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "full_name": { "type": "string" },
      "email": { "type": "string" },
      "roles": { "type": "array of strings" },
      "is_active": { "type": "boolean" },
      "created_at": { "type": "string (ISO 8601)" }
    }
  },
  "total": { "type": "integer", "description": "Total number of users matching filters" },
  "page": { "type": "integer", "description": "Current page number" },
  "size": { "type": "integer", "description": "Items per page" },
  "pages": { "type": "integer", "description": "Total number of pages" }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
    
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-026: Only return users user has permission to view
  BR-027: Apply pagination (page and size)
  BR-028: Apply filters if provided
  BR-029: Search across name and email fields
  BR-030: Exclude soft-deleted users unless specifically requested

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Displays users in data table
    2. Updates pagination controls
    3. Caches in React Query
  
  Failure:
    1. Shows error toast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-008
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /users/{id}
PURPOSE:        Get details of a specific user
PRIORITY:       🟢 MEDIUM
USED BY:        User detail page (not yet implemented)
WORKFLOW STEP:  Step 1 of User Detail Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewUsers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": {
    "type": "string/uuid",
    "required": true,
    "description": "User ID",
    "example": "550e8400-e29b-41d4-a716-446655440000"
  }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "email": { "type": "string" },
  "roles": { "type": "array of strings" },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error
  404 Not Found:
    { "message": "User not found" }
    → Frontend action: Show 404 page or error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-031: Check user has permission to view this specific user
  BR-032: Return full user details

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Displays user details
    2. Populates edit form
  Failure:
    1. Shows error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-009
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /users
PURPOSE:        Create a new user
PRIORITY:       🟢 MEDIUM
USED BY:        Create user page (not yet implemented)
WORKFLOW STEP:  Step 1 of User Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canCreateUser

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "email": {
    "type": "string",
    "required": true,
    "format": "email",
    "example": "newuser@sms.edu.et"
  },
  "full_name": {
    "type": "string",
    "required": true,
    "min_length": 2,
    "example": "Jane Doe"
  },
  "password": {
    "type": "string",
    "required": true,
    "min_length": 8,
    "example": "SecurePassword123"
  },
  "phone_number": {
    "type": "string",
    "required": false,
    "nullable": true,
    "example": "+251911234567"
  },
  "address": {
    "type": "string",
    "required": false,
    "nullable": true,
    "example": "Addis Ababa, Ethiopia"
  },
  "role_names": {
    "type": "array of strings",
    "required": true,
    "min_items": 1,
    "allowed_values": ["admin","director","registrar","teacher","student","guardian"],
    "example": ["teacher"]
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "email": { "type": "string" },
  "roles": { "type": "array of strings" },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request:
    { "message": "Validation error", "errors": { "email": "Email already exists" } }
    → Frontend action: Display field-level errors
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-033: Email must be unique
  BR-034: At least one role required
  BR-035: Non-admin users cannot create admin users
  BR-036: Hash password before storing
  BR-037: Set is_active = true by default
  BR-038: Validate password strength

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Shows success toast
    2. Redirects to users list
    3. Invalidates users query cache
  Failure:
    1. Shows error message
    2. Keeps form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-010
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /users/{id}
PURPOSE:        Update an existing user
PRIORITY:       🟢 MEDIUM
USED BY:        Edit user page (not yet implemented)
WORKFLOW STEP:  Step 1 of User Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canEditUser (with target role check)

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": {
    "type": "string/uuid",
    "required": true,
    "example": "550e8400-e29b-41d4-a716-446655440000"
  }
}

REQUEST BODY:
{
  "full_name": {
    "type": "string",
    "required": false,
    "min_length": 2,
    "example": "Jane Smith"
  },
  "phone_number": {
    "type": "string",
    "required": false,
    "nullable": true,
    "example": "+251911234567"
  },
  "address": {
    "type": "string",
    "required": false,
    "nullable": true,
    "example": "Addis Ababa, Ethiopia"
  },
  "profile_image_url": {
    "type": "string",
    "required": false,
    "nullable": true,
    "example": "https://example.com/image.jpg"
  },
  "is_active": {
    "type": "boolean",
    "required": false,
    "example": true
  }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "email": { "type": "string" },
  "roles": { "type": "array of strings" },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request:
    { "message": "Validation error", "errors": {} }
    → Frontend action: Display field-level errors
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error
  404 Not Found:
    { "message": "User not found" }
    → Frontend action: Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-039: Check user has permission to edit this user's role level
  BR-040: Cannot edit own is_active to false
  BR-041: Only update provided fields
  BR-042: Email cannot be changed via this endpoint

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Shows success toast
    2. Redirects to users list or detail
    3. Invalidates users query cache
  Failure:
    1. Shows error message
    2. Keeps form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-011
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       DELETE /users/{id}
PURPOSE:        Soft delete a user
PRIORITY:       🟢 MEDIUM
USED BY:        Users list page, delete action
WORKFLOW STEP:  Step 1 of User Deletion

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canDeleteUser (with target role check)

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": {
    "type": "string/uuid",
    "required": true,
    "example": "550e8400-e29b-41d4-a716-446655440000"
  }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "message": {
    "type": "string",
    "example": "User deleted successfully"
  }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error
  404 Not Found:
    { "message": "User not found" }
    → Frontend action: Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-043: Check user has permission to delete this user's role level
  BR-044: Cannot delete own account
  BR-045: Cannot delete the last admin
  BR-046: Soft delete (set is_active = false, not hard delete)
  BR-047: Invalidate all user's refresh tokens

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Shows success toast
    2. Invalidates users query cache
    3. Removes user from list (optimistic)
  Failure:
    1. Shows error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-012
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /users/{id}/restore
PURPOSE:        Restore a soft-deleted user
PRIORITY:       🟢 MEDIUM
USED BY:        Users list page, restore action
WORKFLOW STEP:  Step 1 of User Restoration

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canRestoreUser

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": {
    "type": "string/uuid",
    "required": true,
    "example": "550e8400-e29b-41d4-a716-446655440000"
  }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "email": { "type": "string" },
  "roles": { "type": "array of strings" },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean", "value": true },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error
  404 Not Found:
    { "message": "User not found" }
    → Frontend action: Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-048: Check user has permission to restore users
  BR-049: Set is_active = true
  BR-050: Only restore if user was soft-deleted

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Shows success toast
    2. Invalidates users query cache
    3. Updates user in list
  Failure:
    1. Shows error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-013
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PUT /users/{id}/roles
PURPOSE:        Update a user's roles
PRIORITY:       🟢 MEDIUM
USED BY:        Role assignment UI (not yet implemented)
WORKFLOW STEP:  Step 1 of Role Assignment

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageRoles

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": {
    "type": "string/uuid",
    "required": true,
    "example": "550e8400-e29b-41d4-a716-446655440000"
  }
}

REQUEST BODY:
{
  "role_names": {
    "type": "array of strings",
    "required": true,
    "min_items": 1,
    "allowed_values": ["admin","director","registrar","teacher","student","guardian"],
    "example": ["teacher", "registrar"]
  }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "email": { "type": "string" },
  "roles": { "type": "array of strings" },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request:
    { "message": "Validation error", "errors": { "role_names": "At least one role required" } }
    → Frontend action: Display field-level errors
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error
  404 Not Found:
    { "message": "User not found" }
    → Frontend action: Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-051: Check user has permission to assign target roles
  BR-052: Cannot remove own admin role if last admin
  BR-053: At least one role required
  BR-054: Log role change

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Shows success toast
    2. Invalidates users query cache
    3. Updates user in list
  Failure:
    1. Shows error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-014
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /users/roles/all
PURPOSE:        Get all available roles with descriptions
PRIORITY:       🟢 MEDIUM
USED BY:        Role selector components
WORKFLOW STEP:  Step 1 of Role Selection

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewUsers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "roles": {
    "type": "array",
    "item_structure": {
      "name": { 
        "type": "string",
        "allowed_values": ["admin","director","registrar","teacher","student","guardian"]
      },
      "description": { "type": "string" }
    },
    "example": [
      { "name": "admin", "description": "Full system access" },
      { "name": "director", "description": "Analytics and oversight" },
      { "name": "registrar", "description": "Academic management" },
      { "name": "teacher", "description": "Classroom management" },
      { "name": "student", "description": "Student access" },
      { "name": "guardian", "description": "Parent access" }
    ]
  }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-055: Return all system roles

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Populates role dropdown/select
    2. Caches in React Query
  Failure:
    1. Shows error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-015
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /users/stats/summary
PURPOSE:        Get user statistics for dashboard
PRIORITY:       🟢 MEDIUM
USED BY:        Dashboard stats cards
WORKFLOW STEP:  Step 1 of Dashboard Stats Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewUsers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "total": { "type": "integer", "description": "Total number of users" },
  "active": { "type": "integer", "description": "Number of active users" },
  "by_role": {
    "type": "object",
    "description": "User count by role",
    "example": {
      "admin": 2,
      "director": 1,
      "registrar": 3,
      "teacher": 25,
      "student": 500,
      "guardian": 400
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized:
    { "message": "Unauthorized" }
    → Frontend action: Trigger token refresh
  403 Forbidden:
    { "message": "Insufficient permissions" }
    → Frontend action: Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-056: Only count users user has permission to view

WHAT FRONTEND DOES WITH RESPONSE:
  Success:
    1. Displays stats on dashboard
    2. Caches in React Query
  Failure:
    1. Shows error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# STUDENT MANAGEMENT ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-016
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /students
PURPOSE:        List students with pagination and filtering
PRIORITY:       🟢 MEDIUM
USED BY:        Students list page
WORKFLOW STEP:  Step 1 of Student List Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "page": { "type": "integer", "required": false, "default": 1 },
  "size": { "type": "integer", "required": false, "default": 20 },
  "search": { "type": "string", "required": false, "description": "Search by name or registration number" },
  "status": { "type": "string", "required": false, "allowed_values": ["active","graduated","transferred","expelled","withdrawn"] },
  "sex": { "type": "string", "required": false, "allowed_values": ["M","F"] },
  "nationality": { "type": "string", "required": false }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "full_name": { "type": "string" },
      "registration_number": { "type": "string" },
      "email": { "type": "string", "nullable": true },
      "sex": { "type": "string" },
      "status": { "type": "string" },
      "is_active": { "type": "boolean" },
      "created_at": { "type": "string (ISO 8601)" }
    }
  },
  "total": { "type": "integer" },
  "page": { "type": "integer" },
  "size": { "type": "integer" },
  "pages": { "type": "integer" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-057: Apply pagination and filters
  BR-058: Search across name and registration number
  BR-059: Exclude soft-deleted students

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display in data table, update pagination, cache in React Query
  Failure: Show error toast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-017
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /students/{id}
PURPOSE:        Get details of a specific student
PRIORITY:       🟢 MEDIUM
USED BY:        Student detail page (not yet implemented)
WORKFLOW STEP:  Step 1 of Student Detail Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "registration_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "date_of_birth": { "type": "string (ISO 8601 date)" },
  "sex": { "type": "string" },
  "nationality": { "type": "string" },
  "admission_date": { "type": "string (ISO 8601 date)" },
  "previous_school": { "type": "string", "nullable": true },
  "ministry_exam_result": { "type": "number", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "status": { "type": "string" },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-060: Return full student details

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display student details, populate edit form
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-018
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /students/registration/{regNumber}
PURPOSE:        Get student by registration number
PRIORITY:       🟢 MEDIUM
USED BY:        Student lookup (not yet implemented)
WORKFLOW STEP:  Step 1 of Student Lookup

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "regNumber": { "type": "string", "required": true, "description": "Student registration number" }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "registration_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "status": { "type": "string" },
  "is_active": { "type": "boolean" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-061: Return student with matching registration number

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display student info
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-019
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /students
PURPOSE:        Create a new student
PRIORITY:       🟢 MEDIUM
USED BY:        Create student page (not yet implemented)
WORKFLOW STEP:  Step 1 of Student Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "email": { "type": "string", "required": false, "format": "email", "nullable": true },
  "full_name": { "type": "string", "required": true, "min_length": 2 },
  "phone_number": { "type": "string", "required": false, "nullable": true },
  "address": { "type": "string", "required": false, "nullable": true },
  "password": { "type": "string", "required": false, "min_length": 8, "description": "Required if email provided" },
  "admission_date": { "type": "string (ISO 8601 date)", "required": true },
  "date_of_birth": { "type": "string (ISO 8601 date)", "required": true },
  "sex": { "type": "string", "required": true, "allowed_values": ["M","F"] },
  "nationality": { "type": "string", "required": false, "default": "Ethiopian" },
  "previous_school": { "type": "string", "required": false, "nullable": true },
  "ministry_exam_result": { "type": "number", "required": false, "nullable": true }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "registration_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "date_of_birth": { "type": "string (ISO 8601 date)" },
  "sex": { "type": "string" },
  "nationality": { "type": "string" },
  "admission_date": { "type": "string (ISO 8601 date)" },
  "previous_school": { "type": "string", "nullable": true },
  "ministry_exam_result": { "type": "number", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "status": { "type": "string", "value": "active" },
  "is_active": { "type": "boolean", "value": true },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-062: Auto-generate unique registration number
  BR-063: Email must be unique if provided
  BR-064: Hash password if provided
  BR-065: Create user account with "student" role if email and password provided
  BR-066: Set status = "active" by default
  BR-067: Set is_active = true by default

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, redirect to students list, invalidate cache
  Failure: Show error message, keep form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-020
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /students/{id}
PURPOSE:        Update an existing student
PRIORITY:       🟢 MEDIUM
USED BY:        Edit student page (not yet implemented)
WORKFLOW STEP:  Step 1 of Student Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
{
  "full_name": { "type": "string", "required": false, "min_length": 2 },
  "phone_number": { "type": "string", "required": false, "nullable": true },
  "address": { "type": "string", "required": false, "nullable": true },
  "profile_image_url": { "type": "string", "required": false, "nullable": true },
  "is_active": { "type": "boolean", "required": false },
  "status": { "type": "string", "required": false, "allowed_values": ["active","graduated","transferred","expelled","withdrawn"] },
  "nationality": { "type": "string", "required": false },
  "previous_school": { "type": "string", "required": false, "nullable": true },
  "ministry_exam_result": { "type": "number", "required": false, "nullable": true }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "registration_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "date_of_birth": { "type": "string (ISO 8601 date)" },
  "sex": { "type": "string" },
  "nationality": { "type": "string" },
  "admission_date": { "type": "string (ISO 8601 date)" },
  "previous_school": { "type": "string", "nullable": true },
  "ministry_exam_result": { "type": "number", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "status": { "type": "string" },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-068: Only update provided fields
  BR-069: Cannot change registration number
  BR-070: Cannot change date_of_birth or admission_date
  BR-071: Cannot change sex
  BR-072: If status changes to "graduated", set is_active = false

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, redirect, invalidate cache
  Failure: Show error message, keep form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-021
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       DELETE /students/{id}
PURPOSE:        Soft delete a student
PRIORITY:       🟢 MEDIUM
USED BY:        Students list page, delete action
WORKFLOW STEP:  Step 1 of Student Deletion

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Student deleted successfully" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-073: Soft delete (set is_active = false)
  BR-074: Cannot delete student with active enrollments
  BR-075: Invalidate student's user account refresh tokens if exists

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, remove from list (optimistic)
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-022
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /students/{id}/restore
PURPOSE:        Restore a soft-deleted student
PRIORITY:       🟢 MEDIUM
USED BY:        Students list page, restore action
WORKFLOW STEP:  Step 1 of Student Restoration

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "registration_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "status": { "type": "string" },
  "is_active": { "type": "boolean", "value": true },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-076: Set is_active = true
  BR-077: Only restore if student was soft-deleted

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, update in list
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-023
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /students/stats/summary
PURPOSE:        Get student statistics for dashboard
PRIORITY:       🟢 MEDIUM
USED BY:        Dashboard stats cards
WORKFLOW STEP:  Step 1 of Dashboard Stats Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "total": { "type": "integer", "description": "Total number of students" },
  "active": { "type": "integer", "description": "Number of active students" },
  "by_status": {
    "type": "object",
    "description": "Student count by status",
    "example": { "active": 450, "graduated": 30, "transferred": 10, "expelled": 2, "withdrawn": 8 }
  },
  "by_sex": {
    "type": "object",
    "description": "Student count by sex",
    "example": { "M": 250, "F": 250 }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-078: Only count students user has permission to view

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display stats on dashboard, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# TEACHER MANAGEMENT ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /teachers
PURPOSE:        List teachers with pagination and filtering
PRIORITY:       🟢 MEDIUM
USED BY:        Teachers list page
WORKFLOW STEP:  Step 1 of Teacher List Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "page": { "type": "integer", "required": false, "default": 1 },
  "size": { "type": "integer", "required": false, "default": 20 },
  "search": { "type": "string", "required": false, "description": "Search by name or employee ID" },
  "status": { "type": "string", "required": false, "allowed_values": ["active","inactive","on_leave"] },
  "subject": { "type": "string", "required": false, "description": "Filter by subject taught" }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "full_name": { "type": "string" },
      "employee_id": { "type": "string" },
      "email": { "type": "string", "nullable": true },
      "subjects": { "type": "array of strings" },
      "status": { "type": "string" },
      "is_active": { "type": "boolean" },
      "created_at": { "type": "string (ISO 8601)" }
    }
  },
  "total": { "type": "integer" },
  "page": { "type": "integer" },
  "size": { "type": "integer" },
  "pages": { "type": "integer" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-079: Apply pagination and filters
  BR-080: Search across name and employee ID
  BR-081: Exclude soft-deleted teachers

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display in data table, update pagination, cache in React Query
  Failure: Show error toast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /teachers/{id}
PURPOSE:        Get details of a specific teacher
PRIORITY:       🟢 MEDIUM
USED BY:        Teacher detail page (not yet implemented)
WORKFLOW STEP:  Step 1 of Teacher Detail Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "employee_id": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "date_of_birth": { "type": "string (ISO 8601 date)" },
  "sex": { "type": "string", "allowed_values": ["M","F"] },
  "nationality": { "type": "string" },
  "hire_date": { "type": "string (ISO 8601 date)" },
  "qualification": { "type": "string", "nullable": true },
  "subjects": { "type": "array of strings" },
  "profile_image_url": { "type": "string", "nullable": true },
  "status": { "type": "string" },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Teacher not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-082: Return full teacher details

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display teacher details, populate edit form
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /teachers/employee/{employeeId}
PURPOSE:        Get teacher by employee ID
PRIORITY:       🟢 MEDIUM
USED BY:        Teacher lookup (not yet implemented)
WORKFLOW STEP:  Step 1 of Teacher Lookup

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "employeeId": { "type": "string", "required": true, "description": "Teacher employee ID" }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "employee_id": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "subjects": { "type": "array of strings" },
  "status": { "type": "string" },
  "is_active": { "type": "boolean" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Teacher not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-083: Return teacher with matching employee ID

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display teacher info
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-027
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /teachers
PURPOSE:        Create a new teacher
PRIORITY:       🟢 MEDIUM
USED BY:        Create teacher page (not yet implemented)
WORKFLOW STEP:  Step 1 of Teacher Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "email": {
    "type": "string",
    "required": false,
    "format": "email",
    "nullable": true
  },
  "full_name": {
    "type": "string",
    "required": true,
    "min_length": 2
  },
  "phone_number": {
    "type": "string",
    "required": false,
    "nullable": true
  },
  "address": {
    "type": "string",
    "required": false,
    "nullable": true
  },
  "password": {
    "type": "string",
    "required": false,
    "min_length": 8,
    "description": "Required if email provided"
  },
  "hire_date": {
    "type": "string (ISO 8601 date)",
    "required": true
  },
  "date_of_birth": {
    "type": "string (ISO 8601 date)",
    "required": true
  },
  "sex": {
    "type": "string",
    "required": true,
    "allowed_values": ["M","F"]
  },
  "nationality": {
    "type": "string",
    "required": false,
    "default": "Ethiopian"
  },
  "qualification": {
    "type": "string",
    "required": false,
    "nullable": true
  },
  "subjects": {
    "type": "array of strings",
    "required": false,
    "description": "Subjects this teacher can teach"
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "employee_id": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "date_of_birth": { "type": "string (ISO 8601 date)" },
  "sex": { "type": "string" },
  "nationality": { "type": "string" },
  "hire_date": { "type": "string (ISO 8601 date)" },
  "qualification": { "type": "string", "nullable": true },
  "subjects": { "type": "array of strings" },
  "profile_image_url": { "type": "string", "nullable": true },
  "status": { "type": "string", "value": "active" },
  "is_active": { "type": "boolean", "value": true },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-084: Auto-generate unique employee ID
  BR-085: Email must be unique if provided
  BR-086: Hash password if provided
  BR-087: Create user account with "teacher" role if email and password provided
  BR-088: Set status = "active" by default
  BR-089: Set is_active = true by default

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, redirect to teachers list, invalidate cache
  Failure: Show error message, keep form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-028
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /teachers/{id}
PURPOSE:        Update an existing teacher
PRIORITY:       🟢 MEDIUM
USED BY:        Edit teacher page (not yet implemented)
WORKFLOW STEP:  Step 1 of Teacher Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
{
  "full_name": {
    "type": "string",
    "required": false,
    "min_length": 2
  },
  "phone_number": {
    "type": "string",
    "required": false,
    "nullable": true
  },
  "address": {
    "type": "string",
    "required": false,
    "nullable": true
  },
  "profile_image_url": {
    "type": "string",
    "required": false,
    "nullable": true
  },
  "is_active": {
    "type": "boolean",
    "required": false
  },
  "status": {
    "type": "string",
    "required": false,
    "allowed_values": ["active","inactive","on_leave"]
  },
  "qualification": {
    "type": "string",
    "required": false,
    "nullable": true
  },
  "subjects": {
    "type": "array of strings",
    "required": false
  }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "employee_id": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "phone_number": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "date_of_birth": { "type": "string (ISO 8601 date)" },
  "sex": { "type": "string" },
  "nationality": { "type": "string" },
  "hire_date": { "type": "string (ISO 8601 date)" },
  "qualification": { "type": "string", "nullable": true },
  "subjects": { "type": "array of strings" },
  "profile_image_url": { "type": "string", "nullable": true },
  "status": { "type": "string" },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Teacher not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-090: Only update provided fields
  BR-091: Cannot change employee_id
  BR-092: Cannot change date_of_birth or hire_date
  BR-093: Cannot change sex

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, redirect, invalidate cache
  Failure: Show error message, keep form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-029
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       DELETE /teachers/{id}
PURPOSE:        Soft delete a teacher
PRIORITY:       🟢 MEDIUM
USED BY:        Teachers list page, delete action
WORKFLOW STEP:  Step 1 of Teacher Deletion

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Teacher deleted successfully" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Teacher not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-094: Soft delete (set is_active = false)
  BR-095: Cannot delete teacher with active class assignments
  BR-096: Invalidate teacher's user account refresh tokens if exists

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, remove from list (optimistic)
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-030
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /teachers/{id}/restore
PURPOSE:        Restore a soft-deleted teacher
PRIORITY:       🟢 MEDIUM
USED BY:        Teachers list page, restore action
WORKFLOW STEP:  Step 1 of Teacher Restoration

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "employee_id": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "status": { "type": "string" },
  "is_active": { "type": "boolean", "value": true },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Teacher not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-097: Set is_active = true
  BR-098: Only restore if teacher was soft-deleted

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, update in list
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-031
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /teachers/stats/summary
PURPOSE:        Get teacher statistics for dashboard
PRIORITY:       🟢 MEDIUM
USED BY:        Dashboard stats cards
WORKFLOW STEP:  Step 1 of Dashboard Stats Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageTeachers

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "total": { "type": "integer", "description": "Total number of teachers" },
  "active": { "type": "integer", "description": "Number of active teachers" },
  "by_status": {
    "type": "object",
    "description": "Teacher count by status",
    "example": { "active": 25, "inactive": 2, "on_leave": 3 }
  },
  "by_subject": {
    "type": "object",
    "description": "Teacher count by subject",
    "example": { "Mathematics": 5, "English": 4, "Science": 6 }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-099: Only count teachers user has permission to view

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display stats on dashboard, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# GUARDIAN MANAGEMENT ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-032
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardians
PURPOSE:        List guardians with pagination and filtering
PRIORITY:       🟢 MEDIUM
USED BY:        Guardians list page (not yet implemented)
WORKFLOW STEP:  Step 1 of Guardian List Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "page": { "type": "integer", "required": false, "default": 1 },
  "size": { "type": "integer", "required": false, "default": 20 },
  "search": { "type": "string", "required": false, "description": "Search by name or phone" }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "full_name": { "type": "string" },
      "phone_number": { "type": "string" },
      "email": { "type": "string", "nullable": true },
      "linked_students_count": { "type": "integer" },
      "is_active": { "type": "boolean" },
      "created_at": { "type": "string (ISO 8601)" }
    }
  },
  "total": { "type": "integer" },
  "page": { "type": "integer" },
  "size": { "type": "integer" },
  "pages": { "type": "integer" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-100: Apply pagination and filters
  BR-101: Search across name and phone
  BR-102: Exclude soft-deleted guardians

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display in data table, update pagination, cache in React Query
  Failure: Show error toast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-033
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardians/{id}
PURPOSE:        Get details of a specific guardian
PRIORITY:       🟢 MEDIUM
USED BY:        Guardian detail page (not yet implemented)
WORKFLOW STEP:  Step 1 of Guardian Detail Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "phone_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "relationship_to_student": { "type": "string", "nullable": true },
  "occupation": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean" },
  "linked_students": {
    "type": "array",
    "item_structure": {
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "relationship": { "type": "string" }
    }
  },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Guardian not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-103: Return full guardian details with linked students

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display guardian details, populate edit form
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-034
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardians/student/{studentId}
PURPOSE:        Get guardians for a specific student
PRIORITY:       🟢 MEDIUM
USED BY:        Student detail page
WORKFLOW STEP:  Step 1 of Student Guardian Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageStudents

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "full_name": { "type": "string" },
      "phone_number": { "type": "string" },
      "email": { "type": "string", "nullable": true },
      "relationship": { "type": "string" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-104: Return all guardians linked to the student

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display guardians in student detail
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-035
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /guardians
PURPOSE:        Create a new guardian
PRIORITY:       🟢 MEDIUM
USED BY:        Create guardian page (not yet implemented)
WORKFLOW STEP:  Step 1 of Guardian Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "email": { "type": "string", "required": false, "format": "email", "nullable": true },
  "full_name": { "type": "string", "required": true, "min_length": 2 },
  "phone_number": { "type": "string", "required": true },
  "address": { "type": "string", "required": false, "nullable": true },
  "password": { "type": "string", "required": false, "min_length": 8, "description": "Required if email provided" },
  "relationship_to_student": { "type": "string", "required": false, "nullable": true },
  "occupation": { "type": "string", "required": false, "nullable": true }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "phone_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "relationship_to_student": { "type": "string", "nullable": true },
  "occupation": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean", "value": true },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-105: Phone number must be unique
  BR-106: Email must be unique if provided
  BR-107: Hash password if provided
  BR-108: Create user account with "guardian" role if email and password provided
  BR-109: Set is_active = true by default

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, redirect to guardians list, invalidate cache
  Failure: Show error message, keep form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-036
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /guardians/{id}
PURPOSE:        Update an existing guardian
PRIORITY:       🟢 MEDIUM
USED BY:        Edit guardian page (not yet implemented)
WORKFLOW STEP:  Step 1 of Guardian Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
{
  "full_name": { "type": "string", "required": false, "min_length": 2 },
  "phone_number": { "type": "string", "required": false },
  "address": { "type": "string", "required": false, "nullable": true },
  "profile_image_url": { "type": "string", "required": false, "nullable": true },
  "is_active": { "type": "boolean", "required": false },
  "relationship_to_student": { "type": "string", "required": false, "nullable": true },
  "occupation": { "type": "string", "required": false, "nullable": true }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "full_name": { "type": "string" },
  "phone_number": { "type": "string" },
  "email": { "type": "string", "nullable": true },
  "address": { "type": "string", "nullable": true },
  "relationship_to_student": { "type": "string", "nullable": true },
  "occupation": { "type": "string", "nullable": true },
  "profile_image_url": { "type": "string", "nullable": true },
  "is_active": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Guardian not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-110: Only update provided fields
  BR-111: Phone number must remain unique if changed

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, redirect, invalidate cache
  Failure: Show error message, keep form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-037
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       DELETE /guardians/{id}
PURPOSE:        Soft delete a guardian
PRIORITY:       🟢 MEDIUM
USED BY:        Guardians list page, delete action
WORKFLOW STEP:  Step 1 of Guardian Deletion

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Guardian deleted successfully" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Guardian not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-112: Soft delete (set is_active = false)
  BR-113: Unlink guardian from all students
  BR-114: Invalidate guardian's user account refresh tokens if exists

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, remove from list (optimistic)
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-038
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /guardians/{id}/link-student
PURPOSE:        Link a guardian to a student
PRIORITY:       🟢 MEDIUM
USED BY:        Student detail page, guardian management
WORKFLOW STEP:  Step 1 of Guardian-Student Link

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true, "description": "Guardian ID" }
}

REQUEST BODY:
{
  "student_id": { "type": "string/uuid", "required": true },
  "relationship": { "type": "string", "required": true, "example": "Father" }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Guardian linked to student successfully" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Guardian or student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-115: Check both guardian and student exist
  BR-116: Prevent duplicate links
  BR-117: Relationship is required

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-039
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /guardians/{id}/unlink-student
PURPOSE:        Unlink a guardian from a student
PRIORITY:       🟢 MEDIUM
USED BY:        Student detail page, guardian management
WORKFLOW STEP:  Step 1 of Guardian-Student Unlink

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true, "description": "Guardian ID" }
}

REQUEST BODY:
{
  "student_id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Guardian unlinked from student successfully" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Guardian or student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-118: Check link exists before unlinking

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-040
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardians/stats/summary
PURPOSE:        Get guardian statistics for dashboard
PRIORITY:       🟢 MEDIUM
USED BY:        Dashboard stats cards
WORKFLOW STEP:  Step 1 of Dashboard Stats Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGuardians

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "total": { "type": "integer", "description": "Total number of guardians" },
  "active": { "type": "integer", "description": "Number of active guardians" },
  "with_students": { "type": "integer", "description": "Guardians with linked students" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-119: Only count guardians user has permission to view

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display stats on dashboard, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# ACADEMIC STRUCTURE ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-041
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/years
PURPOSE:        List all academic years
PRIORITY:       🔴 CRITICAL
USED BY:        Academic years page, multiple dropdowns
WORKFLOW STEP:  Step 1 of Academic Year Selection

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "status": { "type": "string", "required": false, "allowed_values": ["upcoming","active","completed"] }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "name": { "type": "string", "example": "2024-2025" },
      "start_date": { "type": "string (ISO 8601 date)" },
      "end_date": { "type": "string (ISO 8601 date)" },
      "status": { "type": "string", "allowed_values": ["upcoming","active","completed"] },
      "is_current": { "type": "boolean" },
      "terms_count": { "type": "integer" },
      "classes_count": { "type": "integer" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-120: Return years ordered by start_date descending
  BR-121: Mark only one year as is_current = true

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate dropdowns, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-042
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /academics/years
PURPOSE:        Create a new academic year
PRIORITY:       🔴 CRITICAL
USED BY:        Academic years page
WORKFLOW STEP:  Step 1 of Academic Year Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "name": {
    "type": "string",
    "required": true,
    "example": "2025-2026"
  },
  "start_date": {
    "type": "string (ISO 8601 date)",
    "required": true
  },
  "end_date": {
    "type": "string (ISO 8601 date)",
    "required": true
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "start_date": { "type": "string (ISO 8601 date)" },
  "end_date": { "type": "string (ISO 8601 date)" },
  "status": { "type": "string", "value": "upcoming" },
  "is_current": { "type": "boolean", "value": false },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-122: Name must be unique
  BR-123: end_date must be after start_date
  BR-124: Cannot overlap with existing years
  BR-125: Set status = "upcoming" by default

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, redirect
  Failure: Show error message, keep form populated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-043
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /academics/years/{id}
PURPOSE:        Update an academic year
PRIORITY:       🔴 CRITICAL
USED BY:        Academic years page
WORKFLOW STEP:  Step 1 of Academic Year Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
{
  "name": { "type": "string", "required": false },
  "start_date": { "type": "string (ISO 8601 date)", "required": false },
  "end_date": { "type": "string (ISO 8601 date)", "required": false },
  "is_current": { "type": "boolean", "required": false }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "start_date": { "type": "string (ISO 8601 date)" },
  "end_date": { "type": "string (ISO 8601 date)" },
  "status": { "type": "string" },
  "is_current": { "type": "boolean" },
  "created_at": { "type": "string (ISO 8601)" },
  "updated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Academic year not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-126: If is_current = true, set is_current = false on all other years
  BR-127: Cannot change is_current to false if it's the only current year
  BR-128: Cannot update dates if year has enrollments or grades

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-044
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/years/{yearId}/terms
PURPOSE:        Get terms for an academic year
PRIORITY:       🔴 CRITICAL
USED BY:        Terms dropdown, schedule page
WORKFLOW STEP:  Step 2 of Academic Selection

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "yearId": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "name": { "type": "string", "example": "Semester 1" },
      "start_date": { "type": "string (ISO 8601 date)" },
      "end_date": { "type": "string (ISO 8601 date)" },
      "status": { "type": "string", "allowed_values": ["upcoming","active","completed"] },
      "academic_year_id": { "type": "string/uuid" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Academic year not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-129: Return terms ordered by start_date

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate dropdowns, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-045
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /academics/years/{yearId}/terms
PURPOSE:        Create a new term for an academic year
PRIORITY:       🔴 CRITICAL
USED BY:        Academic years page
WORKFLOW STEP:  Step 1 of Term Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "yearId": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
{
  "name": {
    "type": "string",
    "required": true,
    "example": "Semester 1"
  },
  "start_date": {
    "type": "string (ISO 8601 date)",
    "required": true
  },
  "end_date": {
    "type": "string (ISO 8601 date)",
    "required": true
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "start_date": { "type": "string (ISO 8601 date)" },
  "end_date": { "type": "string (ISO 8601 date)" },
  "status": { "type": "string", "value": "upcoming" },
  "academic_year_id": { "type": "string/uuid" },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-130: Term dates must be within academic year dates
  BR-131: Terms cannot overlap within the same year
  BR-132: Set status = "upcoming" by default

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-046
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/classes
PURPOSE:        List all classes
PRIORITY:       🔴 CRITICAL
USED BY:        Classes dropdown, enrollment page
WORKFLOW STEP:  Step 3 of Academic Selection

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "grade_level": { "type": "string", "required": false }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "name": { "type": "string", "example": "Grade 10" },
      "grade_level": { "type": "string", "example": "10" },
      "academic_year_id": { "type": "string/uuid" },
      "sections_count": { "type": "integer" },
      "students_count": { "type": "integer" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-133: Filter by academic_year_id if provided

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate dropdowns, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-047
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /academics/classes
PURPOSE:        Create a new class
PRIORITY:       🔴 CRITICAL
USED BY:        Classes page (not yet implemented)
WORKFLOW STEP:  Step 1 of Class Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "name": {
    "type": "string",
    "required": true,
    "example": "Grade 10"
  },
  "grade_level": {
    "type": "string",
    "required": true,
    "example": "10"
  },
  "academic_year_id": {
    "type": "string/uuid",
    "required": true
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "grade_level": { "type": "string" },
  "academic_year_id": { "type": "string/uuid" },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-134: Class name + academic_year_id must be unique

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-048
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/classes/{classId}/sections
PURPOSE:        Get sections for a class
PRIORITY:       🔴 CRITICAL
USED BY:        Sections dropdown, attendance page
WORKFLOW STEP:  Step 4 of Academic Selection

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "classId": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "name": { "type": "string", "example": "Section A" },
      "class_id": { "type": "string/uuid" },
      "capacity": { "type": "integer" },
      "students_count": { "type": "integer" },
      "room_number": { "type": "string", "nullable": true }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Class not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-135: Return sections ordered by name

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate dropdowns, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-049
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /academics/classes/{classId}/sections
PURPOSE:        Create a new section for a class
PRIORITY:       🔴 CRITICAL
USED BY:        Classes page (not yet implemented)
WORKFLOW STEP:  Step 1 of Section Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "classId": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
{
  "name": {
    "type": "string",
    "required": true,
    "example": "Section A"
  },
  "capacity": {
    "type": "integer",
    "required": false,
    "default": 40
  },
  "room_number": {
    "type": "string",
    "required": false,
    "nullable": true
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "class_id": { "type": "string/uuid" },
  "capacity": { "type": "integer" },
  "room_number": { "type": "string", "nullable": true },
  "students_count": { "type": "integer", "value": 0 },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-136: Section name + class_id must be unique
  BR-137: Capacity must be positive

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-050
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/subjects
PURPOSE:        List all subjects
PRIORITY:       🔴 CRITICAL
USED BY:        Subjects dropdown, grades page
WORKFLOW STEP:  Step 5 of Academic Selection

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "category": { "type": "string", "required": false, "allowed_values": ["core","elective","extra"] }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "name": { "type": "string", "example": "Mathematics" },
      "code": { "type": "string", "example": "MATH" },
      "category": { "type": "string", "allowed_values": ["core","elective","extra"] },
      "credit_hours": { "type": "integer" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-138: Return subjects ordered by name

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate dropdowns, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-051
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /academics/subjects
PURPOSE:        Create a new subject
PRIORITY:       🔴 CRITICAL
USED BY:        Subjects page (not yet implemented)
WORKFLOW STEP:  Step 1 of Subject Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "name": {
    "type": "string",
    "required": true,
    "example": "Physics"
  },
  "code": {
    "type": "string",
    "required": true,
    "example": "PHYS"
  },
  "category": {
    "type": "string",
    "required": true,
    "allowed_values": ["core","elective","extra"]
  },
  "credit_hours": {
    "type": "integer",
    "required": false,
    "default": 1
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "code": { "type": "string" },
  "category": { "type": "string" },
  "credit_hours": { "type": "integer" },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-139: Code must be unique
  BR-140: Credit hours must be positive

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-052
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/classes/{classId}/sections/{sectionId}
PURPOSE:        Get section details with students
PRIORITY:       🔴 CRITICAL
USED BY:        Attendance page, grades page
WORKFLOW STEP:  Step 1 of Section Data Fetch

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "classId": { "type": "string/uuid", "required": true },
  "sectionId": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "class_id": { "type": "string/uuid" },
  "class_name": { "type": "string" },
  "capacity": { "type": "integer" },
  "room_number": { "type": "string", "nullable": true },
  "students": {
    "type": "array",
    "item_structure": {
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "registration_number": { "type": "string" }
    }
  },
  "students_count": { "type": "integer" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Section not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-141: Return only enrolled students for the current academic year

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display section info and student list
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-053
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /academics/sections/{sectionId}/subjects
PURPOSE:        Assign subject to a section
PRIORITY:       🟢 MEDIUM
USED BY:        Section management (not yet implemented)
WORKFLOW STEP:  Step 1 of Subject Assignment

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "sectionId": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
{
  "subject_id": { "type": "string/uuid", "required": true },
  "teacher_id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (201):
{
  "message": { "type": "string", "example": "Subject assigned to section successfully" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-142: Prevent duplicate subject assignments
  BR-143: Verify teacher exists and is active

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-054
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/sections/{sectionId}/subjects
PURPOSE:        Get subjects assigned to a section
PRIORITY:       🔴 CRITICAL
USED BY:        Grades page, schedule page
WORKFLOW STEP:  Step 1 of Section Subjects Fetch

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAcademics

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "sectionId": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "subject_id": { "type": "string/uuid" },
      "subject_name": { "type": "string" },
      "subject_code": { "type": "string" },
      "teacher_id": { "type": "string/uuid" },
      "teacher_name": { "type": "string" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Section not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-144: Return subjects with assigned teachers

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate subject dropdown
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-055
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /enrollments
PURPOSE:        Enroll a student in a section
PRIORITY:       🔴 CRITICAL
USED BY:        Enrollment page, student creation
WORKFLOW STEP:  Step 1 of Student Enrollment

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageEnrollments

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "student_id": { "type": "string/uuid", "required": true },
  "section_id": { "type": "string/uuid", "required": true },
  "academic_year_id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "student_id": { "type": "string/uuid" },
  "section_id": { "type": "string/uuid" },
  "academic_year_id": { "type": "string/uuid" },
  "status": { "type": "string", "value": "active" },
  "enrollment_date": { "type": "string (ISO 8601)" },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  409 Conflict: { "message": "Student already enrolled in this section" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-145: Prevent duplicate enrollments
  BR-146: Check section capacity
  BR-147: Student must be active
  BR-148: Section must belong to specified academic year

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-056
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /enrollments
PURPOSE:        List enrollments with filtering
PRIORITY:       🟢 MEDIUM
USED BY:        Enrollment page
WORKFLOW STEP:  Step 1 of Enrollment List Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewEnrollments

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "page": { "type": "integer", "required": false, "default": 1 },
  "size": { "type": "integer", "required": false, "default": 20 },
  "academic_year_id": { "type": "string/uuid", "required": false },
  "section_id": { "type": "string/uuid", "required": false },
  "status": { "type": "string", "required": false, "allowed_values": ["active","withdrawn","transferred","completed"] },
  "search": { "type": "string", "required": false, "description": "Search by student name or registration number" }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "registration_number": { "type": "string" },
      "section_id": { "type": "string/uuid" },
      "section_name": { "type": "string" },
      "class_name": { "type": "string" },
      "academic_year_id": { "type": "string/uuid" },
      "academic_year_name": { "type": "string" },
      "status": { "type": "string" },
      "enrollment_date": { "type": "string (ISO 8601 date)" }
    }
  },
  "total": { "type": "integer" },
  "page": { "type": "integer" },
  "size": { "type": "integer" },
  "pages": { "type": "integer" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-149: Apply pagination and filters
  BR-150: Search across student name and registration number

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display in data table, update pagination, cache in React Query
  Failure: Show error toast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# ATTENDANCE ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-061
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /attendance/section/{sectionId}/date/{date}
PURPOSE:        Get attendance records for a section on a specific date
PRIORITY:       🔴 CRITICAL
USED BY:        Attendance page
WORKFLOW STEP:  Step 1 of Attendance Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAttendance

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "sectionId": { "type": "string/uuid", "required": true },
  "date": { "type": "string (ISO 8601 date)", "required": true }
}

SUCCESS RESPONSE (200):
{
  "date": { "type": "string (ISO 8601 date)" },
  "section_id": { "type": "string/uuid" },
  "section_name": { "type": "string" },
  "summary": {
    "total_students": { "type": "integer" },
    "present": { "type": "integer" },
    "absent": { "type": "integer" },
    "late": { "type": "integer" },
    "excused": { "type": "integer" },
    "not_marked": { "type": "integer" }
  },
  "records": {
    "type": "array",
    "item_structure": {
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "registration_number": { "type": "string" },
      "status": { "type": "string", "allowed_values": ["present","absent","late","excused","not_marked"] },
      "marked_by": { "type": "string", "nullable": true },
      "marked_at": { "type": "string (ISO 8601)", "nullable": true }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Section not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-151: Return all enrolled students for the section
  BR-152: Include students without attendance as "not_marked"

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display attendance grid with existing records
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-062
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /attendance/bulk
PURPOSE:        Submit attendance for multiple students
PRIORITY:       🔴 CRITICAL
USED BY:        Attendance page
WORKFLOW STEP:  Step 2 of Attendance Submission

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageAttendance

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "section_id": { "type": "string/uuid", "required": true },
  "date": { "type": "string (ISO 8601 date)", "required": true },
  "records": {
    "type": "array",
    "required": true,
    "item_structure": {
      "student_id": { "type": "string/uuid", "required": true },
      "status": {
        "type": "string",
        "required": true,
        "allowed_values": ["present","absent","late","excused"]
      }
    }
  }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Attendance submitted successfully" },
  "summary": {
    "total": { "type": "integer" },
    "present": { "type": "integer" },
    "absent": { "type": "integer" },
    "late": { "type": "integer" },
    "excused": { "type": "integer" }
  }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-153: All students must be enrolled in the section
  BR-154: Date must be within current academic year
  BR-155: Cannot submit attendance for future dates
  BR-156: Override existing records if they exist
  BR-157: Log who submitted the attendance

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, show summary
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-063
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /attendance/student/{studentId}/summary
PURPOSE:        Get attendance summary for a student
PRIORITY:       🟢 MEDIUM
USED BY:        Student portal, student detail page
WORKFLOW STEP:  Step 1 of Student Attendance Summary

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAttendance

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "term_id": { "type": "string/uuid", "required": false },
  "from_date": { "type": "string (ISO 8601 date)", "required": false },
  "to_date": { "type": "string (ISO 8601 date)", "required": false }
}

SUCCESS RESPONSE (200):
{
  "student_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "period": {
    "from_date": { "type": "string (ISO 8601 date)" },
    "to_date": { "type": "string (ISO 8601 date)" }
  },
  "summary": {
    "total_days": { "type": "integer" },
    "present": { "type": "integer" },
    "absent": { "type": "integer" },
    "late": { "type": "integer" },
    "excused": { "type": "integer" },
    "attendance_percentage": { "type": "number" }
  },
  "daily_records": {
    "type": "array",
    "item_structure": {
      "date": { "type": "string (ISO 8601 date)" },
      "status": { "type": "string" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-158: Calculate attendance percentage as (present / total_days) * 100
  BR-159: Filter by date range if provided

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display attendance summary and calendar view
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-064
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /attendance/stats/summary
PURPOSE:        Get attendance statistics for dashboard
PRIORITY:       🟢 MEDIUM
USED BY:        Dashboard stats cards
WORKFLOW STEP:  Step 1 of Dashboard Stats Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAttendance

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "date": { "type": "string (ISO 8601 date)", "required": false, "description": "For daily stats" }
}

SUCCESS RESPONSE (200):
{
  "overall": {
    "average_attendance_rate": { "type": "number" },
    "total_students": { "type": "integer" },
    "present_today": { "type": "integer" },
    "absent_today": { "type": "integer" }
  },
  "by_status": {
    "present": { "type": "integer" },
    "absent": { "type": "integer" },
    "late": { "type": "integer" },
    "excused": { "type": "integer" }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-160: Only include data user has permission to view

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display stats on dashboard, cache in React Query
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# GRADE MANAGEMENT ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-067
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /academics/assessments
PURPOSE:        List assessments for a section and subject
PRIORITY:       🔴 CRITICAL
USED BY:        Grades page
WORKFLOW STEP:  Step 1 of Assessment Selection

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGrades

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "section_id": { "type": "string/uuid", "required": true },
  "subject_id": { "type": "string/uuid", "required": true },
  "term_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "name": { "type": "string", "example": "Midterm Exam" },
      "type": {
        "type": "string",
        "allowed_values": ["quiz","test","midterm","final","assignment","project"]
      },
      "date": { "type": "string (ISO 8601 date)" },
      "max_score": { "type": "number" },
      "weight": { "type": "number", "description": "Weight towards final grade" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-161: Return assessments ordered by date

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate assessment dropdown
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-068
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /academics/assessments
PURPOSE:        Create a new assessment
PRIORITY:       🔴 CRITICAL
USED BY:        Grades page
WORKFLOW STEP:  Step 1 of Assessment Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGrades

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "section_id": { "type": "string/uuid", "required": true },
  "subject_id": { "type": "string/uuid", "required": true },
  "term_id": { "type": "string/uuid", "required": true },
  "name": { "type": "string", "required": true },
  "type": {
    "type": "string",
    "required": true,
    "allowed_values": ["quiz","test","midterm","final","assignment","project"]
  },
  "date": { "type": "string (ISO 8601 date)", "required": true },
  "max_score": {
    "type": "number",
    "required": true,
    "example": 100
  },
  "weight": {
    "type": "number",
    "required": false,
    "default": 1,
    "example": 10
  }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "name": { "type": "string" },
  "type": { "type": "string" },
  "date": { "type": "string (ISO 8601 date)" },
  "max_score": { "type": "number" },
  "weight": { "type": "number" },
  "section_id": { "type": "string/uuid" },
  "subject_id": { "type": "string/uuid" },
  "term_id": { "type": "string/uuid" },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-162: max_score must be positive
  BR-163: weight must be positive
  BR-164: Assessment date must be within term dates

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-069
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /grades/assessment/{assessmentId}
PURPOSE:        Get grades for a specific assessment
PRIORITY:       🔴 CRITICAL
USED BY:        Grades page
WORKFLOW STEP:  Step 2 of Grade Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGrades

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "assessmentId": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "assessment_id": { "type": "string/uuid" },
  "assessment_name": { "type": "string" },
  "max_score": { "type": "number" },
  "grades": {
    "type": "array",
    "item_structure": {
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "registration_number": { "type": "string" },
      "score": { "type": "number", "nullable": true },
      "percentage": { "type": "number", "nullable": true },
      "letter_grade": { "type": "string", "nullable": true },
      "graded_by": { "type": "string", "nullable": true },
      "graded_at": { "type": "string (ISO 8601)", "nullable": true }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Assessment not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-165: Return all enrolled students for the assessment's section
  BR-166: Calculate percentage as (score / max_score) * 100
  BR-167: Calculate letter grade based on percentage

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display grade entry grid
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-070
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /grades/bulk
PURPOSE:        Submit grades for multiple students for an assessment
PRIORITY:       🔴 CRITICAL
USED BY:        Grades page
WORKFLOW STEP:  Step 3 of Grade Submission

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageGrades

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "assessment_id": { "type": "string/uuid", "required": true },
  "grades": {
    "type": "array",
    "required": true,
    "item_structure": {
      "student_id": { "type": "string/uuid", "required": true },
      "score": {
        "type": "number",
        "required": true,
        "min": 0
      }
    }
  }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Grades submitted successfully" },
  "summary": {
    "total_students": { "type": "integer" },
    "graded": { "type": "integer" },
    "average_score": { "type": "number" },
    "highest_score": { "type": "number" },
    "lowest_score": { "type": "number" }
  }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-168: Score cannot exceed assessment's max_score
  BR-169: Students must be enrolled in the assessment's section
  BR-170: Calculate percentage and letter grade automatically
  BR-171: Log who graded the assessment

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache, show summary
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-071
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /grades/student/{studentId}/summary
PURPOSE:        Get grade summary for a student
PRIORITY:       🟢 MEDIUM
USED BY:        Student portal, student detail page
WORKFLOW STEP:  Step 1 of Student Grade Summary

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewGrades

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "term_id": { "type": "string/uuid", "required": false },
  "subject_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "student_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "by_subject": {
    "type": "array",
    "item_structure": {
      "subject_id": { "type": "string/uuid" },
      "subject_name": { "type": "string" },
      "average_percentage": { "type": "number" },
      "average_letter_grade": { "type": "string" },
      "total_assessments": { "type": "integer" }
    }
  },
  "overall": {
    "average_percentage": { "type": "number" },
    "average_letter_grade": { "type": "string" },
    "total_assessments": { "type": "integer" }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-172: Calculate weighted average based on assessment weights
  BR-173: Only include grades for the specified term/year/subject

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display grade summary
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-072
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /grades/report-card/{studentId}
PURPOSE:        Generate report card for a student
PRIORITY:       🟢 MEDIUM
USED BY:        Student portal, student detail page
WORKFLOW STEP:  Step 1 of Report Card Generation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewGrades

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": true },
  "term_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "student_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "registration_number": { "type": "string" },
  "academic_year_name": { "type": "string" },
  "term_name": { "type": "string", "nullable": true },
  "class": { "type": "string" },
  "section": { "type": "string" },
  "subjects": {
    "type": "array",
    "item_structure": {
      "subject_name": { "type": "string" },
      "teacher_name": { "type": "string" },
      "assessments": {
        "type": "array",
        "item_structure": {
          "name": { "type": "string" },
          "type": { "type": "string" },
          "score": { "type": "number" },
          "max_score": { "type": "number" },
          "percentage": { "type": "number" },
          "letter_grade": { "type": "string" }
        }
      },
      "average_percentage": { "type": "number" },
      "average_letter_grade": { "type": "string" }
    }
  },
  "overall_average": { "type": "number" },
  "overall_letter_grade": { "type": "string" },
  "class_rank": { "type": "integer", "nullable": true },
  "total_students": { "type": "integer" },
  "generated_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-174: Include all subjects the student is enrolled in
  BR-175: Calculate class rank if data available

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display report card
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# SCHEDULE ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-075
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /schedule/section/{sectionId}
PURPOSE:        Get timetable for a section
PRIORITY:       🔴 CRITICAL
USED BY:        Schedule page
WORKFLOW STEP:  Step 1 of Schedule Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewSchedule

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "sectionId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "term_id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "section_id": { "type": "string/uuid" },
  "section_name": { "type": "string" },
  "term_id": { "type": "string/uuid" },
  "term_name": { "type": "string" },
  "schedule": {
    "type": "array",
    "item_structure": {
      "day_of_week": {
        "type": "string",
        "allowed_values": ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
      },
      "periods": {
        "type": "array",
        "item_structure": {
          "period": { "type": "integer" },
          "start_time": { "type": "string", "example": "08:00" },
          "end_time": { "type": "string", "example": "08:45" },
          "subject_id": { "type": "string/uuid", "nullable": true },
          "subject_name": { "type": "string", "nullable": true },
          "teacher_id": { "type": "string/uuid", "nullable": true },
          "teacher_name": { "type": "string", "nullable": true },
          "room_number": { "type": "string", "nullable": true }
        }
      }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Section not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-176: Return schedule ordered by day_of_week and period

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display timetable grid
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-076
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /schedule/entries
PURPOSE:        Create a schedule entry
PRIORITY:       🟢 MEDIUM
USED BY:        Schedule management (not yet implemented)
WORKFLOW STEP:  Step 1 of Schedule Entry Creation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageSchedule

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "section_id": { "type": "string/uuid", "required": true },
  "term_id": { "type": "string/uuid", "required": true },
  "day_of_week": {
    "type": "string",
    "required": true,
    "allowed_values": ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
  },
  "period": { "type": "integer", "required": true },
  "start_time": { "type": "string", "required": true, "example": "08:00" },
  "end_time": { "type": "string", "required": true, "example": "08:45" },
  "subject_id": { "type": "string/uuid", "required": true },
  "teacher_id": { "type": "string/uuid", "required": true },
  "room_number": { "type": "string", "required": false }
}

SUCCESS RESPONSE (201):
{
  "id": { "type": "string/uuid" },
  "section_id": { "type": "string/uuid" },
  "term_id": { "type": "string/uuid" },
  "day_of_week": { "type": "string" },
  "period": { "type": "integer" },
  "start_time": { "type": "string" },
  "end_time": { "type": "string" },
  "subject_id": { "type": "string/uuid" },
  "teacher_id": { "type": "string/uuid" },
  "room_number": { "type": "string", "nullable": true },
  "created_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  409 Conflict: { "message": "Schedule conflict detected" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-177: Prevent schedule conflicts (same section, day, period)
  BR-178: Prevent teacher conflicts (same teacher, day, period)
  BR-179: Verify teacher is assigned to subject for this section

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# ENROLLMENT MANAGEMENT ENDPOINTS (CONTINUED)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-079
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /enrollments/{id}/transfer
PURPOSE:        Transfer a student to another section
PRIORITY:       🟢 MEDIUM
USED BY:        Enrollment page
WORKFLOW STEP:  Step 1 of Student Transfer

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageEnrollments

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true, "description": "Enrollment ID" }
}

REQUEST BODY:
{
  "new_section_id": { "type": "string/uuid", "required": true },
  "reason": { "type": "string", "required": false },
  "effective_date": { "type": "string (ISO 8601 date)", "required": false, "default": "today" }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Student transferred successfully" },
  "enrollment_id": { "type": "string/uuid" },
  "old_section_name": { "type": "string" },
  "new_section_name": { "type": "string" },
  "effective_date": { "type": "string (ISO 8601 date)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Enrollment not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-180: Set old enrollment status to "transferred"
  BR-181: Create new enrollment with status "active"
  BR-182: Check new section capacity
  BR-183: Preserve historical grades and attendance

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-080
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /enrollments/{id}/withdraw
PURPOSE:        Withdraw a student from enrollment
PRIORITY:       🟢 MEDIUM
USED BY:        Enrollment page
WORKFLOW STEP:  Step 1 of Student Withdrawal

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageEnrollments

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true, "description": "Enrollment ID" }
}

REQUEST BODY:
{
  "reason": { "type": "string", "required": false },
  "withdrawal_date": { "type": "string (ISO 8601 date)", "required": false, "default": "today" }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Student withdrawn successfully" },
  "enrollment_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "section_name": { "type": "string" },
  "withdrawal_date": { "type": "string (ISO 8601 date)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Enrollment not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-184: Set enrollment status to "withdrawn"
  BR-185: Preserve historical grades and attendance
  BR-186: Cannot withdraw student with outstanding fees

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# ANALYTICS ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-084
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /analytics/summary
PURPOSE:        Get overall analytics summary
PRIORITY:       🟢 MEDIUM
USED BY:        Analytics dashboard
WORKFLOW STEP:  Step 1 of Analytics Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAnalytics (admin, director only)

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "term_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "students": {
    "total": { "type": "integer" },
    "active": { "type": "integer" },
    "at_risk": { "type": "integer" }
  },
  "attendance": {
    "average_rate": { "type": "number" },
    "below_threshold": { "type": "integer" }
  },
  "grades": {
    "average_score": { "type": "number" },
    "failing": { "type": "integer" }
  },
  "enrollments": {
    "total": { "type": "integer" },
    "by_class": { "type": "object" }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-187: Only accessible to admin and director roles
  BR-188: Filter by academic year/term if provided

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display analytics cards and charts
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-085
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /analytics/students/at-risk
PURPOSE:        Get list of at-risk students
PRIORITY:       🟢 MEDIUM
USED BY:        Analytics dashboard
WORKFLOW STEP:  Step 2 of At-Risk Student Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewAnalytics (admin, director only)

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "term_id": { "type": "string/uuid", "required": false },
  "risk_level": {
    "type": "string",
    "required": false,
    "allowed_values": ["high","medium","low"]
  }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "registration_number": { "type": "string" },
      "class": { "type": "string" },
      "section": { "type": "string" },
      "risk_level": {
        "type": "string",
        "allowed_values": ["high","medium","low"]
      },
      "risk_factors": {
        "type": "array",
        "item_structure": {
          "type": { "type": "string", "example": "low_attendance" },
          "value": { "type": "number" },
          "threshold": { "type": "number" }
        }
      },
      "attendance_rate": { "type": "number" },
      "average_grade": { "type": "number" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-189: Calculate risk based on attendance and grades
  BR-190: High risk: attendance < 70% OR average grade < 50%
  BR-191: Medium risk: attendance < 80% OR average grade < 60%

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display at-risk students table
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# NOTIFICATION ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-089
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /notifications/send
PURPOSE:        Send a notification to recipients
PRIORITY:       🟢 MEDIUM
USED BY:        Notification composer page
WORKFLOW STEP:  Step 1 of Notification Sending

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canSendNotifications

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "type": {
    "type": "string",
    "required": true,
    "allowed_values": ["general","attendance","grade","fee","announcement"]
  },
  "priority": {
    "type": "string",
    "required": true,
    "allowed_values": ["low","normal","high","urgent"]
  },
  "title": { "type": "string", "required": true },
  "message": { "type": "string", "required": true },
  "recipient_type": {
    "type": "string",
    "required": true,
    "allowed_values": ["all","students","guardians","teachers","specific"]
  },
  "recipient_ids": {
    "type": "array of strings/uuid",
    "required": false,
    "description": "Required if recipient_type is 'specific'"
  },
  "channels": {
    "type": "array",
    "required": false,
    "allowed_values": ["email","sms","in_app"],
    "default": ["in_app"]
  }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Notification sent successfully" },
  "notification_id": { "type": "string/uuid" },
  "recipients_count": { "type": "integer" },
  "channels_used": { "type": "array of strings" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-192: recipient_ids required if recipient_type is 'specific'
  BR-193: Validate all recipient IDs exist
  BR-194: Store notification history
  BR-195: Queue for background processing for email/SMS

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, display recipients count
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-090
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /notifications
PURPOSE:        Get notifications for current user
PRIORITY:       🟢 MEDIUM
USED BY:        Notification bell, notifications page
WORKFLOW STEP:  Step 1 of Notification Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     None (authenticated users only)

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "page": { "type": "integer", "required": false, "default": 1 },
  "size": { "type": "integer", "required": false, "default": 20 },
  "unread_only": { "type": "boolean", "required": false, "default": false }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "type": { "type": "string" },
      "priority": { "type": "string" },
      "title": { "type": "string" },
      "message": { "type": "string" },
      "is_read": { "type": "boolean" },
      "created_at": { "type": "string (ISO 8601)" }
    }
  },
  "total": { "type": "integer" },
  "unread_count": { "type": "integer" },
  "page": { "type": "integer" },
  "size": { "type": "integer" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-196: Return notifications for authenticated user only
  BR-197: Order by created_at descending

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display notifications list, update unread badge
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-091
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /notifications/{id}/read
PURPOSE:        Mark notification as read
PRIORITY:       🟢 MEDIUM
USED BY:        Notifications page, notification bell
WORKFLOW STEP:  Step 1 of Mark as Read

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     None (authenticated users only)

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "id": { "type": "string/uuid", "required": true }
}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Notification marked as read" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  404 Not Found: { "message": "Notification not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-198: User can only mark their own notifications

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Update notification state, decrement unread count
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# PAYMENT ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-096
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /payments/student/{studentId}/fees
PURPOSE:        Get fee balance for a student
PRIORITY:       🔴 CRITICAL
USED BY:        Guardian portal, student detail page
WORKFLOW STEP:  Step 1 of Fee Balance Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewPayments (or guardian viewing own children)

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "student_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "total_fees": { "type": "number" },
  "total_paid": { "type": "number" },
  "balance_due": { "type": "number" },
  "fees": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "type": { "type": "string", "example": "tuition" },
      "name": { "type": "string" },
      "amount": { "type": "number" },
      "due_date": { "type": "string (ISO 8601 date)" },
      "status": {
        "type": "string",
        "allowed_values": ["paid","partial","unpaid","overdue"]
      },
      "amount_paid": { "type": "number" },
      "balance": { "type": "number" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error
  404 Not Found: { "message": "Student not found" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-199: Guardians can only view their linked children
  BR-200: Calculate balance from total - paid

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display fee breakdown and balance
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-097
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       POST /payments/initiate
PURPOSE:        Initiate a payment via Chapa gateway
PRIORITY:       🔴 CRITICAL
USED BY:        Guardian portal, student portal
WORKFLOW STEP:  Step 1 of Payment Initiation

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canMakePayments (or guardian for own children)

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "student_id": { "type": "string/uuid", "required": true },
  "fee_ids": {
    "type": "array of strings/uuid",
    "required": true,
    "description": "Fees to pay for"
  },
  "amount": { "type": "number", "required": true },
  "payment_method": {
    "type": "string",
    "required": true,
    "allowed_values": ["telebirr","cbe_belecia","m_pesa","bank_transfer"]
  },
  "return_url": {
    "type": "string",
    "required": true,
    "format": "url",
    "description": "URL to redirect after payment"
  }
}

SUCCESS RESPONSE (200):
{
  "payment_reference": { "type": "string", "example": "CH-123456" },
  "checkout_url": { "type": "string", "format": "url" },
  "expires_at": { "type": "string (ISO 8601)" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-201: Validate fee ownership
  BR-202: Amount must match sum of fee balances
  BR-203: Create pending payment transaction
  BR-204: Integrate with Chapa API

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Redirect to checkout_url
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-098
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /payments/transactions
PURPOSE:        Get payment history
PRIORITY:       🟢 MEDIUM
USED BY:        Guardian portal, student portal
WORKFLOW STEP:  Step 1 of Payment History Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canViewPayments

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "page": { "type": "integer", "required": false, "default": 1 },
  "size": { "type": "integer", "required": false, "default": 20 },
  "student_id": { "type": "string/uuid", "required": false },
  "status": {
    "type": "string",
    "required": false,
    "allowed_values": ["pending","completed","failed","refunded"]
  }
}

SUCCESS RESPONSE (200):
{
  "items": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "payment_reference": { "type": "string" },
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "amount": { "type": "number" },
      "payment_method": { "type": "string" },
      "status": { "type": "string" },
      "created_at": { "type": "string (ISO 8601)" },
      "completed_at": { "type": "string (ISO 8601)", "nullable": true }
    }
  },
  "total": { "type": "integer" },
  "page": { "type": "integer" },
  "size": { "type": "integer" }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-205: Guardians only see their children's transactions
  BR-206: Students only see their own transactions

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display payment history table
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# STUDENT PORTAL ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-102
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /student-portal/dashboard
PURPOSE:        Get student dashboard data
PRIORITY:       🔴 CRITICAL
USED BY:        Student portal home page
WORKFLOW STEP:  Step 1 of Student Dashboard Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     student role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "student": {
    "id": { "type": "string/uuid" },
    "full_name": { "type": "string" },
    "registration_number": { "type": "string" },
    "class": { "type": "string" },
    "section": { "type": "string" },
    "profile_image_url": { "type": "string", "nullable": true }
  },
  "announcements": {
    "type": "array",
    "item_structure": {
      "id": { "type": "string/uuid" },
      "title": { "type": "string" },
      "content": { "type": "string" },
      "posted_date": { "type": "string (ISO 8601)" }
    }
  },
  "recent_grades": {
    "type": "array",
    "item_structure": {
      "subject": { "type": "string" },
      "assessment": { "type": "string" },
      "score": { "type": "number" },
      "max_score": { "type": "number" },
      "percentage": { "type": "number" },
      "letter_grade": { "type": "string" }
    }
  },
  "attendance_summary": {
    "present_days": { "type": "integer" },
    "total_days": { "type": "integer" },
    "attendance_rate": { "type": "number" }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Student access only" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-207: Only accessible to students
  BR-208: Return data for authenticated student only

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display dashboard widgets
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-103
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /student-portal/attendance
PURPOSE:        Get student attendance calendar
PRIORITY:       🔴 CRITICAL
USED BY:        Student portal attendance page
WORKFLOW STEP:  Step 1 of Student Attendance Calendar

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     student role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "from_date": { "type": "string (ISO 8601 date)", "required": false },
  "to_date": { "type": "string (ISO 8601 date)", "required": false }
}

SUCCESS RESPONSE (200):
{
  "summary": {
    "total_days": { "type": "integer" },
    "present": { "type": "integer" },
    "absent": { "type": "integer" },
    "late": { "type": "integer" },
    "excused": { "type": "integer" },
    "attendance_percentage": { "type": "number" }
  },
  "calendar": {
    "type": "array",
    "item_structure": {
      "date": { "type": "string (ISO 8601 date)" },
      "status": {
        "type": "string",
        "allowed_values": ["present","absent","late","excused","not_marked"]
      }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Student access only" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-209: Only accessible to students
  BR-210: Return attendance for authenticated student only

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display calendar view with attendance markers
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-104
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /student-portal/grades
PURPOSE:        Get student grade summary
PRIORITY:       🔴 CRITICAL
USED BY:        Student portal grades page
WORKFLOW STEP:  Step 1 of Student Grades Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     student role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "term_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "by_subject": {
    "type": "array",
    "item_structure": {
      "subject_id": { "type": "string/uuid" },
      "subject_name": { "type": "string" },
      "teacher_name": { "type": "string" },
      "average_percentage": { "type": "number" },
      "average_letter_grade": { "type": "string" },
      "assessments": {
        "type": "array",
        "item_structure": {
          "name": { "type": "string" },
          "type": { "type": "string" },
          "score": { "type": "number" },
          "max_score": { "type": "number" },
          "percentage": { "type": "number" },
          "letter_grade": { "type": "string" }
        }
      }
    }
  },
  "overall": {
    "average_percentage": { "type": "number" },
    "average_letter_grade": { "type": "string" },
    "gpa": { "type": "number", "nullable": true }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Student access only" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-211: Only accessible to students
  BR-212: Return grades for authenticated student only

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display grades by subject
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-105
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /student-portal/schedule
PURPOSE:        Get student class schedule
PRIORITY:       🔴 CRITICAL
USED BY:        Student portal schedule page
WORKFLOW STEP:  Step 1 of Student Schedule Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     student role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

QUERY PARAMETERS:
{
  "term_id": { "type": "string/uuid", "required": true }
}

SUCCESS RESPONSE (200):
{
  "term_id": { "type": "string/uuid" },
  "term_name": { "type": "string" },
  "schedule": {
    "type": "array",
    "item_structure": {
      "day_of_week": { "type": "string" },
      "periods": {
        "type": "array",
        "item_structure": {
          "period": { "type": "integer" },
          "start_time": { "type": "string" },
          "end_time": { "type": "string" },
          "subject": { "type": "string" },
          "teacher": { "type": "string" },
          "room": { "type": "string", "nullable": true }
        }
      }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Student access only" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-213: Only accessible to students
  BR-214: Return schedule for authenticated student's current section

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display timetable
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# GUARDIAN PORTAL ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-108
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardian-portal/dashboard
PURPOSE:        Get guardian dashboard data
PRIORITY:       🔴 CRITICAL
USED BY:        Guardian portal home page
WORKFLOW STEP:  Step 1 of Guardian Dashboard Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     guardian role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "children": {
    "type": "array",
    "item_structure": {
      "student_id": { "type": "string/uuid" },
      "full_name": { "type": "string" },
      "registration_number": { "type": "string" },
      "class": { "type": "string" },
      "section": { "type": "string" },
      "attendance_rate": { "type": "number" },
      "average_grade": { "type": "number" },
      "fee_balance": { "type": "number" }
    }
  },
  "alerts": {
    "type": "array",
    "item_structure": {
      "student_id": { "type": "string/uuid" },
      "student_name": { "type": "string" },
      "type": { "type": "string", "example": "low_attendance" },
      "message": { "type": "string" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Guardian access only" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-215: Only accessible to guardians
  BR-216: Return only linked children

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display children cards and alerts
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-109
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardian-portal/children/{studentId}/attendance
PURPOSE:        Get child's attendance for guardian
PRIORITY:       🔴 CRITICAL
USED BY:        Guardian portal
WORKFLOW STEP:  Step 1 of Child Attendance View

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     guardian role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "from_date": { "type": "string (ISO 8601 date)", "required": false },
  "to_date": { "type": "string (ISO 8601 date)", "required": false }
}

SUCCESS RESPONSE (200):
{
  "student_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "summary": {
    "total_days": { "type": "integer" },
    "present": { "type": "integer" },
    "absent": { "type": "integer" },
    "attendance_percentage": { "type": "number" }
  },
  "calendar": {
    "type": "array",
    "item_structure": {
      "date": { "type": "string (ISO 8601 date)" },
      "status": { "type": "string" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Guardian access only" } → Show permission error
  404 Not Found: { "message": "Student not found or not linked" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-217: Only accessible to guardians
  BR-218: Guardian can only view linked children

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display child's attendance calendar
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-110
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardian-portal/children/{studentId}/grades
PURPOSE:        Get child's grades for guardian
PRIORITY:       🔴 CRITICAL
USED BY:        Guardian portal
WORKFLOW STEP:  Step 1 of Child Grades View

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     guardian role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false },
  "term_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "student_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "by_subject": {
    "type": "array",
    "item_structure": {
      "subject_name": { "type": "string" },
      "average_percentage": { "type": "number" },
      "average_letter_grade": { "type": "string" }
    }
  },
  "overall": {
    "average_percentage": { "type": "number" },
    "average_letter_grade": { "type": "string" }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Guardian access only" } → Show permission error
  404 Not Found: { "message": "Student not found or not linked" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-219: Only accessible to guardians
  BR-220: Guardian can only view linked children

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display child's grades
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-111
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /guardian-portal/children/{studentId}/fees
PURPOSE:        Get child's fee balance for guardian
PRIORITY:       🔴 CRITICAL
USED BY:        Guardian portal
WORKFLOW STEP:  Step 1 of Child Fees View

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     guardian role only

REQUEST HEADERS:
  Authorization: Bearer {access_token}

PATH PARAMETERS:
{
  "studentId": { "type": "string/uuid", "required": true }
}

QUERY PARAMETERS:
{
  "academic_year_id": { "type": "string/uuid", "required": false }
}

SUCCESS RESPONSE (200):
{
  "student_id": { "type": "string/uuid" },
  "student_name": { "type": "string" },
  "total_fees": { "type": "number" },
  "total_paid": { "type": "number" },
  "balance_due": { "type": "number" },
  "fees": {
    "type": "array",
    "item_structure": {
      "name": { "type": "string" },
      "amount": { "type": "number" },
      "due_date": { "type": "string (ISO 8601 date)" },
      "status": { "type": "string" },
      "balance": { "type": "number" }
    }
  }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Guardian access only" } → Show permission error
  404 Not Found: { "message": "Student not found or not linked" } → Show error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-221: Only accessible to guardians
  BR-222: Guardian can only view linked children

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display child's fee breakdown
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# SETTINGS ENDPOINTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-115
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /settings/school
PURPOSE:        Get school information settings
PRIORITY:       🟢 MEDIUM
USED BY:        Settings page
WORKFLOW STEP:  Step 1 of School Settings Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageSettings

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "school_name": { "type": "string" },
  "school_code": { "type": "string" },
  "address": { "type": "string" },
  "phone": { "type": "string" },
  "email": { "type": "string" },
  "website": { "type": "string", "nullable": true },
  "logo_url": { "type": "string", "nullable": true }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-223: Only accessible to admin and director

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Populate school settings form
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-116
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /settings/school
PURPOSE:        Update school information settings
PRIORITY:       🟢 MEDIUM
USED BY:        Settings page
WORKFLOW STEP:  Step 1 of School Settings Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageSettings

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "school_name": { "type": "string", "required": false },
  "school_code": { "type": "string", "required": false },
  "address": { "type": "string", "required": false },
  "phone": { "type": "string", "required": false },
  "email": { "type": "string", "required": false },
  "website": { "type": "string", "required": false },
  "logo_url": { "type": "string", "required": false }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "School settings updated successfully" },
  "school_name": { "type": "string" },
  "school_code": { "type": "string" },
  "address": { "type": "string" },
  "phone": { "type": "string" },
  "email": { "type": "string" },
  "website": { "type": "string", "nullable": true },
  "logo_url": { "type": "string", "nullable": true }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-224: Only accessible to admin and director
  BR-225: Only update provided fields

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-117
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /settings/academic
PURPOSE:        Get academic settings
PRIORITY:       🔴 CRITICAL
USED BY:        Settings page, system-wide
WORKFLOW STEP:  Step 1 of Academic Settings Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageSettings

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "current_academic_year_id": { "type": "string/uuid" },
  "current_term_id": { "type": "string/uuid", "nullable": true },
  "grading_scale": {
    "type": "object",
    "example": {
      "A": { "min": 90, "max": 100 },
      "B": { "min": 80, "max": 89 },
      "C": { "min": 70, "max": 79 },
      "D": { "min": 60, "max": 69 },
      "F": { "min": 0, "max": 59 }
    }
  },
  "attendance_threshold": { "type": "number", "example": 75 },
  "late_arrival_threshold": { "type": "integer", "example": 15 }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-226: Only accessible to admin and director

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display academic settings
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-118
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /settings/academic
PURPOSE:        Update academic settings
PRIORITY:       🔴 CRITICAL
USED BY:        Settings page
WORKFLOW STEP:  Step 1 of Academic Settings Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageSettings

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "current_academic_year_id": { "type": "string/uuid", "required": false },
  "current_term_id": { "type": "string/uuid", "required": false },
  "grading_scale": { "type": "object", "required": false },
  "attendance_threshold": { "type": "number", "required": false },
  "late_arrival_threshold": { "type": "integer", "required": false }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Academic settings updated successfully" },
  "current_academic_year_id": { "type": "string/uuid" },
  "current_term_id": { "type": "string/uuid", "nullable": true },
  "grading_scale": { "type": "object" },
  "attendance_threshold": { "type": "number" },
  "late_arrival_threshold": { "type": "integer" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-227: Only accessible to admin and director
  BR-228: Validate academic year and term exist

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-119
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       GET /settings/attendance
PURPOSE:        Get attendance system settings
PRIORITY:       🟢 MEDIUM
USED BY:        Settings page
WORKFLOW STEP:  Step 1 of Attendance Settings Display

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageSettings

REQUEST HEADERS:
  Authorization: Bearer {access_token}

REQUEST BODY:
  None

SUCCESS RESPONSE (200):
{
  "face_recognition_enabled": { "type": "boolean" },
  "confidence_threshold": { "type": "number", "example": 0.85 },
  "late_arrival_minutes": { "type": "integer", "example": 15 },
  "auto_mark_absent_after_minutes": { "type": "integer", "example": 30 }
}

ERROR RESPONSES:
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-229: Only accessible to admin and director

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Display attendance settings
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API-120
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDPOINT:       PATCH /settings/attendance
PURPOSE:        Update attendance system settings
PRIORITY:       🟢 MEDIUM
USED BY:        Settings page
WORKFLOW STEP:  Step 1 of Attendance Settings Update

AUTH REQUIRED:  Yes (Bearer token)
PERMISSION:     canManageSettings

REQUEST HEADERS:
  Authorization: Bearer {access_token}
  Content-Type: application/json

REQUEST BODY:
{
  "face_recognition_enabled": { "type": "boolean", "required": false },
  "confidence_threshold": { "type": "number", "required": false },
  "late_arrival_minutes": { "type": "integer", "required": false },
  "auto_mark_absent_after_minutes": { "type": "integer", "required": false }
}

SUCCESS RESPONSE (200):
{
  "message": { "type": "string", "example": "Attendance settings updated successfully" },
  "face_recognition_enabled": { "type": "boolean" },
  "confidence_threshold": { "type": "number" },
  "late_arrival_minutes": { "type": "integer" },
  "auto_mark_absent_after_minutes": { "type": "integer" }
}

ERROR RESPONSES:
  400 Bad Request: { "message": "Validation error", "errors": {} } → Display field-level errors
  401 Unauthorized: { "message": "Unauthorized" } → Trigger token refresh
  403 Forbidden: { "message": "Insufficient permissions" } → Show permission error

BUSINESS RULES BACKEND MUST ENFORCE:
  BR-230: Only accessible to admin and director
  BR-231: confidence_threshold must be between 0 and 1

WHAT FRONTEND DOES WITH RESPONSE:
  Success: Show success toast, invalidate cache
  Failure: Show error message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

# END OF API SPECIFICATION

This document contains complete specifications for all API endpoints required by the School Management System frontend.
Total endpoints documented: 120 endpoints across 12 feature modules.

**Document Status: COMPLETE**
