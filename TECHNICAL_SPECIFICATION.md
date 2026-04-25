# School Management System - Technical Specification

## 1. Project Overview

A comprehensive, role-based School Management System (SMS) for Ethiopian high schools. Built with Next.js 16, React 19, and TypeScript. Connects to a FastAPI/Python REST backend.

### Purpose
Manage academic workflows including:
- User management (Admin, Director, Registrar, Teacher, Student, Guardian)
- Student registration and enrollment
- Teacher management and assignments
- Academic structure (years, terms, classes, sections, subjects)
- Attendance tracking (manual, face recognition, barcode scanning)
- Grade management with assessments and report cards
- Class scheduling with conflict detection
- Fee payments via Chapa integration (Ethiopia)
- Real-time notifications

## 2. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.6 (App Router) |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Components | Radix UI + shadcn/ui | Latest |
| State Management | Zustand | 5.0.11 |
| Server State | TanStack React Query | 5.90.21 |
| HTTP Client | Axios | 1.13.5 |
| Forms | React Hook Form + Zod | 7.71.2 + 4.3.6 |
| i18n | next-intl | 4.8.3 |
| Icons | Lucide React | 0.575.0 |
| Charts | Recharts | 3.8.1 |
| Notifications | Sonner | 2.0.7 |
| Face Recognition | face-api.js | Latest |
| PDF Generation | jspdf | Latest |
| Barcode | html5-qrcode | Latest |

## 3. Project Structure

```
front_end/
├── messages/                    # i18n translations
│   ├── en.json                 # English
│   └── am.json                 # Amharic
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Locale-prefixed routes
│   │   │   ├── (auth)/        # Auth routes (login, forgot-password, etc.)
│   │   │   └── (dashboard)/   # Dashboard routes with sidebar
│   │   │       └── dashboard/
│   │   │           ├── attendance/
│   │   │           ├── grades/
│   │   │           ├── schedule/
│   │   │           ├── academics/
│   │   │           ├── students/
│   │   │           ├── teachers/
│   │   │           ├── guardians/
│   │   │           ├── enrollments/
│   │   │           ├── users/
│   │   │           ├── profile/
│   │   │           └── settings/
│   │   ├── layout.tsx         # Root layout
│   │   ├── not-found.tsx      # 404 page (no i18n context)
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── auth/              # Auth components
│   │   ├── layout/            # Sidebar, TopBar
│   │   ├── shared/            # Reusable components
│   │   └── ui/                # shadcn/ui components
│   ├── features/              # Feature modules
│   │   ├── academics/         # Academic structure API
│   │   ├── attendance/        # Attendance with face/barcode
│   │   ├── enrollments/       # Enrollment management
│   │   ├── grades/            # Grade management + report cards
│   │   ├── schedule/          # Timetable with conflict detection
│   │   ├── payments/          # Chapa integration
│   │   ├── notifications/     # Notification system
│   │   └── teachers/          # Teacher management
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core utilities
│   │   ├── api/              # API services
│   │   ├── store/            # Zustand stores
│   │   └── utils.ts          # Utility functions
│   └── i18n/                  # i18n configuration
├── middleware.ts              # Next.js middleware for locale routing
├── next.config.ts            # Next.js config
└── package.json
```

## 4. User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access - all users, settings, configuration |
| **Director** | School oversight - teachers, students, academics |
| **Registrar** | Student enrollment, guardians, enrollments |
| **Teacher** | View assigned classes, students, schedules |
| **Student** | View own profile, grades, enrollment |
| **Guardian** | View linked students' information, pay fees |

## 5. Core Features Implementation

### 5.1 Authentication System

**Files:**
- `src/lib/store/auth-store.ts` - Zustand auth store
- `src/lib/api/auth.service.ts` - Auth API calls
- `src/components/auth/protected-route.tsx` - Route guards
- `src/middleware.ts` - Locale and auth middleware

**Key Logic:**
- JWT tokens stored in memory (not localStorage for security)
- Role-based route access
- Auto-redirect to login for unauthenticated users
- Mock authentication fallback when backend unavailable

**Mock Credentials:**
```
admin@school.com / admin123
student@school.com / student123
guardian@school.com / guardian123
```

### 5.2 Attendance System (Phase 1)

