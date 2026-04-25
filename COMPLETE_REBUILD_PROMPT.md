# COMPLETE AI REBUILD PROMPT: School Management System Frontend

## CRITICAL: Read This Entire Document Before Starting

This document contains the COMPLETE specification for rebuilding the School Management System frontend. EVERY feature, component, type, and functionality is documented here. Do not skip any sections.

---

## PART 1: TECHNOLOGY STACK (Exact Versions Required)

```json
{
  "dependencies": {
    "next": "15.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "@tanstack/react-query": "^5.64.2",
    "zustand": "^5.0.3",
    "axios": "^1.7.9",
    "next-intl": "^3.26.3",
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.10.0",
    "lucide-react": "^0.474.0",
    "date-fns": "^4.1.0",
    "sonner": "^1.7.2",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.5.25",
    "face-api.js": "^0.22.2",
    "html5-qrcode": "^2.3.8",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "postcss": "^8",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## PART 2: COMPLETE PROJECT STRUCTURE

Create these directories and files in EXACT order:

```
front_end/
├── messages/
│   ├── en.json                    # All English translations
│   └── am.json                    # All Amharic translations
├── public/
│   └── sounds/
│       ├── notification-high.mp3
│       └── notification-urgent.mp3
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── change-password/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── attendance/page.tsx
│   │   │   │   ├── grades/page.tsx
│   │   │   │   ├── schedule/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── users/create/page.tsx
│   │   │   │   ├── users/[id]/page.tsx
│   │   │   │   ├── users/[id]/edit/page.tsx
│   │   │   │   ├── students/page.tsx
│   │   │   │   ├── students/create/page.tsx
│   │   │   │   ├── students/[id]/page.tsx
│   │   │   │   ├── students/[id]/edit/page.tsx
│   │   │   │   ├── teachers/page.tsx
│   │   │   │   ├── teachers/create/page.tsx
│   │   │   │   ├── teachers/[id]/page.tsx
│   │   │   │   ├── teachers/[id]/edit/page.tsx
│   │   │   │   ├── guardians/page.tsx
│   │   │   │   ├── guardians/create/page.tsx
│   │   │   │   ├── guardians/[id]/page.tsx
│   │   │   │   ├── guardians/[id]/edit/page.tsx
│   │   │   │   ├── directors/page.tsx
│   │   │   │   ├── academics/
│   │   │   │   │   ├── subjects/page.tsx
│   │   │   │   │   ├── classes/page.tsx
│   │   │   │   │   ├── classes/[classId]/page.tsx
│   │   │   │   │   ├── years/page.tsx
│   │   │   │   │   └── years/[yearId]/page.tsx
│   │   │   │   ├── enrollments/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   └── change-password/page.tsx
│   │   │   └── layout.tsx
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── [...rest]/page.tsx
│   │   │   └── not-found.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── protected-route.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── top-bar.tsx
│   │   │   └── user-menu.tsx
│   │   ├── shared/
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── data-table/
│   │   │   │   └── index.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── enrollment-chart.tsx
│   │   │   └── activity-feed.tsx
│   │   └── providers.tsx
│   │
│   ├── features/
│   │   ├── attendance/
│   │   │   ├── api/
│   │   │   │   └── useAttendance.ts
│   │   │   ├── components/
│   │   │   │   ├── FaceRecognitionScanner.tsx
│   │   │   │   ├── BarcodeScanner.tsx
│   │   │   │   ├── AttendancePDFReport.tsx
│   │   │   │   └── ManualAttendanceEntry.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
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
│   │   │
│   │   ├── schedule/
│   │   │   ├── api/
│   │   │   │   └── useSchedule.ts
│   │   │   ├── components/
│   │   │   │   ├── TimetableGrid.tsx
│   │   │   │   ├── ScheduleEntryModal.tsx
│   │   │   │   └── ConflictDetector.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── api/
│   │   │   │   └── usePayments.ts
│   │   │   ├── components/
│   │   │   │   ├── GuardianDashboard.tsx
│   │   │   │   ├── ChapaPaymentModal.tsx
│   │   │   │   └── PaymentHistory.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
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
│   │   │
│   │   ├── academics/
│   │   │   ├── api/
│   │   │   │   ├── useAcademicYears.ts
│   │   │   │   ├── useClasses.ts
│   │   │   │   ├── useSubjects.ts
│   │   │   │   └── useTerms.ts
│   │   │   ├── components/
│   │   │   │   └── SubjectModal.tsx
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   └── schemas.ts
│   │   │
│   │   ├── enrollments/
│   │   │   ├── api/
│   │   │   │   └── useEnrollments.ts
│   │   │   ├── components/
│   │   │   │   ├── TransferModal.tsx
│   │   │   │   └── WithdrawModal.tsx
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   └── schemas.ts
│   │   │
│   │   └── teachers/
│   │       └── api/
│   │           └── useTeachers.ts
│   │
│   ├── hooks/
│   │   ├── use-guardians.ts
│   │   ├── use-permissions.ts
│   │   ├── use-students.ts
│   │   ├── use-teachers.ts
│   │   └── use-users.ts
│   │
│   ├── i18n/
│   │   ├── navigation.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.service.ts
│   │   │   ├── axios.ts
│   │   │   ├── guardians.service.ts
│   │   │   ├── query-keys.ts
│   │   │   ├── students.service.ts
│   │   │   ├── teachers.service.ts
│   │   │   └── users.service.ts
│   │   ├── store/
│   │   │   └── auth-store.ts
│   │   ├── permissions.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── global.d.ts
│
├── components.json
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## PART 3: CONFIGURATION FILES (Implement These First)

