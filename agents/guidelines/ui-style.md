# Vaisu UI Library - Developer Guide

**Last Updated:** January 15, 2026  
**Status:** ✅ **IMPLEMENTED**  
**Architecture:** Single source of truth - component library

## 🚨 CRITICAL: READ BEFORE BUILDING ANY UI

### The Golden Rule

**You are FORBIDDEN from creating custom UI components.**

Every new UI element must use one of these sources:

1. **`@/components/primitives/`** - Atoms (Button, Card, Input, etc.)
2. **`@/components/patterns/`** - Molecules (TabGroup, StageContainer)
3. **`@/design-system/`** - Tokens and themes

**Exception:** Only create a new component if you need NEW logic that cannot be composed from existing primitives.

---

## 🏗️ Current Architecture

### Directory Structure

```
/frontend/src/
├── components/
│   ├── primitives/          ← USE THESE for UI
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── Badge.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Radio.tsx
│   │   ├── Toggle.tsx
│   │   └── index.ts
│   ├── patterns/
│   │   ├── TabGroup.tsx
│   │   ├── StageContainer.tsx
│   │   └── index.ts
│   └── index.ts
│
├── stages/                  ← App pages (compose library)
│   ├── StageInput.tsx
│   ├── StageVisualization.tsx
│   └── StageContainer.tsx
│
├── design-system/
│   ├── tokens.ts            ← All design tokens
│   ├── themes.ts            ← Theme definitions
│   ├── ThemeProvider.tsx    ← Theme management
│   └── components/
│       └── index.ts         ← ComponentSampler (dev tool)
│
├── hooks/
│   ├── useClickOutside.ts
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
│
└── index.css                ← 3,084 lines of CSS custom properties
```

### What This Means

✅ **One place to find any UI component**  
✅ **Update Button once → all pages auto-update**  
✅ **No page-specific "hacks"**  
✅ **Consistent UI across entire app**

---

## 📦 Available Primitives

### Core Components (10 available)

| Component    | Location                  | Props                                                             | Usage                      |
| ------------ | ------------------------- | ----------------------------------------------------------------- | -------------------------- |
| **Button**   | `@/components/primitives` | `variant`, `size`, `leftIcon`, `rightIcon`, `disabled`, `onClick` | `size="sm"` or `size="lg"` |
| **Card**     | `@/components/primitives` | `elevation`, `padding`, `className`                               | `elevation="2"`            |
| **Input**    | `@/components/primitives` | `value`, `onChange`, `placeholder`, `error`                       | Text input with styling    |
| **Modal**    | `@/components/primitives` | `open`, `onClose`, `title`, `children`                            | Dialog overlays            |
| **Spinner**  | `@/components/primitives` | `size`, `color`                                                   | Loading indicators         |
| **Badge**    | `@/components/primitives` | `variant`                                                         | Status indicators          |
| **Checkbox** | `@/components/primitives` | `checked`, `onChange`                                             | Toggle inputs              |
| **Radio**    | `@/components/primitives` | `checked`, `onChange`                                             | Radio buttons              |
| **Toggle**   | `@/components/primitives` | `enabled`, `onChange`                                             | On/off switches            |
| **Icon**     | `@/components/primitives` | `name`, `size`, `color`                                           | Icon wrapper               |

### Pattern Components (3 available)

| Component            | Location                     | Purpose                             |
| -------------------- | ---------------------------- | ----------------------------------- |
| **TabGroup**         | `@/components/patterns`      | Tabbed navigation with icons        |
| **StageContainer**   | `@/components/patterns`      | Page layout with header/back button |
| **ComponentSampler** | `@/design-system/components` | Dev tool - displays all primitives  |

---

## 🎨 How to Use

### 1. Building a New Page (Step-by-Step)

**NEVER do this:**

```typescript
// ❌ WRONG - Custom button
const MyButton = ({ text }) => (
  <button className="bg-purple-500 text-white px-4 py-2 rounded">
    {text}
  </button>
)

// ❌ WRONG - Custom card
const MyCard = ({ children }) => (
  <div className="bg-white shadow-lg p-4 rounded">
    {children}
  </div>
)
```