**Files:**
- `src/features/attendance/types/index.ts` - Type definitions
- `src/features/attendance/api/useAttendance.ts` - React Query hooks
- `src/features/attendance/components/FaceRecognitionScanner.tsx`
- `src/features/attendance/components/BarcodeScanner.tsx`
- `src/features/attendance/components/AttendancePDFReport.tsx`
- `src/app/[locale]/(dashboard)/dashboard/attendance/page.tsx`

**Features:**
1. **Manual Entry:** Tab-based interface with present/absent/late/excused status
2. **Face Recognition:** 
   - Uses face-api.js from CDN
   - Loads TinyFaceDetector, FaceLandmark68, FaceRecognitionNet models
   - Real-time webcam detection
   - Euclidean distance matching against registered faces
   - Auto-mark attendance on recognition
3. **Barcode/ID Scanning:**
   - Global keyboard listener for physical scanners
   - Manual ID entry with Enter key
   - Lookup by registration number or student ID
4. **PDF Reports:**
   - Print-ready HTML generation
   - CSV export
   - Statistics summary

**Data Types:**
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
  student_name: string;
  registration_number: string;
  section_id: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  marked_by: string;
}
```

### 5.3 Grade Management (Phase 2)

**Files:**
- `src/features/grades/types/index.ts`
- `src/features/grades/api/useGrades.ts`
- `src/features/grades/components/GradeEntryGrid.tsx`
- `src/features/grades/components/ReportCardGenerator.tsx`
- `src/app/[locale]/(dashboard)/dashboard/grades/page.tsx`

**Features:**
1. **Assessment Management:**
   - Create assessments (quiz, test, midterm, final, assignment, project)
   - Set max score and weight
   - Subject/class linkage
2. **Spreadsheet Grid:**
   - TanStack Table-based
   - Bulk selection with checkboxes
   - Inline score editing
   - Auto-calculated letter grades (A: 90+, B: 80+, C: 70+, D: 60+, F: <60)
   - Sorting by name, score, registration number
   - Filtering by search text
   - Pagination (20 students/page)
   - Bulk score assignment
   - CSV export
3. **Report Cards:**
   - English/Amharic language support
   - Print-ready HTML template
   - Student info, subjects, assessments breakdown
   - Overall average and ranking
   - Signature lines for teacher, principal, guardian

**Data Types:**
```typescript
enum AssessmentType {
  QUIZ = 'quiz',
  TEST = 'test',
  MIDTERM = 'midterm',
  FINAL = 'final',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project'
}

interface Grade {
  id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  assessment_id: string;
  score: number | null;
  letter_grade?: string;
  comment?: string;
}

interface ReportCard {
  student_id: string;
  student_name: string;
  registration_number: string;
  term_name: string;
  academic_year: string;
  class_name: string;
  section_name: string;
  subjects: StudentGradeSummary[];
  overall_average: number;
  rank?: number;
  total_students?: number;
  conduct?: string;
  teacher_comment?: string;
}
```

### 5.4 Schedule Management (Phase 3)

**Files:**
- `src/features/schedule/types/index.ts`
- `src/features/schedule/api/useSchedule.ts`
- `src/features/schedule/components/TimetableGrid.tsx`
- `src/features/schedule/components/ScheduleEntryModal.tsx`
- `src/app/[locale]/(dashboard)/dashboard/schedule/page.tsx`

**Features:**
1. **Timetable Grid:**
   - 5 days (Mon-Fri), 8 time slots
   - Visual schedule display
   - Subject, teacher, room info on cards
   - Hover actions (edit/delete)
2. **CRUD Modal:**
   - Create/edit/delete schedule entries
   - Day of week selection
   - Time slot picker (08:00-16:00)
   - Subject and teacher dropdowns
   - Room number input
3. **Conflict Detection:**
   - Teacher double-booking detection
   - Room conflict detection
   - Same-section time conflict
   - Visual warnings with icons
   - Prevent save until resolved

**Data Types:**
```typescript
interface ScheduleEntry {
  id: string;
  section_id: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  day_of_week: number; // 0=Sunday, 1=Monday...
  start_time: string;  // HH:mm:ss
  end_time: string;
  room_number?: string;
  term_id: string;
}