### 3.1 next.config.js
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

### 3.2 tailwind.config.ts
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### 3.3 components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 3.4 middleware.ts
```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### 3.5 .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## PART 4: TYPE DEFINITIONS (All Types and Enums)

### 4.1 Attendance Types (`src/features/attendance/types/index.ts`)
```typescript
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  section_id: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  marked_by: string;
  created_at: string;
  updated_at: string;
}

export interface DailyAttendanceSummary {
  section_id: string;
  section_name: string;
  date: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  is_submitted: boolean;
}

export interface AttendanceEntry {
  student_id: string;
  status: AttendanceStatus;
  note?: string;
}

export interface BulkAttendancePayload {
  section_id: string;
  date: string;
  entries: AttendanceEntry[];
}

export interface StudentAttendanceStats {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}
```

### 4.2 Grades Types (`src/features/grades/types/index.ts`)
```typescript
export enum AssessmentType {
  QUIZ = 'quiz',
  MIDTERM = 'midterm',
  FINAL = 'final',
  PROJECT = 'project',
  HOMEWORK = 'homework',
  PARTICIPATION = 'participation',
  ASSIGNMENT = 'assignment',
  LAB = 'lab',
}

export interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  subject_id: string;
  class_id: string;
  section_id?: string;
  term_id: string;
  max_score: number;
  weight: number;
  date: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface Grade {
  id: string;
  assessment_id: string;
  student_id: string;
  score: number;
  remarks?: string;
  graded_by: string;
  graded_at: string;
}

export interface GradeEntry {
  student_id: string;
  score: number | null;
}

export interface BulkGradePayload {
  assessment_id: string;
  entries: GradeEntry[];
}

export interface StudentGradeSummary {
  student_id: string;
  student_name: string;
  subjects: {
    subject_id: string;
    subject_name: string;
    assessments: {
      assessment_id: string;
      assessment_name: string;
      score: number;
      max_score: number;
      percentage: number;
    }[];
    subject_average: number;
  }[];
  overall_average: number;
  rank?: number;
}

