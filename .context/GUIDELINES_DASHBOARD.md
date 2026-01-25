# Dashboard UI Guidelines

**Last Updated:** January 16, 2026  
**Status:** ✅ **APPROVED**  
**Scope:** Dashboard Layouts & Grid Systems

## 🚨 IMPORTANT: Before Building Dashboards

### Core Principle
**Dashboard layouts must compose existing primitives from the UI library.**

Every dashboard widget, panel, and navigation element must be built using:
- **`@/components/primitives/`** - For individual UI elements
- **`@/components/patterns/`** - For composed layouts
- **`@/design-system/`** - For tokens and theming

**Never** create custom dashboard-specific components unless absolutely necessary.

---

## 🏗️ Dashboard Architecture

### Directory Structure
```
/frontend/src/
├── pages/
│   ├── dashboard/
│   │   ├── DashboardDemo.tsx          ← Demo page with layout comparison
│   │   ├── ClassicDashboardLayout.tsx ← Traditional sidebar layout
│   │   ├── ModernDashboardLayout.tsx  ← Bento grid layout
│   │   └── README.md                  ← Integration documentation
│   └── ... (other pages)
```

### Layout Philosophy

#### Two Approaches
1. **Classic Layout** - Traditional data application navigation
   - Fixed sidebar (256px)
   - Vertical navigation stack
   - Main content area with widgets
   - Best for: Task-oriented workflows, data tables, form-heavy apps

2. **Modern Layout** - Visual exploration and discovery
   - Bento grid system
   - Variable-sized widgets
   - Entity relationship visualization
   - Best for: Analytics, exploration, network mapping, creative tools

**Choose based on user mental model, not personal preference.**

---

## 🎨 Visual Design System

### CSS Custom Properties (from `index.css`)

#### Color Tokens (Required for consistency)
```typescript
// Backgrounds
var(--color-background-primary)     // Main app background
var(--color-surface-base)           // Card/widget surface
var(--color-surface-elevated)       // Hover/selected states

// Text
var(--color-text-primary)           // Main text
var(--color-text-secondary)         // Secondary text
var(--color-text-tertiary)          // Minimal text

// Borders & Interactions
var(--color-border-subtle)          // Default border
var(--color-border-strong)          // Active/hover border
var(--color-border-focus)           // Focus ring
var(--color-interactive-primary-base) // Primary accent
```

#### Spacing Scale (4px base)
```typescript
var(--space-xxs)  // 4px   (0.25rem)
var(--space-xs)   // 8px   (0.5rem)
var(--space-sm)   // 12px  (0.75rem)
var(--space-md)   // 16px  (1rem)
var(--space-lg)   // 24px  (1.5rem)
var(--space-xl)   // 32px  (2rem)
var(--space-2xl)  // 48px  (3rem)
```

#### Radius Scale
```typescript
var(--radius-sm)  // 4px
var(--radius-md)  // 8px
var(--radius-lg)  // 12px
var(--radius-xl)  // 16px
```

#### Shadow Scale
```typescript
var(--shadow-sm)  // Subtle elevation
var(--shadow-md)  // Card elevation
var(--shadow-lg)  // Modal/drawer elevation
```

### Color Gradient Themes

**Use these predefined gradients for visual hierarchy:**

| Theme | Gradient | Usage |
|-------|----------|-------|
| **Aurora** | `from-[#6366F1] via-[#8B5CF6] to-[#EC4899]` | Primary actions, highlights |
| **Nova** | `from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6]` | Secondary accents, insights |
| **Solar** | `from-[#F59E0B] via-[#F97316] to-[#EF4444]` | Warnings, status indicators |
| **Ember** | `from-[#F43F5E] via-[#EC4899] to-[#DB2777]` | Errors, critical actions |

**Usage Pattern:**
```typescript
// For text
className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899]"

// For backgrounds
className="bg-gradient-to-r from-[#6366F1] to-[#EC4899]"
```

---

## 📦 Component Requirements

### Dashboard Widget Pattern
```typescript
interface Widget {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  metric?: string;
  trend?: number;
  color: 'aurora' | 'nova' | 'solar' | 'ember';
  content?: React.ReactNode;
}

// Size mapping for grid
// small → 1x1
// medium → 2x1 or 1x2
// large → 2x2
// xlarge → 3x2 or 4x2
```

### Navigation Item Pattern
```typescript
interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  action: () => void;
}
```

---

## 🎯 Usage Examples

### 1. Creating a Dashboard Card

**❌ AVOID - Custom implementation:**
```typescript
// Bad: Custom card with hardcoded styles
const WidgetCard = () => (
  <div className="bg-white shadow p-4 rounded-lg">
    <div className="bg-gradient-to-r from-purple-500 to-pink-500">
      <Icon className="text-white" />
    </div>
    <h3>Widget Title</h3>
    <p>123</p>
  </div>
)
```

