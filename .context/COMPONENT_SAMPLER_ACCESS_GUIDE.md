# Component Sampler Access Guide

## How to Access the ComponentSampler

### Method 1: Through the Electron UI Stage System (Recommended)

The ComponentSampler is integrated into your existing Electron UI stage system. Here's how to access it:

#### **Development Access:**
1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the Electron UI:**
   - Open your browser to `http://localhost:5173` (or your configured port)
   - The app will load in Electron mode

3. **Navigate to ComponentSampler:**
   - You'll see the **Welcome** stage by default
   - Click "Get Started" to go to Input stage (optional)
   - **To access ComponentSampler directly**, you need to modify the initial stage

#### **Direct Access to ComponentSampler:**
Modify your `AppElectron.tsx` to start directly on the sampler:

```tsx
// In AppElectron.tsx, change the initial stage:
const [currentStage, setStage] = useState<AppStage>('component-sampler'); // Change from 'welcome'
```

Or temporarily set it in the store:

```tsx
// In your main App component or useEffect:
useEffect(() => {
  useDocumentStore.getState().setStage('component-sampler');
}, []);
```

### Method 2: Standalone Demo Page

I've created a standalone demo page that you can use independently:

1. **Create a route** in your app for `/sampler`:
   ```tsx
   // In your router or App.tsx
   import ComponentSamplerDemo from './electron/ComponentSamplerDemo';

   // Add route
   <Route path="/sampler" element={<ComponentSamplerDemo />} />
   ```

2. **Access directly:**
   - Navigate to `http://localhost:5173/sampler`

### Method 3: Development Testing

For quick testing during development:

1. **Create a test component:**
   ```tsx
   // Create frontend/src/test-sampler.tsx
   import { ComponentSampler } from './electron/components';

   export default function TestSampler() {
     return <ComponentSampler />;
   }
   ```

2. **Use it temporarily in your main App:**
   ```tsx
   // In App.tsx, replace the main content temporarily
   import TestSampler from './test-sampler';

   function App() {
     return <TestSampler />;
   }
   ```

## Available Stages in AppElectron

Your Electron UI has these stages:

1. **`welcome`** - Landing page with "Get Started" button
2. **`input`** - File upload and text input stage
3. **`analysis`** - Document analysis with progress ring
4. **`visualization`** - Main visualization workspace
5. **`component-sampler`** - **NEW** - Component showcase and testing

## Navigation Controls in ComponentSampler

Once in the ComponentSampler, you'll find:

### 🎛️ **Header Controls:**
- **Back Button** - Returns to Welcome stage
- **Theme Toggle** - Switch between Light/Dark themes
- **Device Mode** - Desktop/Tablet/Mobile simulation
- **Label Visibility** - Show/hide component names
- **Class ID Visibility** - Show/hide CSS class identifiers

### 📋 **Component Sections:**
1. **Buttons** - 12 different button variants
2. **Badges** - 10 badge types and sizes
3. **Cards** - 6 card variants with different effects
4. **Form Elements** - 9 input and form components
5. **Status Indicators** - 6 loading and status components
6. **Advanced Components** - Complex layouts and interactions
7. **Accessibility Testing** - Contrast and focus testing

## Quick Testing Workflow

### For Designers:
1. Start with **Light theme**
2. Enable **Labels** and **Class IDs**
3. Test each component section
4. Switch to **Dark theme** and repeat
5. Use **Device modes** to test responsive behavior

### For Developers:
1. Check **Console** for any errors
2. Test **Keyboard navigation** (Tab through components)
3. Verify **Focus indicators** are visible
4. Test **Theme switching** performance
5. Check **Animation smoothness**

### For QA:
1. Use **Accessibility tools** (screen readers, color contrast checkers)
2. Test **Form validation** states
3. Verify **Error states** are properly displayed
4. Check **Mobile responsiveness**

## URL Parameters for Testing

You can add URL parameters to control the initial state:

```bash
# Start with dark theme and labels hidden
http://localhost:5173/sampler?theme=dark&labels=false&classIds=false

# Start with mobile mode
http://localhost:5173/sampler?device=mobile
```

## Keyboard Shortcuts

The ComponentSampler supports these shortcuts:
- **H** - Toggle labels
- **I** - Toggle class IDs
- **T** - Toggle theme
- **D** - Cycle device modes
- **Escape** - Close any open modals

## Troubleshooting

### If ComponentSampler doesn't appear:
1. Check that `ComponentSampler` is imported in `AppElectron.tsx`
2. Verify the `component-sampler` stage is added to the StageContainer
3. Ensure the store has the correct stage name

### If styles are missing:
1. Check that CSS custom properties are loaded
2. Verify Tailwind classes are being generated
3. Ensure the component sampler styles are injected

### If animations are choppy:
1. Check browser performance settings
2. Verify GPU acceleration is enabled
3. Test in different browsers

## Integration with Existing Workflow

The ComponentSampler is designed to work alongside your existing development:

- **Development**: Use during component development and testing
- **Design Review**: Showcase components to stakeholders
- **Accessibility Testing**: Validate WCAG compliance
- **Quality Assurance**: Comprehensive component testing
- **Documentation**: Reference for component usage

## Next Steps

1. **Start the development server**
2. **Access the ComponentSampler** using one of the methods above
3. **Test your components** across themes, devices, and accessibility scenarios
4. **Identify any contrast or readability issues**
5. **Make necessary adjustments** to your design system

The ComponentSampler provides a comprehensive view of your entire Electron UI component ecosystem with easy identification of readability and contrast issues through visible labels and class IDs.