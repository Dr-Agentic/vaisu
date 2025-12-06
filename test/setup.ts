import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables
beforeAll(() => {
  process.env.OPENROUTER_API_KEY = 'test-api-key';
  process.env.NODE_ENV = 'test';
});

// Cleanup after each test
afterEach(() => {
  // Clear any mocks
});

afterAll(() => {
  // Final cleanup
});
