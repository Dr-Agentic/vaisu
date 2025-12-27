# Design System Setup Guide

## Installation

The design system is already integrated into the project. To use it in your components:

```tsx
import { Button, Card, Input, Badge, ThemeProvider } from '@/design-system/components';
```

## Required Dependencies

The design system uses the following dependencies (already in package.json):
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `lucide-react` ^0.344.0 (for icons)
- `tailwindcss` ^3.4.1

## Testing Dependencies (Optional)

To run component tests, install:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe jsdom
```

Then update `vitest.config.ts` to use `jsdom` environment for frontend tests:

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom', // Change from 'node' to 'jsdom'
    // ... rest of config
  },
});
```

## Usage

### 1. Wrap your app with ThemeProvider

```tsx
// main.tsx
import { ThemeProvider } from './design-system/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### 2. Use components

```tsx
import { Button, Card, Input } from './design-system/components';

function MyComponent() {
  return (
    <Card variant="elevated" padding="lg">
      <Input label="Email" type="email" required />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### 3. Toggle theme

```tsx
import { ThemeToggle, useTheme } from './design-system/components';

function Header() {
  return (
    <header>
      <ThemeToggle showLabels />
    </header>
  );
}
```

## CSS Variables

All design tokens are available as CSS custom properties. They're automatically loaded via `index.css`.

```css
.my-component {
  padding: var(--spacing-md);
  color: var(--color-text-primary);
  background: var(--color-background-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-md);
}
```

## Dark Mode

Dark mode is automatically enabled based on system preferences. Users can override this using the `ThemeToggle` component.

The theme system supports:
- `light` - Light theme
- `dark` - Dark theme  
- `system` - Follows OS preference (default)

## Next Steps

1. **Replace existing components** - Gradually migrate existing components to use design system components
2. **Add more components** - Extend the design system with Modal, Select, Tooltip, etc.
3. **Set up Storybook** - Create visual documentation for all components
4. **Add tests** - Write comprehensive tests for all components

