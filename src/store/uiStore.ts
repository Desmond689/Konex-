/**
 * KONEX UI Store
 * Billion Dollar Code - Production Ready
 * 
 * Manages UI state including:
 * - Loading states
 * - Modal visibility
 * - Toast messages
 * - Theme
 * - Network status
 * - Keyboard visibility
 * - Bottom sheet state
 * - Tab visibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Modal {
  id: string;
  visible: boolean;
  data?: any;
}

export interface BottomSheet {
  id: string;
  visible: boolean;
  snapPoints?: string[];
  data?: any;
}

export interface UIState {
  // State
  isLoading: boolean;
  loadingMessage: string | null;
  isOnline: boolean;
  theme: 'light' | 'dark' | 'system';
  toasts: Toast[];
  modals: Modal[];
  bottomSheets: BottomSheet[];
  activeTab: string;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  isFullscreen: boolean;
  selectedTab: string;
  previousRoute: string | null;
  currentRoute: string | null;

  // Actions
  setLoading: (loading: boolean, message?: string) => void;
  setOnline: (isOnline: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  showModal: (id: string, data?: any) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  showBottomSheet: (id: string, snapPoints?: string[], data?: any) => void;
  hideBottomSheet: (id: string) => void;
  hideAllBottomSheets: () => void;
  setActiveTab: (tab: string) => void;
  setKeyboardVisible: (visible: boolean, height?: number) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setNavigation: (current: string, previous?: string) => void;
  reset: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: UIState = {
  isLoading: false,
  loadingMessage: null,
  isOnline: true,
  theme: 'system',
  toasts: [],
  modals: [],
  bottomSheets: [],
  activeTab: 'Home',
  isKeyboardVisible: false,
  keyboardHeight: 0,
  isFullscreen: false,
  selectedTab: 'Home',
  previousRoute: null,
  currentRoute: null,
  setLoading: () => {},
  setOnline: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
  showToast: () => {},
  hideToast: () => {},
  clearToasts: () => {},
  showModal: () => {},
  hideModal: () => {},
  hideAllModals: () => {},
  showBottomSheet: () => {},
  hideBottomSheet: () => {},
  hideAllBottomSheets: () => {},
  setActiveTab: () => {},
  setKeyboardVisible: () => {},
  setFullscreen: () => {},
  setNavigation: () => {},
  reset: () => {},
};

// ============================================
// 3. STORE
// ============================================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // LOADING
      // ============================================

      setLoading: (loading: boolean, message?: string) => {
        set({
          isLoading: loading,
          loadingMessage: loading ? message || 'Loading...' : null,
        });
      },

      // ============================================
      // NETWORK
      // ============================================

      setOnline: (isOnline: boolean) => {
        set({ isOnline });
        if (!isOnline && __DEV__) {
          console.log('📡 Network offline');
        } else if (isOnline && __DEV__) {
          console.log('📡 Network online');
        }
      },

      // ============================================
      // THEME
      // ============================================

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        if (__DEV__) {
          console.log('🎨 Theme set:', theme);
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        set({ theme: newTheme });
        if (__DEV__) {
          console.log('🎨 Theme toggled:', newTheme);
        }
      },

      // ============================================
      // TOASTS
      // ============================================

      showToast: (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        set((state) => ({
          toasts: [...state.toasts, { id, message, type, duration }],
        }));
        // Auto-hide toast after duration
        setTimeout(() => {
          get().hideToast(id);
        }, duration);
      },

      hideToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // ============================================
      // MODALS
      // ============================================

      showModal: (id: string, data?: any) => {
        set((state) => ({
          modals: [...state.modals, { id, visible: true, data }],
        }));
      },

      hideModal: (id: string) => {
        set((state) => ({
          modals: state.modals.filter((modal) => modal.id !== id),
        }));
      },

      hideAllModals: () => {
        set({ modals: [] });
      },

      // ============================================
      // BOTTOM SHEETS
      // ============================================

      showBottomSheet: (id: string, snapPoints: string[] = ['50%', '100%'], data?: any) => {
        set((state) => ({
          bottomSheets: [...state.bottomSheets, { id, visible: true, snapPoints, data }],
        }));
      },

      hideBottomSheet: (id: string) => {
        set((state) => ({
          bottomSheets: state.bottomSheets.filter((sheet) => sheet.id !== id),
        }));
      },

      hideAllBottomSheets: () => {
        set({ bottomSheets: [] });
      },

      // ============================================
      // NAVIGATION
      // ============================================

      setActiveTab: (tab: string) => {
        set({ activeTab: tab, selectedTab: tab });
      },

      setKeyboardVisible: (visible: boolean, height: number = 0) => {
        set({
          isKeyboardVisible: visible,
          keyboardHeight: height,
        });
      },

      setFullscreen: (fullscreen: boolean) => {
        set({ isFullscreen: fullscreen });
      },

      setNavigation: (current: string, previous?: string) => {
        set({
          currentRoute: current,
          previousRoute: previous || get().currentRoute,
        });
      },

      // ============================================
      // RESET
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 UI store reset');
        }
      },
    }),
    {
      name: '@konex/ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        activeTab: state.activeTab,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectIsOnline = (state: UIState) => state.isOnline;
export const selectTheme = (state: UIState) => state.theme;
export const selectToasts = (state: UIState) => state.toasts;
export const selectModals = (state: UIState) => state.modals;
export const selectActiveTab = (state: UIState) => state.activeTab;
export const selectCurrentRoute = (state: UIState) => state.currentRoute;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useUIStore;