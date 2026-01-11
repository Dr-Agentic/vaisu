/**
 * SimpleButtonSampler Component
 *
 * Simplified button component examples showing all variants.
 * No documentation, no interactive states, no code examples.
 */

import { Button } from '../primitives/Button';

export function SimpleButtonSampler() {
  const variants: { name: string; variant: any }[] = [
    { name: 'Primary', variant: 'primary' },
    { name: 'Secondary', variant: 'secondary' },
    { name: 'Accent', variant: 'accent' },
    { name: 'Outline', variant: 'outline' },
    { name: 'Ghost', variant: 'ghost' },
    { name: 'Danger', variant: 'danger' },
    { name: 'Aurora', variant: 'aurora' },
    { name: 'Nova', variant: 'nova' },
    { name: 'Aurora Fast', variant: 'aurora-fast' },
    { name: 'Aurora Static', variant: 'aurora-static' },
    { name: 'Gradient Primary', variant: 'gradient-primary' },
  ];

  return (
    <div className="space-y-8">
      {/* All Variants */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">All Variants</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {variants.map(({ name, variant }) => (
            <div key={variant} className="space-y-2 p-4 border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
              <Button variant={variant} size="md">
                {name}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Sizes</h3>
        <div className="space-y-4">
          {['sm', 'md', 'lg'].map((size) => (
            <div key={size} className="space-y-2">
              <span className="text-sm text-[var(--color-text-secondary)] capitalize">{size}</span>
              <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed border-red-400 rounded-lg">
                <Button variant="primary" size={size as any}>
                  Primary
                </Button>
                <Button variant="secondary" size={size as any}>
                  Secondary
                </Button>
                <Button variant="ghost" size={size as any}>
                  Ghost
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">With Icons</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <Button variant="primary" leftIcon="🚀">
              Launch
            </Button>
          </div>
          <div className="p-4 border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <Button variant="secondary" rightIcon="⚡">
              Quick
            </Button>
          </div>
          <div className="p-4 border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <Button variant="ghost" leftIcon="✨" rightIcon="✨">
              Magic
            </Button>
          </div>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">States</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed border-red-400 rounded-lg">
            <Button variant="primary">Default</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </div>
      </div>
    </div>
  );
}