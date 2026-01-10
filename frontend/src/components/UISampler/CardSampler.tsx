/**
 * CardSampler Component
 *
 * Interactive examples showing all Card component variants, sizes, and states.
 * Demonstrates all 11 variants defined in the Card component.
 *
 * Features:
 * - All variants: base, elevated, outlined, filled, mesh-glow, mesh-glow-strong, gradient-border-animated, gradient-border-static, gradient-border-animated-fast, aurora, nova
 * - All padding sizes: none, sm, md, lg, xl
 * - States: default, interactive (hover)
 * - Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 * - With and without content
 * - Copyable code for each variation
 * - WCAG AA compliant with proper contrast ratios
 */


import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Spinner } from '../primitives/Spinner';
import { PreviewContainer } from './PreviewContainer';
import { CopyToClipboard } from './CopyToClipboard';
import { CodeBlock } from './CodeBlock';

export function CardSampler() {
  const handleCopyCard = (cardCode: string) => {
    navigator.clipboard.writeText(cardCode);
  };

  // Card variants and their properties
  const cardVariants = [
    {
      name: 'Base',
      variant: 'base' as const,
      description: 'Standard card with subtle border',
      code: '<Card variant="base">Content</Card>',
    },
    {
      name: 'Elevated',
      variant: 'elevated' as const,
      description: 'Card with shadow and elevation',
      code: '<Card variant="elevated">Content</Card>',
    },
    {
      name: 'Outlined',
      variant: 'outlined' as const,
      description: 'Card with strong border',
      code: '<Card variant="outlined">Content</Card>',
    },
    {
      name: 'Filled',
      variant: 'filled' as const,
      description: 'Card with filled background',
      code: '<Card variant="filled">Content</Card>',
    },
    {
      name: 'Mesh Glow',
      variant: 'mesh-glow' as const,
      description: 'Card with subtle mesh glow effect',
      code: '<Card variant="mesh-glow">Content</Card>',
    },
    {
      name: 'Mesh Glow Strong',
      variant: 'mesh-glow-strong' as const,
      description: 'Card with strong mesh glow effect',
      code: '<Card variant="mesh-glow-strong">Content</Card>',
    },
    {
      name: 'Gradient Border Animated',
      variant: 'gradient-border-animated' as const,
      description: 'Card with animated gradient border',
      code: '<Card variant="gradient-border-animated">Content</Card>',
    },
    {
      name: 'Gradient Border Static',
      variant: 'gradient-border-static' as const,
      description: 'Card with static gradient border',
      code: '<Card variant="gradient-border-static">Content</Card>',
    },
    {
      name: 'Gradient Border Fast',
      variant: 'gradient-border-animated-fast' as const,
      description: 'Card with fast animated gradient border',
      code: '<Card variant="gradient-border-animated-fast">Content</Card>',
    },
    {
      name: 'Aurora',
      variant: 'aurora' as const,
      description: 'Card with aurora gradient border',
      code: '<Card variant="aurora">Content</Card>',
    },
    {
      name: 'Nova',
      variant: 'nova' as const,
      description: 'Card with nova gradient border',
      code: '<Card variant="nova">Content</Card>',
    },
  ];

  const cardPaddings = [
    { name: 'None', padding: 'none' as const, code: 'padding="none"' },
    { name: 'Small', padding: 'sm' as const, code: 'padding="sm"' },
    { name: 'Medium', padding: 'md' as const, code: 'padding="md"' },
    { name: 'Large', padding: 'lg' as const, code: 'padding="lg"' },
    { name: 'Extra Large', padding: 'xl' as const, code: 'padding="xl"' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Card Components</h1>
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
          Complete Card component examples showing all 11 variants, 5 padding sizes, and sub-components.
          All cards follow WCAG AA contrast requirements.
        </p>
      </div>

      {/* All Variants */}
      <PreviewContainer
        title="Card Variants"
        description="All 11 card variants with descriptions and usage examples"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardVariants.map((card) => (
            <Card key={card.name} variant={card.variant} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{card.name}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)]">
                  This card demonstrates the {card.name.toLowerCase()} variant.
                  It includes a header with title and description, and content area.
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <CopyToClipboard
                    text={card.code}
                    tooltip="Copy Code"
                    size="sm"
                  />
                  <Button variant="ghost" size="sm">
                    Action
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Card Sizes */}
      <PreviewContainer
        title="Card Padding Sizes"
        description="Five padding options: none, small, medium, large, and extra large"
      >
        <div className="space-y-6">
          {cardPaddings.map((padding) => (
            <Card key={padding.name} variant="elevated" padding={padding.padding} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{padding.name} Padding</CardTitle>
                <CardDescription>{padding.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg">
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Content Area</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">This shows the padding around the content.</p>
                  </div>
                  <div className="p-4 bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg">
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Grid Item</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Demonstrates spacing with other elements.</p>
                  </div>
                  <div className="p-4 bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg">
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Third Column</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Shows consistent padding across columns.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <CodeBlock
                  code={`<Card variant="elevated" ${padding.code}>
  {/* Content here */}
</Card>`}
                  language="tsx"
                  showCopyButton={false}
                  className="text-sm"
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Sub-components */}
      <PreviewContainer
        title="Card Sub-components"
        description="Examples of all Card sub-components and their usage"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="gradient-border-animated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Card Header Example</CardTitle>
              <CardDescription>This shows the header with title and description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-primary)] mb-4">
                The CardHeader component provides structured layout for titles and descriptions.
                It automatically handles spacing and typography hierarchy.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-surface-base)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Feature 1</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Description of feature 1</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-base)] rounded-lg">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Feature 2</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Description of feature 2</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
              </div>
            </CardFooter>
          </Card>

          <Card variant="aurora" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Content and Footer</CardTitle>
              <CardDescription>CardContent and CardFooter examples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[var(--color-text-primary)]">
                CardContent is the main container for your card's content. It automatically
                inherits the correct text color for your theme.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[var(--color-surface-base)] rounded-lg">
                  <span className="text-[var(--color-text-primary)]">Item 1</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--color-surface-base)] rounded-lg">
                  <span className="text-[var(--color-text-primary)]">Item 2</span>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--color-surface-base)] rounded-lg">
                  <span className="text-[var(--color-text-primary)]">Item 3</span>
                  <Badge variant="error">Error</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <span className="text-[var(--color-text-secondary)] text-sm">Last updated: Today</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="danger" size="sm">Delete</Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </PreviewContainer>

      {/* Interactive Cards */}
      <PreviewContainer
        title="Interactive Cards"
        description="Cards with hover effects and interactive elements"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardVariants.filter(v => v.variant === 'elevated' || v.variant === 'aurora' || v.variant === 'nova').map((card) => (
            <Card
              key={card.name}
              variant={card.variant}
              interactive
              className="hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handleCopyCard(card.code)}
            >
              <CardHeader>
                <CardTitle>{card.name} (Interactive)</CardTitle>
                <CardDescription>Hover to see elevation effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  This card is interactive with hover effects. It elevates on hover
                  and includes a subtle translate animation.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-base)] rounded-lg">
                    <div className="w-3 h-3 bg-[var(--color-interactive-primary-base)] rounded-full"></div>
                    <span className="text-[var(--color-text-primary)]">Interactive element</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-base)] rounded-lg">
                    <div className="w-3 h-3 bg-[var(--color-interactive-accent-base)] rounded-full"></div>
                    <span className="text-[var(--color-text-primary)]">Another element</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Usage Examples */}
      <PreviewContainer
        title="Usage Examples"
        description="Real-world examples of how to use cards in different contexts"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Example profile card layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  JD
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">John Doe</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Senior Developer</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="primary">React</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="accent">Node.js</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button variant="primary" fullWidth>Contact</Button>
                <Button variant="ghost">View Profile</Button>
              </div>
            </CardFooter>
          </Card>

          {/* Statistics Card */}
          <Card variant="gradient-border-animated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Key metrics and data points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-[var(--color-surface-base)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">1,234</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Total Users</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-surface-base)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">98%</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-surface-base)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">4.8</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Avg Rating</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-surface-base)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">24/7</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Support</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" fullWidth>View Details</Button>
            </CardFooter>
          </Card>

          {/* Feature Card */}
          <Card variant="aurora" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Feature Highlight</CardTitle>
              <CardDescription>Showcase your product features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[var(--color-success-500)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)]">Feature One</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Description of the first amazing feature.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[var(--color-accent-500)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)]">Feature Two</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Description of the second amazing feature.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[var(--color-interactive-primary-base)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)]">Feature Three</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Description of the third amazing feature.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button variant="primary">Learn More</Button>
                <Button variant="ghost">Try Demo</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </PreviewContainer>

      {/* Accessibility Features */}
      <PreviewContainer
        title="Accessibility Features"
        description="Cards include proper semantic structure and keyboard navigation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated" className="bg-green-50 border-green-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900">Semantic Structure</h3>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Use proper heading hierarchy (h1-h6)</li>
                <li>• Card sub-components provide semantic structure</li>
                <li>• Interactive elements have proper ARIA labels</li>
                <li>• Focus indicators are clearly visible</li>
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
                <li>• Interactive cards support keyboard navigation</li>
                <li>• Tab navigation through card content</li>
                <li>• Enter/Space to activate interactive cards</li>
                <li>• Focus management for accessibility</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="aurora" className="bg-purple-50 border-purple-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-purple-900">Contrast Compliance</h3>
              </div>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• All variants meet WCAG AA contrast ratios</li>
                <li>• Text colors are semantic and theme-aware</li>
                <li>• Background and border colors provide sufficient contrast</li>
                <li>• Interactive states maintain contrast requirements</li>
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
                <li>• Proper heading structure for screen readers</li>
                <li>• Alt text for decorative elements</li>
                <li>• Clear content hierarchy</li>
                <li>• Accessible descriptions and labels</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* Code Examples */}
      <PreviewContainer
        title="Code Examples"
        description="Copyable code snippets for common card implementations"
      >
        <div className="space-y-6">
          {/* Simple Card */}
          <Card variant="base" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>Basic card structure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4">
                This is the most basic card structure with header, content, and footer.
              </p>
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Card variant="base">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Primary Action</Button>
  </CardFooter>
