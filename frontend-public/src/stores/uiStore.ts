/**
 * UI 상태 관리 Store (Zustand)
 * - 로딩 상태
 * - 모달
 * - 토스트/알림
 * - 사이드바
 */

import { create } from 'zustand';

// 토스트 메시지 타입
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// 모달 타입
export interface Modal {
  id: string;
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// UI 상태 타입
interface UIState {
  // State
  isLoading: boolean;
  loadingText: string | null;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  toasts: Toast[];
  activeModal: Modal | null;

  // Actions
  setLoading: (isLoading: boolean, text?: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;

  // Toast Actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal Actions
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: () => void;
}

// ID 생성 유틸
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useUIStore = create<UIState>((set, get) => ({
  // Initial State
  isLoading: false,
  loadingText: null,
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  toasts: [],
  activeModal: null,

  // Loading Actions
  setLoading: (isLoading, text) =>
    set({
      isLoading,
      loadingText: text || null,
    }),

  // Sidebar Actions
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarOpen: (isOpen) =>
    set({
      isSidebarOpen: isOpen,
    }),

  // Mobile Menu Actions
  toggleMobileMenu: () =>
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
    })),

  setMobileMenuOpen: (isOpen) =>
    set({
      isMobileMenuOpen: isOpen,
    }),

  // Toast Actions
  addToast: (toast) => {
    const id = generateId();
    const newToast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 자동 제거 (기본 3초)
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  // Modal Actions
  openModal: (modal) =>
    set({
      activeModal: { ...modal, id: generateId() },
    }),

  closeModal: () => set({ activeModal: null }),
}));

// 셀렉터 (성능 최적화)
export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectToasts = (state: UIState) => state.toasts;
export const selectActiveModal = (state: UIState) => state.activeModal;
export const selectIsSidebarOpen = (state: UIState) => state.isSidebarOpen;
