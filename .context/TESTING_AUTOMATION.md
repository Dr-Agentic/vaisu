# Automated Testing Guide - Vaisu

This document outlines the automated testing strategy, procedures, and best practices for the Vaisu application.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run CI test suite
npm run test:ci
```

## Test Structure

```
vaisu/
├── test/
│   ├── setup.ts              # Global test setup
│   ├── fixtures/             # Test data
│   │   └── documents.ts      # Document fixtures
│   └── mocks/                # Mock implementations
│       └── openRouterMock.ts # LLM API mocks
├── backend/src/
│   └── services/
│       └── __tests__/        # Unit tests
│           ├── documentParser.test.ts
│           └── textAnalyzer.test.ts
└── vitest.config.ts          # Test configuration
```

## Testing Philosophy

### Test Pyramid
- **70% Unit Tests**: Fast, isolated, test individual functions
- **20% Integration Tests**: Test component interactions
- **10% E2E Tests**: Test complete user flows

### Key Principles
1. **Fast**: Tests should run quickly (< 5 seconds for unit tests)
2. **Isolated**: Tests should not depend on each other
3. **Repeatable**: Same input = same output
4. **Maintainable**: Clear, readable test code
5. **Comprehensive**: Cover happy paths, edge cases, and errors

## Test Coverage Requirements

| Component | Target Coverage |
|-----------|----------------|
| Services | 90% |
| Utils | 85% |
| Routes | 80% |
| Components | 75% |
| Overall | 80% |

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentParser } from '../documentParser';

describe('DocumentParser', () => {
  let parser: DocumentParser;

  beforeEach(() => {
    parser = new DocumentParser();
  });

  it('should parse plain text successfully', async () => {
    const result = await parser.parseText('# Test\n\nContent');
    
    expect(result).toBeDefined();
    expect(result.content).toBe('# Test\n\nContent');
    expect(result.metadata.wordCount).toBeGreaterThan(0);
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('POST /api/documents/analyze', () => {
  it('should analyze document successfully', async () => {
    const response = await request(app)
      .post('/api/documents/analyze')
      .send({ text: 'Test document' })
      .expect(200);

    expect(response.body).toHaveProperty('analysis');
  });
});
```

## Test Fixtures

Use predefined test data from `test/fixtures/documents.ts`:

```typescript
import { 
  SMALL_BUSINESS_REPORT,
  PROCESS_DOCUMENT,
  TECHNICAL_SPEC 
} from '../../../test/fixtures/documents';

it('should analyze business report', async () => {
  const result = await analyzer.analyze(SMALL_BUSINESS_REPORT);
  expect(result.signals.quantitative).toBeGreaterThan(0.7);
});
```

## Mocking

### Mock LLM API Calls

```typescript
import { createMockOpenRouterClient } from '../../../test/mocks/openRouterMock';

const mockClient = createMockOpenRouterClient();
const analyzer = new TextAnalyzer(mockClient);

// Test without hitting real API
const result = await analyzer.generateTLDR(text);
```

### Mock External Services

```typescript
import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: mockResponse })
  }
}));
```

## Performance Testing

### Benchmark Tests

```typescript
it('should parse document within 2 seconds', async () => {
  const start = Date.now();
  await parser.parseText(largeDocument);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(2000);
});
```

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Nightly builds (extended test suite)

### Quality Gates

Pull requests must pass:
- ✅ All unit tests
- ✅ All integration tests
- ✅ Type checking
- ✅ Linting
- ✅ 80% code coverage

## Best Practices

### DO ✅
- Write descriptive test names
- Test one thing per test
- Use beforeEach for setup
- Clean up after tests
- Mock external dependencies
- Test error cases
- Keep tests simple and readable

### DON'T ❌
- Test implementation details
- Share state between tests
- Use real API calls in unit tests
- Ignore failing tests
- Write tests that depend on order
- Test third-party libraries
- Make tests too complex

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Plan](../testplan-2025-12-06.md)

## Getting Help

- Check existing tests for examples
- Review test fixtures and mocks
- Ask in #engineering Slack channel
- Consult test plan document