interface CreateScheduleEntryPayload {
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number?: string;
  term_id: string;
}
```

### 5.5 Guardian Financial Portal (Phase 4)

**Files:**
- `src/features/payments/types/index.ts`
- `src/features/payments/api/usePayments.ts`
- `src/features/payments/components/GuardianDashboard.tsx`
- `src/features/payments/components/ChapaPaymentModal.tsx`

**Features:**
1. **Guardian Dashboard:**
   - Summary cards (total balance, linked students, recent transactions)
   - Tabbed interface: Student Fees | Payment History
   - Per-student fee listing
   - Fee status badges (paid, partial, unpaid, overdue)
2. **Chapa Integration:**
   - Payment initialization with Chapa API
   - Customizable amount (full or partial payment)
   - Secure checkout in new window
   - Payment verification webhook
   - Transaction reference tracking
3. **Payment History:**
   - All transactions with reference numbers
   - Status indicators (completed, pending, failed)
   - Filterable by student

**Data Types:**
```typescript
enum FeeType {
  TUITION = 'tuition',
  REGISTRATION = 'registration',
  EXAM = 'exam',
  LIBRARY = 'library',
  LAB = 'lab',
  TRANSPORT = 'transport',
  OTHER = 'other'
}

enum FeeStatus {
  PAID = 'paid',
  PARTIAL = 'partial',
  UNPAID = 'unpaid',
  OVERDUE = 'overdue'
}

interface StudentFee {
  id: string;
  student_id: string;
  fee_type: FeeType;
  amount: number;
  paid_amount: number;
  balance: number;
  due_date: string;
  status: FeeStatus;
}

interface PaymentTransaction {
  id: string;
  student_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string;
  chapa_reference?: string;
  paid_at: string;
}
```

### 5.6 Notification Hub (Phase 5)

**Files:**
- `src/features/notifications/types/index.ts`
- `src/features/notifications/api/useNotifications.ts`
- `src/features/notifications/components/NotificationCenter.tsx`
- `src/features/notifications/hooks/useRealtimeToasts.ts`
- `src/components/layout/top-bar.tsx` (integration)

**Features:**
1. **Notification Center (Slide-over):**
   - Bell icon with unread badge in top-bar
   - Sheet component from shadcn/ui
   - Tabs: All | Unread | Grades | Fees | Announcements
   - Mark as read / mark all as read
   - Delete notifications
   - Priority-based styling (urgent=pulsing red, high=orange, medium=amber, low=blue)
   - Type icons (attendance=clock, grade=graduation cap, fee=wallet, etc.)
2. **Real-time Toasts:**
   - Automatic toast notifications for new unread items
   - Session-based deduplication (sessionStorage)
   - Priority-based toast types (error for urgent, warning for high, info for medium, success for low)
   - Optional sound for high/urgent (audio files)
   - Helper hooks: useAttendanceToasts, useFeeToasts, useGradeToasts

**Data Types:**
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
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  user_id: string;
  link?: string;
}
```

## 6. Academic Structure

**Files:** `src/features/academics/api/`

**Entities:**
- Academic Years (with is_current flag)
- Terms (semesters within year)
- Grade Levels (9, 10, 11, 12)
- Classes (linked to grade level)
- Sections (within classes)
- Subjects

## 7. API Layer Structure

All API hooks follow this pattern:
```typescript
// Query Keys for cache invalidation
const featureKeys = {
  all: ['feature'] as const,
  byId: (id: string) => [...featureKeys.all, id] as const,
  list: (filters: any) => [...featureKeys.all, 'list', filters] as const,
};

// Fetch hook
export function useFeatureData(id: string) {
  return useQuery({
    queryKey: featureKeys.byId(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/endpoint/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Mutation hook
export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post('/endpoint', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.all });
      toast.success('Success message');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error message');
    },
  });
}
```

## 8. Internationalization (i18n)

**Setup:**
- next-intl for routing and translations
- Locale prefix in URLs: `/en/dashboard`, `/am/dashboard`
- Supported locales: English (en), Amharic (am)
- Translation files: `messages/en.json`, `messages/am.json`
- RTL support for Amharic in report cards

**Key Files:**
- `src/i18n/routing.ts` - Locale configuration
- `src/middleware.ts` - Locale detection and routing
- `src/app/[locale]/` - Locale-scoped pages

## 9. State Management

**Zustand Stores:**
- `auth-store.ts` - User authentication state, tokens, role
- No persistence (security) - tokens in memory only

**React Query:**
- Server state caching
- Automatic background refetching
- Optimistic updates where applicable
- Cache invalidation patterns

## 10. Component Patterns

