# AI Rebuild Prompt: School Management System Frontend

## Overview

Build a complete School Management System frontend using Next.js 15, React 19, TypeScript, Tailwind CSS, and shadcn/ui. This is a comprehensive educational management platform for Ethiopian schools with role-based access control, supporting English and Amharic languages.

## Tech Stack (Exact Versions)

- **Framework**: Next.js 15.1.6 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: shadcn/ui (latest)
- **State Management**: Zustand 5.0.3 with persist middleware
- **Data Fetching**: TanStack React Query 5.64.2
- **HTTP Client**: Axios 1.7.9
- **Forms**: React Hook Form 7.54.2 + Zod 3.24.1
- **Internationalization**: next-intl 3.26.3
- **Icons**: Lucide React 0.474.0
- **Date Handling**: date-fns 4.1.0
- **Toast Notifications**: Sonner 1.7.2
- **PDF Generation**: jsPDF 2.5.2 + jspdf-autotable 3.5.25

## Project Structure

```
front_end/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (no sidebar)
│   │   │   ├── login/page.tsx        # Login page
│   │   │   └── layout.tsx            # Auth layout
│   │   ├── (dashboard)/              # Dashboard route group
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # Dashboard home
│   │   │   │   ├── attendance/page.tsx
│   │   │   │   ├── grades/page.tsx
│   │   │   │   ├── schedule/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── students/page.tsx
│   │   │   │   ├── teachers/page.tsx
│   │   │   │   ├── guardians/page.tsx
│   │   │   │   ├── directors/page.tsx
│   │   │   │   ├── academics/
│   │   │   │   │   ├── subjects/page.tsx
│   │   │   │   │   ├── classes/page.tsx
│   │   │   │   │   └── sections/page.tsx
│   │   │   │   ├── enrollments/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx            # Dashboard layout with sidebar
│   │   ├── [locale]/                 # Locale-specific routes
│   │   │   ├── layout.tsx            # Locale layout with fonts, i18n
│   │   │   ├── page.tsx              # Locale root (redirects to login)
│   │   │   ├── [...rest]/page.tsx    # Catch-all for 404
│   │   │   └── not-found.tsx         # Localized 404 page
│   │   ├── layout.tsx                # Root layout (minimal)
│   │   ├── not-found.tsx             # Root 404 fallback
│   │   ├── page.tsx                  # Root redirect to /en/login
│   │   └── globals.css               # Global styles, Tailwind
│   ├── components/
│   │   ├── auth/
│   │   │   └── protected-route.tsx   # Auth guard component
│   │   ├── layout/
│   │   │   ├── sidebar.tsx           # Navigation sidebar
│   │   │   ├── top-bar.tsx           # Header with user menu
│   │   │   └── user-menu.tsx         # User dropdown menu
│   │   └── providers.tsx             # React Query, Theme providers
│   ├── features/                      # Feature-based organization
│   │   ├── attendance/
│   │   │   ├── api/
│   │   │   │   └── useAttendance.ts  # React Query hooks
│   │   │   ├── components/
│   │   │   │   ├── AttendancePDFReport.tsx
│   │   │   │   ├── BarcodeScanner.tsx
│   │   │   │   ├── FaceRecognitionScanner.tsx
│   │   │   │   └── ManualAttendanceEntry.tsx
│   │   │   └── types/
│   │   │       └── index.ts          # Attendance types/enums
│   │   ├── grades/
│   │   │   ├── api/
│   │   │   │   └── useGrades.ts
│   │   │   ├── components/
│   │   │   │   ├── GradeDashboard.tsx
│   │   │   │   ├── GradeEntryGrid.tsx
│   │   │   │   ├── BulkGradeEntry.tsx
│   │   │   │   └── ReportCardGenerator.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── schedule/
│   │   │   ├── api/
│   │   │   │   └── useSchedule.ts
│   │   │   ├── components/
│   │   │   │   ├── TimetableGrid.tsx
│   │   │   │   ├── ScheduleEntryModal.tsx
│   │   │   │   └── ConflictDetector.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── payments/
│   │   │   ├── api/
│   │   │   │   └── usePayments.ts
│   │   │   ├── components/
│   │   │   │   ├── GuardianDashboard.tsx
│   │   │   │   ├── ChapaPaymentModal.tsx
│   │   │   │   └── PaymentHistory.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── notifications/
│   │   │   ├── api/
│   │   │   │   └── useNotifications.ts
│   │   │   ├── components/
│   │   │   │   ├── NotificationCenter.tsx
│   │   │   │   ├── NotificationPreferences.tsx
│   │   │   │   └── NotificationToast.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useRealtimeToasts.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── academics/
│   │       ├── api/
│   │       │   ├── useAcademicYears.ts
│   │       │   ├── useClasses.ts
│   │       │   └── useSubjects.ts
│   │       └── types/
│   │           └── index.ts
│   ├── hooks/
│   │   └── use-permissions.ts        # Role permission checks
│   ├── i18n/
│   │   ├── navigation.ts             # Localized Link/Router
│   │   ├── request.ts                # next-intl request config
│   │   └── routing.ts                # Locale routing config
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios.ts              # Axios instance with interceptors
│   │   │   └── auth.service.ts       # Auth API calls
│   │   ├── store/
│   │   │   └── auth-store.ts         # Zustand auth store
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       └── global.d.ts               # Global TypeScript types
├── messages/
│   ├── en.json                       # English translations
│   └── am.json                       # Amharic translations
├── components.json                   # shadcn/ui config
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind config
└── tsconfig.json                     # TypeScript config
```

