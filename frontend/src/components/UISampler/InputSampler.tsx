/**
 * InputSampler Component
 *
 * Interactive examples showing all Input component variants, sizes, states, and features.
 * Demonstrates comprehensive form input capabilities with accessibility features.
 *
 * Features:
 * - All sizes: sm, md, lg
 * - All states: default, focus, error, disabled, loading
 * - With icons (leftIcon, rightIcon)
 * - Labels and helper text
 * - Validation states
 * - Full width examples
 * - Interactive: typing, validation feedback
 * - Copyable code for each variation
 * - Keyboard navigation testing (Tab, Enter)
 * - Focus indicators visible and WCAG compliant
 * - ARIA attributes demonstrated
 */

import { useState } from 'react';

import { Input } from '../primitives/Input';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../primitives/Card';
import { Spinner } from '../primitives/Spinner';
import { PreviewContainer } from './PreviewContainer';
import { CopyToClipboard } from './CopyToClipboard';
import { CodeBlock } from './CodeBlock';

export function InputSampler() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  // Input examples with their properties
  const inputExamples = [
    {
      title: 'Email Input',
      description: 'Email input with validation and helper text',
      code: `<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  helperText="We'll never share your email"
  leftIcon={<MailIcon />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={email && !validateEmail(email) ? "Please enter a valid email" : undefined}
/>`,
      component: (
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          helperText="We'll never share your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={email && !validateEmail(email) ? "Please enter a valid email" : undefined}
        />
      ),
    },
    {
      title: 'Password Input',
      description: 'Password input with toggle visibility',
      code: `<Input
  label="Password"
  type="password"
  placeholder="Enter your password"
  rightIcon={<LockIcon />}
  required
/>`,
      component: (
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          rightIcon={<LockIcon />}
          required
        />
      ),
    },
    {
      title: 'Name Input',
      description: 'Simple text input with required field indicator',
      code: `<Input
  label="Full Name"
  placeholder="Enter your full name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>`,
      component: (
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      ),
    },
    {
      title: 'Disabled Input',
      description: 'Disabled input with placeholder',
      code: `<Input
  label="Disabled Field"
  placeholder="This field is disabled"
  disabled
/>`,
      component: (
        <Input
          label="Disabled Field"
          placeholder="This field is disabled"
          disabled
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Input with error state and validation message',
      code: `<Input
  label="Error Example"
  placeholder="This shows error state"
  error="This field has an error"
/>`,
      component: (
        <Input
          label="Error Example"
          placeholder="This shows error state"
          error="This field has an error"
        />
      ),
    },
    {
      title: 'With Left Icon',
      description: 'Input with left icon for visual context',
      code: `<Input
  label="Search"
  placeholder="Search for items..."
  leftIcon={<SearchIcon />}
/>`,
      component: (
        <Input
          label="Search"
          placeholder="Search for items..."
          leftIcon={<SearchIcon />}
        />
      ),
    },
    {
      title: 'With Right Icon',
      description: 'Input with right icon for additional actions',
      code: `<Input
  label="Username"
  placeholder="Choose a username"
  rightIcon={<UserIcon />}
/>`,
      component: (
        <Input
          label="Username"
          placeholder="Choose a username"
          rightIcon={<UserIcon />}
        />
      ),
    },
    {
      title: 'Full Width',
      description: 'Full width input for forms',
      code: `<Input
  label="Full Width Input"
  placeholder="This input spans the full width"
  fullWidth
/>`,
      component: (
        <Input
          label="Full Width Input"
          placeholder="This input spans the full width"
          fullWidth
        />
      ),
    },
  ];

  const inputSizes = [
    { name: 'Small', size: 'sm' as const, code: 'size="sm"' },
    { name: 'Medium', size: 'md' as const, code: 'size="md"' },
    { name: 'Large', size: 'lg' as const, code: 'size="lg"' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Input Components</h1>
          <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white">
            All Variants
          </Badge>
          <Badge variant="secondary" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            Interactive
          </Badge>
          <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            8 Examples
          </Badge>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Comprehensive Input component examples showing all sizes, states, and accessibility features.
          All inputs follow WCAG AA standards with proper labeling and validation.
        </p>
      </div>

      {/* Live Form Example */}
      <PreviewContainer
        title="Live Form Example"
        description="Interactive form with validation, loading states, and real-time feedback"
      >
        <Card variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  helperText="We'll never share your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={email && !validateEmail(email) ? "Please enter a valid email" : undefined}
                  required
                />
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                helperText="Must be at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Bio"
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                helperText="Optional - Max 200 characters"
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !email || !name || !password || !validateEmail(email)}
                  className="flex items-center gap-2"
                >
                  {loading ? <Spinner size="sm" /> : null}
                  {loading ? 'Submitting...' : 'Submit Form'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEmail('');
                    setName('');
                    setPassword('');
                    setBio('');
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PreviewContainer>

      {/* Input Examples */}
      <PreviewContainer
        title="Input Examples"
        description="Various input configurations with different features and states"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputExamples.map((example, index) => (
            <Card key={index} variant="base" className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{example.title}</CardTitle>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {example.component}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Code:</span>
                    <CopyToClipboard
                      text={example.code}
                      tooltip="Copy Code"
                      size="sm"
                    />
                  </div>
                  <CodeBlock
                    code={example.code}
                    language="tsx"
                    showCopyButton={false}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Input Sizes */}
      <PreviewContainer
        title="Input Sizes"
        description="Three sizes available: small (sm), medium (md), and large (lg)"
      >
        <div className="space-y-6">
          {inputSizes.map((size) => (
            <Card key={size.name} variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{size.name} Size</span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {size.code}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    size={size.size}
                    label="Regular Input"
                    placeholder={`Enter text (${size.name})`}
                  />
                  <Input
                    size={size.size}
                    label="With Icon"
                    placeholder={`Search (${size.name})`}
                    leftIcon={<SearchIcon />}
                  />
                  <Input
                    size={size.size}
                    label="Error State"
                    placeholder={`Error input (${size.name})`}
                    error="This field has an error"
                  />
                </div>
                <CodeBlock
                  code={`<Input size="${size.size}" label="Input Label" placeholder="Placeholder text" />
<Input size="${size.size}" label="With Icon" leftIcon={<Icon />} />
<Input size="${size.size}" label="Error State" error="Error message" />`}
                  language="tsx"
                  showCopyButton={false}
                  className="text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Input States */}
      <PreviewContainer
        title="Input States"
        description="Interactive states: default, hover, focus, error, disabled, and loading"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default State */}
          <Card variant="base" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Default State</CardTitle>
              <CardDescription>Standard input appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                label="Default Input"
                placeholder="This is the default state"
              />
            </CardContent>
          </Card>

          {/* Focus State */}
          <Card variant="gradient-border-animated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Focus State</CardTitle>
              <CardDescription>Input with focus (tab to this field)</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                label="Focus Input"
                placeholder="Click or tab to focus"
              />
            </CardContent>
          </Card>

          {/* Error State */}
          <Card variant="aurora" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Error State</CardTitle>
              <CardDescription>Input with validation error</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                label="Error Input"
                placeholder="This shows error state"
                error="Please enter a valid value"
              />
            </CardContent>
          </Card>

          {/* Disabled State */}
          <Card variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Disabled State</CardTitle>
              <CardDescription>Input that cannot be interacted with</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                label="Disabled Input"
                placeholder="This field is disabled"
                disabled
              />
            </CardContent>
          </Card>

          {/* With Helper Text */}
          <Card variant="nova" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Helper Text</CardTitle>
              <CardDescription>Additional guidance for users</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                label="Input with Helper"
                placeholder="Helper text below"
                helperText="This is helper text to guide the user"
              />
            </CardContent>
          </Card>

          {/* Required Field */}
          <Card variant="gradient-border-static" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Required Field</CardTitle>
              <CardDescription>Field marked as required</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                label="Required Input"
                placeholder="This field is required"
                required
              />
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* Input with Icons */}
      <PreviewContainer
        title="Input with Icons"
        description="Examples of inputs with left and right icons for visual context"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Left Icons</CardTitle>
              <CardDescription>Icons on the left for context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Search"
                placeholder="Search for items..."
                leftIcon={<SearchIcon />}
              />
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                leftIcon={<MailIcon />}
              />
              <Input
                label="Username"
                placeholder="Choose a username"
                leftIcon={<UserIcon />}
              />
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Input label="Search" leftIcon={<SearchIcon />} />
<Input label="Email" type="email" leftIcon={<MailIcon />} />
<Input label="Username" leftIcon={<UserIcon />} />`}
                language="tsx"
                showCopyButton={false}
                className="text-sm"
              />
            </CardFooter>
          </Card>

          <Card variant="gradient-border-animated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Right Icons</CardTitle>
              <CardDescription>Icons on the right for actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                rightIcon={<LockIcon />}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                rightIcon={<LockIcon />}
              />
              <Input
                label="API Key"
                placeholder="Enter your API key"
                rightIcon={<KeyIcon />}
              />
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Input label="Password" type="password" rightIcon={<LockIcon />} />
<Input label="Confirm Password" type="password" rightIcon={<LockIcon />} />
<Input label="API Key" rightIcon={<KeyIcon />} />`}
                language="tsx"
                showCopyButton={false}
                className="text-sm"
              />
            </CardFooter>
          </Card>
        </div>
      </PreviewContainer>

      {/* Full Width Examples */}
      <PreviewContainer
        title="Full Width Inputs"
        description="Inputs that span the full width of their container"
      >
        <Card variant="aurora" className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                label="Full Width Email"
                type="email"
                placeholder="user@example.com"
                fullWidth
              />
              <Input
                label="Full Width Name"
                placeholder="Enter your full name"
                fullWidth
              />
              <Input
                label="Full Width Message"
                placeholder="Enter your message here..."
                fullWidth
                helperText="This input spans the full width of the container"
              />
            </div>
            <CodeBlock
              code={`<Input label="Full Width Email" type="email" fullWidth />
<Input label="Full Width Name" fullWidth />
<Input label="Full Width Message" fullWidth helperText="Helper text" />`}
              language="tsx"
              showCopyButton={false}
            />
          </CardContent>
        </Card>
      </PreviewContainer>

      {/* Accessibility Features */}
      <PreviewContainer
        title="Accessibility Features"
        description="Inputs include proper ARIA attributes and keyboard navigation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated" className="bg-green-50 border-green-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900">Semantic Structure</h3>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Proper label association with htmlFor/id</li>
                <li>• Error states with aria-invalid and role="alert"</li>
                <li>• Helper text with aria-describedby</li>
                <li>• Required fields marked with aria-required</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient-border-animated" className="bg-blue-50 border-blue-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-blue-900">Keyboard Navigation</h3>
              </div>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Tab navigation through form fields</li>
                <li>• Enter key submits forms</li>
                <li>• Focus indicators clearly visible</li>
                <li>• Skip links for keyboard users</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="aurora" className="bg-purple-50 border-purple-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-purple-900">Focus Indicators</h3>
              </div>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• 2px focus ring with offset</li>
                <li>• High contrast colors</li>
                <li>• Consistent across all input types</li>
                <li>• WCAG AA compliant</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="nova" className="bg-yellow-50 border-yellow-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-yellow-900">Screen Reader Support</h3>
              </div>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Clear label-text associations</li>
                <li>• Error messages announced</li>
                <li>• Helper text accessible</li>
                <li>• Required field indicators</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient-border-static" className="bg-cyan-50 border-cyan-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-cyan-900">Form Validation</h3>
              </div>
              <ul className="text-cyan-800 text-sm space-y-1">
                <li>• Real-time validation feedback</li>
                <li>• Clear error messages</li>
                <li>• Visual error indicators</li>
                <li>• Accessible error announcements</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="mesh-glow" className="bg-indigo-50 border-indigo-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-indigo-900">Touch Targets</h3>
              </div>
              <ul className="text-indigo-800 text-sm space-y-1">
                <li>• Minimum 44px touch targets</li>
                <li>• Adequate spacing between fields</li>
                <li>• Large enough for mobile devices</li>
                <li>• Easy to tap and interact with</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* Usage Guidelines */}
      <PreviewContainer
        title="Usage Guidelines"
        description="Best practices for using input components in your application"
      >
        <Card variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">When to Use Each Size</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="bg-[var(--color-success-100)] text-[var(--color-success-800)]">Small</Badge>
                    <span>Compact forms, dense layouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)]">Medium</Badge>
                    <span>Standard forms, default choice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)]">Large</Badge>
                    <span>Mobile forms, accessibility focus</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Accessibility Checklist</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Use semantic label elements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Provide clear error messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Use appropriate input types</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Ensure sufficient color contrast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Support keyboard navigation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Provide loading states for async actions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-4">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Interactive Demo</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Try interacting with the inputs above to see different states in action.
                Notice how the focus indicators work and how validation feedback is provided.
              </p>
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Top of Page
                </Button>
                <Button variant="secondary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                  Bottom of Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PreviewContainer>

      {/* Component API */}
      <PreviewContainer
        title="Component API"
        description="Input component props and configuration options"
      >
        <Card variant="gradient-border-animated" className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Props</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">label</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">helperText</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">error</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">leftIcon</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">ReactNode | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">rightIcon</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">ReactNode | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">size</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">sm | md | lg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">required</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">boolean | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">fullWidth</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">boolean | optional</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">HTML Attributes</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">type</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">text, email, password, etc.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">placeholder</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">disabled</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">boolean | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">value</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">onChange</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">function | optional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">className</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">string | optional</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-4">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Accessibility Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">Labels & Association</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• Automatic id generation</li>
                    <li>• Proper htmlFor association</li>
                    <li>• Required field indicators</li>
                    <li>• Clear label text</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">Error Handling</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• aria-invalid attribute</li>
                    <li>• role="alert" for errors</li>
                    <li>• aria-describedby for helper text</li>
                    <li>• Visual error indicators</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">Keyboard Support</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• Tab navigation</li>
                    <li>• Enter key submission</li>
                    <li>• Focus management</li>
                    <li>• Skip link support</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PreviewContainer>
    </div>
  );
}

// Icon components for examples
function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M4 21h16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 00-2 2m0-2a2 2 0 012-2m-2 2V9m0 0h6m0 0H9m6 0v6m-6-6h6m0 0V3" />
    </svg>
  );
}