export interface ReportCard {
  student_id: string;
  academic_year: string;
  term: string;
  grades: StudentGradeSummary;
  attendance: {
    total_days: number;
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  conduct_remarks?: string;
  teacher_remarks?: string;
  principal_remarks?: string;
  issue_date: string;
}
```

### 4.3 Schedule Types (`src/features/schedule/types/index.ts`)
```typescript
export interface ScheduleEntry {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;  // 0 = Sunday, 6 = Saturday
  period_number: number;
  start_time: string;
  end_time: string;
  room?: string;
  subject_name?: string;
  teacher_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleEntryPayload {
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  room?: string;
  term_id: string;
}

export interface UpdateScheduleEntryPayload {
  subject_id?: string;
  teacher_id?: string;
  day_of_week?: number;
  period_number?: number;
  start_time?: string;
  end_time?: string;
  room?: string;
}

export interface ScheduleConflict {
  type: 'teacher' | 'room' | 'section';
  message: string;
  conflicting_entry: ScheduleEntry;
}
```

### 4.4 Payment Types (`src/features/payments/types/index.ts`)
```typescript
export enum FeeType {
  TUITION = 'tuition',
  REGISTRATION = 'registration',
  EXAM = 'exam',
  LIBRARY = 'library',
  LABORATORY = 'laboratory',
  TRANSPORTATION = 'transportation',
  LUNCH = 'lunch',
  UNIFORM = 'uniform',
  OTHER = 'other',
}

export enum FeeStatus {
  PAID = 'paid',
  PARTIAL = 'partial',
  UNPAID = 'unpaid',
  WAIVED = 'waived',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CHAPA = 'chapa',
  TELEBIRR = 'telebirr',
  CBE_BIRR = 'cbe_birr',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface StudentFee {
  id: string;
  student_id: string;
  fee_type: FeeType;
  academic_year_id: string;
  term_id: string;
  amount: number;
  balance: number;
  due_date: string;
  status: FeeStatus;
  description?: string;
}

export interface PaymentTransaction {
  id: string;
  student_fee_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference?: string;
  payer_name: string;
  payer_phone?: string;
  payer_email?: string;
  notes?: string;
  processed_by?: string;
  created_at: string;
}

export interface LinkedStudent {
  student_id: string;
  student_name: string;
  registration_number: string;
  class_name: string;
  section_name: string;
  current_fees: StudentFee[];
  total_outstanding: number;
}

export interface GuardianDashboardData {
  guardian_id: string;
  guardian_name: string;
  linked_students: LinkedStudent[];
  total_outstanding: number;
  total_paid_this_term: number;
}

export interface ChapaPaymentPayload {
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface CreatePaymentRequest {
  student_fee_id: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}
```

### 4.5 Notification Types (`src/features/notifications/types/index.ts`)
```typescript
export enum NotificationType {
  ATTENDANCE = 'attendance',
  GRADE = 'grade',
  FEE = 'fee',
  SCHEDULE = 'schedule',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  type_preferences: Record<NotificationType, {
    email: boolean;
    push: boolean;
    sms: boolean;
    in_app: boolean;
    min_priority: NotificationPriority;
  }>;
}

export interface CreateNotificationPayload {
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}
```

### 4.6 Academic Types (`src/features/academics/types/index.ts`)
```typescript
export enum TermType {
  SEMESTER = 'semester',
  QUARTER = 'quarter',
  TRIMESTER = 'trimester',
}

export enum SubjectCategory {
  CORE = 'core',
  ELECTIVE = 'elective',
  VOCATIONAL = 'vocational',
  EXTRACURRICULAR = 'extracurricular',
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  terms: Term[];
  created_at: string;
}

export interface Term {
  id: string;
  academic_year_id: string;
  name: string;
  type: TermType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  registration_deadline?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: SubjectCategory;
  credit_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  academic_year_id: string;
  sections: Section[];
  subjects: Subject[];
  created_at: string;
}

export interface Section {
  id: string;
  name: string;
  class_id: string;
  class_teacher_id?: string;
  class_teacher_name?: string;
  capacity: number;
  room?: string;
  student_count: number;
}
```

### 4.7 Enrollment Types (`src/features/enrollments/types/index.ts`)
```typescript
export enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRANSFERRED = 'transferred',
  WITHDRAWN = 'withdrawn',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
}

export interface Enrollment {
  id: string;
  student_id: string;
  student_name: string;
  academic_year_id: string;
  academic_year_name: string;
  class_id: string;
  class_name: string;
  section_id: string;
  section_name: string;
  enrollment_date: string;
  status: EnrollmentStatus;
  previous_school?: string;
  transfer_reason?: string;
  remarks?: string;
  enrolled_by: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentHistory {
  enrollment_id: string;
  action: 'enrolled' | 'transferred' | 'withdrawn' | 'reinstated' | 'graduated';
  from_section?: string;
  to_section?: string;
  reason?: string;
  performed_by: string;
  performed_at: string;
}

export interface CreateEnrollmentPayload {
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string;
  enrollment_date: string;
  previous_school?: string;
  remarks?: string;
}

export interface TransferPayload {
  target_section_id: string;
  reason?: string;
}

export interface WithdrawPayload {
  reason: string;
  withdrawal_date: string;
}
```

### 4.8 Auth Store Types (`src/lib/store/auth-store.ts`)
```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  must_change_password: boolean;
  roles: string[];
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setHydrated: () => void;
}
```

---

## PART 5: CORE IMPLEMENTATION FILES

### 5.1 i18n Configuration

#### 5.1.1 src/i18n/routing.ts
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'am'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

#### 5.1.2 src/i18n/navigation.ts
```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

#### 5.1.3 src/i18n/request.ts
```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

---

### 5.2 Global State Management

#### 5.2.1 src/lib/store/auth-store.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  must_change_password: boolean;
  roles: string[];
  created_at: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
      updateTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
```

---

### 5.3 API Configuration

#### 5.3.1 src/lib/api/axios.ts
```typescript
import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 with token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          const locale = window.location.pathname.startsWith('/am') ? 'am' : 'en';
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        useAuthStore
          .getState()
          .updateTokens(data.access_token, data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          const locale = window.location.pathname.startsWith('/am') ? 'am' : 'en';
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

#### 5.3.2 src/lib/api/auth.service.ts
```typescript
import { axiosInstance } from './axios';
import type { User } from '@/lib/store/auth-store';

interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await axiosInstance.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axiosInstance.post('/auth/forgot-password', { email });
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },
};
```

---

### 5.4 Permission System

#### 5.4.1 src/lib/permissions.ts
```typescript
export const ROLES = {
  ADMIN: 'admin',
  DIRECTOR: 'director',
  REGISTRAR: 'registrar',
  TEACHER: 'teacher',
  STUDENT: 'student',
  GUARDIAN: 'guardian',
} as const;

export const PERMISSIONS = {
  // User management
  VIEW_USERS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  CREATE_USER: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  EDIT_USER: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  DELETE_USER: [ROLES.ADMIN],
  RESTORE_USER: [ROLES.ADMIN],

  // Student management
  VIEW_STUDENTS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR, ROLES.TEACHER],
  CREATE_STUDENT: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  EDIT_STUDENT: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  DELETE_STUDENT: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],

  // Teacher management
  VIEW_TEACHERS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  CREATE_TEACHER: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  EDIT_TEACHER: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],

  // Guardian management
  VIEW_GUARDIANS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  CREATE_GUARDIAN: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  EDIT_GUARDIAN: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],

  // Academics
  MANAGE_ACADEMICS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  MANAGE_SUBJECTS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  MANAGE_CLASSES: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],

  // Enrollments
  MANAGE_ENROLLMENTS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  TRANSFER_STUDENT: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],

  // Attendance
  MARK_ATTENDANCE: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR, ROLES.TEACHER],
  VIEW_ATTENDANCE: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR, ROLES.TEACHER, ROLES.GUARDIAN],

  // Grades
  MANAGE_GRADES: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR, ROLES.TEACHER],
  VIEW_GRADES: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR, ROLES.TEACHER, ROLES.STUDENT, ROLES.GUARDIAN],

  // Schedule
  MANAGE_SCHEDULE: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  VIEW_SCHEDULE: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR, ROLES.TEACHER, ROLES.STUDENT],

  // Payments
  MANAGE_PAYMENTS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],
  VIEW_PAYMENTS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR, ROLES.GUARDIAN],
  PROCESS_PAYMENT: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.REGISTRAR],

  // Settings
  ACCESS_SETTINGS: [ROLES.ADMIN],
  SYSTEM_CONFIGURATION: [ROLES.ADMIN],
} as const;

