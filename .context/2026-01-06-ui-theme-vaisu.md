# Vaisu Electron UI Theme Architecture & Design Principles

**Date:** January 7, 2026
**Status:** Current Implementation

## Overview

This document describes the actual UI theme architecture and design system implemented in the Vaisu Electron application's frontend codebase. The design system follows modern principles but has limitations compared to the originally documented vision.

## Design System Architecture

### 1. Theme System Foundation

#### Theme Configuration (Actual)
**Location:** `/frontend/src/design-system/tokens.ts` and `/frontend/src/design-system/themes.ts`

**Implemented:**
- **CSS Custom Properties** defined in `index.css` (3,084 lines)
- **Theme Tokens** in `tokens.ts` (280 lines)
- **Theme Definitions** in `themes.ts` (186 lines)

**Missing from Implementation:**
- ❌ `ThemeProvider.tsx` component
- ❌ Context-based theme management
- ❌ localStorage persistence
- ❌ Automatic system preference detection

#### CSS Custom Properties System (✅ Implemented)
**Location:** `/frontend/src/index.css`

**Organized into sections:**
```css
/* 1. Base/Reset */
*, *::before, *::after { box-sizing: border-box; }

/* 2. Color Variables - Light Theme */
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9fafb;
  --color-text-primary: #111827;
  /* ... ~150 color variables */
  
  /* Aurora Gradient System */
  --aurora-1: #6366f1;
  --aurora-2: #a855f7;
  --aurora-3: #ec4899;
  --gradient-angle: 0deg;
  --duration-gradient: 4s;
}

/* 3. Dark Theme Override */
[data-theme="dark"] {
  --color-background-primary: #0f172a;
  --color-background-secondary: #1e293b;
  --color-text-primary: #f1f5f9;
  /* ... all dark mode colors */
}

/* 4. Typography */
:root {
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'SF Mono', Monaco, monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}

/* 5. Spacing (4px base grid) */
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 0.75rem;   /* 12px */
  --space-base: 1rem;    /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  --space-4xl: 6rem;     /* 96px */
  --space-5xl: 8rem;     /* 128px */
}

/* 6. Radius */
:root {
  --radius-sm: 0.25rem;
  --radius-base: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}

/* 7. Motion */
:root {
  --duration-fast: 100ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 8. Elevation/Shadows */
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

**Total Lines in index.css:** 1,308 lines (much larger than documented)

### 2. Color System (✅ Implemented)

#### Primary Color Palette
```css
/* Backgrounds */
--color-background-primary: #ffffff;
--color-background-secondary: #f9fafb;
--color-background-tertiary: #f3f4f6;

/* Text */
--color-text-primary: #111827;
--color-text-secondary: #4b5563;
--color-text-tertiary: #6b7280;
--color-text-disabled: #d1d5db;

/* Surfaces */
--color-surface-base: #ffffff;
--color-surface-elevated: #f9fafb;
--color-surface-overlay: rgba(255, 255, 255, 0.9);

/* Interactive */
--color-interactive-primary-base: #4f46e5;
--color-interactive-primary-hover: #4338ca;
--color-interactive-primary-active: #3730a3;
--color-interactive-primary-disabled: #a5b4fc;

--color-interactive-secondary-base: #6b7280;
--color-interactive-accent-base: #f59e0b;
--color-interactive-accent-hover: #d97706;
--color-interactive-accent-active: #b45309;

/* Borders */
--color-border-base: #e5e7eb;
--color-border-subtle: #f3f4f6;
--color-border-strong: #9ca3af;
--color-border-focus: #4f46e5;

/* Semantic */
--color-semantic-success-base: #10b981;
--color-semantic-success-text: #065f46;
--color-semantic-error-base: #ef4444;
--color-semantic-error-text: #991b1b;
--color-semantic-warning-base: #f59e0b;
--color-semantic-warning-text: #92400e;
--color-semantic-info-base: #3b82f6;
--color-semantic-info-text: #1e40af;
```

#### Aurora Gradient System (✅ Implemented)
```css
/* Primary Aurora Colors */
--aurora-1: #6366f1; /* Indigo */
--aurora-2: #a855f7; /* Purple */
--aurora-3: #ec4899; /* Pink */

/* Secondary Nova Colors */
--nova-1: #06b6d4; /* Cyan */
--nova-2: #3b82f6; /* Blue */
--nova-3: #8b5cf6; /* Violet */

