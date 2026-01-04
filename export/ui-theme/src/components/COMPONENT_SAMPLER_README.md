# Component Sampler

A comprehensive component sampler for the Vaisu Electron UI design system. This tool allows designers and developers to quickly identify readability and contrast issues across all UI components.

## Features

### 🎨 **Component Showcase**
- **Buttons**: Primary, Secondary, Ghost, Outline, Aurora, Nova, Danger variants
- **Badges**: Success, Error, Warning, Info, Aurora, and size variants
- **Cards**: Base, Elevated, Outlined, Mesh Glow, Gradient Border, Interactive variants
- **Form Elements**: Inputs, Textareas, Selects, with states (error, success, disabled)
- **Status Indicators**: Spinners, Progress Rings, Tooltips, Stage Indicators
- **Advanced Components**: Theme Toggle, Complex Layouts, Responsive Grids
- **Accessibility Testing**: Contrast testing and focus state validation

### 🎛️ **Interactive Controls**
- **Theme Switching**: Toggle between light and dark themes
- **Device Simulation**: Desktop, Tablet, Mobile viewports
- **Label Visibility**: Show/hide component names and descriptions
- **Class ID Visibility**: Show/hide CSS class identifiers

### 🔍 **Accessibility & Readability Testing**
- **Contrast Testing**: High-contrast examples for WCAG compliance
- **Focus States**: Proper focus indicators on all interactive elements
- **Text Readability**: Font sizes, line heights, and spacing validation
- **Color Usage**: Semantic color application across components

## Usage

### In App Integration
```tsx
import { ComponentSampler } from './components/ComponentSampler';

// Use as a standalone component
<ComponentSampler
  onBack={() => setStage('welcome')}
  showLabels={true}
  showClassIds={true}
/>
```

### As Demo Page
```tsx
import ComponentSamplerDemo from './ComponentSamplerDemo';

// Render in Router or as standalone page
<ComponentSamplerDemo />
```

## Component Categories

### 1. Buttons
Test all button variants for:
- Color contrast ratios
- Hover and active states
- Loading states and disabled states
- Icon integration and spacing
- Size consistency (small, medium, large)

### 2. Badges
Validate:
- Background and text color combinations
- Size variations and spacing
- Semantic color usage (success, error, warning, info)
- Custom gradient variants (Aurora, Nova)

### 3. Cards
Check:
- Border and background contrast
- Elevation and shadow effects
- Interactive states and hover effects
- Padding and spacing consistency
- Complex layouts with nested components

### 4. Form Elements
Test:
- Input field contrast and readability
- Label positioning and sizing
- Error and success state visibility
- Disabled state clarity
- Focus indicators and accessibility

### 5. Status Indicators
Validate:
- Loading animation visibility
- Progress ring contrast
- Tooltip positioning and readability
- Multi-step indicator clarity

## Testing Scenarios

### Color Contrast Testing
1. Switch between light and dark themes
2. Check text readability against backgrounds
3. Verify button text contrast in all states
4. Test badge text against colored backgrounds

### Accessibility Testing
1. Test keyboard navigation
2. Verify focus indicators are visible
3. Check ARIA labels and descriptions
4. Validate screen reader compatibility

### Responsive Testing
1. Use device mode controls to test different screen sizes
2. Check layout reflow and component behavior
3. Verify touch target sizes on mobile
4. Test text wrapping and overflow

### Performance Testing
1. Monitor animation smoothness
2. Check for layout thrashing
3. Verify GPU acceleration usage
4. Test component rendering performance

## CSS Classes Reference

Each component includes visible class ID labels showing:
- Component base classes (e.g., `btn-primary`, `badge-success`)
- State classes (e.g., `active`, `completed`)
- Variant classes (e.g., `gradient-border-animated`, `mesh-glow`)
- Size classes (e.g., `size-sm`, `size-lg`)

## Development Guidelines

### Adding New Components
1. Follow the existing `renderComponentSample` pattern
2. Include appropriate descriptions and testing scenarios
3. Add to relevant sections based on component type
4. Ensure accessibility and contrast compliance

### Component Documentation
Each component sample should include:
- Clear component name
- Brief description of purpose
- Testing scenarios for readability
- Notes on accessibility considerations

### Testing Workflow
1. Start with default theme and desktop mode
2. Toggle labels and class IDs for identification
3. Switch themes to test contrast
4. Change device modes for responsive testing
5. Use accessibility tools for compliance validation

## Integration with Design System

The ComponentSampler is designed to work seamlessly with:
- **ThemeProvider**: Dynamic theme switching
- **Design Tokens**: Consistent CSS custom properties
- **Accessibility Standards**: WCAG 2.2 AA compliance
- **Motion System**: Smooth animations and transitions
- **Responsive Design**: Flexible grid and layout system

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive support with touch optimization

## Troubleshooting

### Common Issues
1. **Animations not smooth**: Check for hardware acceleration
2. **Contrast issues**: Verify theme variables are loaded
3. **Layout problems**: Check CSS custom properties
4. **Accessibility failures**: Review ARIA attributes and focus management

### Debug Mode
Enable debug mode to show:
- Component boundaries
- CSS grid/flexbox overlays
- Color contrast ratios
- Focus state visibility

## Contributing

When adding new components to the sampler:
1. Follow the established patterns
2. Include comprehensive testing scenarios
3. Ensure accessibility compliance
4. Add appropriate documentation
5. Test across all themes and device modes

## Related Files

- `ComponentSampler.tsx`: Main sampler component
- `ComponentSamplerDemo.tsx`: Standalone demo page
- `index.ts`: Component exports
- `StageContainer.tsx`: Parent container for stage-based navigation
- `StageIndicators.tsx`: Progress indicator component
- `StageWelcome.tsx`: Welcome screen component
- `StageInput.tsx`: Input stage component
- `StageAnalysis.tsx`: Analysis stage component
- `StageVisualization.tsx`: Visualization stage component
- `VisualizationSidebar.tsx`: Sidebar for visualization controls