**ALWAYS do this:**

```typescript
// ✅ CORRECT - Import from library
import { Button, Card } from '@/components/primitives'
import { StageContainer } from '@/components/patterns'

const MyPage = () => {
  return (
    <StageContainer title="My Page" onBack={handleBack}>
      <Card elevation="2" padding="lg">
        <h2>Welcome</h2>
        <Button variant="primary" onClick={handleClick}>
          Click Me
        </Button>
      </Card>
    </StageContainer>
  )
}
```

### 2. Import Paths

**Use these aliases (configured in tsconfig.json):**

```typescript
// Components
import { Button } from "@/components/primitives";
import { TabGroup } from "@/components/patterns";
import { StageContainer } from "@/components/patterns";

// Design system
import { themes } from "@/design-system/themes";
import { tokens } from "@/design-system/tokens";

// Hooks
import { useDebounce } from "@/hooks/useDebounce";
```

### 3. Theme Usage

**All components automatically respect the theme.**

```typescript
// ✅ This works automatically
import { Card } from '@/components/primitives'

const MyComponent = () => (
  <Card>Dark mode? Light mode? It just works.</Card>
)
```

**To switch themes:**

```typescript
import { useTheme } from '@/design-system/ThemeProvider'

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  )
}
```

---

## 🎯 When to Create New Components

### ✅ DO Create New Component If:

1. **You need new logic** (e.g., drag-and-drop file uploader)
2. **No existing pattern fits** (e.g., multi-step wizard)
3. **You will use it 3+ times** (justify the maintenance)

### ❌ DO NOT Create If:

1. **You can compose from existing** (use Button + Card + Input)
2. **It's used only once** (inline it)
3. **It's just styling** (use className prop)

**Example:**

```typescript
// ❌ Bad: Custom button group
const MyButtonGroup = () => (
  <div className="flex gap-2">
    <button onClick={prev} className="bg-gray-200">Prev</button>
    <button onClick={next} className="bg-blue-500">Next</button>
  </div>
)

// ✅ Good: Compose existing
import { Button } from '@/components/primitives'

const MyButtonGroup = () => (
  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
    <Button variant="secondary" onClick={prev}>Prev</Button>
    <Button variant="primary" onClick={next}>Next</Button>
  </div>
)
```

---

## 🔧 Design Tokens

### Available CSS Variables

All tokens are defined in `@/index.css`. Use them directly:

```css
/* Colors */
var(--color-background-primary)
var(--color-text-primary)

/* Spacing */
var(--space-md)
var(--space-xl)

/* Radius */
var(--radius-lg)
```

### TypeScript Token Access

```typescript
import { tokens } from "@/design-system/tokens";

// Access design tokens programmatically
const spacing = tokens.spacing.md; // 1rem
const color = tokens.colors.primary[500]; // #4f46e5
```

---

## ⚠️ Common Mistakes to Avoid

### 1. Duplicate Custom Components

**Before:** Every page had its own Button style
**After:** Import from `@/components/primitives`

### 2. Hardcoded Colors

**Before:** `className="bg-purple-500"`
**After:** `className="bg-[var(--color-interactive-primary-base)]"`

### 3. Inconsistent Spacing

**Before:** `padding: 12px`, `padding: 16px`, `padding: 1rem`
**After:** `padding: var(--space-md)` (always 16px)

### 4. Not Using Tokens

**Before:** Random values everywhere
**After:** `var(--radius-lg)`, `var(--shadow-md)`

---

## 🎯 Success Metrics

### Before (Jan 14)

- 50+ different button styles across pages
- No consistent spacing system
- Colors hardcoded everywhere
- 200+ component files

### After (Jan 15)

- **One Button component** used everywhere
- **Consistent spacing** via tokens
- **Centralized colors** in CSS
- **13 library components** + app-specific stages

### Goal

- Build page 4 in 30 minutes (not 3 hours)
- Update color scheme once, affects all pages
- New devs can ship UI on day 1