export function hasPermission(userRoles: string[], allowedRoles: string[]): boolean {
  return userRoles.some((role) => allowedRoles.includes(role));
}
```

#### 5.4.2 src/hooks/use-permissions.ts
```typescript
import { useAuthStore } from '@/lib/store/auth-store';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuthStore();
  const roles = user?.roles || [];

  return {
    // User permissions
    canViewUsers: hasPermission(roles, PERMISSIONS.VIEW_USERS),
    canCreateUser: hasPermission(roles, PERMISSIONS.CREATE_USER),
    canEditUser: hasPermission(roles, PERMISSIONS.EDIT_USER),
    canDeleteUser: hasPermission(roles, PERMISSIONS.DELETE_USER),
    canRestoreUser: hasPermission(roles, PERMISSIONS.RESTORE_USER),

    // Student permissions
    canViewStudents: hasPermission(roles, PERMISSIONS.VIEW_STUDENTS),
    canManageStudents: hasPermission(roles, PERMISSIONS.CREATE_STUDENT),

    // Teacher permissions
    canViewTeachers: hasPermission(roles, PERMISSIONS.VIEW_TEACHERS),
    canManageTeachers: hasPermission(roles, PERMISSIONS.CREATE_TEACHER),

    // Guardian permissions
    canViewGuardians: hasPermission(roles, PERMISSIONS.VIEW_GUARDIANS),
    canManageGuardians: hasPermission(roles, PERMISSIONS.CREATE_GUARDIAN),

    // Academic permissions
    canManageAcademics: hasPermission(roles, PERMISSIONS.MANAGE_ACADEMICS),
    canManageSubjects: hasPermission(roles, PERMISSIONS.MANAGE_SUBJECTS),
    canManageClasses: hasPermission(roles, PERMISSIONS.MANAGE_CLASSES),

    // Enrollment permissions
    canManageEnrollments: hasPermission(roles, PERMISSIONS.MANAGE_ENROLLMENTS),
    canTransferStudent: hasPermission(roles, PERMISSIONS.TRANSFER_STUDENT),

    // Attendance permissions
    canMarkAttendance: hasPermission(roles, PERMISSIONS.MARK_ATTENDANCE),
    canViewAttendance: hasPermission(roles, PERMISSIONS.VIEW_ATTENDANCE),

    // Grade permissions
    canManageGrades: hasPermission(roles, PERMISSIONS.MANAGE_GRADES),
    canViewGrades: hasPermission(roles, PERMISSIONS.VIEW_GRADES),

    // Schedule permissions
    canManageSchedule: hasPermission(roles, PERMISSIONS.MANAGE_SCHEDULE),
    canViewSchedule: hasPermission(roles, PERMISSIONS.VIEW_SCHEDULE),

    // Payment permissions
    canManagePayments: hasPermission(roles, PERMISSIONS.MANAGE_PAYMENTS),
    canViewPayments: hasPermission(roles, PERMISSIONS.VIEW_PAYMENTS),
    canProcessPayment: hasPermission(roles, PERMISSIONS.PROCESS_PAYMENT),

    // Settings permissions
    canAccessSettings: hasPermission(roles, PERMISSIONS.ACCESS_SETTINGS),
    canConfigureSystem: hasPermission(roles, PERMISSIONS.SYSTEM_CONFIGURATION),

    // Role checks
    isAdmin: roles.includes('admin'),
    isDirector: roles.includes('director'),
    isRegistrar: roles.includes('registrar'),
    isTeacher: roles.includes('teacher'),
    isStudent: roles.includes('student'),
    isGuardian: roles.includes('guardian'),
  };
}
```

---

## PART 6: LAYOUT FILES (Detailed Implementation)

### 6.1 Root Layout
```typescript
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