## Core Features to Implement

### 1. Authentication System

**Login Page** (`/login`):
- Email and password form with Zod validation
- Client-side validation (required fields, email format)
- Server error display
- Loading state with spinner
- "Remember me" checkbox
- Redirect to dashboard on success
- Redirect to change-password if `must_change_password` is true

**ProtectedRoute Component**:
- Checks if user is authenticated (redirects to login if not)
- Checks if user must change password
- Role-based access control (optional `requireRoles` prop)
- Shows loading spinner while auth store hydrates from localStorage

**Auth Store** (Zustand with persist):
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user, accessToken, refreshToken) => void;
  clearAuth: () => void;
  updateTokens: (accessToken, refreshToken) => void;
  updateUser: (updates) => void;
  setHydrated: () => void;
}
```

**Axios Configuration**:
- Base URL from env var `NEXT_PUBLIC_API_URL` or fallback to `http://localhost:8000/api`
- Request interceptor: adds Bearer token from auth store
- Response interceptor: handles 401 errors, attempts token refresh
- On refresh failure: clears auth and redirects to login with locale prefix

### 2. Layout System

**Root Layout** (`app/layout.tsx`):
- Minimal layout - just returns children
- Avoids hydration conflicts with locale layout

**Locale Layout** (`app/[locale]/layout.tsx`):
- Validates locale against `['en', 'am']`
- Loads Google Fonts: Geist Sans, Geist Mono, Noto Sans Ethiopic
- Applies `font-amharic` class when locale is 'am'
- Wraps with NextIntlClientProvider
- Wraps with global Providers (React Query, Theme)
- Includes skip-link for accessibility

**Dashboard Layout** (`app/(dashboard)/layout.tsx`):
- Wraps with ProtectedRoute
- Flexbox layout: sidebar (left) + main content (right)
- Sidebar state: mobile (slide-out), desktop (collapsible)
- Main content area with independent scrolling
- Top bar with hamburger menu, notifications, user menu

**Sidebar Component**:
- Navigation items with role-based visibility:
  - Dashboard (all users)
  - Users (canViewUsers: admin, director, registrar)
  - Directors (canViewUsers)
  - Students (canManageStudents)
  - Teachers (canManageTeachers)
  - Guardians (canManageGuardians)
  - Academics (canManageAcademics)
  - Enrollments (canManageEnrollments)
  - Attendance (canManageStudents || canManageAcademics)
  - Schedule (canManageStudents || canManageAcademics)
  - Grades (canManageStudents || canManageAcademics)
  - Payments (canManageGuardians || canManageStudents)
  - Settings (canAccessSettings: admin only)
- Active state highlighting based on current pathname
- Collapsible on desktop (icon-only mode)
- Mobile: slide-out drawer with backdrop
- Close button on mobile

**Top Bar Component**:
- Menu toggle button (mobile only)
- Breadcrumbs based on current path
- Language switcher (EN/AM toggle)
- Notification bell with unread count
- User menu with profile, settings, logout

### 3. Internationalization (i18n)

**Routing Config** (`i18n/routing.ts`):
```typescript
defineRouting({
  locales: ['en', 'am'],
  defaultLocale: 'en',
  localePrefix: 'always'  // All routes have /en/ or /am/ prefix
})
```

