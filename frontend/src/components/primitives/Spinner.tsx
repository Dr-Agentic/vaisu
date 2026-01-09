/**
 * Spinner Component
 *
 * Loading spinner component with multiple sizes and variants.
 *
 * @example
 * ```tsx
 * <Spinner size="md" />
 * <Spinner size="lg" variant="primary" />
 * ```
 */

import { HTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'accent' | 'neutral';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;
  /**
   * Color variant
   * @default 'primary'
   */
  variant?: SpinnerVariant;
  /**
   * Accessible label for screen readers
   * @default 'Loading'
   */
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

const variantStyles: Record<SpinnerVariant, string> = {
  primary: 'border-[var(--color-interactive-primary-base)]',
  secondary: 'border-[var(--color-interactive-secondary-base)]',
  accent: 'border-[var(--color-interactive-accent-base)]',
  neutral: 'border-[var(--color-text-tertiary)]',
};

/**
 * Spinner Component
 *
 * Accessible loading spinner with multiple sizes and variants.
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'primary',
      label = 'Loading',
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn('inline-block', className)}
        role="status"
        aria-label={label}
        {...props}
      >
        <div
          className={cn(
            'rounded-full',
            'border-t-transparent',
            'animate-spin',
            sizeStyles[size],
            variantStyles[variant],
          )}
          aria-hidden="true"
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  },
);

Spinner.displayName = 'Spinner';

