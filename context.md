# PROJECT CONTEXT — READ THIS BEFORE DOING ANYTHING
# This is the authoritative context for this codebase.
# Every task you receive after this must follow these rules exactly.

==============================================================
## 1. TECH STACK (exact versions)
==============================================================

- Framework:     Next.js 16.1.6 (App Router)
- Language:      TypeScript
- UI:            React 19 + Tailwind CSS 4 + shadcn/ui + Radix UI
- Client state:  Zustand  →  src/lib/store/auth-store.ts
- Server state:  TanStack Query (React Query)
- HTTP:          Axios  →  src/lib/api/axios.ts
                 (has request/response interceptors + token refresh)
- Forms:         React Hook Form + Zod
- i18n:          next-intl  (locale-prefixed routes: /en/... and /am/...)
- Charts:        recharts   (already installed — do NOT add another chart lib)
- PDF:           jspdf      (already installed)
- Face scan:     face-api.js (already installed)
- Barcode scan:  html5-qrcode (already installed)
- Toasts:        sonner     (already installed — do NOT use react-hot-toast or others)
- Date utils:    date-fns   (already installed)

==============================================================
## 2. FOLDER STRUCTURE (actual — follow this exactly)
==============================================================

src/
├── app/
│   └── [locale]/
│       ├── (auth)/                    ← public/auth routes
│       │   ├── login/
│       │   ├── forgot-password/
│       │   ├── reset-password/
│       │   └── change-password/
│       └── (dashboard)/
│           └── dashboard/             ← ALL protected pages live here
│               ├── layout.tsx         ← uses ProtectedRoute + Sidebar + TopBar
│               ├── page.tsx
│               ├── users/
│               ├── directors/
│               ├── students/
│               ├── teachers/
│               ├── guardians/
│               ├── academics/
│               ├── enrollments/
│               ├── attendance/
│               ├── grades/
│               ├── schedule/
│               ├── profile/
│               └── settings/
│
├── components/
│   ├── ui/           ← shadcn/ui primitives (Button, Card, Input, etc.)
│   ├── layout/       ← Sidebar, TopBar, DashboardShell
│   └── shared/       ← reusable cross-feature components
│
├── features/
│   ├── academics/
│   │   └── api/
│   ├── attendance/
│   │   └── api/
│   │       └── useAttendance.ts
│   ├── enrollments/
│   │   └── api/
│   ├── grades/
│   │   └── api/
│   │       └── useGrades.ts
│   ├── notifications/
│   │   └── api/
│   ├── payments/
│   │   └── api/
│   └── schedule/
│       └── api/
│
├── hooks/
│   ├── use-students.ts        ← entity hook (calls students.service.ts)
│   ├── use-teachers.ts
│   ├── use-guardians.ts
│   ├── use-users.ts
│   └── use-permissions.ts     ← exposes usePermissions() boolean flags
│
├── lib/
│   ├── api/
│   │   ├── axios.ts           ← axios instance with interceptors
│   │   ├── query-keys.ts      ← centralized TanStack Query keys
│   │   ├── students.service.ts
│   │   ├── teachers.service.ts
│   │   ├── guardians.service.ts
│   │   └── users.service.ts
│   ├── store/
│   │   └── auth-store.ts      ← Zustand persisted auth store
│   └── permissions.ts         ← role capability logic
│
├── i18n/                      ← next-intl routing/request config
│   ├── routing.ts
│   ├── navigation.ts
│   └── request.ts
│
└── types/                     ← shared TypeScript interfaces

messages/                      ← AT REPO ROOT (not inside src/)
├── en.json
└── am.json

==============================================================
## 3. ROUTING MODEL (exact pattern)
==============================================================

IMPORTANT: All protected pages are nested under:
  /[locale]/(dashboard)/dashboard/

So the full URL pattern for a protected page is:
  /en/dashboard/students        ← student list
  /en/dashboard/attendance      ← attendance
  /am/dashboard/settings        ← settings in Amharic

When creating new pages, always place them at:
  src/app/[locale]/(dashboard)/dashboard/[feature]/page.tsx

NOT at:
  src/app/[locale]/(dashboard)/[feature]/page.tsx  ← WRONG

==============================================================
## 4. DATA LAYER RULES
==============================================================

Two patterns exist — use the RIGHT one for the RIGHT thing:

### Pattern A: Entity-level operations (users, students, teachers, guardians)
  - Service file: src/lib/api/[entity].service.ts
  - Hook file:    src/hooks/use-[entity].ts
  - Example:
      src/lib/api/students.service.ts  → API calls
      src/hooks/use-students.ts        → TanStack Query hooks

### Pattern B: Feature-level operations (attendance, grades, schedule, etc.)
  - Hook file: src/features/[feature]/api/use[Feature].ts
  - Example:
      src/features/attendance/api/useAttendance.ts
      src/features/grades/api/useGrades.ts

