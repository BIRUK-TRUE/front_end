# School Management System — Frontend

A modern, role-based web application for managing Ethiopian high school operations. Built with **Next.js 16**, **React 19**, and **TypeScript**, the system provides dashboards for administrators, directors, registrars, teachers, students, and guardians to manage academic workflows through a responsive, multilingual interface.

## Project Description

The School Management System (SMS) is a comprehensive administrative platform designed for Ethiopian high schools. It connects to a **FastAPI/Python REST backend** and provides a rich, role-secured dashboard for day-to-day school operations including:

- **User management** — Create, edit, deactivate, and restore user accounts across all roles
- **Student management** — Register students, track academic status, link guardians
- **Teacher management** — Manage teacher profiles, qualifications, and assignments
- **Guardian management** — Link guardians to students with relationship types and permissions
- **Academic structure** — Configure academic years, semesters, grade levels, sections, and subjects
- **Enrollment** — Enroll students into academic sections and manage transfers
- **Role-based access control** — Each user role sees only the pages and actions they are authorized for
- **Internationalization** — Full English and Amharic (አማርኛ) language support

## User Roles

| Role | Description |
|---|---|
| **Admin** | Full system access — manages all users, settings, and configuration |
| **Director** | School-level oversight — manages teachers, students, academics |
| **Registrar** | Student enrollment — manages students, guardians, and enrollments |
| **Teacher** | Classroom operations — views assigned classes, students, and schedules |
| **Student** | Personal dashboard — views own profile, grades, and enrollment info |
| **Guardian** | Parent/guardian portal — views linked students' information |

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI Library | [React 19](https://react.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Component Library | [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| State Management | [Zustand 5](https://zustand.docs.pmnd.rs) |
| Server State | [TanStack React Query 5](https://tanstack.com/query) |
| HTTP Client | [Axios](https://axios-http.com) |
| Forms | [React Hook Form 7](https://react-hook-form.com) + [Zod 4](https://zod.dev) |
| Charts | [Recharts 3](https://recharts.org) |
| i18n | [next-intl 4](https://next-intl-docs.vercel.app) |
| Icons | [Lucide React](https://lucide.dev) |
| Notifications | [Sonner](https://sonner.emilkowal.dev) |

## Project Structure

```
front_end/
├── public/                          # Static assets (favicon, images)
├── messages/                        # i18n translation files
│   ├── en.json                      #   English translations
│   └── am.json                      #   Amharic (አማርኛ) translations
├── middleware.ts                     # Next.js middleware (locale routing)
│
├── src/
│   ├── app/                         # ── PAGES & ROUTING (Next.js App Router) ──
│   │   ├── layout.tsx               #   Root layout (fonts, metadata)
│   │   ├── globals.css              #   Global styles & Tailwind config
│   │   ├── not-found.tsx            #   404 page
│   │   │
│   │   └── [locale]/               #   Locale-prefixed routes (/en/..., /am/...)
│   │       ├── (auth)/             #   Auth route group (no sidebar)
│   │       │   ├── layout.tsx      #     Auth layout (centered card)
│   │       │   ├── login/          #     Login page
│   │       │   ├── change-password/#     Change password page
│   │       │   ├── forgot-password/#     Forgot password page
│   │       │   └── reset-password/ #     Reset password page
│   │       │
│   │       └── (dashboard)/        #   Dashboard route group (with sidebar)
│   │           ├── layout.tsx      #     Dashboard layout (sidebar + top-bar)
│   │           └── dashboard/
│   │               ├── page.tsx    #     Dashboard home (stats overview)
│   │               ├── students/   #     Student list & detail pages
│   │               ├── teachers/   #     Teacher list & detail pages
│   │               ├── guardians/  #     Guardian list & detail pages
│   │               ├── users/      #     User management pages
│   │               ├── directors/  #     Director management pages
│   │               ├── academics/  #     Academic structure pages
│   │               ├── enrollments/#     Enrollment management pages
│   │               ├── profile/    #     User profile page
│   │               ├── settings/   #     System settings page
│   │               └── change-password/ # Password change (in-app)
│   │
│   ├── components/                  # ── REUSABLE UI COMPONENTS ──
│   │   ├── providers.tsx            #   App-wide providers (QueryClient, Toaster)
│   │   │
│   │   ├── auth/                    #   Auth-related components
│   │   │   ├── protected-route.tsx  #     Route guard (redirects unauthenticated)
│   │   │   ├── password-strength.tsx#     Password strength indicator
│   │   │   └── language-switcher.tsx#     Locale toggle (EN/AM)
│   │   │
│   │   ├── layout/                  #   Layout components
│   │   │   ├── sidebar.tsx          #     Navigation sidebar (role-aware)
│   │   │   └── top-bar.tsx          #     Top navigation bar (user menu)
│   │   │
│   │   ├── shared/                  #   Shared utility components
│   │   │   ├── confirm-dialog.tsx   #     Confirmation modal
│   │   │   ├── empty-state.tsx      #     Empty data state display
│   │   │   ├── loading-spinner.tsx  #     Loading indicator
│   │   │   ├── page-header.tsx      #     Page title + actions header
│   │   │   ├── stats-card.tsx       #     Dashboard statistics card
│   │   │   └── status-badge.tsx     #     Colored status indicator
│   │   │
│   │   └── ui/                      #   Base design system (shadcn/ui)
│   │       ├── avatar.tsx           #     Avatar component
│   │       ├── badge.tsx            #     Badge component
│   │       ├── button.tsx           #     Button component
│   │       ├── card.tsx             #     Card component
│   │       ├── checkbox.tsx         #     Checkbox component
│   │       ├── command.tsx          #     Command palette component
│   │       ├── dialog.tsx           #     Dialog/modal component
│   │       ├── dropdown-menu.tsx    #     Dropdown menu component
│   │       ├── form.tsx             #     Form wrapper (react-hook-form)
│   │       ├── input.tsx            #     Input component
│   │       ├── label.tsx            #     Label component
│   │       ├── popover.tsx          #     Popover component
│   │       ├── progress.tsx         #     Progress bar component
│   │       ├── radio-group.tsx      #     Radio group component
│   │       ├── scroll-area.tsx      #     Scrollable area component
│   │       ├── select.tsx           #     Select dropdown component
│   │       ├── separator.tsx        #     Visual separator component
│   │       ├── sheet.tsx            #     Slide-over panel component
│   │       ├── skeleton.tsx         #     Loading skeleton component
│   │       ├── sonner.tsx           #     Toast notification wrapper
│   │       ├── switch.tsx           #     Toggle switch component
│   │       ├── table.tsx            #     Data table component
│   │       ├── tabs.tsx             #     Tabs component
│   │       ├── textarea.tsx         #     Textarea component
│   │       └── tooltip.tsx          #     Tooltip component
│   │
│   ├── features/                    # ── FEATURE MODULES ──
│   │   ├── academics/               #   Academic structure feature
│   │   │   ├── api/                 #     API services & hooks
│   │   │   ├── components/          #     Feature-specific components
│   │   │   └── types/               #     TypeScript type definitions
│   │   │
│   │   ├── enrollments/             #   Enrollment feature
│   │   │   ├── api/                 #     API services & hooks
│   │   │   ├── components/          #     Feature-specific components
│   │   │   └── types/               #     TypeScript type definitions
│   │   │
│   │   └── teachers/                #   Teachers feature
│   │       └── api/                 #     API services & hooks
│   │
│   ├── hooks/                       # ── CUSTOM REACT HOOKS ──
│   │   ├── use-students.ts          #   Student CRUD operations (React Query)
│   │   ├── use-teachers.ts          #   Teacher CRUD operations (React Query)
│   │   ├── use-guardians.ts         #   Guardian CRUD operations (React Query)
│   │   ├── use-users.ts             #   User management operations (React Query)
│   │   └── use-permissions.ts       #   Role-based permission checks
│   │
│   ├── lib/                         # ── CORE LIBRARIES & UTILITIES ──
│   │   ├── permissions.ts           #   Permission rules (pure business logic)
│   │   ├── utils.ts                 #   Utility functions (cn, formatters)
│   │   │
│   │   ├── api/                     #   API / Infrastructure layer
│   │   │   ├── axios.ts             #     Axios instance (interceptors, token refresh)
│   │   │   ├── auth.service.ts      #     Auth API (login, refresh, password reset)
│   │   │   ├── students.service.ts  #     Students API (CRUD, stats, filters)
│   │   │   ├── teachers.service.ts  #     Teachers API (CRUD, stats, filters)
│   │   │   ├── guardians.service.ts #     Guardians API (CRUD, student linking)
│   │   │   ├── users.service.ts     #     Users API (CRUD, role management)
│   │   │   └── query-keys.ts        #     React Query key factory
│   │   │
│   │   └── store/                   #   Global state
│   │       └── auth-store.ts        #     Zustand auth store (user, tokens)
│   │
│   └── i18n/                        # ── INTERNATIONALIZATION CONFIG ──
│       ├── routing.ts               #   Locale routing definitions
│       ├── navigation.ts            #   Localized navigation helpers
│       └── request.ts               #   Server-side i18n request handler
│
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration
├── postcss.config.mjs               # PostCSS configuration (Tailwind)
├── eslint.config.mjs                # ESLint configuration
└── components.json                  # shadcn/ui configuration
```

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9+ (or yarn / pnpm)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd front_end

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mock Login Credentials

When the backend is unavailable, the app automatically falls back to mock authentication:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@school.com` | `admin123` |
| Director | `director@school.com` | `director123` |
| Registrar | `registrar@school.com` | `registrar123` |
| Teacher | `teacher@school.com` | `teacher123` |
| Student | `student@school.com` | `student123` |
| Guardian | `guardian@school.com` | `guardian123` |

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## Architecture Overview

The project follows a **layered architecture** within a single Next.js application:

```
┌──────────────────────────────────────────┐
│           Presentation Layer             │
│   (app/ pages, components/, features/)   │
├──────────────────────────────────────────┤
│           Application Layer              │
│     (hooks/, lib/store/, permissions)    │
├──────────────────────────────────────────┤
│          Infrastructure Layer            │
│       (lib/api/ services, axios)         │
└──────────────────────────────────────────┘
         ↕ HTTP (REST API)
┌──────────────────────────────────────────┐
│        Backend (FastAPI / Python)         │
└──────────────────────────────────────────┘
```

- **Presentation** — Next.js pages and React components handle UI rendering and user interaction
- **Application** — Custom hooks orchestrate data fetching, caching, mutations, and permission checks
- **Infrastructure** — Axios-based service modules handle all HTTP communication with the backend API

## License

This project is part of a Final Year Project (FYP) at Hawassa University, Faculty of Informatics.
