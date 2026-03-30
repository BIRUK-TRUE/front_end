import { axiosInstance } from './axios';
import { useAuthStore, type User } from '@/lib/store/auth-store';

// ============================================================
// Mock accounts for testing without a backend
// ============================================================
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@school.com': {
    password: 'admin123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@school.com',
      full_name: 'Admin User',
      phone_number: '+251911223344',
      address: 'Addis Ababa, Ethiopia',
      profile_image_url: null,
      is_active: true,
      must_change_password: false,
      roles: ['admin'],
      created_at: '2024-01-01T00:00:00Z',
    },
  },
  'director@school.com': {
    password: 'director123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'director@school.com',
      full_name: 'Director Abebe',
      phone_number: '+251922334455',
      address: 'Addis Ababa, Ethiopia',
      profile_image_url: null,
      is_active: true,
      must_change_password: false,
      roles: ['director'],
      created_at: '2024-01-15T00:00:00Z',
    },
  },
  'teacher@school.com': {
    password: 'teacher123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'teacher@school.com',
      full_name: 'Teacher Kebede',
      phone_number: '+251933445566',
      address: 'Bahir Dar, Ethiopia',
      profile_image_url: null,
      is_active: true,
      must_change_password: false,
      roles: ['teacher'],
      created_at: '2024-02-01T00:00:00Z',
    },
  },
  'registrar@school.com': {
    password: 'registrar123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'registrar@school.com',
      full_name: 'Registrar Almaz',
      phone_number: '+251944556677',
      address: 'Addis Ababa, Ethiopia',
      profile_image_url: null,
      is_active: true,
      must_change_password: false,
      roles: ['registrar'],
      created_at: '2024-02-10T00:00:00Z',
    },
  },
  'student@school.com': {
    password: 'student123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440005',
      email: 'student@school.com',
      full_name: 'Student Dawit',
      phone_number: '+251955667788',
      address: 'Hawassa, Ethiopia',
      profile_image_url: null,
      is_active: true,
      must_change_password: false,
      roles: ['student'],
      created_at: '2024-03-01T00:00:00Z',
    },
  },
  'guardian@school.com': {
    password: 'guardian123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440006',
      email: 'guardian@school.com',
      full_name: 'Guardian Fatuma',
      phone_number: '+251966778899',
      address: 'Dire Dawa, Ethiopia',
      profile_image_url: null,
      is_active: true,
      must_change_password: false,
      roles: ['guardian'],
      created_at: '2024-03-15T00:00:00Z',
    },
  },
};

function mockLogin(email: string, password: string) {
  const account = MOCK_USERS[email.toLowerCase()];
  if (!account || account.password !== password) {
    throw { response: { data: { detail: 'Invalid email or password' } } };
  }
  return {
    user: account.user,
    access_token: 'mock-access-token-' + account.user.id,
    refresh_token: 'mock-refresh-token-' + account.user.id,
  };
}

// ============================================================
// Auth service — tries real API first, falls back to mock
// ============================================================
export const authService = {
  async login(email: string, password: string) {
    // Try real API first
    try {
      const { data } = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      return data;
    } catch (apiError: any) {
      // If the API is unreachable (network error), fall back to mock
      if (!apiError.response || apiError.code === 'ERR_NETWORK') {
        console.info('[Auth] API unreachable, using mock login');
        return mockLogin(email, password);
      }
      // Otherwise re-throw the real API error (e.g. 401)
      throw apiError;
    }
  },

  async refresh(refreshToken: string) {
    const { data } = await axiosInstance.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ) {
    const { data } = await axiosInstance.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    return data;
  },

  async resetPassword(
    token: string,
    newPassword: string,
    newPasswordConfirm: string
  ) {
    const { data } = await axiosInstance.post('/auth/reset-password', {
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return data;
  },

  async getCurrentUser() {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
  },

  async verifyToken() {
    const { data } = await axiosInstance.get('/auth/verify');
    return data;
  },

  logout() {
    useAuthStore.getState().clearAuth();
  },
};

