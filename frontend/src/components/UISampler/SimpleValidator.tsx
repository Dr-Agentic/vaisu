/**
 * SimpleValidator Component
 *
 * Validation tool to ensure all simplified components are working correctly.
 */

import { SimpleButtonSampler } from './SimpleButtonSampler';
import { SimpleCardSampler } from './SimpleCardSampler';
import { SimplePreviewContainer } from './SimplePreviewContainer';

export function SimpleValidator() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Simplified UI Sampler - Validation</h1>

      {/* Button Validation */}
      <SimplePreviewContainer title="Button Component Validation">
        <SimpleButtonSampler />
      </SimplePreviewContainer>

      {/* Card Validation */}
      <SimplePreviewContainer title="Card Component Validation">
        <SimpleCardSampler />
      </SimplePreviewContainer>

      {/* Component Count Summary */}
      <SimplePreviewContainer title="Component Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--color-surface-secondary)] p-4 rounded-lg">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Buttons</h3>
            <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
              <li>✓ 11 variants (primary, secondary, accent, outline, ghost, danger, aurora, nova, aurora-fast, aurora-static, gradient-primary)</li>
              <li>✓ 3 sizes (sm, md, lg)</li>
              <li>✓ Icon support (left/right)</li>
              <li>✓ State variations (default, disabled)</li>
            </ul>
          </div>

          <div className="bg-[var(--color-surface-secondary)] p-4 rounded-lg">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Cards</h3>
            <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
              <li>✓ 11 variants (base, elevated, outlined, filled, mesh-glow, mesh-glow-strong, gradient-border-animated, gradient-border-static, gradient-border-animated-fast, aurora, nova)</li>
              <li>✓ 5 padding sizes (none, sm, md, lg, xl)</li>
              <li>✓ Interactive states</li>
            </ul>
          </div>
        </div>
      </SimplePreviewContainer>
    </div>
  );
}