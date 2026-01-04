# Design System Usage Examples

Comprehensive examples demonstrating how to use all design system components and features.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Components](#components)
3. [Hooks](#hooks)
4. [Theme Management](#theme-management)
5. [Responsive Design](#responsive-design)
6. [Complete Examples](#complete-examples)

## Basic Setup

### App Root Setup

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './design-system/ThemeProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

## Components

### Button

```tsx
import { Button } from './design-system/components';
import { Download, Check } from 'lucide-react';

// Primary button
<Button variant="primary" size="md" onClick={handleClick}>
  Primary Action
</Button>

// Secondary button with icon
<Button variant="secondary" leftIcon={<Download />}>
  Download
</Button>

// Outline button
<Button variant="outline" onClick={handleCancel}>
  Cancel
</Button>

// Ghost button
<Button variant="ghost" onClick={handleSkip}>
  Skip
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Loading state
<Button variant="primary" loading={isSubmitting}>
  Submitting...
</Button>

// Full width
<Button variant="primary" fullWidth>
  Submit Form
</Button>

// With right icon
<Button variant="primary" rightIcon={<Check />}>
  Complete
</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './design-system/components';

// Basic card
<Card>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>

// Elevated card with header and footer
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>This is a description of the card</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content area</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>

// Interactive card
<Card variant="outlined" interactive onClick={handleCardClick}>
  <CardContent>
    <p>Click me!</p>
  </CardContent>
</Card>
```

### Input

```tsx
import { Input } from './design-system/components';
import { Mail, Search } from 'lucide-react';

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  required
/>

// Input with icon
<Input
  label="Email"
  type="email"
  leftIcon={<Mail />}
  placeholder="your@email.com"
/>

// Input with error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// Input with helper text
<Input
  label="Username"
  helperText="Choose a unique username"
/>

// Large input
<Input
  label="Full Name"
  size="lg"
  fullWidth
/>
```

### Textarea

```tsx
import { Textarea } from './design-system/components';

<Textarea
  label="Description"
  placeholder="Enter a detailed description"
  rows={5}
  helperText="Minimum 50 characters"
  required
/>

<Textarea
  label="Comments"
  error="This field is required"
  rows={4}
/>
```

### Select

```tsx
import { Select } from './design-system/components';

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];

<Select
  label="Country"
  value={selectedCountry}
  onChange={(e) => setSelectedCountry(e.target.value)}
  options={countries}
  placeholder="Select a country"
  required
/>

<Select
  label="Priority"
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]}
  error="Please select a priority"
/>
```

### Modal

```tsx
import { Modal, ModalContent, ModalFooter, Button } from './design-system/components';

const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
  
  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Confirm Action"
    size="md"
  >
    <ModalContent>
      <p>Are you sure you want to delete this item? This action cannot be undone.</p>
    </ModalContent>
    <ModalFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </ModalFooter>
  </Modal>
</>
```

### Tooltip

```tsx
import { Tooltip, Button } from './design-system/components';

// Basic tooltip
<Tooltip content="This is a helpful tooltip">
  <Button>Hover me</Button>
</Tooltip>

// Tooltip with different positions
<Tooltip content="Top tooltip" position="top">
  <Button>Top</Button>
</Tooltip>

<Tooltip content="Bottom tooltip" position="bottom">
  <Button>Bottom</Button>
</Tooltip>

<Tooltip content="Left tooltip" position="left">
  <Button>Left</Button>
</Tooltip>

<Tooltip content="Right tooltip" position="right">
  <Button>Right</Button>
</Tooltip>

// Tooltip with custom delay
<Tooltip content="Delayed tooltip" delay={500}>
  <Button>Hover after delay</Button>
</Tooltip>
```

### Badge

```tsx
import { Badge } from './design-system/components';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>

// Color badges
<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="accent">Accent</Badge>

// Sizes
<Badge variant="success" size="sm">Small</Badge>
<Badge variant="success" size="md">Medium</Badge>
<Badge variant="success" size="lg">Large</Badge>
```

### Spinner

```tsx
import { Spinner } from './design-system/components';

// Basic spinner
<Spinner />

// Different sizes
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />

// Different variants
<Spinner variant="primary" />
<Spinner variant="secondary" />
<Spinner variant="accent" />
<Spinner variant="neutral" />

// With custom label
<Spinner label="Loading data..." />
```

## Hooks

### useMediaQuery

```tsx
import { useMediaQuery, breakpoints } from './design-system/hooks';

function ResponsiveComponent() {
  const isMobile = useMediaQuery(breakpoints.mobile);
  const isTablet = useMediaQuery(breakpoints.tablet);
  const isDesktop = useMediaQuery(breakpoints.desktop);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  
  if (isMobile) {
    return <MobileLayout />;
  }
  
  if (isTablet) {
    return <TabletLayout />;
  }
  
  return <DesktopLayout />;
}
```

### useClickOutside

```tsx
import { useRef } from 'react';
import { useClickOutside } from './design-system/hooks';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(dropdownRef, () => setIsOpen(false));
  
  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

### useDebounce

```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from './design-system/hooks';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <Input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Theme Management

### Theme Toggle

```tsx
import { ThemeToggle, useTheme } from './design-system/components';

function Header() {
  const { theme, resolvedTheme } = useTheme();
  
  return (
    <header>
      <ThemeToggle showLabels />
      <p>Current theme: {resolvedTheme}</p>
    </header>
  );
}
```

### Programmatic Theme Control

```tsx
import { useTheme } from './design-system/components';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Select
      label="Theme"
      value={theme}
      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
      options={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ]}
    />
  );
}
```

## Responsive Design

### Using CSS Custom Properties

```css
.my-component {
  padding: var(--spacing-md);
  
  @media (min-width: 768px) {
    padding: var(--spacing-lg);
  }
}
```

### Using useMediaQuery Hook

```tsx
import { useMediaQuery, breakpoints } from './design-system/hooks';

function ResponsiveCard() {
  const isDesktop = useMediaQuery(breakpoints.desktop);
  
  return (
    <Card padding={isDesktop ? 'lg' : 'md'}>
      <CardContent>
        {isDesktop ? <DesktopView /> : <MobileView />}
      </CardContent>
    </Card>
  );
}
```

## Complete Examples

### Form Example

```tsx
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  Button,
} from './design-system/components';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.message) newErrors.message = 'Message is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    // Submit form
    await submitForm(formData);
    setIsSubmitting(false);
  };
  
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
            fullWidth
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
            fullWidth
          />
          
          <Select
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            options={[
              { value: 'general', label: 'General Inquiry' },
              { value: 'support', label: 'Support' },
              { value: 'feedback', label: 'Feedback' },
            ]}
            placeholder="Select a subject"
            fullWidth
          />
          
          <Textarea
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            error={errors.message}
            rows={5}
            required
            fullWidth
          />
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            fullWidth
          >
            Send Message
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

### Confirmation Dialog Example

```tsx
import { useState } from 'react';
import { Modal, ModalContent, ModalFooter, Button } from './design-system/components';

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <ModalContent>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

---

For more information, see the [Design System README](./README.md).

