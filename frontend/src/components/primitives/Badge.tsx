/**
 * Badge Component
 *
 * Small status indicator or label component.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" size="lg">Error</Badge>
 * ```
 */

import { HTMLAttributes, forwardRef, ReactNode } from 'react';

import { cn } from '../../lib/utils';

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'aurora' | 'nova' | 'solar' | 'ember';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: BadgeVariant;
  /**
   * Size of the badge
   * @default 'md'
   */
  size?: BadgeSize;
  /**
   * Badge content
   */
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: `
    bg-[var(--color-interactive-primary-base)]
    text-white
  `,
  secondary: `
    bg-[var(--color-interactive-secondary-base)]
    text-white
  `,
  accent: `
    bg-[var(--color-interactive-accent-base)]
    text-white
  `,
  success: `
    bg-[var(--color-semantic-success-background)]
    text-[var(--color-semantic-success-text)]
    border border-[var(--color-semantic-success-border)]
    hover:bg-[var(--color-semantic-success-border)]
    hover:border-[var(--color-semantic-success-base)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
  error: `
    bg-[var(--color-semantic-error-background)]
    text-[var(--color-semantic-error-text)]
    border border-[var(--color-semantic-error-border)]
    hover:bg-[var(--color-semantic-error-border)]
    hover:border-[var(--color-semantic-error-base)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
  warning: `
    bg-[var(--color-semantic-warning-background)]
    text-[var(--color-semantic-warning-text)]
    border border-[var(--color-semantic-warning-border)]
    hover:bg-[var(--color-semantic-warning-border)]
    hover:border-[var(--color-semantic-warning-base)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
  info: `
    bg-[var(--color-semantic-info-background)]
    text-[var(--color-semantic-info-text)]
    border border-[var(--color-semantic-info-border)]
    hover:bg-[var(--color-semantic-info-border)]
    hover:border-[var(--color-semantic-info-base)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
  neutral: `
    bg-[var(--color-background-secondary)]
    text-[var(--color-text-secondary)]
    border border-[var(--color-border-base)]
  `,
  // Vaisu Vaisu UI variants with gradient colors
  aurora: `
    bg-[color-mix(in_srgb,var(--color-interactive-primary-base)_25%,transparent)]
    text-[var(--color-interactive-secondary-hover)]
    hover:bg-[color-mix(in_srgb,var(--color-interactive-primary-base)_35%,transparent)]
    hover:text-[var(--color-interactive-secondary-active)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
  nova: `
    bg-[color-mix(in_srgb,var(--color-interactive-accent-base)_25%,transparent)]
    text-[var(--color-interactive-accent-hover)]
    hover:bg-[color-mix(in_srgb,var(--color-interactive-accent-base)_35%,transparent)]
    hover:text-[var(--color-interactive-accent-active)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
  solar: `
    bg-[var(--color-semantic-warning-background)]
    text-[var(--color-semantic-warning-base)]
    hover:bg-[color-mix(in_srgb,var(--color-semantic-warning-base)_30%,transparent)]
    hover:text-[var(--color-semantic-warning-text)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
  ember: `
    bg-[var(--color-semantic-error-background)]
    text-[var(--color-semantic-error-base)]
    hover:bg-[color-mix(in_srgb,var(--color-semantic-error-base)_30%,transparent)]
    hover:text-[var(--color-semantic-error-text)]
    transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]
  `,
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: `
    px-[var(--spacing-xs)]
    py-[var(--spacing-xs)]
    text-[var(--font-size-xs)]
    font-[var(--font-weight-medium)]
    leading-[var(--line-height-tight)]
    rounded-[var(--radius-sm)]
  `,
  md: `
    px-[var(--spacing-sm)]
    py-[var(--spacing-xs)]
    text-[var(--font-size-sm)]
    font-[var(--font-weight-medium)]
    leading-[var(--line-height-tight)]
    rounded-[var(--radius-base)]
  `,
  lg: `
    px-[var(--spacing-md)]
    py-[var(--spacing-sm)]
    text-[var(--font-size-base)]
    font-[var(--font-weight-semibold)]
    leading-[var(--line-height-normal)]
    rounded-[var(--radius-md)]
  `,
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex',
          'items-center',
          'justify-center',
          'font-medium',
          'whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

