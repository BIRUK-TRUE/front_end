# Authentication Module — Complete Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/app/[locale]/(auth)/login/page.tsx`
- `src/lib/api/auth.service.ts`
- `src/lib/store/auth-store.ts`
- `src/app/[locale]/(auth)/layout.tsx`

WHAT IT DOES:
Renders a login form (email + password). On submit it calls `authService.login(email, password)`.
- If successful, stores `user`, `access_token`, and `refresh_token` in Zustand (`useAuthStore.setAuth`).
- If `user.must_change_password` is `true`, redirects to `/change-password`.
- Otherwise redirects by role:
  - `teacher` → `/dashboard/teacher`
  - `student` → `/dashboard/student`
  - `guardian` → `/guardian`
  - otherwise → `/dashboard`
- Displays server-side error message from `error.response?.data?.detail`.

UI COMPONENTS:
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Input` email (`type="email"`)
- `Input` password with show/hide toggle (`Eye`, `EyeOff`)
- `Button` submit with loading spinner (`Loader2`)
- Server error alert banner (uses `AlertCircle`)
- Field-level validation error messages
- `Link` to `/forgot-password`

API CALLS:
- Method: POST
- URL: `/auth/login`
- Sends:
  - `email`
  - `password`
- Expects (fields accessed):
  - `user`
  - `access_token`
  - `refresh_token`
  - `user.must_change_password`
  - `user.roles`
- File: `src/lib/api/auth.service.ts`

FORM FIELDS (if form exists):
- `email`
  - Required: `min(1)`
  - Must be valid email: `.email(...)`
- `password`
  - Required: `min(1)`

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- `src/app/[locale]/(auth)/login/page.tsx`:
  - `const response = await authService.login(data.email, data.password);`
  - `setAuth(response.user, response.access_token, response.refresh_token);`
  - `if (response.user.must_change_password) { router.push('/change-password'); }`
  - Role redirects: `router.push('/dashboard/teacher')`, `router.push('/dashboard/student')`, `router.push('/guardian')`, `router.push('/dashboard')`
- `src/lib/api/auth.service.ts`:
  - `axiosInstance.post('/auth/login', { email, password })`

PROBLEMS FOUND:
- Role redirect uses an `if/else if` chain; multi-role users will always be routed to the first matching role.
- `console.log` statements exist inside the redirect logic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Forgot Password
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/app/[locale]/(auth)/forgot-password/page.tsx`
- `src/lib/api/auth.service.ts`

WHAT IT DOES:
Renders an email-only form. On submit, calls `authService.forgotPassword(email)` and then always transitions to a submitted state (success confirmation) regardless of whether the backend indicates the email exists.

UI COMPONENTS:
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Input` email
- `Button` submit with loading spinner (`Loader2`)
- Submitted confirmation UI with `CheckCircle`
- Links back to `/login`

API CALLS:
- Method: POST
- URL: `/auth/forgot-password`
- Sends:
  - `email`
- Expects (fields accessed):
  - None
- File: `src/lib/api/auth.service.ts`

FORM FIELDS (if form exists):
- `email`
  - Required: `min(1)`
  - Must be valid email: `.email(...)`

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ❌ Missing
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- `src/app/[locale]/(auth)/forgot-password/page.tsx`:
  - `await authService.forgotPassword(data.email);`
  - `setIsSubmitted(true);`
- `src/lib/api/auth.service.ts`:
  - `axiosInstance.post('/auth/forgot-password', { email })`

PROBLEMS FOUND:
- Loading label `Sending...` is hardcoded (not translated).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Reset Password
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/app/[locale]/(auth)/reset-password/page.tsx`
- `src/lib/api/auth.service.ts`
- `src/components/auth/password-strength.tsx`

WHAT IT DOES:
Reads `token` from URL query string (`?token=...`). Allows user to set new password and confirm it.
- Validates password length and confirmation match.
- Shows password strength indicator.
- On submit: calls `authService.resetPassword(token, newPassword, confirmPassword)`.
- On success: shows toast and redirects to `/login`.

UI COMPONENTS:
- `Card`, `CardHeader`, `CardContent`
- Password show/hide toggle for new password
- `PasswordStrength` component
- Server error alert banner
- Submit `Button` with `Loader2`

