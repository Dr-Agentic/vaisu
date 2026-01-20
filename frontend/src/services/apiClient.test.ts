import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock localStorage BEFORE importing apiClient
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Mock window.location BEFORE importing apiClient
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'http://localhost:7002',
      pathname: '/',
      search: '',
      hash: '',
    },
  },
  writable: true,
});

// Import apiClient after mocking
import { apiClient } from "./apiClient";

describe("apiClient - localStorage methods", () => {
  beforeEach(() => {
    // Reset all mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it("isAuthenticated returns true when access token exists", () => {
    localStorageMock.getItem.mockReturnValueOnce("mock-token");
    
    expect(apiClient.isAuthenticated()).toBe(true);
    expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
  });

  it("isAuthenticated returns false when no access token", () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    expect(apiClient.isAuthenticated()).toBe(false);
    expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
  });

  it("getUser returns parsed user data", () => {
    const mockUser = { id: "123", email: "test@example.com" };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
    
    expect(apiClient.getUser()).toEqual(mockUser);
    expect(localStorage.getItem).toHaveBeenCalledWith("user");
  });

  it("getUser returns null when no user data", () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    expect(apiClient.getUser()).toBeNull();
    expect(localStorage.getItem).toHaveBeenCalledWith("user");
  });

  it("logout clears authentication data", () => {
    // isLoginPage check will return false with default location
    apiClient.logout();
    
    expect(localStorage.removeItem).toHaveBeenCalledWith("accessToken");
    expect(localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
  });
});
