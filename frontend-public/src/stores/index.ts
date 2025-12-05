/**
 * Zustand Stores
 *
 * 사용법:
 * import { useAuthStore, useUIStore } from '@/stores';
 *
 * // 컴포넌트에서
 * const { user, login, logout } = useAuthStore();
 * const { isLoading, addToast } = useUIStore();
 */

// Auth Store
export {
  useAuthStore,
  selectUser,
  selectIsLoggedIn,
  selectIsLoading as selectAuthLoading,
  selectError as selectAuthError,
  type User,
} from './authStore';

// UI Store
export {
  useUIStore,
  selectIsLoading as selectUILoading,
  selectToasts,
  selectActiveModal,
  selectIsSidebarOpen,
  type Toast,
  type Modal,
} from './uiStore';