**✅ CORRECT - Composed from library:**
```typescript
// Good: Uses Card primitive with tokens
import { Card } from '@/components/primitives'

const WidgetCard = () => (
  <Card 
    elevation="2"
    padding="lg"
    className="cursor-pointer hover:border-[var(--color-border-strong)] transition-all"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#EC4899] opacity-20">
        <Network className="w-5 h-5 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899]" />
      </div>
      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)]">
        +12%
      </span>
    </div>
    <h3 className="font-semibold text-[var(--color-text-primary)]">Entity Network</h3>
    <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">2,432</p>
    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
      Real-time relationship mapping
    </p>
  </Card>
)
```

### 2. Grid Layout System

**Classic Layout (Side-by-side widgets):**
```typescript
// Stats row - 4 columns
<div className="grid grid-cols-4 gap-4 mb-6">
  {widgets.filter(w => w.size === 'small').map((widget) => (
    <WidgetCard key={widget.id} widget={widget} />
  ))}
</div>

// Main content - 2 columns
<div className="grid grid-cols-2 gap-6">
  {widgets.filter(w => w.size !== 'small').map((widget) => (
    <WidgetCard key={widget.id} widget={widget} />
  ))}
</div>
```

**Modern Layout (Bento grid):**
```typescript
// Responsive bento grid
<div className="grid grid-cols-4 gap-4 auto-rows-[240px]">
  {/* Large widget - 2 columns wide, 2 rows tall */}
  <div className="col-span-2 row-span-2">
    <WidgetCard widget={largeWidget} />
  </div>
  
  {/* Medium widget - 2 columns wide, 1 row tall */}
  <div className="col-span-2">
    <WidgetCard widget={mediumWidget} />
  </div>
  
  {/* Small widget - 1 column wide */}
  <div className="col-span-1">
    <WidgetCard widget={smallWidget} />
  </div>
</div>
```

### 3. Navigation Elements

**Side Navigation:**
```typescript
<nav className="flex-1 p-4 space-y-1">
  {menuItems.map((item) => {
    const isActive = activeMenuItem === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveMenuItem(item.id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-[var(--color-surface-elevated)] border border-[var(--color-border-strong)] shadow-sm' 
            : 'hover:bg-[var(--color-surface-elevated)] border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`} />
          <span className={`text-sm font-medium ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
            {item.label}
          </span>
        </div>
        {item.count && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isActive 
              ? 'bg-[var(--color-interactive-primary-base)] text-white' 
              : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]'
          }`}>
            {item.count}
          </span>
        )}
      </button>
    );
  })}
</nav>
```

### 4. Search/Filter Components

**Input with Icon:**
```typescript
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
  <input
    type="text"
    placeholder="Search entities, documents, insights..."
    className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
  />
</div>
```

---

## 📊 Data Visualization Guidelines

### Metric Display
- **Large numbers:** Use `text-2xl` or `text-3xl` with bold font
- **Trend indicators:** Always show direction (↑↓) and percentage
- **Color coding:** Use color system (Aurora=success, Solar=warning, Ember=error)
- **Progress bars:** Use gradient backgrounds with percentage width

### Activity Feeds
- **Timeline format:** Use icons + text + timestamp
- **Hover states:** Subtle background color change
- **Spacing:** 12px between items
- **Icons:** 16px x 16px, color: `var(--color-text-secondary)`

### Network/Relationship Maps
- **Node styling:** Circular with gradient background
- **Line thickness:** Use `--space-xs` to `--space-sm`
- **Labels:** Small font (10-12px), high contrast
- **Interactions:** Hover = highlight connected nodes

---

## 🎨 Visual Hierarchy Rules

### Typography Scale
```css
/* Headings */
h1: text-3xl font-bold
h2: text-2xl font-bold  
h3: text-xl font-semibold

/* Body text */
p: text-base (14px)
p.secondary: text-sm, color-secondary

/* Metadata */
p.metadata: text-xs, color-tertiary, font-mono

/* Metrics */
.metric: text-2xl/3xl font-bold
```

### Z-Index Layering
```
10: Sidebar navigation (fixed)
20: Header navigation (sticky)
30: Modal/dialog overlays
40: Popovers and tooltips
50: Notifications
```

### Elevation Levels
```css
/* Base surface */
bg-[var(--color-surface-base)]

/* Hover/interactive */
bg-[var(--color-surface-elevated)]

/* Selected/active */
border-[var(--color-border-strong)]

