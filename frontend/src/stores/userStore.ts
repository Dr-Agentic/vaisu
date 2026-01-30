import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { apiClient } from '../services/apiClient';

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role?: string;
  subscriptionProvider?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
}

export interface UsageStats {
  totalDocuments: number;
  totalWords: number;
  documentsThisWeek: number;
  totalGraphs: number;
  dailyAnalysisUsage: number;
  storageUsed: number;
  documentLimit: number;
  analysisLimit: number;
  storageLimit: number;
}

interface UserState {
  user: User | null;
  usageStats: UsageStats | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isUpgradeModalOpen: boolean;

  setUpgradeModalOpen: (isOpen: boolean) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchUsageStats: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      usageStats: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isUpgradeModalOpen: false,

      setUpgradeModalOpen: (isOpen) => set({ isUpgradeModalOpen: isOpen }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(email, password);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMsg = error.response?.data?.error || 'Login failed';
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email, password, firstName, lastName) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.register(email, password, firstName, lastName);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        apiClient.logout();
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.updateProfile(data);
          set((state) => ({
            user: { ...state.user, ...response.user } as User,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      checkAuth: async () => {
        if (!apiClient.isAuthenticated()) {
          // If we are already not authenticated, do nothing to avoid resetting potential error states
          const { isAuthenticated } = get();
          if (isAuthenticated) {
            set({ user: null, isAuthenticated: false });
          }
          return;
        }
        try {
          const response = await apiClient.getMe();
          set({ user: response.user, isAuthenticated: true });
        } catch (error) {
          // Token is invalid or user is not active, clear everything
          apiClient.logout();
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchUsageStats: async () => {
        try {
          const stats = await apiClient.getDashboardStats();
          // Default limits (could be dynamic based on plan later)
          const limits = {
            documentLimit: 100,
            analysisLimit: 50,
            storageLimit: 1024 * 1024 * 1024, // 1GB
          };

          set({
            usageStats: {
              ...stats,
              ...limits,
            },
          });
        } catch (error) {
          console.error('Failed to fetch usage stats', error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
