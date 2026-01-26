import { describe, it, expect, beforeEach } from "vitest";

// Import apiClient after mocking
import { apiClient } from "./apiClient";

describe("apiClient - localStorage methods", () => {
  beforeEach(() => {
    // Reset all mocks
    (window.localStorage.getItem as any).mockClear();
    (window.localStorage.setItem as any).mockClear();
    (window.localStorage.removeItem as any).mockClear();
    (window.localStorage.clear as any).mockClear();
  });

  it("isAuthenticated returns true when access token exists", () => {
    (window.localStorage.getItem as any).mockReturnValueOnce("mock-token");
    
    expect(apiClient.isAuthenticated()).toBe(true);
    expect(window.localStorage.getItem).toHaveBeenCalledWith("accessToken");
  });

  it("isAuthenticated returns false when no access token", () => {
    (window.localStorage.getItem as any).mockReturnValueOnce(null);
    
    expect(apiClient.isAuthenticated()).toBe(false);
    expect(window.localStorage.getItem).toHaveBeenCalledWith("accessToken");
  });

  it("getUser returns parsed user data", () => {
    const mockUser = { id: "123", email: "test@example.com" };
    (window.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(mockUser));
    
    expect(apiClient.getUser()).toEqual(mockUser);
    expect(window.localStorage.getItem).toHaveBeenCalledWith("user");
  });

  it("getUser returns null when no user data", () => {
    (window.localStorage.getItem as any).mockReturnValueOnce(null);
    
    expect(apiClient.getUser()).toBeNull();
    expect(window.localStorage.getItem).toHaveBeenCalledWith("user");
  });

  it("logout clears authentication data", () => {
    // isLoginPage check will return false with default location
    apiClient.logout();
    
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("accessToken");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("user");
  });
});
