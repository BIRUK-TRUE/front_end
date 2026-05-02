# Technology Stack and Architecture Analysis

## 1. FRAMEWORK

- **Next.js version:** 16.1.6
- **Router type:** App Router (evident from `src/app/` directory structure with `[locale]` dynamic segments)
- **React version:** 19.2.3

## 2. KEY LIBRARIES

- **UI library:** radix-ui (1.4.3), shadcn (3.8.5), lucide-react (0.575.0)
- **State management:** zustand (5.0.11)
- **Data fetching:** @tanstack/react-query (5.90.21)
- **Form library:** react-hook-form (7.71.2)
- **Validation:** zod (4.3.6), @hookform/resolvers (5.2.2)
- **HTTP client:** axios (1.13.5)
- **Auth:** No dedicated auth library (custom implementation with axios + zustand)
- **Other important:** next-intl (4.8.3), recharts (3.8.1), face-api.js (0.22.2), jspdf (4.2.1), html-to-image (1.11.13), sonner (2.0.7), date-fns (4.1.0), @tanstack/react-table (8.21.3), tailwind-merge (3.5.0), clsx (2.1.1)

## 3. API SETUP

**Complete axios.ts content:**

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
          window.location.href = '/en/login';
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
          window.location.href = '/en/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

**Key details:**
- **Base URL:** `process.env.NEXT_PUBLIC_API_URL` or `'http://localhost:8000/api'`
- **Auth token attachment:** Bearer token in `Authorization` header from `useAuthStore.getState().accessToken`
- **Interceptors:** Yes - request interceptor attaches token, response interceptor handles 401
- **Error handling:** 401 triggers token refresh via `/auth/refresh` endpoint. If refresh fails or no refresh token exists, clears auth and redirects to `/en/login`

## 4. AUTH STORE

**Complete auth-store.ts content:**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return sessionStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
```

**Key details:**
- **What is stored:** `user` object (with id, email, full_name, phone_number, address, profile_image_url, is_active, must_change_password, roles, created_at, updated_at), `accessToken`, `refreshToken`, `isHydrated`
- **Persistence:** sessionStorage (via zustand persist middleware with custom storage that falls back to no-op on server)
- **Actions:** `setAuth` (login), `clearAuth` (logout), `updateTokens` (token refresh), `updateUser` (update user data), `setHydrated` (hydration tracking)

## 5. PROJECT STRUCTURE PATTERN

**Mixed architecture: Feature-based with layer-based elements**

**Top-level structure:**

- **`src/app/`** - Next.js App Router routes (layer-based for routing)
  - Contains page files, layout files, and route groups `(auth)`, `(dashboard)`
  - Uses dynamic segments `[locale]` for internationalization
  - Route groups organize by functionality: auth routes, dashboard routes

- **`src/components/`** - Shared UI components (layer-based)
  - `auth/` - Authentication-related components (RoleGuard, language-switcher, password-strength, protected-route)
  - `layout/` - Layout components (sidebar, top-bar)
  - `notifications/` - Notification components
  - `shared/` - Reusable shared components (data-table, activity-feed, confirm-dialog, etc.)
  - `ui/` - Base UI components from shadcn/ui (button, card, dialog, etc.)

- **`src/features/`** - Feature modules (feature-based)
  - Each feature is self-contained with its own structure
  - **academics/** - Academic years, classes, subjects, terms
  - **analytics/** - Analytics dashboards, charts, risk calculations
  - **attendance/** - Face recognition, barcode scanning, attendance records
  - **enrollments/** - Student enrollment, transfers, withdrawals
  - **grades/** - Grade entry, report cards
  - **guardian-portal/** - Guardian-specific views
  - **notifications/** - Alert rules, notification composer, history
  - **payments/** - Payment processing (Chapa integration)
  - **schedule/** - Timetable, schedule management
  - **student-portal/** - Student-specific views
  - **teacher/** - Teacher-specific views
  - **teachers/** - Teacher API

  Each feature typically contains:
  - `api/` - Feature-specific API hooks
  - `components/` - Feature-specific components
  - `hooks/` - Feature-specific custom hooks
  - `types/` - TypeScript types/schemas
  - `utils/` - Feature-specific utilities

- **`src/hooks/`** - Global custom hooks (layer-based)
  - use-guardians, use-permissions, use-settings, use-students, use-teachers, use-users, useSettings

- **`src/lib/`** - Core utilities and infrastructure (layer-based)
  - `api/` - API services (auth, axios, guardians, settings, students, teachers, users, query-keys)
  - `store/` - Global state (auth-store)
  - `permissions.ts` - Permission utilities
  - `utils.ts` - General utilities

- **`src/i18n/`** - Internationalization (layer-based)
  - navigation.ts, request.ts, routing.ts

**Pattern summary:** The project uses a hybrid approach - the overall structure is layer-based (app, components, hooks, lib, i18n), but within the `features/` directory, it adopts a feature-based architecture where each domain feature is self-contained with its own API, components, hooks, types, and utilities. This allows for better organization and scalability of domain-specific logic while maintaining a clear separation of concerns at the top level.