### NEVER create:
  - src/services/         ← does not exist in this project
  - src/stores/           ← does not exist, use src/lib/store/

### API response shape (common list format):
  {
    items: T[],
    total: number,
    page: number,
    size: number,
    pages: number
  }

  Note: Not all endpoints use this exact shape.
  Some return { data: T } or { data: T[] }.
  Match the existing pattern in nearby service files
  when possible. Do not assume a single global envelope.

### Query keys:
  Always add new query keys to:
  src/lib/api/query-keys.ts

  Example format:
  export const queryKeys = {
    students: {
      all: ['students'] as const,
      list: (filters) => ['students', 'list', filters] as const,
      detail: (id) => ['students', 'detail', id] as const,
    }
  }

==============================================================
## 5. AUTH + PROTECTION MODEL
==============================================================

- Auth store: src/lib/store/auth-store.ts
  * Zustand persisted store
  * Has isHydrated flag (wait for this before rendering auth-dependent UI)
  * Fields: user, accessToken, isAuthenticated, mustChangePassword

- ProtectedRoute component:
  * Handles: not logged in → redirect to /[locale]/login
  * Handles: mustChangePassword → redirect to /[locale]/change-password
  * Accepts optional requireRoles prop for role-gating

- To get logged-in user:
  import { useAuthStore } from '@/lib/store/auth-store'
  const { user } = useAuthStore()

- To add role protection to a new page layout:
  Use the existing ProtectedRoute component with requireRoles prop.
  Do NOT invent a new RoleGuard component — use what exists.

- Auth service:
  * Tries real backend first
  * Falls back to mock accounts if API unreachable
  * This mock fallback must remain intact — do not remove it

- Token refresh:
  * Handled automatically in src/lib/api/axios.ts interceptor
  * On refresh failure: clears auth store + redirects to login
  * Do not duplicate this logic

==============================================================
## 6. PERMISSIONS SYSTEM
==============================================================

Permission logic is in: src/lib/permissions.ts
Consumed via: usePermissions() hook in src/hooks/use-permissions.ts

The hook returns BOOLEAN FLAGS, not a can() function.
This is critical — use the flags directly.

CORRECT usage:
  const { canManageStudents, canViewUsers, isAdmin } = usePermissions()
  if (canManageStudents) { ... }

WRONG usage (do not do this):
  const { can } = usePermissions()
  if (can('manageStudents')) { ... }    ← this pattern does NOT exist

Current boolean flags (from actual code):
  canViewUsers
  canCreateUsers
  canEditUsers
  canDeleteUsers
  canManageStudents
  canManageTeachers
  canManageGuardians
  canManageAcademics
  canManageEnrollments
  canAccessSettings
  isAdmin
  isDirector
  isRegistrar
  isTeacher
  isStudent
  isGuardian

When you need a new permission for a new feature,
ADD it to src/lib/permissions.ts following the same
boolean flag pattern. Show the exact diff/addition.

==============================================================
## 7. i18n RULES (non-negotiable)
==============================================================

### Translation files location:
  messages/en.json    ← English (at repo root)
  messages/am.json    ← Amharic (at repo root)

### How to use translations in components:
  'use client'
  import { useTranslations } from 'next-intl'

  export function MyComponent() {
    const t = useTranslations('featureNamespace')
    return <h1>{t('title')}</h1>
  }

### How to use translations in server components / pages:
  import { getTranslations } from 'next-intl/server'

  export default async function MyPage() {
    const t = await getTranslations('featureNamespace')
    return <h1>{t('title')}</h1>
  }

### ABSOLUTE RULES:
  1. NEVER hardcode English (or any language) text in JSX.
     Every visible string must come from t('key').

  2. ALWAYS provide BOTH en.json and am.json updates
     in the same response. Never update one without the other.

  3. Namespace your keys by feature to avoid collisions:
     "teacherPortal": { ... }
     "studentPortal": { ... }
     "guardianPortal": { ... }
     "analytics": { ... }
     "faceAttendance": { ... }

  4. For dynamic values use ICU message format:
     en.json:  "welcome": "Welcome, {name}"
     usage:    t('welcome', { name: user.name })

  5. If you are uncertain about an Amharic translation,
     still provide your best attempt and add a comment
     in your response like:
     ⚠️ Verify Amharic: "someKey" — provided translation 
     may need review by a native speaker.

==============================================================
## 8. COMPONENT RULES
==============================================================

### UI components:
  Always use existing shadcn/ui components from src/components/ui/
  Examples: Button, Card, CardHeader, CardContent, Input,
            Select, Dialog, Sheet, Table, Badge, Tabs,
            Skeleton, Alert, Separator, Avatar

  Do NOT install new UI component libraries.

### Toast notifications:
  Use sonner (already installed):
  import { toast } from 'sonner'
  toast.success('Done')
  toast.error('Failed')

  Do NOT use react-hot-toast or any other toast library.