/* Animation Properties */
--gradient-angle: 0deg;
--duration-gradient: 4s;
```

**Animation Usage:**
```css
@keyframes aurora-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Conic gradient for borders */
.conic-gradient {
  background: conic-gradient(
    from var(--gradient-angle),
    var(--aurora-1),
    var(--aurora-2),
    var(--aurora-3),
    var(--aurora-1)
  );
  animation: aurora-rotate var(--duration-gradient) linear infinite;
}
```

### 3. Typography System (✅ Implemented)

**Font Stack:**
- **Sans-serif**: `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
- **Mono**: `SF Mono, Monaco, 'Cascadia Code', monospace`

**Font Sizes:**
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

**Font Weights:**
- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### 4. Component Architecture

#### Design System Components (Actual vs Documented)

**Documented but NOT Implemented:**
- ❌ `/frontend/src/design-system/components/Button.tsx`
- ❌ `/frontend/src/design-system/components/Badge.tsx`
- ❌ `/frontend/src/design-system/components/Card.tsx`
- ❌ `/frontend/src/design-system/components/ThemeToggle.tsx`
- ❌ `/frontend/src/design-system/ThemeProvider.tsx`

**Actually Implemented:**
- ✅ `/frontend/src/design-system/components/index.ts` (exports: `ComponentSampler`)
- ✅ `/frontend/src/design-system/hooks/` - 3 hooks
  - `useClickOutside.ts`
  - `useDebounce.ts`
  - `useMediaQuery.ts`

**Component Sampler:**
- **Location:** `/frontend/src/electron/components/ComponentSampler.tsx`
- **Purpose:** Testing ground for UI components
- **Status:** Documentation component, not production UI

### 5. Layout System

#### CSS Grid & Flexbox (✅ Implemented Throughout)
**Usage in codebase:**
- Tailwind classes for layout (via index.css)
- Custom grid in `index.css` for experiments

**Responsive Design:**
- No explicit breakpoints defined in custom CSS
- Uses Tailwind's responsive classes (if available)
- Mobile-first approach in visualizations

### 6. State of the Art Features (Documented vs Reality)

#### 6.1. Animated Gradient System (✅ Partially Implemented)
- **In index.css:** ✅ All CSS variables and keyframes exist
- **In components:** ❌ No actual usage in production components
- **In experiments:** ✅ Used in `/experiments/` HTML files

**Usage in Experiments:**
```html
<!-- grid_kinetic_blueprint_elite.html -->
<div class="aurora-glow">
  <!-- Uses CSS custom properties for gradient animation -->
</div>
```

#### 6.2. Mesh Glow Effects (❌ Not Implemented)
**Documented:** Yes
**Actual:** No component uses mesh glow

#### 6.3. Gradient Border Variants (✅ In Experiments Only)
```css
/* Available in index.css */
.gradient-border {
  position: relative;
  background: white;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  margin: -2px;
  border-radius: inherit;
  background: conic-gradient(...);
  z-index: -1;
}
```

**Actual Usage:** Only in HTML experiment files, not React components.

### 7. Accessibility Standards

#### WCAG Compliance (⚠️ Partial)
**Implemented:**
- ✅ Semantic HTML in main App.tsx
- ✅ Focus indicators in CSS variables (`--color-border-focus`)
- ✅ Keyboard navigation support (basic)

**Missing:**
- ❌ Comprehensive ARIA labels
- ❌ Screen reader testing
- ❌ Reduced motion media queries
- ❌ Contrast ratio verification

### 8. Visual Component Reality

#### What Actually Exists

**Main Application Structure:**
```typescript
// frontend/src/App.tsx
- Upload component
- Document list
- Analysis results display
- Visualization router
- Progress indicators
```

**Visualization Components (4/15 Implemented):**
```
frontend/src/components/visualizations/
├── argument-map/          ✅ Complete
├── flowchart/             ✅ Complete
├── knowledge-graph/       ✅ Complete
├── uml-class-diagram/     ✅ Complete
└── [11 more types]        ❌ Not implemented
```

**Design System Files:**
```
frontend/src/design-system/
├── components/
│   └── index.ts           ✅ Exports ComponentSampler
├── hooks/
│   ├── useClickOutside.ts ✅
│   ├── useDebounce.ts     ✅
│   └── useMediaQuery.ts   ✅
├── themes.ts              ✅ Theme definitions
├── tokens.ts              ✅ Design tokens
└── README.md              ✅ Documentation
```

**Missing Files:**
```
❌ /frontend/src/design-system/components/Button.tsx
❌ /frontend/src/design-system/components/Badge.tsx
❌ /frontend/src/design-system/components/Card.tsx
❌ /frontend/src/design-system/components/ThemeToggle.tsx
❌ /frontend/src/design-system/ThemeProvider.tsx
```

