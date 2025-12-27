/**
 * Button Component
 * 
 * Accessible, semantic button component with multiple variants and states.
 * Follows WCAG 2.2 AA standards for accessibility.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  /**
   * Icon to display before the button text
   */
  leftIcon?: ReactNode;
  /**
   * Icon to display after the button text
   */
  rightIcon?: ReactNode;
  /**
   * Whether the button should take full width
   */
  fullWidth?: boolean;
  /**
   * Button content
   */
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--color-interactive-primary-base)]
    text-white
    hover:bg-[var(--color-interactive-primary-hover)]
    active:bg-[var(--color-interactive-primary-active)]
    focus-visible:ring-2
    focus-visible:ring-[var(--color-interactive-primary-base)]
    focus-visible:ring-offset-2
    disabled:bg-[var(--color-interactive-primary-disabled)]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `,
  secondary: `
    bg-[var(--color-interactive-secondary-base)]
    text-white
    hover:bg-[var(--color-interactive-secondary-hover)]
    active:bg-[var(--color-interactive-secondary-active)]
    focus-visible:ring-2
    focus-visible:ring-[var(--color-interactive-secondary-base)]
    focus-visible:ring-offset-2
    disabled:bg-[var(--color-interactive-secondary-disabled)]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `,
  accent: `
    bg-[var(--color-interactive-accent-base)]
    text-white
    hover:bg-[var(--color-interactive-accent-hover)]
    active:bg-[var(--color-interactive-accent-active)]
    focus-visible:ring-2
    focus-visible:ring-[var(--color-interactive-accent-base)]
    focus-visible:ring-offset-2
    disabled:bg-[var(--color-interactive-accent-disabled)]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `,
  outline: `
    border-2
    border-[var(--color-border-base)]
    bg-transparent
    text-[var(--color-text-primary)]
    hover:bg-[var(--color-background-secondary)]
    hover:border-[var(--color-border-strong)]
    active:bg-[var(--color-background-tertiary)]
    focus-visible:ring-2
    focus-visible:ring-[var(--color-border-focus)]
    focus-visible:ring-offset-2
    disabled:border-[var(--color-border-subtle)]
    disabled:text-[var(--color-text-disabled)]
    disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent
    text-[var(--color-text-primary)]
    hover:bg-[var(--color-background-secondary)]
    active:bg-[var(--color-background-tertiary)]
    focus-visible:ring-2
    focus-visible:ring-[var(--color-border-focus)]
    focus-visible:ring-offset-2
    disabled:text-[var(--color-text-disabled)]
    disabled:cursor-not-allowed
  `,
  danger: `
    bg-[var(--color-semantic-error-base)]
    text-white
    hover:bg-[var(--color-semantic-error-text)]
    active:opacity-90
    focus-visible:ring-2
    focus-visible:ring-[var(--color-semantic-error-base)]
    focus-visible:ring-offset-2
    disabled:bg-[var(--color-interactive-primary-disabled)]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: `
    px-[var(--spacing-md)]
    py-[var(--spacing-sm)]
    text-[var(--font-size-sm)]
    font-[var(--font-weight-medium)]
    leading-[var(--line-height-tight)]
    rounded-[var(--radius-md)]
  `,
  md: `
    px-[var(--spacing-base)]
    py-[var(--spacing-sm)]
    text-[var(--font-size-base)]
    font-[var(--font-weight-medium)]
    leading-[var(--line-height-normal)]
    rounded-[var(--radius-md)]
  `,
  lg: `
    px-[var(--spacing-lg)]
    py-[var(--spacing-md)]
    text-[var(--font-size-lg)]
    font-[var(--font-weight-semibold)]
    leading-[var(--line-height-normal)]
    rounded-[var(--radius-lg)]
  `,
};

/**
 * Button Component
 * 
 * Accessible button with semantic variants and proper ARIA attributes.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex',
          'items-center',
          'justify-center',
          'gap-[var(--spacing-sm)]',
          'font-medium',
          'transition-all',
          'duration-[var(--motion-duration-base)]',
          'ease-[var(--motion-easing-ease-out)]',
          'outline-none',
          'select-none',
          'touch-manipulation',
          
          // Variant styles
          variantStyles[variant],
          
          // Size styles
          sizeStyles[size],
          
          // Full width
          fullWidth && 'w-full',
          
          // Loading state
          loading && 'cursor-wait',
          
          className
        )}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span
            className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

