import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUserStore } from "./userStore";
import { apiClient } from "../services/apiClient";

vi.mock("../services/apiClient", () => ({
  apiClient: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    checkAuth: vi.fn(),
    isAuthenticated: vi.fn(),
    getMe: vi.fn(),
    getDashboardStats: vi.fn(),
  },
}));

describe("UserStore", () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      usageStats: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it("fetchUsageStats updates state with backend data", async () => {
    const mockStats = {
      totalDocuments: 5,
      totalWords: 1000,
      documentsThisWeek: 2,
      totalGraphs: 1,
    };

    (apiClient.getDashboardStats as any).mockResolvedValue(mockStats);

    await useUserStore.getState().fetchUsageStats();

    const state = useUserStore.getState();
    expect(state.usageStats).toEqual({
      ...mockStats,
      documentLimit: 100,
      analysisLimit: 50,
      storageLimit: 1024 * 1024 * 1024,
    });
  });
});