API CALLS:
- Method: POST
- URL: `/auth/reset-password`
- Sends:
  - `token`
  - `new_password`
  - `new_password_confirm`
- Expects (fields accessed):
  - None
- File: `src/lib/api/auth.service.ts`

FORM FIELDS (if form exists):
- `newPassword`
  - Min length: 8
  - Max length: 128
- `confirmPassword`
  - Required: `min(1)`
  - Must match `newPassword` (refine)

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ❌ Missing
- UPDATE: ✅ Full
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- `src/app/[locale]/(auth)/reset-password/page.tsx`:
  - `const token = searchParams.get('token') || '';`
  - `await authService.resetPassword(token, data.newPassword, data.confirmPassword);`
- `src/lib/api/auth.service.ts`:
  - `axiosInstance.post('/auth/reset-password', { token, new_password, new_password_confirm })`

PROBLEMS FOUND:
- No guard when `token` is missing; request can be sent with an empty token.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Change Password (Auth Context — Forced)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/app/[locale]/(auth)/change-password/page.tsx`
- `src/lib/api/auth.service.ts`
- `src/lib/store/auth-store.ts`
- `src/components/auth/password-strength.tsx`

WHAT IT DOES:
Allows user to change password (typically after login when `must_change_password` is true).
- Collects current password, new password, confirm password.
- Calls `authService.changePassword(currentPassword, newPassword, confirmPassword)`.
- On success: updates auth store user field `must_change_password: false`, shows toast, redirects to `/dashboard`.

UI COMPONENTS:
- Warning banner when `user.must_change_password` is true
- Show/hide toggles for current and new password
- `PasswordStrength` component
- Server error banner

API CALLS:
- Method: POST
- URL: `/auth/change-password`
- Sends:
  - `current_password`
  - `new_password`
  - `new_password_confirm`
- Expects (fields accessed):
  - None
- File: `src/lib/api/auth.service.ts`

FORM FIELDS (if form exists):
- `currentPassword`: required
- `newPassword`: min 8, max 128
- `confirmPassword`: required, must match newPassword

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ❌ Missing
- UPDATE: ✅ Full
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- `src/app/[locale]/(auth)/change-password/page.tsx`:
  - `await authService.changePassword(...)`
  - `updateUser({ must_change_password: false });`
  - `router.push('/dashboard');`
- `src/lib/api/auth.service.ts`:
  - `axiosInstance.post('/auth/change-password', { current_password, new_password, new_password_confirm })`

PROBLEMS FOUND:
- Redirects to `/dashboard` regardless of role.
- Some labels are hardcoded in English (button text like `Changing...`, show/hide labels).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Change Password (Dashboard Context)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/app/[locale]/(dashboard)/dashboard/change-password/page.tsx`

WHAT IT DOES:
Provides a dashboard page for changing password, but the API is not wired:
- The intended API call is commented out.
- Uses `setTimeout` simulation and always reports success.

UI COMPONENTS:
- `PageHeader`
- `Card`
- `Input` for `current_password`, `new_password`, `confirm_password`
- Submit `Button` with spinner

API CALLS:
- None

FORM FIELDS (if form exists):
- `current_password`: required
- `new_password`: min 8
- `confirm_password`: required, must match

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ❌ Missing
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
❌ NOT IMPLEMENTED — UI exists but API call is mocked

EVIDENCE:
- `src/app/[locale]/(dashboard)/dashboard/change-password/page.tsx`:
  - `// await authService.changePassword(data);`
  - `await new Promise(resolve => setTimeout(resolve, 1000));`