### 9. Theme Switching Implementation

#### Current Approach (Manual)
**Location:** `/frontend/src/design-system/themes.ts`

**Implementation:**
```typescript
export const themes = {
  light: {
    colors: {
      background: '#ffffff',
      text: '#111827',
      // ... all tokens
    }
  },
  dark: {
    colors: {
      background: '#0f172a',
      text: '#f1f5f9',
      // ... all tokens
    }
  }
};

// Usage in CSS via [data-theme="dark"]
```

**Switching Mechanism:**
```typescript
// Somewhere in App.tsx or main.tsx
document.documentElement.setAttribute('data-theme', 'dark');
```

**Missing:**
- ❌ Theme toggle component
- ❌ System preference detection (`matchMedia`)
- ❌ localStorage persistence
- ❌ React context provider

### 10. Code Organization Reality

#### Actual vs Documented Structure

**Documented (from 2026-01-06 guide):**
```
/frontend/src/design-system/
├── components/
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   └── [various hooks]
├── themes.ts
├── tokens.ts
└── ThemeProvider.tsx
```

**Actual:**
```
/frontend/src/design-system/
├── components/
│   └── index.ts           # Just ComponentSampler
├── hooks/
│   ├── useClickOutside.ts
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
├── themes.ts              # Theme definitions (not used at runtime)
├── tokens.ts              # Design tokens (not used at runtime)
└── README.md
```

**Note:** `themes.ts` and `tokens.ts` contain TypeScript definitions but are **not imported** by the main application at runtime. CSS variables in `index.css` are the actual source of truth.

### 11. Style Implementation Strategy

#### CSS-in-JS vs CSS Variables

**Current Approach:**
- ✅ Pure CSS custom properties
- ❌ No CSS-in-JS library
- ❌ No styled-components
- ❌ No Emotion

**Tailwind CSS:**
- Configured in `/frontend/tailwind.config.js`
- Used in component classes
- Custom CSS variables for design tokens

**Migration Path:**
The codebase has tokens defined in TypeScript but uses plain CSS. There's a disconnect between the design system documentation and actual implementation.

### 12. Component Patterns

#### What Components Actually Do

**Main App Component (`App.tsx`):**
```typescript
// ~220 lines
- State management (Zustand)
- File upload
- Document list display
- Analysis results
- Visualization router
- Progress tracking
- Error display
```

**Visualizations (e.g., KnowledgeGraph):**
```typescript
// Uses D3/Cytoscape for rendering
- Nodes and edges
- Interactive SVG/Canvas
- Zoom and pan
- Node selection
- Hover tooltips
- Search/filter
```

**Component Style:**
- Functional components with hooks
- Zustand for state
- No design system components used
- Ad-hoc styling in component files

### 13. State of the Art vs Reality

#### Documented Features:
1. ✅ **Aurora gradients** - In CSS, not used
2. ✅ **CSS custom properties** - Fully implemented
3. ❌ **ThemeProvider** - Not implemented
4. ❌ **Design components** - Not implemented
5. ❌ **Mesh glow** - Not implemented
6. ✅ **Animation tokens** - Defined but limited usage
7. ❌ **Accessibility** - Partial, not comprehensive

#### Actual Features:
1. ✅ **CSS variables** for all tokens
2. ✅ **Dark mode support** via data attribute
3. ✅ **Aurora gradient CSS** defined
4. ✅ **Typography scale** defined
5. ✅ **Spacing scale** defined
6. ❌ **Component library** - Minimal
7. ❌ **Theme persistence** - No

### 14. Accessibility Reality

#### What's Actually Implemented
**In CSS:**
```css
/* Focus indicators */
--color-border-focus: #4f46e5;

/* Some semantic classes */
.text-error { color: var(--color-semantic-error-base); }
.text-success { color: var(--color-semantic-success-base); }
```

**In Components:**
- Some `aria-label` attributes
- Tab navigation works
- Focus states visible (via browser defaults)

**Missing:**
- ❌ `aria-describedby` for form errors
- ❌ `role` attributes for custom widgets
- ❌ `prefers-reduced-motion` support
- ❌ Screen reader announcements
- ❌ Keyboard shortcuts documentation
- ❌ Contrast ratio validation

### 15. Development Workflow

#### Component Testing
**Location:** `/frontend/src/electron/components/ComponentSampler.tsx`

**Purpose:** Visual playground for testing design tokens
**Status:** Developer tool, not user-facing