**Navigation Utils** (`i18n/navigation.ts`):
- Export `Link`, `redirect`, `usePathname`, `useRouter` from next-intl
- These preserve locale in URLs automatically

**Middleware** (`middleware.ts`):
- Use next-intl middleware with routing config
- Matcher: `/((?!api|_next|.*\\..*).*)`
- Handles locale detection and redirect

**Translations**:
- `messages/en.json` - English translations
- `messages/am.json` - Amharic translations
- Namespaces: auth, nav, common, attendance, grades, schedule, etc.

### 4. Attendance System (`/dashboard/attendance`)

**Features**:
- Manual attendance entry (present/absent/late/excused)
- Face recognition scanning (using face-api.js)
- Barcode/QR code scanning (using html5-qrcode)
- Daily attendance report with PDF export
- Filters: academic year, term, class, section, date

**Components**:
- `ManualAttendanceEntry.tsx`: Table with status dropdowns for each student
- `FaceRecognitionScanner.tsx`: Camera feed, face detection, matching
- `BarcodeScanner.tsx`: Camera/keyboard input for registration numbers
- `AttendancePDFReport.tsx`: Print-friendly HTML report generation

**API Hooks** (`useAttendance.ts`):
- `useAttendanceBySection(sectionId, date)` - Get attendance records
- `useSubmitAttendance()` - Submit attendance data
- `useDailyAttendanceSummary()` - Get summary stats

**Types**:
```typescript
enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused'
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  section_id: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  recorded_by: string;
  recorded_at: string;
}
```

### 5. Grade Management (`/dashboard/grades`)

**Features**:
- Grade dashboard with statistics
- Bulk grade entry interface
- Assessment management (quizzes, midterms, finals, projects)
- Report card generation (PDF with English/Amharic)
- Grade history and analytics

**Components**:
- `GradeDashboard.tsx`: Overview cards, charts, recent activity
- `GradeEntryGrid.tsx`: Spreadsheet-like interface for entering grades
- `BulkGradeEntry.tsx`: Mass upload/entry of grades
- `ReportCardGenerator.tsx`: PDF report cards with school branding

**API Hooks** (`useGrades.ts`):
- `useAssessments(sectionId, subjectId)` - Get assessments
- `useGradesByAssessment(assessmentId)` - Get grades for assessment
- `useSubmitGrades()` - Submit grades
- `useReportCards(studentId, termId)` - Get report cards

**Types**:
```typescript
enum AssessmentType {
  QUIZ = 'quiz',
  MIDTERM = 'midterm',
  FINAL = 'final',
  PROJECT = 'project',
  HOMEWORK = 'homework',
  PARTICIPATION = 'participation'
}

interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  section_id: string;
  subject_id: string;
  max_score: number;
  weight: number;
  date: string;
}

interface Grade {
  id: string;
  assessment_id: string;
  student_id: string;
  score: number;
  remarks?: string;
}
```

### 6. Schedule Management (`/dashboard/schedule`)

**Features**:
- Weekly timetable grid view
- CRUD operations for schedule entries
- Conflict detection (teacher double-booked, room double-booked)
- Filter by academic year, term, class, section

**Components**:
- `TimetableGrid.tsx`: Visual grid showing days (rows) × periods (columns)
- `ScheduleEntryModal.tsx`: Form to add/edit schedule entries
- `ConflictDetector.tsx`: Shows conflicts with warnings

**API Hooks** (`useSchedule.ts`):
- `useSectionSchedule(sectionId)` - Get schedule for a section
- `useTeacherSchedule(teacherId)` - Get schedule for a teacher
- `useCreateScheduleEntry()` - Create new entry
- `useDeleteScheduleEntry()` - Delete entry

**Types**:
```typescript
interface ScheduleEntry {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;  // 0-6 (Sunday-Saturday)
  period_number: number;
  start_time: string;
  end_time: string;
  room?: string;
}

interface CreateScheduleEntryPayload {
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  room?: string;
}
```

### 7. Payment/Financial Portal (`/dashboard/payments`)

**Features**:
- Guardian dashboard showing linked students
- Fee status overview (paid/unpaid/pending)
- Chapa payment integration (Ethiopian payment gateway)
- Payment history and receipts
- Outstanding balance tracking

**Components**:
- `GuardianDashboard.tsx`: Overview of all linked students and their fees
- `ChapaPaymentModal.tsx`: Chapa checkout integration
- `PaymentHistory.tsx`: List of past payments

