# Testing Quick Reference Card

## 🚀 Quick Commands

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode (TDD)
npm run test:coverage      # With coverage report
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm test -- myfile.test.ts # Run specific file
```

## 📝 Writing a Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyComponent', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

## 🎯 Common Assertions

```typescript
expect(value).toBe(expected)              // Strict equality
expect(value).toEqual(expected)           // Deep equality
expect(value).toBeDefined()               // Not undefined
expect(value).toBeTruthy()                // Truthy value
expect(value).toHaveLength(3)             // Array/string length
expect(value).toContain(item)             // Array contains
expect(value).toHaveProperty('key')       // Object has property
expect(fn).toThrow()                      // Function throws
expect(value).toBeGreaterThan(5)          // Number comparison
expect(value).toBeLessThan(10)            // Number comparison
```

## 🔧 Mocking

```typescript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn().mockReturnValue('result');

// Mock module
vi.mock('./module', () => ({
  myFunction: vi.fn()
}));

// Mock implementation
mockFn.mockImplementation(() => 'custom');

// Check calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);
```

## 📦 Using Fixtures

```typescript
import { SMALL_BUSINESS_REPORT } from '../../../test/fixtures/documents';

it('should analyze document', async () => {
  const result = await analyze(SMALL_BUSINESS_REPORT);
  expect(result).toBeDefined();
});
```

## ⏱️ Async Testing

```typescript
// Using async/await
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// With timeout
it('should complete quickly', async () => {
  await slowOperation();
}, 10000); // 10 second timeout
```

## 🎭 Mock LLM Calls

```typescript
import { createMockOpenRouterClient } from '../../../test/mocks/openRouterMock';

const mockClient = createMockOpenRouterClient();
const analyzer = new TextAnalyzer(mockClient);

const result = await analyzer.generateTLDR(text);
expect(result).toBeDefined();
```

## 🐛 Debugging Tests

```bash
# Run single test
npm test -- myfile.test.ts

# Run with debugging
node --inspect-brk node_modules/.bin/vitest run

# View coverage
npm run test:coverage
open coverage/index.html
```

## ✅ Coverage Targets

| Component | Target |
|-----------|--------|
| Services  | 90%    |
| Utils     | 85%    |
| Routes    | 80%    |
| Overall   | 80%    |

## 🚦 CI/CD Checks

Every PR must pass:
- ✅ All tests pass
- ✅ 80% coverage
- ✅ Type check
- ✅ Linting

## 📚 Test Structure

```
describe('Feature', () => {
  describe('Subfeature', () => {
    it('should handle happy path', () => {});
    it('should handle edge case', () => {});
    it('should handle error', () => {});
  });
});
```

## 🎨 Test Naming

```typescript
// ✅ Good
it('should return user when ID exists')
it('should throw error when ID is invalid')
it('should parse document within 2 seconds')

// ❌ Bad
it('test 1')
it('works')
it('user test')
```

## 🔥 Common Patterns

### Setup/Teardown
```typescript
beforeEach(() => {
  // Runs before each test
});

afterEach(() => {
  // Runs after each test
});

beforeAll(() => {
  // Runs once before all tests
});

afterAll(() => {
  // Runs once after all tests
});
```

### Testing Errors
```typescript
it('should throw on invalid input', () => {
  expect(() => {
    myFunction(invalidInput);
  }).toThrow('Expected error message');
});

// Async errors
it('should reject on failure', async () => {
  await expect(asyncFunction()).rejects.toThrow();
});
```

### Performance Testing
```typescript
it('should complete within time limit', async () => {
  const start = Date.now();
  await operation();
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(2000);
});
```

## 🆘 Troubleshooting

### Test Timeout
```typescript
// Increase timeout
it('slow test', async () => {
  // test code
}, 10000); // 10 seconds
```

### Mock Not Working
```typescript
// Mock before import
vi.mock('./module');
import { myFunction } from './module';
```

### Flaky Test
- Remove time dependencies
- Use proper async/await
- Isolate test data
- Check for race conditions

## 📖 Resources

- [Full Testing Guide](./TESTING_AUTOMATION.md)
- [Test Plan](../testplan-2025-12-06.md)
- [Vitest Docs](https://vitest.dev/)
- [Test Fixtures](./test/fixtures/documents.ts)
- [Mock Examples](./test/mocks/openRouterMock.ts)

## 💡 Tips

1. **Write tests first** (TDD) when possible
2. **Keep tests simple** - one assertion per test
3. **Use descriptive names** - tests are documentation
4. **Mock external dependencies** - keep tests fast
5. **Test edge cases** - not just happy paths
6. **Run tests often** - use watch mode
7. **Fix failing tests immediately** - don't let them pile up
8. **Review coverage** - but don't chase 100%

---

**Questions?** Check the full testing guide or ask in #engineering
