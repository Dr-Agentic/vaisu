// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PricingPage from "./PricingPage";
import { apiClient } from "../services/apiClient";

// Mock dependencies
vi.mock("../services/apiClient", () => ({
  apiClient: {
    createCheckoutSession: vi.fn(),
  },
}));

vi.mock("../stores/userStore", () => ({
  useUserStore: () => ({
    user: {
      userId: "test-user",
      subscriptionStatus: "inactive",
    },
  }),
}));

describe("PricingPage", () => {
  // We need to capture this inside the test or check if window exists (it should with jsdom env)
  // But safest is to just delete and restore in beforeEach/afterEach without storing global original immediately
  // if we are unsure about when jsdom loads.
  // However, with @vitest-environment jsdom, it should be there.

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders pricing plans", () => {
    render(<PricingPage />);
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("$29")).toBeInTheDocument();
  });

  it("calls createCheckoutSession when Upgrade is clicked", async () => {
    // Setup mock response
    const mockUrl = "https://checkout.stripe.com/test";
    (apiClient.createCheckoutSession as any).mockResolvedValue({
      url: mockUrl,
    });

    render(<PricingPage />);

    const upgradeBtn = screen.getByText("Upgrade to Pro");
    fireEvent.click(upgradeBtn);

    expect(screen.getByText("Processing...")).toBeInTheDocument();

    await waitFor(() => {
      expect(apiClient.createCheckoutSession).toHaveBeenCalled();
      expect(window.location.href).toBe(mockUrl);
    });
  });
});