</Card>`}
                language="tsx"
                showCopyButton={false}
              />
            </CardFooter>
          </Card>

          {/* Feature Card */}
          <Card variant="gradient-border-animated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Feature Card</CardTitle>
              <CardDescription>Multi-column layout</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Feature cards work well for showcasing multiple items or statistics.
              </p>
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Card variant="gradient-border-animated" padding="lg">
  <CardHeader>
    <CardTitle>Features</CardTitle>
    <CardDescription>Our amazing features</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-[var(--color-surface-base)] rounded-lg">
        <h4 className="font-medium mb-2">Feature 1</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Description</p>
      </div>
      <div className="p-4 bg-[var(--color-surface-base)] rounded-lg">
        <h4 className="font-medium mb-2">Feature 2</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Description</p>
      </div>
      <div className="p-4 bg-[var(--color-surface-base)] rounded-lg">
        <h4 className="font-medium mb-2">Feature 3</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Description</p>
      </div>
    </div>
  </CardContent>
</Card>`}
                language="tsx"
                showCopyButton={false}
              />
            </CardFooter>
          </Card>

          {/* Interactive Card */}
          <Card variant="aurora" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>With hover effects and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Interactive cards elevate on hover and can contain multiple actions.
              </p>
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Card variant="aurora" interactive>
  <CardHeader>
    <CardTitle>Interactive Card</CardTitle>
    <CardDescription>Hover to see effects</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content with interactive elements...</p>
  </CardContent>
  <CardFooter>
    <div className="flex gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Outline</Button>
    </div>
  </CardFooter>
