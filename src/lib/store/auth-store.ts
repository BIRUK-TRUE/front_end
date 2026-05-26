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
  student_id?: string;
  teacher_id?: string;
  guardian_id?: string;
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

// Align with backend REFRESH_TOKEN_EXPIRE_DAYS (default 7) so middleware and client stay in sync
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function writeAuthCookie(name: string, value: string, maxAge = AUTH_COOKIE_MAX_AGE) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearAuthCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function syncAuthCookies(user: User | null, accessToken: string | null) {
  if (!user || !accessToken) {
    clearAuthCookie('auth-token');
    clearAuthCookie('auth-roles');
    clearAuthCookie('must-change-password');
    return;
  }

  writeAuthCookie('auth-token', accessToken);
  writeAuthCookie('auth-roles', JSON.stringify(user.roles));
  writeAuthCookie(
    'must-change-password',
    user.must_change_password ? 'true' : 'false'
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      setAuth: (user, accessToken, refreshToken) => {
        syncAuthCookies(user, accessToken);
        set({ user, accessToken, refreshToken });
      },
      clearAuth: () => {
        syncAuthCookies(null, null);
        set({ user: null, accessToken: null, refreshToken: null });
      },
      updateTokens: (accessToken, refreshToken) => {
        syncAuthCookies(get().user, accessToken);
        set({ accessToken, refreshToken });
      },
      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          const nextUser = { ...current, ...updates };
          syncAuthCookies(nextUser, get().accessToken);
          set({ user: nextUser });
        }
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          // localStorage survives tab close/reopen; sessionStorage was logging users out unexpectedly
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => () => {
        const state = useAuthStore.getState();
        if (state.user && state.accessToken) {
          syncAuthCookies(state.user, state.accessToken);
        }
        state.setHydrated();
      },
    }
  )
);