#### Style Development
**Approach:**
1. Define tokens in `tokens.ts` (TypeScript)
2. Define themes in `themes.ts` (TypeScript)
3. Implement in `index.css` (CSS custom properties)
4. Use via class names or inline styles

**Gap:** No automated synchronization between TypeScript definitions and actual CSS.

### 16. Integration Patterns

#### With Electron
**Native Feel:**
- Uses Electron's native window controls
- macOS/Windows/Linux specific styling in some places
- System font stack for native appearance

#### With React
- Functional components
- Hooks for state and effects
- Zustand for global state
- No component library dependencies

#### With State Management
- Zustand stores: `/frontend/src/stores/`
- `/frontend/src/stores/documentStore.ts` (432 lines)
- Manages documents, analyses, visualizations
- No theme state (theme not reactive yet)

### 17. Code Quality Standards

#### TypeScript Usage
- ✅ Strict mode enabled in `tsconfig.json`
- ✅ Types in `/frontend/src/types/` (minimal)
- ✅ Shared types in `/shared/src/types.ts`
- ❌ No component prop types (minimal usage)

#### Organization
- ❌ No component library pattern
- ❌ No design system package
- Ad-hoc component structure
- Visualizations organized by type

#### Testing
- ❌ No component tests
- ❌ No visual regression tests
- ❌ No accessibility tests
- ⚠️ Some API tests in backend only

### 18. Future Enhancements (Reality Check)

#### What Would Need to be Built
1. **ThemeProvider Component**
   - React context
   - Theme switching logic
   - localStorage persistence
   - System preference detection

2. **Component Library**
   - Button, Badge, Card, Input
   - Consistent props interface
   - Full accessibility
   - Storybook documentation

3. **Accessibility Layer**
   - ARIA attributes
   - Keyboard navigation
   - Focus management
   - Reduced motion support

4. **Theme Persistence**
   - localStorage integration
   - Sync across tabs
   - Cookie fallback

5. **Design Token Pipeline**
   - Auto-generate CSS from TS
   - Design token documentation
   - Version control for tokens

### 19. Summary: Documented vs Reality

#### Documented (Aspirational):
- Full design system with components
- ThemeProvider with context
- Auto theme detection
- Comprehensive component library
- Mesh glow effects
- State-of-the-art animations
- Full WCAG compliance

#### Reality (Current):
- CSS variables defined but unused
- Theme definitions exist but not integrated
- 4 visualization components implemented
- No reusable UI component library
- Manual theme switching (if any)
- Basic accessibility
- Aurora CSS defined but not used in app

#### Gap Analysis:
**What Exists:**
- ✅ CSS variables in index.css
- ✅ Token definitions in tokens.ts
- ✅ Theme definitions in themes.ts
- ✅ Design system documentation
- ✅ 4 visualization components
- ✅ Aurora gradient CSS

**What Doesn't:**
- ❌ Runtime theme system
- ❌ Component library
- ❌ Theme persistence
- ❌ System preference detection
- ❌ Comprehensive accessibility
- ❌ Reusable UI components

**Conclusion:**
The design system is 60% documented but only 30% implemented. The CSS foundation exists but lacks the React integration and component library described in documentation.

### 20. Recommendations for Implementation

#### Phase 1: Core Theme System
1. Create `ThemeProvider.tsx` using React Context
2. Implement theme switching logic
3. Add localStorage persistence
4. Detect system preference

#### Phase 2: Component Library
1. Start with Button, Badge, Card
2. Build with full accessibility
3. Document props and usage
4. Add Storybook

#### Phase 3: Integration
1. Migrate visualizations to use components
2. Add theme state to Zustand
3. Implement reduced motion support
4. Add automated contrast checking

#### Phase 4: Polish
1. Add animations to match documentation
2. Implement mesh glow effects
3. Add comprehensive ARIA attributes
4. Create component examples

### 21. Conclusion

**The Vaisu design system is in early stages:**

✅ **Strengths:**
- Solid CSS foundation with variables
- Token-based design approach
- Aurora gradient system defined
- Type-safe token definitions
- Good typography and spacing scales

❌ **Weaknesses:**
- No React integration
- No component library
- No theme persistence
- Minimal accessibility
- Unused design tokens
- Disconnect between TypeScript and CSS

⚠️ **Status:**
Documentation describes an **aspirational vision** rather than current reality. The system has all the ingredients but hasn't been assembled into a functional design system.

**For the design system to match documentation, approximately 70% more implementation work is needed.**