### Loading states:
  Every data-fetching component MUST handle:
  ✓ Loading  → show Skeleton components (not spinners alone)
  ✓ Error    → show error message + retry button
  ✓ Empty    → show friendly empty state (not a blank div)
  ✓ Data     → show the actual content

### Form pattern:
  Always use React Hook Form + Zod:
  - Define schema with z.object({...})
  - Use useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
  - Use FormField, FormItem, FormLabel, FormControl, FormMessage
    from src/components/ui/form

==============================================================
## 9. THE 6 ROLES
==============================================================

Roles:
  admin       → full access
  director    → broad management, below admin
  registrar   → student/guardian/enrollment focused
  teacher     → own classes, own attendance, own grades only
  student     → own data only (read-only mostly)
  guardian    → own children's data only + payments

==============================================================
## 10. WHAT IS ALREADY BUILT (do not rebuild)
==============================================================

These pages/features exist and work. Do not recreate them.
Reference them for patterns only.

  ✓ Auth flow (login, forgot, reset, change password)
  ✓ Dashboard shell (Sidebar, TopBar, ProtectedRoute layout)
  ✓ User CRUD + role management
  ✓ Student CRUD + detail profile
  ✓ Teacher CRUD + detail profile
  ✓ Guardian CRUD + link/unlink to students
  ✓ Academic years, terms, classes, sections, subjects CRUD
  ✓ Enrollment (enroll, transfer, withdraw workflows)
  ✓ Attendance page (manual entry + scanner components exist)
  ✓ Grades page (assessment creation + grade entry grid)
  ✓ Schedule / timetable page
  ✓ Notification center in TopBar
    (unread count, mark read, mark all read, delete)
  ✓ Settings page (tabbed UI, partially wired)
  ✓ Profile page
  ✓ Bilingual structure (en + am) active across app

==============================================================
## 11. KNOWN PARTIAL / BROKEN ITEMS
==============================================================

Be aware these exist but are not fully working:

  ⚠ Schedule modal: teachers prop passed as empty array []
     → needs to use useTeachers() hook to populate

  ⚠ Section roster page: students hardcoded as []
     → needs real API call for enrolled students

  ⚠ Grades report generator: has a mock fallback path
     → needs real API data

  ⚠ Payments feature: components exist in features/payments
     but no dashboard navigation route wired yet

  ⚠ useRealtimeToasts hook: exists but never called
     in the dashboard layout

  ⚠ Settings forms: UI exists but most do not persist
     to backend on save

  ⚠ Some components still have hardcoded English strings
     (i18n migration is incomplete)

  ⚠ Teacher/Student/Guardian roles: can log in but have
     no role-specific dashboard pages yet

When a task touches any of these, fix the known issue
as part of the task — do not work around it.

==============================================================
## 12. CODE QUALITY EXPECTATIONS
==============================================================

  - TypeScript: no implicit 'any'. Define interfaces for 
    all data shapes in a types.ts file within the feature.

  - Imports: use the @/ alias (configured).
    Example: import { Button } from '@/components/ui/button'

  - 'use client' directive: add it only when needed
    (event handlers, hooks, browser APIs).
    Prefer server components for pages when possible.

  - Error boundaries: wrap complex feature areas in
    an error boundary or use Next.js error.tsx files.

  - Console logs: do not leave console.log in production
    code. Remove all debug logs before output.

  - Responsive design: all new UI must work on both
    desktop and tablet. Use Tailwind responsive prefixes
    (sm:, md:, lg:) where needed.

==============================================================
## 13. HOW TO HANDLE BACKEND UNCERTAINTY
==============================================================

Some backend endpoints may not be implemented yet.
When this is the case:

  1. Write the frontend code correctly using the 
     expected API contract.

  2. Add a clear comment near the API call:
     // BACKEND REQUIRED: POST /api/endpoint
     // Expected request body: { ... }
     // Expected response: { ... }

  3. Do NOT silently use hardcoded mock data as if it
     were real. If you need a fallback for development,
     wrap it clearly:
     
     const USE_MOCK = process.env.NODE_ENV === 'development' 
                      && !process.env.NEXT_PUBLIC_API_URL

  4. Do not remove the existing auth mock fallback
     in auth.service — that is intentional.

==============================================================
## 14. RESPONSE FORMAT FOR EACH TASK
==============================================================

When implementing a feature, structure your response as:

  ### Files to create
  (list with full paths)

  ### Files to modify
  (list with full paths and what changes)

  ### [filename]
  (full file content)

  ### messages/en.json additions
  (only the new keys to add, in correct namespace)

  ### messages/am.json additions
  (same keys in Amharic)

  ### BACKEND REQUIRED
  (list any API endpoints the frontend depends on
   that may not exist yet)

  ### Notes
  (any important implementation decisions or warnings)

==============================================================
## END OF CONTEXT
==============================================================

Keep this context active for all tasks in this session.
When I give you a task, implement it following every rule
above without needing to be reminded.