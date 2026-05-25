# Filter Key Validation Guide

## Purpose
This document helps identify and prevent filter key mismatches between pages and API hooks.

## How to Validate

### Step 1: Find the Hook Interface
Look for the interface definition in the hook file:

```typescript
// Example: src/features/enrollments/api/useEnrollments.ts
interface EnrollmentFilters {
  page?: number;
  size?: number;
  studentId?: string;    // ← These are the CORRECT keys
  classId?: string;
  sectionId?: string;
  status?: string;
  yearId?: string;       // ← NOT academic_year_id
}
```

### Step 2: Check Page Usage
Verify the page uses the EXACT same keys:

```typescript
// Example: src/app/[locale]/(dashboard)/dashboard/enrollments/page.tsx
const filters = {
  page,
  yearId: selectedYear,        // ✅ CORRECT - matches interface
  sectionId: selectedSection,  // ✅ CORRECT - matches interface
  status: selectedStatus,      // ✅ CORRECT - matches interface
};
```

### Step 3: Common Mistakes

#### ❌ WRONG - Using Different Key Names
```typescript
const filters = {
  academic_year_id: selectedYear,  // ❌ Hook expects 'yearId'
  section: selectedSection,        // ❌ Hook expects 'sectionId'
};
```

#### ✅ CORRECT - Using Exact Key Names
```typescript
const filters = {
  yearId: selectedYear,      // ✅ Matches interface
  sectionId: selectedSection, // ✅ Matches interface
};
```

## All Filter Interfaces in the Project

### 1. Enrollment Filters
**File:** `src/features/enrollments/api/useEnrollments.ts`
```typescript
interface EnrollmentFilters {
  page?: number;
  size?: number;
  studentId?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  yearId?: string;  // ← Use 'yearId', NOT 'academic_year_id'
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/enrollments/page.tsx` ✅ FIXED

### 2. Student Filters
**File:** `src/lib/api/students.service.ts`
```typescript
export interface StudentFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  grade_level?: number;
  section_id?: string;
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/students/page.tsx` ✅ CORRECT

### 3. Teacher Filters
**File:** `src/lib/api/teachers.service.ts`
```typescript
export interface TeacherFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'inactive';
  subject_id?: string;
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/teachers/page.tsx` ✅ CORRECT

### 4. Guardian Filters
**File:** `src/lib/api/guardians.service.ts`
```typescript
export interface GuardianFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'inactive';
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/guardians/page.tsx` ✅ CORRECT

### 5. User Filters
**File:** `src/lib/api/users.service.ts`
```typescript
export interface UserFilters {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/users/page.tsx` ✅ CORRECT

### 6. Admin Log Filters
**File:** `src/lib/api/admin-logs.service.ts`
```typescript
export interface AdminLogFilters {
  page?: number;
  size?: number;
  search?: string;
  action?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/admin-logs/page.tsx` ✅ CORRECT

### 7. Subject Filters
**File:** `src/features/academics/api/useSubjects.ts`
```typescript
interface SubjectFilters {
  page?: number;
  size?: number;
  search?: string;
  grade_level?: number;
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/academics/subjects/page.tsx` ✅ CORRECT

### 8. Fee Filters
**File:** `src/features/payments/api/useFees.ts`
```typescript
interface FeeFilters {
  academic_year_id?: string;  // ← Note: This one uses 'academic_year_id'
  grade_level?: number;
  is_active?: boolean;
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/fees/page.tsx` ✅ CORRECT

### 9. Notification History Filters
**File:** `src/features/notifications/api/useNotificationHistory.ts`
```typescript
interface NotificationHistoryFilters {
  page?: number;
  limit?: number;
  status?: string;
}
```

**Used in:**
- `src/app/[locale]/(dashboard)/dashboard/notifications/history/page.tsx` ✅ CORRECT

## Validation Checklist

When creating or modifying a page with filters:

- [ ] Find the hook's filter interface
- [ ] Copy the exact key names from the interface
- [ ] Use those exact keys in the page component
- [ ] Test that data loads correctly
- [ ] Test that filters work as expected
- [ ] Verify no TypeScript errors

## TypeScript Tips

### Use Type Imports
Import the filter type from the hook to catch mismatches:

```typescript
import { type EnrollmentFilters } from '@/features/enrollments/api/useEnrollments';

// TypeScript will error if keys don't match
const filters: EnrollmentFilters = {
  yearId: selectedYear,  // ✅ TypeScript validates this
};
```

### Use Satisfies Operator
Use `satisfies` to ensure type safety while preserving inference:

```typescript
const filters = {
  yearId: selectedYear,
  status: selectedStatus,
} satisfies EnrollmentFilters;
```

## Common Naming Patterns

### Academic Year
- ✅ `yearId` - Most hooks use this
- ❌ `academic_year_id` - Only use if hook specifically expects it
- ❌ `year_id` - Avoid unless hook uses it

### Section
- ✅ `sectionId` - Camel case
- ❌ `section_id` - Snake case (only if hook uses it)

### Status
- ✅ `status` - Simple string
- ❌ `statusFilter` - Don't add "Filter" suffix

## Testing Filter Keys

### Manual Test
1. Open the page
2. Check browser DevTools Network tab
3. Look at the API request
4. Verify query parameters match expected keys

### Automated Test
```typescript
// In your test file
it('should use correct filter keys', () => {
  const filters = {
    yearId: 'test-year-id',
    sectionId: 'test-section-id',
  };
  
  // This will fail if keys don't match the interface
  const result: EnrollmentFilters = filters;
  expect(result).toBeDefined();
});
```

## When You See Empty Data

If a page shows empty data but backend has data:

1. **Check filter keys** - Most common issue
2. **Check query enabling** - Is `enabled: false`?
3. **Check API endpoint** - Is it correct?
4. **Check network tab** - Is request being made?
5. **Check response** - Is data in expected format?

## Prevention Strategy

### 1. Export Filter Types
Always export filter interfaces from hooks:

```typescript
// In hook file
export interface EnrollmentFilters {
  yearId?: string;
}
```

### 2. Import in Pages
Import and use the type in pages:

```typescript
// In page file
import { type EnrollmentFilters } from '@/features/enrollments/api/useEnrollments';

const filters: EnrollmentFilters = {
  yearId: selectedYear,
};
```

### 3. Use TypeScript Strict Mode
Enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

## Summary

✅ **Always use exact key names from the hook interface**
✅ **Import types to catch mismatches at compile time**
✅ **Test filters after implementation**
✅ **Check network tab if data doesn't load**

❌ **Don't guess key names**
❌ **Don't use different naming conventions**
❌ **Don't skip TypeScript type checking**