**API Hooks** (`usePayments.ts`):
- `useGuardianDashboard()` - Get guardian data with linked students
- `useStudentFees(studentId)` - Get fees for a student
- `useCreateChapaPayment()` - Initiate Chapa payment
- `usePaymentHistory(studentId)` - Get payment history

**Types**:
```typescript
enum FeeStatus {
  PAID = 'paid',
  PARTIAL = 'partial',
  UNPAID = 'unpaid',
  WAIVED = 'waived'
}

enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface StudentFee {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
  balance: number;
  due_date: string;
  status: FeeStatus;
}

interface GuardianDashboardData {
  guardian_id: string;
  linked_students: LinkedStudent[];
  total_outstanding: number;
  total_paid_this_term: number;
}
```

### 8. Notification System

**Features**:
- Real-time notification center
- Toast notifications for immediate alerts
- Notification preferences management
- Different types: attendance, grade, fee, schedule, announcement, system
- Priority levels: low, medium, high, urgent

**Components**:
- `NotificationCenter.tsx`: Slide-out panel with notification list
- `NotificationPreferences.tsx`: Settings for notification types
- `NotificationToast.tsx`: Real-time toast display

**API Hooks** (`useNotifications.ts`):
- `useNotifications(userId)` - Get all notifications
- `useUnreadNotifications(userId)` - Get unread count
- `useMarkAsRead()` - Mark notification as read
- `useUpdatePreferences()` - Update notification settings

**Types**:
```typescript
enum NotificationType {
  ATTENDANCE = 'attendance',
  GRADE = 'grade',
  FEE = 'fee',
  SCHEDULE = 'schedule',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system'
}

enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}
```

### 9. User Management (`/dashboard/users`, `/dashboard/students`, etc.)

**Role-Based Access**:
- Admin: Full access to all features
- Director: Manage academics, view all data
- Registrar: Manage enrollments, students, guardians
- Teacher: Manage grades, view own schedule and students
- Guardian: View own children's data, make payments

**Permission Hook** (`usePermissions.ts`):
```typescript
const usePermissions = () => {
  const { user } = useAuthStore();
  
  return {
    canViewUsers: user?.roles.includes('admin') || user?.roles.includes('director') || user?.roles.includes('registrar'),
    canManageStudents: user?.roles.includes('admin') || user?.roles.includes('director') || user?.roles.includes('registrar') || user?.roles.includes('teacher'),
    canManageTeachers: user?.roles.includes('admin') || user?.roles.includes('director') || user?.roles.includes('registrar'),
    canManageGuardians: user?.roles.includes('admin') || user?.roles.includes('director') || user?.roles.includes('registrar'),
    canManageAcademics: user?.roles.includes('admin') || user?.roles.includes('director') || user?.roles.includes('registrar'),
    canManageEnrollments: user?.roles.includes('admin') || user?.roles.includes('director') || user?.roles.includes('registrar'),
    canAccessSettings: user?.roles.includes('admin'),
    isGuardian: user?.roles.includes('guardian'),
  };
};
```

### 10. Academic Management

**Academic Year & Terms**:
- Create/manage academic years
- Define terms within years (semesters/quarters)
- Set active academic year

**Classes & Sections**:
- Class management (Grade 1, Grade 2, etc.)
- Section management (A, B, C sections per class)
- Assign class teachers

**Subjects**:
- Subject catalog
- Assign subjects to classes
- Define subject teachers

### 11. Enrollment System

**Features**:
- Student enrollment workflow
- Transfer students between sections
- Enrollment history tracking
- Bulk enrollment

## UI/UX Requirements

### Design System (shadcn/ui)

**Color Palette**:
- Primary: Blue theme (adjustable via CSS variables)
- Background: Light mode default, dark mode support
- Text: High contrast for readability
- Destructive: Red for errors/danger actions

**Typography**:
- English: Geist Sans/Mono
- Amharic: Noto Sans Ethiopic
- Responsive sizing (sm, base, lg, xl, 2xl)

**Components to Use**:
- Layout: Card, Separator, ScrollArea, Sheet
- Forms: Input, Label, Select, Checkbox, Textarea
- Feedback: Button, Badge, Toast (Sonner), Alert
- Data Display: Table, DataTable (with sorting/filtering)
- Navigation: Tabs, Breadcrumb (custom)
- Overlay: Dialog, DropdownMenu, Popover

### Responsive Design

**Breakpoints**:
- Mobile: < 768px (sidebar as slide-out drawer)
- Tablet: 768px - 1024px (sidebar collapsible)
- Desktop: > 1024px (sidebar always visible, collapsible)