PROBLEMS FOUND:
- Not connected to backend (`authService.changePassword` is commented).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Change Password (Student Portal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/features/student-portal/components/ChangePasswordForm.tsx`
- `src/lib/api/axios.ts`

WHAT IT DOES:
Student portal change-password form that calls API directly via `axiosInstance`.

UI COMPONENTS:
- `Card`
- `Form` / `FormField` inputs
- Submit `Button`

API CALLS:
- Method: POST
- URL: `/api/auth/change-password`
- Sends:
  - `currentPassword`
  - `newPassword`
- Expects (fields accessed):
  - None
- File: `src/features/student-portal/components/ChangePasswordForm.tsx`

FORM FIELDS (if form exists):
- `currentPassword`: required
- `newPassword`: min 8
- `confirmPassword`: must match newPassword
- Additional validation:
  - newPassword must not equal currentPassword

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ❌ Missing
- UPDATE: ⚠️ Partial
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ✅
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — API call exists but likely broken

EVIDENCE:
- `src/features/student-portal/components/ChangePasswordForm.tsx`:
  - `await api.post("/api/auth/change-password", { currentPassword: values.currentPassword, newPassword: values.newPassword });`
- `src/lib/api/axios.ts`:
  - Base URL default ends with `/api`: `http://localhost:8000/api`

PROBLEMS FOUND:
- Likely double `/api` prefix (baseURL already contains `/api`, and request path begins with `/api/...`).
- Request body uses camelCase fields and omits `new_password_confirm`, while `auth.service.ts` uses snake_case + confirm.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Auth Store (Zustand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/lib/store/auth-store.ts`

WHAT IT DOES:
Stores and persists authentication state in `sessionStorage`.
- `user`, `accessToken`, `refreshToken`, `isHydrated`
- `setAuth`, `clearAuth`, `updateTokens`, `updateUser`

UI COMPONENTS:
- None

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ✅ Full
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ❌
- Error:    ❌
- Empty:    ❌
- Success:  ❌

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- `persist(..., { name: 'auth-storage', storage: createJSONStorage(() => sessionStorage) })`

PROBLEMS FOUND:
- Uses `sessionStorage` only (not persistent across browser restarts).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Axios Auth Interceptors (Attach Token + Refresh)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/lib/api/axios.ts`
- `src/lib/store/auth-store.ts`

WHAT IT DOES:
- Attaches `Authorization: Bearer <accessToken>` to every request.
- On 401, attempts refresh using `refreshToken`, updates tokens, and retries original request.
- If refresh fails, clears auth and redirects browser to `/en/login`.

UI COMPONENTS:
- None

API CALLS:
- Method: POST
- URL: `${API_BASE_URL}/auth/refresh`
- Sends:
  - `refresh_token`
- Expects (fields accessed):
  - `access_token`
  - `refresh_token`
- File: `src/lib/api/axios.ts`

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ✅ Full

UI STATES:
- Loading:  ❌
- Error:    ✅
- Empty:    ❌
- Success:  ❌

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — works but has issues

EVIDENCE:
- Token attach: `config.headers.Authorization = \`Bearer ${token}\``
- Refresh flow: `axios.post(\`${API_BASE_URL}/auth/refresh\`, { refresh_token: refreshToken })`
- Redirect on failure: `window.location.href = '/en/login'`

PROBLEMS FOUND:
- Redirect hardcodes `/en/login` and ignores current locale.
- No concurrency control for multiple simultaneous 401 refresh attempts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: ProtectedRoute (Client Guard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/components/auth/protected-route.tsx`

WHAT IT DOES:
Client-side guard:
- If no `user`: redirects to `/login`.
- If `must_change_password`: redirects to `/change-password`.
- If `requireRoles` passed and user lacks them: redirects to `/dashboard`.

UI COMPONENTS:
- Loading spinner (`Loader2`) shown until mounted.

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ❌
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED — hydration + unauthorized handling issues

EVIDENCE:
- Redirects:
  - `router.push('/login')`
  - `router.push('/change-password')`
  - `router.push('/dashboard')`

PROBLEMS FOUND:
- Unauthorized role redirects to `/dashboard` instead of `/unauthorized`.
- Does not wait for Zustand hydration (can redirect before store rehydrates).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: RoleGuard (RBAC Guard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/components/auth/RoleGuard.tsx`

WHAT IT DOES:
Waits for auth store hydration, then checks if logged-in user has at least one role in `allowedRoles`. If not, redirects to `/unauthorized`.

UI COMPONENTS:
- Hydration loading spinner (`Loader2`)

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ✅
- Error:    ❌
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- Hydration wait: `if (!isHydrated) return;`
- Role check: `allowedRoles.some((role) => user.roles.includes(role))`
- Redirect: `router.push("/unauthorized")`

PROBLEMS FOUND:
- Redundant role check is performed both in `useEffect` and again during render.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Unauthorized Page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/app/[locale]/unauthorized/page.tsx`

WHAT IT DOES:
Shows an unauthorized page with the user’s first role and buttons to go to `/dashboard` or `/`.

UI COMPONENTS:
- `ShieldAlert` icon
- Buttons linking to `/dashboard` and `/`

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ❌
- Error:    ❌
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
⚠️ PARTIALLY IMPLEMENTED

EVIDENCE:
- Role display: `const userRole = user?.roles?.[0] || "guest";`
- Dashboard link: `<Link href="/dashboard">`

PROBLEMS FOUND:
- One button label is hardcoded in English: `Go Back Home`.
- Always routes to `/dashboard` instead of role-specific dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Forbidden Page (Shared)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/components/shared/forbidden-page.tsx`

WHAT IT DOES:
Reusable 403 page component with CTA buttons to `/dashboard` and browser back.

UI COMPONENTS:
- Large `403` display
- `ShieldX` icon
- `Button` to `/dashboard`
- `Button` to `window.history.back()`

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ❌
- Error:    ❌
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- Dashboard link: `<Link href="/dashboard">`

PROBLEMS FOUND:
- Always routes to `/dashboard` instead of role-specific dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Password Strength Indicator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/components/auth/password-strength.tsx`

WHAT IT DOES:
Computes password strength based on:
- Min length >= 8
- Has uppercase
- Has lowercase
- Has number
- Has special character
Renders a progress bar and checklist.

UI COMPONENTS:
- Progress bar
- Strength label
- Requirement checklist with `Check` / `X`

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ❌
- Error:    ❌
- Empty:    ✅
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- Checks: `minLength`, `hasUppercase`, `hasLowercase`, `hasNumber`, `hasSpecial`

PROBLEMS FOUND:
- Not consistently used across all change-password UIs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Language Switcher (Auth Layout)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/components/auth/language-switcher.tsx`
- `src/app/[locale]/(auth)/layout.tsx`

WHAT IT DOES:
Toggles locale between `en` and `am` and navigates to the same path under the new locale.

UI COMPONENTS:
- `Button` with `Globe` icon
- Displays `EN` or `አማ`

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Missing

UI STATES:
- Loading:  ❌
- Error:    ❌
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- `router.push(pathnameWithoutLocale, { locale: newLocale });`

PROBLEMS FOUND:
- Only supports en/am toggle; not scalable for more locales.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Middleware (Locale Routing Only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `middleware.ts`

WHAT IT DOES:
Wires `next-intl` locale routing only. No authentication checks.

UI COMPONENTS:
- None

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ❌ Missing
- UPDATE: ❌ Missing
- DELETE: ❌ Missing

UI STATES:
- Loading:  ❌
- Error:    ❌
- Empty:    ❌
- Success:  ❌

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
❌ NOT IMPLEMENTED — no auth/rbac in middleware

EVIDENCE:
- `middleware.ts`:
  - `export default createMiddleware(routing);`

PROBLEMS FOUND:
- All access control is client-side; no server-side route protection.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE: Permissions Helper + Hook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES INVOLVED:
- `src/lib/permissions.ts`
- `src/hooks/use-permissions.ts`

WHAT IT DOES:
Defines permission helper functions and a React hook that maps current user roles to permission booleans.

UI COMPONENTS:
- None

API CALLS:
- None

FORM FIELDS:
- None

CRUD STATUS:
- CREATE: ❌ Missing
- READ:   ✅ Full
- UPDATE: ✅ Full
- DELETE: ❌ Missing

UI STATES:
- Loading:  ❌
- Error:    ❌
- Empty:    ❌
- Success:  ✅

SEARCH/FILTER/PAGINATION:
- Search:     ❌ Missing
- Filter:     ❌ Missing
- Pagination: ❌ Missing
- Sort:       ❌ Missing

IMPLEMENTATION STATUS:
✅ FULLY IMPLEMENTED

EVIDENCE:
- Example: `permissions.canCreateUser = (roles) => roles.some((r) => ['admin', 'director', 'registrar'].includes(r))`

PROBLEMS FOUND:
- Client-side permissions only (no middleware enforcement).
