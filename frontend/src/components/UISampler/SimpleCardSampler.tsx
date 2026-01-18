/**
 * SimpleCardSampler Component
 *
 * Simplified card component examples showing all variants.
 * No documentation, no interactive states, no code examples.
 */

import { Card, CardContent, CardHeader, CardTitle } from '../primitives/Card';

export function SimpleCardSampler() {
  const variants: { name: string; variant: any }[] = [
    { name: 'Base', variant: 'base' },
    { name: 'Elevated', variant: 'elevated' },
    { name: 'Outlined', variant: 'outlined' },
    { name: 'Filled', variant: 'filled' },
    { name: 'Mesh Glow', variant: 'mesh-glow' },
    { name: 'Mesh Glow Strong', variant: 'mesh-glow-strong' },
    { name: 'Gradient Border', variant: 'gradient-border-animated' },
    { name: 'Gradient Border Static', variant: 'gradient-border-static' },
    { name: 'Gradient Border Fast', variant: 'gradient-border-animated-fast' },
    { name: 'Aurora', variant: 'aurora' },
    { name: 'Nova', variant: 'nova' },
  ];

  return (
    <div className="space-y-8">
      {/* All Variants */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">All Variants</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {variants.map(({ name, variant }) => (
            <div key={variant} className="p-2 border-2 border-dashed border-red-400 rounded-lg">
              <Card variant={variant} padding="md">
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Sample card content
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Padding Sizes */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Padding Sizes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['none', 'sm', 'md', 'lg', 'xl'].map((padding) => (
            <div key={padding} className="p-2 border-2 border-dashed border-[var(--color-text-primary)] rounded-lg opacity-80 hover:opacity-100 transition-opacity">
              <Card variant="base" padding={padding as any}>
                <CardHeader>
                  <CardTitle>{padding} Padding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Content with {padding} padding
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Cards */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Interactive</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-2 border-2 border-dashed border-red-400 rounded-lg">
            <Card variant="base" padding="md" interactive>
              <CardHeader>
                <CardTitle>Hover Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Interactive card with hover effects
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="p-2 border-2 border-dashed border-red-400 rounded-lg">
            <Card variant="elevated" padding="lg" interactive>
              <CardHeader>
                <CardTitle>Elevated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Elevated with hover effects
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
