/**
 * StageWelcome Component
 *
 * Welcome stage with hero section featuring void mesh glow background.
 * Serves as entry point to Electron UI.
 *
 * @example
 * ```tsx
 * <StageWelcome onGetStarted={() => setStage('input')} />
 * ```
 */

import { forwardRef } from 'react';
import { Button } from '../../design-system/components/Button';
import { cn } from '../../lib/utils';

export interface StageWelcomeProps {
  /**
   * Callback when "Get Started" button is clicked
   */
  onGetStarted: () => void;
  /**
   * Custom title text
   * @default 'Vaisu'
   */
  title?: string;
  /**
   * Custom subtitle text
   * @default 'Transform text into intelligent visual representations'
   */
  subtitle?: string;
  /**
   * Custom button text
   * @default 'Get Started'
   */
  buttonText?: string;
}

/**
 * StageWelcome
 *
 * Hero stage with mesh-glow background and luminous gradient text.
 * Uses Aurora gradient for primary button with animated border.
 */
export const StageWelcome = forwardRef<HTMLDivElement, StageWelcomeProps>(
  (
    {
      onGetStarted,
      title = 'Vaisu',
      subtitle = 'Transform text into intelligent visual representations',
      buttonText = 'Get Started',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex-1',
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'text-center',
          'hero-bg'
        )}
        style={{
          backgroundColor: 'var(--color-background-primary)',
        }}
      >
        <div className="max-w-3xl mx-auto p-8">
          {/* Hero Title with Gradient Text */}
          <h1
            className={cn(
              'mb-4',
              'text-gradient-glow',
              'font-bold',
              'leading-tight'
            )}
            style={{
              fontSize: 'var(--font-size-6xl)',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="mb-12 leading-normal"
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-xl)',
              lineHeight: 'var(--line-height-normal)',
            }}
          >
            {subtitle}
          </p>

          {/* Get Started Button */}
          <Button
            variant="aurora"
            size="lg"
            onClick={onGetStarted}
            className="animate-fade-in-up"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    );
  }
);

StageWelcome.displayName = 'StageWelcome';