**Mobile-First Approach**:
- All features must work on mobile
- Touch-friendly buttons (min 44px)
- Readable text sizes
- Horizontal scroll for tables with many columns

### Accessibility

- WCAG 2.1 AA compliance
- Skip links for keyboard navigation
- ARIA labels for icons
- Focus management in modals
- Color contrast ratios
- Keyboard navigation support

## API Integration

### Backend Endpoints (Expected)

**Authentication**:
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

**Users**:
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

**Students**:
- `GET /students` - List students
- `POST /students` - Create student
- `GET /students/{id}` - Get student details
- `PUT /students/{id}` - Update student

**Attendance**:
- `GET /attendance/section/{section_id}?date={date}` - Get attendance
- `POST /attendance/bulk` - Submit attendance
- `GET /attendance/summary?section_id={id}&date={date}` - Get summary

**Grades**:
- `GET /assessments?section_id={id}&subject_id={id}` - Get assessments
- `POST /assessments` - Create assessment
- `GET /grades?assessment_id={id}` - Get grades
- `POST /grades/bulk` - Submit grades

**Schedule**:
- `GET /schedule/section/{section_id}` - Get section schedule
- `GET /schedule/teacher/{teacher_id}` - Get teacher schedule
- `POST /schedule` - Create schedule entry
- `DELETE /schedule/{id}` - Delete schedule entry

**Notifications**:
- `GET /notifications?user_id={id}` - Get notifications
- `POST /notifications/{id}/read` - Mark as read
- `PUT /notifications/preferences` - Update preferences

## Build Configuration

### next.config.js
```javascript
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

module.exports = withNextIntl(nextConfig);
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        amharic: ['var(--font-noto-ethiopic)', 'sans-serif'],
      },
      // ... rest of theme config
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### Environment Variables (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Development Workflow

1. **Setup**:
   ```bash
   npx shadcn@latest init --yes --template next --base-color blue
   npx shadcn add button card input label select checkbox table tabs dialog dropdown-menu sheet scroll-area separator badge alert sonner
   npm install zustand @tanstack/react-query axios next-intl react-hook-form zod @hookform/resolvers date-fns lucide-react face-api.js jspdf jspdf-autotable
   ```

2. **File Creation Order**:
   - Config files (tailwind, next.config, tsconfig, components.json)
   - i18n setup (routing, request, navigation)
   - Global styles (globals.css)
   - Store (auth-store.ts)
   - API client (axios.ts, auth.service.ts)
   - Layouts (root, locale, dashboard)
   - Auth components (protected-route.tsx)
   - Layout components (sidebar, top-bar, user-menu)
   - Feature modules (attendance, grades, schedule, payments, notifications)
   - Pages (implement each route)

3. **Testing**:
   - Test login flow
   - Test navigation with different roles
   - Test language switching
   - Test responsive design on mobile
   - Test protected routes (redirects when not logged in)

## Key Implementation Notes

1. **Hydration Issues**: Root layout should be minimal to avoid hydration mismatches. Full HTML structure should be in locale layout.

2. **Locale Prefix**: Always use `localePrefix: 'always'` in routing config to ensure consistent URLs.

3. **Client vs Server**: 
   - Server Components: layouts, pages that don't need client interactivity
   - Client Components: forms, interactive UI, components using hooks
   - Mark with 'use client' directive

4. **State Persistence**: Auth store uses localStorage via Zustand persist. Check `isHydrated` before using auth state.

5. **Error Handling**: Use React Query for server state error handling. Use toast notifications for user feedback.

6. **Type Safety**: Define all types in feature `types/index.ts` files. Use TypeScript strict mode.

7. **Performance**: 
   - Use React Query caching for API data
   - Lazy load heavy components (face-api.js, jspdf)
   - Use Next.js Image component for images

8. **Security**:
   - Never store sensitive data in localStorage beyond tokens
   - Always validate forms on both client and server
   - Sanitize user inputs
   - Use HTTPS in production

## Deliverables

1. Complete Next.js 15 project structure
2. All pages implementing the features above
3. Fully functional authentication system
4. Role-based navigation and access control
5. Responsive design (mobile + desktop)
6. English and Amharic language support
7. Integration-ready API hooks
8. PDF generation capabilities
9. Face recognition and barcode scanning features
10. Payment integration (Chapa)

The resulting application should be a production-ready, feature-complete School Management System frontend that can connect to a FastAPI/Python backend.
