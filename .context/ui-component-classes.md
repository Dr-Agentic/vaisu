# UI Component Classes and Types

## Electron UI Components

### Stage Components
- StageContainer
- Stage
- StageWelcome
- StageInput
- StageAnalysis
- StageVisualization
- StageIndicators

### Navigation & Layout
- VisualizationSidebar
- DocumentBrowserPanel

## Design System Components

### Core UI Components
- Button
  - Variants: primary, secondary, accent, outline, ghost, danger, aurora, nova, aurora-fast, aurora-static
  - Sizes: sm, md, lg

- Card
  - Variants: base, elevated, outlined, filled, mesh-glow, mesh-glow-strong, gradient-border-animated, gradient-border-static, gradient-border-animated-fast, aurora, nova
  - Padding: none, sm, md, lg, xl

- Input
  - Sizes: sm, md, lg

- Textarea
  - Sizes: sm, md, lg

- Badge
  - Variants: primary, secondary, accent, outline, ghost, danger, aurora, nova, solar, ember
  - Sizes: sm, md, lg

- Modal
- ThemeToggle
- Select
- Tooltip
- Spinner

### Specialized Components
- ThemeProvider
- useTheme hook

## CSS Classes and Utilities

### Gradient Border Classes
- gradient-border-animated
- gradient-border-animated-fast
- gradient-border-static
- gradient-border-animated.nova
- gradient-border-animated-fast.nova
- gradient-border-static.nova

### Mesh Glow Backgrounds
- mesh-glow
- mesh-glow-strong
- hero-bg

### Text Gradients
- text-gradient
- text-gradient.nova
- text-gradient-glow

### Stage Utilities
- stage-container
- stage
- stage.active
- stage.fade-in
- stage.slide-in-left
- stage.slide-in-right

### Loading States
- shimmer
- loading-spinner
- progress-ring

### Electron UI Utilities
- floating
- sr-only
- btn
- btn-primary
- btn-primary-fast
- btn-primary-static
- btn-secondary
- btn-tertiary
- card
- card-title
- card-subtitle
- badge
- badge-aurora
- badge-nova
- badge-solar
- badge-ember
- stage-indicators
- stage-dot
- stage-dot.completed
- stage-dot.active
- viz-item
- viz-item.active
- viz-item-name
- viz-item-desc

### Animation Classes
- accelerated
- gradient-border-animated (will-change: background, transform)
- gradient-border-animated-fast (will-change: background, transform)
- btn (will-change: transform, background)
- floating (will-change: transform)
- card:hover (will-change: transform, border-color)
- stage (will-change: opacity)
- stage.active (will-change: opacity)
- stage.fade-in, stage.slide-in-left, stage.slide-in-right (will-change: opacity, transform)
- loading-spinner, progress-ring (will-change: transform)

## Color System Variables

### Aurora Gradient (Primary)
- --aurora-1: #6366f1
- --aurora-2: #a855f7
- --aurora-3: #ec4899

### Nova Gradient (Secondary)
- --nova-1: #06b6d4
- --nova-2: #3b82f6
- --nova-3: #8b5cf6

### Solar Gradient (Warning)
- --solar-1: #f59e0b
- --solar-2: #f97316
- --solar-3: #ef4444

### Ember Gradient (Error)
- --ember-1: #f43f5e
- --ember-2: #ec4899
- --ember-3: #db2777

### Void System (Electron UI Background)
- --void-deepest: #1a1a1f
- --void-dark: #202028
- --void-light: #2a2a35
- --void-border: rgba(255, 255, 255, 0.15)
- --void-border-hover: rgba(255, 255, 255, 0.25)
- --void-border-unselected: #666666

### Text Colors (Void)
- --text-primary: #ffffff
- --text-secondary: rgba(255, 255, 255, 0.75)
- --text-tertiary: rgba(255, 255, 255, 0.65)

## Animation Classes
- rotate-gradient-angle
- rotate-gradient
- pulse-glow
- shimmer
- aurora-shift
- success-pulse
- float
- spin
- fade-in-up
- fade-in
- slide-in-left
- slide-in-right