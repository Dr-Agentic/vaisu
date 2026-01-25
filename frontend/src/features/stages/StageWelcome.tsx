/**
 * StageWelcome Component
 *
 * Welcome stage with hero section featuring void mesh glow background.
 * Serves as entry point to Vaisu UI.
 *
 * @example
 * ```tsx
 * <StageWelcome onGetStarted={() => setStage('input')} />
 * ```
 */

import { forwardRef } from 'react';

import { Button } from '@/components/primitives';
import { useTheme } from '@/design-system/ThemeProvider';
import { cn } from '@/lib/utils';

export interface StageWelcomeProps {
  /**
   * Callback when 'Get Started' button is clicked
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
    ref,
  ) => {
    const { resolvedTheme } = useTheme();

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
          'hero-bg',
          'bg-[var(--color-background-primary)]',
        )}
      >
        <div className='max-w-3xl mx-auto p-8'>
          {/* Logo */}
          <div className='flex justify-center mb-8'>
            <img
              src={
                resolvedTheme === 'dark'
                  ? '/vaisu-logo.png'
                  : '/vaisu-logo-light.png'
              }
              alt='Vaisu Logo'
              className={cn(
                'w-32',
                'h-32',
                'rounded-2xl',
                'shadow-glow',
                'animate-fade-in',
              )}
            />
          </div>

          {/* Hero Title with Gradient Text */}
          <h1
            className={cn(
              'mb-4',
              'text-gradient-glow',
              'font-bold',
              'leading-tight',
              'text-6xl',
            )}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              'mb-12',
              'leading-normal',
              'text-xl',
              'text-[var(--color-text-secondary)]',
            )}
          >
            {subtitle}
          </p>

          {/* Get Started Button */}
          <Button
            variant='aurora'
            size='lg'
            onClick={onGetStarted}
            className='animate-fade-in'
          >
            {buttonText}
          </Button>
        </div>
      </div>
    );
  },
);

StageWelcome.displayName = 'StageWelcome';