</Card>`}
                language="tsx"
                showCopyButton={false}
              />
            </CardFooter>
          </Card>
        </div>
      </PreviewContainer>

      {/* Quick Reference */}
      <PreviewContainer
        title="Quick Reference"
        description="Card component API and usage guidelines"
      >
        <Card variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Variants</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">base</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Standard border</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">elevated</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Shadow & elevation</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">outlined</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Strong border</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">filled</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Filled background</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">aurora</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Aurora gradient border</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">nova</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Nova gradient border</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Props</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">variant</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Card style</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">padding</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Content padding</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">interactive</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Hover effects</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">className</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Custom styles</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-4">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Best Practices</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">Content</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• Keep content concise and scannable</li>
                    <li>• Use appropriate heading hierarchy</li>
                    <li>• Provide clear calls to action</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">Accessibility</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• Use semantic HTML structure</li>
                    <li>• Ensure sufficient color contrast</li>
                    <li>• Provide keyboard navigation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-[var(--color-text-secondary)]">Design</h5>
                  <ul className="text-[var(--color-text-tertiary)] space-y-1">
                    <li>• Match card variant to content importance</li>
                    <li>• Use consistent padding across layouts</li>
                    <li>• Consider interactive states</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PreviewContainer>

      {/* Other Component Examples */}
      <PreviewContainer
        title="Other Component Examples"
        description="Examples of Tooltip, Input, and BadgeSpinnerTheme components"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tooltip Example */}
          <Card variant="gradient-border-animated" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Tooltip Component</CardTitle>
              <CardDescription>Hover over elements to see tooltips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-[var(--color-text-secondary)] mb-4">
                  Tooltips provide additional context when users hover over interactive elements.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Badge variant="primary">Hover me</Badge>
                    <span className="text-sm text-[var(--color-text-tertiary)]">for tooltip</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="secondary">Button with Tooltip</Button>
                    <span className="text-sm text-[var(--color-text-tertiary)]">hover for info</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Tooltip content="Additional information">
  <Button>Hover for tooltip</Button>
</Tooltip>`}
                language="tsx"
                showCopyButton={false}
                className="text-sm"
              />
            </CardFooter>
          </Card>

          {/* Input Example */}
          <Card variant="aurora" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Input Component</CardTitle>
              <CardDescription>Various input types and states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-[var(--color-text-secondary)] mb-4">
                  Input components provide consistent styling and validation states.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Email</label>
                    <div className="bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2">
                      <input
                        type="email"
                        placeholder="user@example.com"
                        className="w-full bg-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Password</label>
                    <div className="bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2">
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Input
  type="email"
  placeholder="user@example.com"
  label="Email Address"
  required
/>`}
                language="tsx"
                showCopyButton={false}
                className="text-sm"
              />
            </CardFooter>
          </Card>
        </div>

        <div className="mt-6 space-y-6">
          {/* BadgeSpinnerTheme Example */}
          <Card variant="nova" className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Badge, Spinner & Theme Components</CardTitle>
              <CardDescription>Interactive theme switching and component examples</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-[var(--color-text-secondary)] mb-4">
                  These components demonstrate theme-aware design, loading states, and status indicators.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="primary">Primary Badge</Badge>
                  <Badge variant="success">Success Badge</Badge>
                  <Badge variant="warning">Warning Badge</Badge>
                  <Badge variant="error">Error Badge</Badge>
                </div>
                <div className="flex gap-4 items-center">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <span className="text-sm text-[var(--color-text-tertiary)]">Loading states</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <CodeBlock
                code={`<Badge variant="primary">Status</Badge>
<Spinner size="md" />
<ThemeProvider theme={currentTheme}>
  <App />
</ThemeProvider>`}
                language="tsx"
                showCopyButton={false}
                className="text-sm"
              />
            </CardFooter>
          </Card>
        </div>
      </PreviewContainer>
    </div>
  );
}