/**
 * ButtonSampler Component
 *
 * Complete Button component examples showing all variants, sizes, states, and accessibility features.
 * Demonstrates all 11 variants defined in the existing Button component.
 *
 * Features:
 * - All variants: primary, secondary, accent, outline, ghost, danger, aurora, nova, aurora-fast, aurora-static, gradient-primary
 * - All sizes: sm, md, lg
 * - States: default, hover, active, focus, disabled, loading
 * - With icons (leftIcon, rightIcon)
 * - Full width examples
 * - Interactive: clicking buttons demonstrates functionality
 * - Copyable code for each variation
 * - Keyboard navigation testing (Tab, Enter, Space)
 * - Focus indicators visible and WCAG compliant
 * - ARIA attributes demonstrated
 */

import { useState } from 'react';

import { Button } from '../primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { PreviewContainer } from './PreviewContainer';
import { CopyToClipboard } from './CopyToClipboard';
import { CodeBlock } from './CodeBlock';

export function ButtonSampler() {
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const handleButtonClick = (buttonName: string, hasLoading: boolean = false) => {
    setClickedButton(buttonName);

    if (hasLoading) {
      setLoadingButton(buttonName);
      setTimeout(() => {
        setLoadingButton(null);
      }, 2000);
    }

    setTimeout(() => {
      setClickedButton(null);
    }, 1000);
  };

  // Button variants and their properties
  const buttonVariants = [
    {
      name: 'Primary',
      variant: 'primary' as const,
      description: 'Main action button',
      code: '<Button variant="primary">Primary</Button>',
      icon: '🚀',
    },
    {
      name: 'Secondary',
      variant: 'secondary' as const,
      description: 'Secondary action button',
      code: '<Button variant="secondary">Secondary</Button>',
      icon: '⚡',
    },
    {
      name: 'Accent',
      variant: 'accent' as const,
      description: 'Accent color button',
      code: '<Button variant="accent">Accent</Button>',
      icon: '✨',
    },
    {
      name: 'Outline',
      variant: 'outline' as const,
      description: 'Outline style button',
      code: '<Button variant="ghost">Outline</Button>',
      icon: '📝',
    },
    {
      name: 'Ghost',
      variant: 'ghost' as const,
      description: 'Ghost style button',
      code: '<Button variant="ghost">Ghost</Button>',
      icon: '👻',
    },
    {
      name: 'Danger',
      variant: 'danger' as const,
      description: 'Destructive action button',
      code: '<Button variant="danger">Danger</Button>',
      icon: '⚠️',
    },
    {
      name: 'Aurora',
      variant: 'aurora' as const,
      description: 'Animated aurora gradient border',
      code: '<Button variant="aurora">Aurora</Button>',
      icon: '🌈',
    },
    {
      name: 'Nova',
      variant: 'nova' as const,
      description: 'Animated nova gradient border',
      code: '<Button variant="nova">Nova</Button>',
      icon: '⭐',
    },
    {
      name: 'Aurora Fast',
      variant: 'aurora-fast' as const,
      description: 'Fast animated aurora border',
      code: '<Button variant="aurora-fast">Aurora Fast</Button>',
      icon: '⚡',
    },
    {
      name: 'Aurora Static',
      variant: 'aurora-static' as const,
      description: 'Static aurora gradient border',
      code: '<Button variant="aurora-static">Aurora Static</Button>',
      icon: '🎨',
    },
    {
      name: 'Gradient Primary',
      variant: 'gradient-primary' as const,
      description: 'Primary gradient background',
      code: '<Button variant="gradient-primary">Gradient</Button>',
      icon: '📈',
    },
  ];

  const buttonSizes = [
    { name: 'Small', size: 'sm' as const, code: 'size="sm"' },
    { name: 'Medium', size: 'md' as const, code: 'size="md"' },
    { name: 'Large', size: 'lg' as const, code: 'size="lg"' },
  ];

  const buttonStates = [
    { name: 'Default', state: 'default', code: 'Default state' },
    { name: 'Hover', state: 'hover', code: 'Hover state' },
    { name: 'Active', state: 'active', code: 'Active state' },
    { name: 'Focus', state: 'focus', code: 'Focus state' },
    { name: 'Disabled', state: 'disabled', code: 'disabled={true}' },
    { name: 'Loading', state: 'loading', code: 'loading={true}' },
  ];

  const iconExamples = [
    { name: 'Left Icon', icon: '⬅️', position: 'left' },
    { name: 'Right Icon', icon: '➡️', position: 'right' },
    { name: 'Both Icons', leftIcon: '⬅️', rightIcon: '➡️' },
    { name: 'No Icons', icon: null },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Button Components</h1>
          <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white">
            All Variants
          </Badge>
          <Badge variant="secondary" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            Interactive
          </Badge>
          <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            11 Variants
          </Badge>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Complete Button component examples showing all 11 variants, 3 sizes, and all interactive states.
          All buttons are fully functional with proper accessibility features.
        </p>
      </div>

      {/* All Variants */}
      <PreviewContainer
        title="Button Variants"
        description="All 11 button variants with descriptions and usage examples"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buttonVariants.map((btn) => (
            <Card key={btn.name} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{btn.name}</span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {btn.variant}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-[var(--color-text-secondary)]">{btn.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={btn.variant}
                    size="md"
                    onClick={() => handleButtonClick(btn.name)}
                    className={clickedButton === btn.name ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                  >
                    {btn.icon} {btn.name}
                  </Button>
                  <Button
                    variant={btn.variant}
                    size="sm"
                    onClick={() => handleButtonClick(btn.name)}
                    className={clickedButton === btn.name ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                  >
                    {btn.icon} Small
                  </Button>
                  <Button
                    variant={btn.variant}
                    size="lg"
                    onClick={() => handleButtonClick(btn.name)}
                    className={clickedButton === btn.name ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                  >
                    {btn.icon} Large
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Usage:</p>
                  <CodeBlock
                    code={btn.code}
                    language="tsx"
                    showCopyButton={false}
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <CopyToClipboard
                    text={btn.code}
                    tooltip="Copy Code"
                    size="sm"
                  />
                  <CopyToClipboard
                    text={`variant="${btn.variant}"`}
                    tooltip="Copy Variant"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Button Sizes */}
      <PreviewContainer
        title="Button Sizes"
        description="Three sizes: Small (sm), Medium (md), and Large (lg)"
      >
        <div className="space-y-6">
          {buttonSizes.map((size) => (
            <Card key={size.name} className="hover:shadow-xl transition-shadow duration-300">
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
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Primary</p>
                    <Button
                      variant="primary"
                      size={size.size}
                      onClick={() => handleButtonClick(`${size.name} Primary`)}
                      className={clickedButton === `${size.name} Primary` ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                    >
                      Primary
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Secondary</p>
                    <Button
                      variant="secondary"
                      size={size.size}
                      onClick={() => handleButtonClick(`${size.name} Secondary`)}
                      className={clickedButton === `${size.name} Secondary` ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                    >
                      Secondary
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Ghost</p>
                    <Button
                      variant="ghost"
                      size={size.size}
                      onClick={() => handleButtonClick(`${size.name} Ghost`)}
                      className={clickedButton === `${size.name} Ghost` ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                    >
                      Ghost
                    </Button>
                  </div>
                </div>
                <CodeBlock
                  code={`<Button variant="primary" ${size.code}>Primary</Button>
<Button variant="secondary" ${size.code}>Secondary</Button>
<Button variant="ghost" ${size.code}>Ghost</Button>`}
                  language="tsx"
                  showCopyButton={false}
                  className="text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Button States */}
      <PreviewContainer
        title="Button States"
        description="Interactive states: default, hover, active, focus, disabled, and loading"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buttonStates.map((state) => (
            <Card key={state.name} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{state.name}</span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {state.state}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Example</p>
                  {state.state === 'disabled' ? (
                    <Button
                      variant="primary"
                      disabled
                      onClick={() => handleButtonClick(`Disabled ${state.name}`)}
                    >
                      Disabled Button
                    </Button>
                  ) : state.state === 'loading' ? (
                    <Button
                      variant="primary"
                      loading={loadingButton === `Loading ${state.name}`}
                      onClick={() => handleButtonClick(`Loading ${state.name}`, true)}
                    >
                      Loading Button
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleButtonClick(`Interactive ${state.name}`)}
                      className={clickedButton === `Interactive ${state.name}` ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                    >
                      Interactive Button
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Code</p>
                  <CodeBlock
                    code={state.code}
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

      {/* Icon Examples */}
      <PreviewContainer
        title="Icon Examples"
        description="Buttons with left icons, right icons, and both icons"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {iconExamples.map((example, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{example.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Example</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      leftIcon={example.leftIcon || (example.position === 'left' ? example.icon : undefined)}
                      rightIcon={example.rightIcon || (example.position === 'right' ? example.icon : undefined)}
                      onClick={() => handleButtonClick(`Icon ${example.name}`)}
                      className={clickedButton === `Icon ${example.name}` ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                    >
                      {example.name}
                    </Button>
                    <Button
                      variant="secondary"
                      leftIcon={example.leftIcon || (example.position === 'left' ? example.icon : undefined)}
                      rightIcon={example.rightIcon || (example.position === 'right' ? example.icon : undefined)}
                      onClick={() => handleButtonClick(`Icon ${example.name} Secondary`)}
                      className={clickedButton === `Icon ${example.name} Secondary` ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                    >
                      {example.name}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Code</p>
                  <CodeBlock
                    code={`<Button variant="primary" ${
                      example.leftIcon ? `leftIcon={${JSON.stringify(example.leftIcon)}} ` : ''
                    }${
                      example.rightIcon ? `rightIcon={${JSON.stringify(example.rightIcon)}} ` : ''
                    }>
  ${example.name}
</Button>`}
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

      {/* Full Width Examples */}
      <PreviewContainer
        title="Full Width Buttons"
        description="Buttons that span the full width of their container"
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleButtonClick('Full Width Primary')}
                className={clickedButton === 'Full Width Primary' ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
              >
                Full Width Primary Button
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleButtonClick('Full Width Secondary')}
                className={clickedButton === 'Full Width Secondary' ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
              >
                Full Width Secondary Button
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => handleButtonClick('Full Width Danger')}
                className={clickedButton === 'Full Width Danger' ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
              >
                Full Width Danger Button
              </Button>
            </div>
            <CodeBlock
              code={`<Button variant="primary" fullWidth>
  Full Width Primary
</Button>
<Button variant="secondary" fullWidth>
  Full Width Secondary
</Button>
<Button variant="danger" fullWidth>
  Full Width Danger
</Button>`}
              language="tsx"
              showCopyButton={false}
            />
          </CardContent>
        </Card>
      </PreviewContainer>

      {/* Accessibility Features */}
      <PreviewContainer
        title="Accessibility Features"
        description="Buttons include proper ARIA attributes and keyboard navigation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900">ARIA Attributes</h3>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• aria-busy for loading states</li>
                <li>• aria-disabled for disabled states</li>
                <li>• aria-label for buttons without text</li>
                <li>• Proper button semantics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-blue-900">Keyboard Navigation</h3>
              </div>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Tab navigation between buttons</li>
                <li>• Enter/Space to activate</li>
                <li>• Visible focus indicators</li>
                <li>• Focus trapping in modals</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-purple-900">Focus Indicators</h3>
              </div>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• 2px focus ring with offset</li>
                <li>• High contrast colors</li>
                <li>• Consistent across variants</li>
                <li>• WCAG AA compliant</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-yellow-900">Loading States</h3>
              </div>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Animated spinner icon</li>
                <li>• Disabled state during loading</li>
                <li>• Cursor changes to wait</li>
                <li>• aria-busy attribute</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* Usage Guidelines */}
      <PreviewContainer
        title="Usage Guidelines"
        description="Best practices for using button variants in your application"
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">When to Use Each Variant</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="bg-[var(--color-success-100)] text-[var(--color-success-800)]">Primary</Badge>
                    <span>Main actions, primary calls to action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)]">Secondary</Badge>
                    <span>Secondary actions, less prominent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)]">Accent</Badge>
                    <span>Highlight important but not primary actions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">Outline</Badge>
                    <span>Subtle actions, form buttons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">Ghost</Badge>
                    <span>Minimal UI, toolbar buttons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="error" className="bg-[var(--color-error-100)] text-[var(--color-error-800)]">Danger</Badge>
                    <span>Destructive actions, deletions</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Accessibility Checklist</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Use semantic button elements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Provide clear focus indicators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Use appropriate aria attributes</span>
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
                Try clicking the buttons above to see different states in action. Notice how the focus indicators
                work and how loading states behave.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="gradient-primary"
                  onClick={() => handleButtonClick('Demo Gradient')}
                  className={clickedButton === 'Demo Gradient' ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                >
                  🎨 Try Me!
                </Button>
                <Button
                  variant="aurora"
                  onClick={() => handleButtonClick('Demo Aurora', true)}
                  loading={loadingButton === 'Demo Aurora'}
                  className={clickedButton === 'Demo Aurora' ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                >
                  🌈 Loading Demo
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleButtonClick('Demo Danger')}
                  className={clickedButton === 'Demo Danger' ? 'ring-2 ring-[var(--color-interactive-primary-base)]' : ''}
                >
                  ⚠️ Danger Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PreviewContainer>
    </div>
  );
}

/**
 * ButtonQuickReference Component
 *
 * Compact reference for button variants and usage.
 */
export function ButtonQuickReference() {
  return (
    <Card className="bg-[var(--color-surface-secondary)] border-[var(--color-border-subtle)]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Button Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-[var(--color-text-secondary)]">Variants (11)</p>
            <ul className="space-y-1 text-[var(--color-text-primary)]">
              <li>• primary, secondary, accent</li>
              <li>• outline, ghost, danger</li>
              <li>• aurora, nova, aurora-fast</li>
              <li>• aurora-static, gradient-primary</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-secondary)]">Sizes (3)</p>
            <ul className="space-y-1 text-[var(--color-text-primary)]">
              <li>• sm: 36px height</li>
              <li>• md: 40px height (default)</li>
              <li>• lg: 48px height</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-secondary)]">States</p>
            <ul className="space-y-1 text-[var(--color-text-primary)]">
              <li>• default, hover, active</li>
              <li>• focus, disabled, loading</li>
              <li>• fullWidth, with icons</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}