**Page Structure:**
```typescript
export default function FeaturePage() {
  // 1. State for filters/selection
  const [selectedId, setSelectedId] = useState('');
  
  // 2. Data fetching
  const { data } = useFeatureData(selectedId);
  
  // 3. Mutations
  const mutation = useCreateFeature();
  
  // 4. Handlers
  const handleSubmit = () => {
    mutation.mutate(payload);
  };
  
  // 5. Render with loading states
  return (
    <div className="space-y-6">
      <PageHeader title="Feature" />
      <Filters />
      {isLoading ? <LoadingSpinner /> : <DataDisplay />}
    </div>
  );
}
```

**Common UI Patterns:**
- Cards with headers for content grouping
- Tables with TanStack Table for data
- Select dropdowns with cascading (year → class → section)
- Tabs for alternate views
- Dialogs/Sheets for modals
- Toast notifications for feedback

## 11. Styling Guidelines

- Tailwind CSS 4 with custom theme
- Color scheme: Primary=blue, Success=green, Warning=amber, Error=red, Info=blue
- Status badges use subtle backgrounds with border
- Cards use `bg-card` with `border` and `shadow-sm`
- Spacing: space-y-6 for sections, gap-4 for grids
- Minimum touch targets: 44px
- Responsive: Mobile-first, lg breakpoint for desktop enhancements

## 12. Backend API Contract

Base URL: `NEXT_PUBLIC_API_URL` (e.g., http://localhost:8000/api)

**Standard Response Format:**
```typescript
// List response
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Error response
interface ErrorResponse {
  detail: string;
  errors?: Record<string, string[]>;
}
```

**Key Endpoints:**
- `POST /auth/login` - Authentication
- `GET /academic-years` - List academic years
- `GET /classes` - List classes (filtered by year)
- `GET /classes/:id` - Class detail with sections
- `GET /subjects` - List subjects
- `GET /terms` - List terms (filtered by year)
- `GET /attendance/section/:id` - Get attendance for section
- `POST /attendance/bulk` - Submit bulk attendance
- `GET /assessments` - List assessments
- `POST /assessments` - Create assessment
- `GET /grades/assessment/:id` - Get grades for assessment
- `POST /grades/bulk` - Submit bulk grades
- `GET /schedule/section/:id` - Get schedule for section
- `POST /schedule` - Create schedule entry
- `DELETE /schedule/:id` - Delete schedule entry
- `GET /guardians/:id/dashboard` - Guardian dashboard data
- `POST /payments/chapa/initialize` - Initiate Chapa payment
- `POST /payments/chapa/verify` - Verify Chapa payment
- `GET /notifications` - List notifications
- `POST /notifications/:id/read` - Mark as read
- `GET /notifications/unread/count` - Get unread count

## 13. Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 14. Security Considerations

- JWT tokens stored in memory (Zustand), not localStorage
- Role-based access control on both frontend and backend
- Protected routes redirect to login
- API calls include Authorization header with Bearer token
- Axios interceptors handle token refresh and 401 errors
- No sensitive data in URL parameters

## 15. Testing Strategy

**Unit Tests:**
- Component testing with React Testing Library
- Hook testing with React Hooks Testing Library
- Utility function tests

**Integration Tests:**
- API mocking with MSW (Mock Service Worker)
- User flow testing

**E2E Tests:**
- Playwright for critical paths
- Login → Dashboard → Feature workflows

## 16. Build & Deployment

**Scripts:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Build Output:**
- Static export or Node.js server
- Output directory: `.next/`

## 17. Key Implementation Notes

1. **Face Recognition:** Models loaded from CDN (jsdelivr). Student face descriptors would come from backend in production.

2. **Barcode Scanning:** Uses global keydown listener. Physical scanners send rapid keystrokes ending with Enter.

3. **Chapa Payment:** Opens in new window. Callback/return URLs must match registered URLs in Chapa dashboard.

4. **Notifications:** Use sessionStorage to prevent duplicate toasts. Real-time via polling (30s intervals).

5. **Report Cards:** Amharic text uses Noto Sans Ethiopic/Abyssinica SIL fonts. RTL layout for Amharic option.

6. **Schedule Conflicts:** Client-side validation only. Server should also validate.

7. **Grade Calculation:** Frontend calculates letter grades. Backend should verify.

8. **Academic Year Cascading:** Selecting year clears class and section. Selecting class clears section.

9. **Error Handling:** All API errors show toast with backend message or fallback.

10. **Loading States:** Consistent spinner component. Skeletons for cards.
