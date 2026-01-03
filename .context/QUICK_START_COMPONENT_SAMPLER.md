# ComponentSampler Quick Start Guide

## 🚀 **Quick Access Methods**

### **Method 1: Floating Button (Easiest)**
1. Start your development server: `npm run dev`
2. Navigate to your Electron app in browser
3. Look for the **purple 🎨 button** in the top-right corner
4. Click it to instantly open the ComponentSampler!

### **Method 2: URL Parameter**
Add `?sampler=true` to your app URL:
```
http://localhost:5173/?sampler=true
```
The ComponentSampler will open automatically.

### **Method 3: Direct Stage Access**
In your `AppElectron.tsx`, temporarily change the initial stage:
```tsx
// In your useEffect or useState
useDocumentStore.getState().setStage('component-sampler');
```

## 🎨 **What You'll See**

The ComponentSampler showcases **45+ components** across 7 sections:

### **1. Buttons** (12 variants)
- Primary, Secondary, Ghost, Outline
- Aurora, Nova (animated gradients)
- Loading states, sizes, icons

### **2. Badges** (10 variants)
- Success, Error, Warning, Info
- Aurora, Nova gradients
- Different sizes

### **3. Cards** (6 variants)
- Base, Elevated, Outlined
- Mesh Glow, Gradient Border
- Interactive hover effects

### **4. Form Elements** (9 components)
- Inputs, Textarea, Select
- All states: error, success, disabled

### **5. Status Indicators** (6 components)
- Spinners, Progress rings
- Tooltips, Stage indicators

### **6. Advanced Components**
- Complex layouts, responsive grids
- Theme toggle, accessibility tools

### **7. Accessibility Testing**
- Contrast testing
- Focus state validation

## 🎛️ **Interactive Controls**

### **Header Controls:**
- **Theme Toggle** - Switch Light/Dark
- **Device Mode** - Desktop/Tablet/Mobile
- **Label Toggle** - Show/hide component names
- **Class ID Toggle** - Show/hide CSS classes

### **Keyboard Shortcuts:**
- **H** - Toggle labels
- **I** - Toggle class IDs
- **T** - Toggle theme
- **D** - Cycle device modes
- **Escape** - Close modals

## 🧪 **Testing Workflow**

### **For Designers:**
1. Start with **Light theme**
2. Enable **Labels** and **Class IDs**
3. Test each component section
4. Switch to **Dark theme** and repeat
5. Use **Device modes** for responsive testing

### **For Developers:**
1. Check **Console** for errors
2. Test **Keyboard navigation**
3. Verify **Focus indicators**
4. Test **Theme switching**
5. Check **Animation performance**

### **For QA:**
1. Use **Accessibility tools**
2. Test **Form validation**
3. Verify **Error states**
4. Check **Mobile responsiveness**

## 🎯 **Quick Testing Checklist**

- [ ] All components visible in Light theme
- [ ] All components visible in Dark theme
- [ ] Text contrast meets WCAG AA standards
- [ ] Buttons have visible focus indicators
- [ ] Form elements show proper states
- [ ] Animations are smooth and performant
- [ ] Components work on all device sizes
- [ ] Keyboard navigation works correctly

## 🔧 **Development Features**

### **Visible Labels**
Every component shows:
- **Component name** (e.g., "Primary Button")
- **CSS class ID** (e.g., "btn-primary")
- **Description** of purpose and usage

### **Class ID Visibility**
Toggle to see CSS classes:
- Component base classes
- State classes (active, completed)
- Variant classes (gradient-border-animated)
- Size classes (size-sm, size-lg)

### **Theme Testing**
- Instant theme switching
- Contrast validation
- Color consistency checks

## 📱 **Mobile Testing**

Use the **Device Mode** controls:
- **Desktop** - Full layout testing
- **Tablet** - Medium screen validation
- **Mobile** - Touch and spacing verification

## 🐛 **Troubleshooting**

### **ComponentSampler not showing:**
- Check browser console for errors
- Verify `ComponentSampler` is imported in `AppElectron.tsx`
- Ensure `component-sampler` stage is in `StageContainer`

### **Styles missing:**
- Check CSS custom properties are loaded
- Verify Tailwind classes are generated
- Look for CSS injection errors in console

### **Animations choppy:**
- Check browser performance settings
- Verify GPU acceleration enabled
- Test in different browsers

## 🎉 **Success!**

You now have access to a comprehensive component testing suite that will help you:

- **Identify readability issues** across themes
- **Validate contrast ratios** for accessibility
- **Test component behavior** in different contexts
- **Ensure consistent styling** across your design system
- **Validate responsive design** across device sizes

The ComponentSampler is your go-to tool for ensuring your Electron UI maintains high quality, accessibility, and consistency across all components and themes!