/* Focus/selected state */
ring-2 ring-[var(--color-interactive-primary-base)]
```

---

## 🔧 Implementation Checklist

### Before Building
- [ ] Check if existing primitives can compose the desired UI
- [ ] Review `/components/primitives/` for matching components
- [ ] Review `/components/patterns/` for layout patterns
- [ ] Define data structures (interfaces) first
- [ ] Plan state management (useState, useMemo, or Context)
- [ ] Choose layout type (Classic vs Modern) based on user needs

### During Development
- [ ] Use CSS custom properties for all colors/spacing
- [ ] Follow 4px spacing scale
- [ ] Apply consistent radius/shadow tokens
- [ ] Use gradient themes (Aurora, Nova, Solar, Ember) appropriately
- [ ] Implement proper focus states for accessibility
- [ ] Add hover states for interactive elements
- [ ] Use semantic HTML (nav, main, header, etc.)

### After Development
- [ ] Test responsive behavior (if applicable)
- [ ] Check contrast ratios for accessibility
- [ ] Verify color consistency across themes
- [ ] Ensure keyboard navigation works
- [ ] Add ARIA labels where needed
- [ ] Review against existing UI guidelines

---

## 📈 Performance Considerations

### React Patterns
- **Use `useMemo`** for derived widget data
- **Avoid re-renders** in grid layouts
- **Lazy load** heavy widgets (if data-intensive)
- **Virtualize** long lists (activity feeds)

### CSS Optimization
- **Prefer CSS variables** over inline styles
- **Use `transform`** for animations
- **Avoid layout thrashing** in grid calculations
- **Batch state updates** for multiple widget selections

### Bundle Size
- **Dynamically import** heavy chart libraries
- **Tree-shake unused** icon imports
- **Code split** dashboard routes

---

## 🚫 Common Anti-Patterns

### ❌ DO NOT
1. **Create custom Card/Button components**
   - Use existing primitives from `/components/primitives/`

2. **Hardcode color values**
   - Use `var(--color-*)` tokens

3. **Use random spacing values**
   - Use `var(--space-*)` tokens

4. **Create one-off layouts**
   - Compose from existing patterns

5. **Copy-paste style classes**
   - Create reusable utility functions

6. **Ignore accessibility**
   - Add ARIA labels, focus states, keyboard navigation

7. **Mix gradient themes randomly**
   - Follow semantic usage (Aurora=primary, Solar=warning)

8. **Overuse animations**
   - Keep transitions subtle (200-300ms)

### ✅ DO
1. **Use existing primitives**
2. **Follow token system**
3. **Maintain accessibility**
4. **Document components**
5. **Test interactions**
6. **Plan for scale**
7. **Consistent patterns**
8. **Performance mindful**

---

## 📚 Integration Guide

### Adding Dashboard Route

**In `App.tsx`:**
```typescript
import DashboardDemo from './pages/dashboard/DashboardDemo';

// Add protected route
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardDemo />
    </ProtectedRoute>
  } 
/>
```

### Using Layouts Individually

```typescript
import ClassicDashboardLayout from './pages/dashboard/ClassicDashboardLayout';
import ModernDashboardLayout from './pages/dashboard/ModernDashboardLayout';

// For production route
const DashboardPage = () => {
  // Choose based on user preference or A/B test
  return <ClassicDashboardLayout />;
};

// Or toggle between them
const ToggleDashboard = () => {
  const [layout, setLayout] = useState<'classic' | 'modern'>('classic');
  
  return layout === 'classic' 
    ? <ClassicDashboardLayout /> 
    : <ModernDashboardLayout />;
};
```

---

## 🎯 Success Metrics

### Code Quality
- **Zero custom components** in dashboard
- **100% token usage** (no hardcoded values)
- **Consistent patterns** across layouts
- **Documented interfaces**

### UX Quality
- **Sub-500ms load time** for dashboard render
- **Clear visual hierarchy** (users scan in <5s)
- **Accessible** (keyboard navigable)
- **Responsive** (works on different screen sizes)

### Performance
- **Bundle size:** < 100KB for dashboard
- **First paint:** < 2s
- **Interaction latency:** < 100ms
- **Memory usage:** Stable under load

---

## 🔗 References

### Internal
- `/frontend/src/index.css` - CSS custom properties
- `/frontend/src/design-system/tokens.ts` - Design tokens
- `/frontend/src/components/primitives/` - Available components
- `/frontend/src/components/patterns/` - Layout patterns

### Context
- `.context/2026-01-06-ui-theme-vaisu.md` - UI library guidelines
- `.context/GUIDELINES_DASHBOARD.md` - Dashboard guidelines (this file)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-16 | Initial dashboard guidelines |
| 1.1 | 2026-01-16 | Added layout comparison rules |
| 1.2 | 2026-01-16 | Added visual hierarchy section |

---

**Document Version:** 1.2  
**Last Updated:** January 16, 2026  
**Maintained By:** Dashboard Architecture Team  
**Next Review:** February 1, 2026
