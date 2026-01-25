import { render, screen } from "@testing-library/react";
import { UsageStats } from "./UsageStats";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the store
const mockFetchUsageStats = vi.fn();
const mockUsageStats = {
  totalDocuments: 10,
  totalWords: 5000,
  documentsThisWeek: 2,
  totalGraphs: 5,
  dailyAnalysisUsage: 25,
  storageUsed: 500 * 1024 * 1024, // 500MB
  documentLimit: 100,
  analysisLimit: 50,
  storageLimit: 1024 * 1024 * 1024, // 1GB
};

// Use a variable to control the return value for different tests
let currentUsageStats: any = mockUsageStats;

vi.mock("../../stores/userStore", () => ({
  useUserStore: () => ({
    usageStats: currentUsageStats,
    fetchUsageStats: mockFetchUsageStats,
  }),
}));

describe("UsageStats", () => {
  beforeEach(() => {
    currentUsageStats = mockUsageStats;
    mockFetchUsageStats.mockClear();
  });

  it("renders usage stats correctly", () => {
    render(<UsageStats />);

    expect(screen.getByText("Daily Analysis Usage")).toBeInTheDocument();
    expect(screen.getByText("25 / 50")).toBeInTheDocument();
    expect(screen.getByText("Storage Usage")).toBeInTheDocument();
    expect(screen.getByText(/500\sMB/)).toBeInTheDocument();
  });

  it("calls fetchUsageStats on mount", () => {
    render(<UsageStats />);
    expect(mockFetchUsageStats).toHaveBeenCalled();
  });

  it("displays warning when analysis limit is near", () => {
    currentUsageStats = {
      ...mockUsageStats,
      dailyAnalysisUsage: 48, // 96%
    };
    render(<UsageStats />);
    expect(screen.getByText("Approaching daily limit")).toBeInTheDocument();
  });

  it("displays warning when storage limit is near", () => {
    currentUsageStats = {
      ...mockUsageStats,
      storageUsed: 1000 * 1024 * 1024, // ~976MB
    };
    render(<UsageStats />);
    expect(screen.getByText("Storage almost full")).toBeInTheDocument();
  });
});