### 6.2 Root Page (Redirect)
```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en/login');
}
```

### 6.3 Root Not Found
```typescript
// src/app/not-found.tsx
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <a href="/en/dashboard">
          <Button size="lg" className="mt-6 gap-2">
            Go to Dashboard
          </Button>
        </a>
      </div>
    </div>
  );
}
```

### 6.4 Locale Layout
```typescript
// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Ethiopic } from 'next/font/google';
import '../globals.css';
import { Providers } from '@/components/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: '--font-noto-ethiopic',
  subsets: ['ethiopic', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Comprehensive school management system for Ethiopian schools',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const plainMessages = JSON.parse(JSON.stringify(messages));

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoEthiopic.variable} antialiased ${
          locale === 'am' ? 'font-amharic' : ''
        }`}
      >
        <NextIntlClientProvider locale={locale} messages={plainMessages}>
          <Providers>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 6.5 Locale Root Page
```typescript
// src/app/[locale]/page.tsx
import { redirect } from 'next/navigation';

export default function LocalePage() {
  redirect('/login');
}
```

### 6.6 Locale Not Found
```typescript
// src/app/[locale]/not-found.tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('error');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('pageNotFound')}
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="mt-6 gap-2">
            {t('goToDashboard')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

### 6.7 Catch-All Route
```typescript
// src/app/[locale]/[...rest]/page.tsx
import { notFound } from 'next/navigation';

