# Design System

A comprehensive, accessible design system built with React, TypeScript, and CSS custom properties. This design system follows industry best practices for enterprise-grade UI development.

## Features

- ✅ **Semantic Design Tokens** - CSS custom properties for all design values
- ✅ **Dark Mode Support** - Automatic system preference detection
- ✅ **Accessibility First** - WCAG 2.2 AA compliant components
- ✅ **TypeScript** - Full type safety with strict mode
- ✅ **4px Base Grid** - Consistent spacing system
- ✅ **Reduced Motion Support** - Respects user preferences
- ✅ **Composable Components** - Reusable, flexible UI primitives

## Design Tokens

All design values are defined as semantic tokens using CSS custom properties:

```css
/* Spacing */
padding: var(--spacing-md);

/* Colors */
color: var(--color-text-primary);
background: var(--color-background-primary);

/* Typography */
font-size: var(--font-size-base);
font-weight: var(--font-weight-semibold);

/* Elevation */
box-shadow: var(--elevation-md);

/* Motion */
transition-duration: var(--motion-duration-base);
transition-timing-function: var(--motion-easing-ease-out);
```

## Components

### Button

Accessible button component with multiple variants and states.

```tsx
import { Button } from '@/design-system/components';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

<Button variant="outline" loading={isLoading}>
  Loading...
</Button>
```

**Variants:** `primary`, `secondary`, `accent`, `outline`, `ghost`, `danger`  
**Sizes:** `sm`, `md`, `lg`

### Card

Flexible container component for grouping related content.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components';

<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Card content goes here</CardContent>
</Card>
```

**Variants:** `base`, `elevated`, `outlined`, `filled`  
**Padding:** `none`, `sm`, `md`, `lg`, `xl`

### Input

Accessible form input with proper labeling and error states.

```tsx
import { Input } from '@/design-system/components';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
  required
/>
```

### Textarea

Accessible textarea component with proper labeling and error states.

```tsx
import { Textarea } from '@/design-system/components';

<Textarea
  label="Description"
  placeholder="Enter description"
  rows={4}
  error="Required field"
/>
```

### Badge

Small status indicator or label component.

```tsx
import { Badge } from '@/design-system/components';

<Badge variant="success">Active</Badge>
<Badge variant="error" size="lg">Error</Badge>
```

**Variants:** `primary`, `secondary`, `accent`, `success`, `error`, `warning`, `info`, `neutral`  
**Sizes:** `sm`, `md`, `lg`

## Theme Provider

The `ThemeProvider` component enables theme switching and system preference detection.

```tsx
import { ThemeProvider, useTheme } from '@/design-system/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  );
}
```

**Modes:** `light`, `dark`, `system`

## Color System

The design system uses a semantic color palette following the 70/20/10 balance:

- **70% Primary** - Main brand color used throughout the UI
- **20% Secondary** - Supporting brand color
- **10% Accent** - Highlights and call-to-actions

All colors are available in both light and dark themes with proper contrast ratios.

## Spacing System

All spacing values follow a 4px base grid:

- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 12px
- `--spacing-base`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 40px
- `--spacing-3xl`: 48px
- `--spacing-4xl`: 64px
- `--spacing-5xl`: 96px

## Typography

The typography system uses a Major Third scale (1.25) for font sizes:

- `--font-size-xs`: 12px
- `--font-size-sm`: 14px
- `--font-size-base`: 16px
- `--font-size-lg`: 18px
- `--font-size-xl`: 20px
- `--font-size-2xl`: 24px
- `--font-size-3xl`: 30px
- `--font-size-4xl`: 36px
- `--font-size-5xl`: 48px
- `--font-size-6xl`: 60px
- `--font-size-7xl`: 72px

## Accessibility

All components are built with accessibility in mind:

- ✅ **WCAG 2.2 AA** compliant
- ✅ **Keyboard navigation** support
- ✅ **ARIA attributes** where needed
- ✅ **Focus management** for modals and dialogs
- ✅ **Screen reader** friendly
- ✅ **Reduced motion** support

## Best Practices

1. **Always use semantic tokens** - Never hard-code values
2. **Use the ThemeProvider** - Wrap your app for theme support
3. **Follow the spacing grid** - Use tokens, not arbitrary values
4. **Test with keyboard** - Ensure all interactions work without a mouse
5. **Check contrast ratios** - Use tools to verify color accessibility

## Contributing

When adding new components:

1. Use TypeScript with strict mode
2. Include proper ARIA attributes
3. Support keyboard navigation
4. Add JSDoc comments
5. Export from `components/index.ts`
6. Follow the existing component patterns

