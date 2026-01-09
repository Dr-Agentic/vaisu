# Component Library Architecture

## Overview

This directory contains the reusable component library for the Vaisu frontend. Components are organized by layer following Atomic Design principles.

## Directory Structure

```
components/
├── primitives/           # Atoms - Foundation components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Spinner.tsx
│   ├── Badge.tsx
│   ├── Tooltip.tsx
│   ├── ThemeToggle.tsx
│   └── index.ts
│
├── patterns/             # Molecules - Composite components
│   ├── TabGroup.tsx      # Reusable tabbed navigation
│   ├── StageContainer.tsx # Stage-based navigation container
│   ├── StageIndicators.tsx # Progress dots
│   └── index.ts
│
└── visualizations/       # Complex visualization components
    ├── StructuredViewRenderer.tsx
    ├── MindMap.tsx
    ├── TermsDefinitions.tsx
    ├── argument-map/
    ├── flowchart/
    ├── uml-class-diagram/
    ├── knowledge-graph/
    └── index.ts
```

## Architecture Principles

### 1. Single Source of Truth
All components are defined in ONE location:
- **Primitives**: `components/primitives/`
- **Patterns**: `components/patterns/`
- **Visualizations**: `components/visualizations/`

**NEVER** duplicate components or have multiple source directories.

### 2. Import Paths
All imports use relative paths from this root:

```tsx
// ✅ Correct - Import from primitives
import { Button } from '../../primitives';

// ✅ Correct - Import from patterns  
import { TabGroup } from '../../patterns';

// ❌ Wrong - Don't import from old locations
import { Button } from '../../design-system/components';
```

### 3. Layer Relationships

```
Features (app logic)
    ↓ uses
Patterns (composite UI)
    ↓ uses
Primitives (atomic UI)
```

### 4. What Goes Where?

**Primitives (Atoms)**
- Single-purpose, low-level components
- No business logic
- Props are all visual configuration
- Examples: Button, Card, Input, Spinner

**Patterns (Molecules)**
- Compose primitives
- Handle common UI patterns
- May have simple state management
- Examples: TabGroup, StageContainer

**Features (Organisms)**
- **These live in `/features/`**
- Compose primitives and patterns
- Contains business logic
- Connects to state management
- Examples: StageInput, DocumentBrowserPanel

## Usage Examples

### Importing Components

```tsx
// Import multiple primitives
import { Button, Card, Input } from '@/components';

// Import a pattern
import { TabGroup } from '@/components';

// Import visualization (rare, usually via VisualizationRenderer)
import { TermsDefinitions } from '@/components/visualizations';
```

### Creating New Components

**New Primitive?**
```tsx
// 1. Add to components/primitives/NewComponent.tsx
// 2. Export in components/primitives/index.ts
// 3. Use anywhere
```

**New Pattern?**
```tsx
// 1. Add to components/patterns/NewPattern.tsx
// 2. Export in components/patterns/index.ts
// 3. Compose primitives
// 4. Use in features
```

**New Feature?**
```tsx
// 1. Add to features/feature-name/NewFeature.tsx
// 2. Export in features/index.ts
// 3. Compose primitives + patterns
// 4. Add business logic
// 5. Connect to stores
```

## Maintenance

### When to Update a Component

1. **Visual bug** → Fix in primitives/ or patterns/
2. **Business logic change** → Fix in features/
3. **New prop needed** → Add to interface, update all uses
4. **Deprecation** → Mark as @deprecated in JSDoc, don't delete immediately

### Finding Components

```bash
# Find component usage
cd frontend/src && grep -r "Button" . --include="*.tsx" --include="*.ts"

# Find what a feature imports
cd frontend/src && grep -n "import" features/stages/StageInput.tsx
```

## Checklist for New Page

When building a new page (e.g., "Analysis"):

- [ ] Check if primitives exist (Button, Card, etc.)
- [ ] Check if patterns exist (TabGroup, etc.)
- [ ] **DO NOT create custom primitives**
- [ ] Compose from existing components
- [ ] Put page-specific logic in features/
- [ ] Use patterns for layout structure
- [ ] Import from `@/components` or `@/features`

## Common Mistakes to Avoid

❌ **Creating "just for this page" components**
→ Always check if an existing component can be adapted

❌ **Importing from multiple locations**
→ One component = one source location

❌ **Mixing business logic with presentation**
→ Keep presentation in primitives/patterns, logic in features

❌ **Forgetting to export**
→ Always add to index.ts

## Current Component Count

- **Primitives**: 10 components
- **Patterns**: 3 components
- **Features**: 13 components
- **Visualizations**: 4 main + 6 specialized

Total: ~30+ reusable components across layers

## Migration Status

✅ **COMPLETED**
- All components moved from `electron/components/` to `features/`
- All primitives extracted from `design-system/components/`
- All imports updated
- Old directories cleaned up

🗑️ **REMOVED**
- `export/ui-theme/` (deleted)
- `frontend/src/electron/components/` (migrated)
- `design-system/components/` (replaced by primitives)

## Questions?

**Where do I import X from?**
1. Is it a single-purpose UI element? → `@/components/primitives`
2. Is it a reusable UI pattern? → `@/components/patterns`
3. Is it app-specific with state? → `@/features`
4. Is it a data visualization? → `@/components/visualizations`

**What about ThemeProvider and tokens?**
They stay in `@/design-system/`. Only components move to `@/components/`.

**Why not use design-system/components?**
We now have `components/primitives/` as the single source of truth.