export default function CatchAllPage() {
  notFound();
}
```

---

## PART 7: AUTH PAGES (Complete Implementation)

### 7.1 Login Page
```typescript
// src/app/[locale]/(auth)/login/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService } from '@/lib/api/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GraduationCap, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError('');

    try {
      const response = await authService.login(data.email, data.password);
      setAuth(response.user, response.access_token, response.refresh_token);

      if (response.user.must_change_password) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.detail || t('invalidCredentials');
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 shadow-primary/5">
      <CardHeader className="space-y-3 text-center pb-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <GraduationCap className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
          <CardDescription className="mt-1.5">
            {t('loginDescription')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Server error */}
          {serverError && (
            <div
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              autoFocus
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
              className="h-11"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                className="h-11 pr-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 w-11 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot password link */}
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline focus-visible:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {tc('loading')}
              </>
            ) : (
              t('login')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 7.2 Auth Layout
```typescript
// src/app/[locale]/(auth)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && user) {
      router.push('/dashboard');
    }
  }, [user, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="animate-pulse">
          <GraduationCap className="h-12 w-12 text-primary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </div>
        <span className="text-xl font-bold tracking-tight">SMS Ethiopia</span>
      </div>
      {children}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} School Management System
      </p>
    </div>
  );
}
```

---

## PART 8: DASHBOARD LAYOUT & COMPONENTS

### 8.1 Dashboard Layout
```typescript
// src/app/[locale]/(dashboard)/layout.tsx
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main
            className="flex-1 overflow-auto p-4 lg:p-6"
            id="main-content"
            role="main"
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### 8.2 ProtectedRoute Component
```typescript
// src/components/auth/protected-route.tsx
'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRoles?: string[];
}

export function ProtectedRoute({ children, requireRoles }: ProtectedRouteProps) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.must_change_password) {
      router.push('/change-password');
      return;
    }

    if (requireRoles && !requireRoles.some((r) => user.roles.includes(r))) {
      router.push('/dashboard');
    }
  }, [user, isHydrated, requireRoles, router, locale]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!user) return null;
  if (user.must_change_password) return null;
  if (requireRoles && !requireRoles.some((r) => user.roles.includes(r))) return null;

  return <>{children}</>;
}
```

---

This prompt documents every major feature. Continue implementing all remaining components following the same detailed pattern.

## CRITICAL REMINDERS FOR AI IMPLEMENTER:

1. **Never skip any feature** - Every page, component, hook, and type in this document must be implemented
2. **Follow exact file paths** - The structure is designed for maintainability
3. **Use exact type definitions** - Type safety is critical
4. **Implement all permission checks** - Security depends on proper role verification
5. **Add loading states everywhere** - UX requires feedback during data fetching
6. **Handle all error cases** - Use toast notifications for errors
7. **Support both languages** - Every user-facing string must be translatable
8. **Test responsive design** - Must work on mobile, tablet, and desktop
9. **Follow accessibility standards** - WCAG 2.1 AA compliance required
10. **Use the exact tech stack versions** - Compatibility depends on specific versions
