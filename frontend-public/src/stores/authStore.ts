/**
 * 인증 상태 관리 Store (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth';

// 사용자 타입
export interface User {
  id: string;
  name: string;
  email?: string;
  userSe?: string;
  uniqId?: string;
}

// 인증 상태 타입
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (id: string, password: string, userSe?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (id: string, password: string, userSe: string = 'USR') => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(id, password, userSe);

          if (response.resultCode === '200' || response.resultCode === 200) {
            const data = response as unknown as { jToken?: string; resultVO?: User };

            set({
              user: data.resultVO || null,
              token: data.jToken || null,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: '로그인에 실패했습니다.',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.',
          });
          return false;
        }
      },

      logout: () => {
        authApi.logout();
        set({
          user: null,
          token: null,
          error: null,
        });
        // localStorage 정리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jToken');
          localStorage.removeItem('user');
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // SSR hydration 처리
      hydrate: () => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('jToken');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (token && user) {
          set({ token, user });
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token
      }),
    }
  )
);

// 셀렉터 (성능 최적화)
export const selectUser = (state: AuthState) => state.user;
export const selectIsLoggedIn = (state: AuthState) => !!state.token;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
