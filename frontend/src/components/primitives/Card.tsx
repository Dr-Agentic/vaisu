/**
 * Card Component
 *
 * Flexible container component for grouping related content.
 * Supports multiple variants and elevation levels.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 * ```
 */

import { HTMLAttributes, ReactNode, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export type CardVariant = 'base' | 'elevated' | 'outlined' | 'filled' | 'mesh-glow' | 'mesh-glow-strong' | 'gradient-border-animated' | 'gradient-border-static' | 'gradient-border-animated-fast' | 'aurora' | 'nova';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual style variant
   * @default 'base'
   */
  variant?: CardVariant;
  /**
   * Padding size
   * @default 'md'
   */
  padding?: CardPadding;
  /**
   * Whether the card is interactive (hoverable)
   */
  interactive?: boolean;
  /**
   * Card content
   */
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  base: `
    bg-[var(--color-surface-base)]
    border border-[var(--color-border-base)]
  `,
  elevated: `
    bg-[var(--color-surface-elevated)]
    shadow-[var(--elevation-md)]
    border border-[var(--color-border-base)]
  `,
  outlined: `
    bg-[var(--color-surface-base)]
    border-2 border-[var(--color-border-strong)]
  `,
  filled: `
    bg-[var(--color-background-secondary)]
    border border-[var(--color-border-base)]
  `,
  // Vaisu Vaisu UI variants with mesh glow and gradient borders
  'mesh-glow': `
    mesh-glow
  `,
  'mesh-glow-strong': `
    mesh-glow-strong
  `,
  'gradient-border-animated': `
    gradient-border-animated
  `,
  'gradient-border-static': `
    gradient-border-static
  `,
  'gradient-border-animated-fast': `
    gradient-border-animated-fast
  `,
  // Aurora and Nova are aliases for gradient-border-animated with specific colors
  'aurora': `
    gradient-border-animated
  `,
  'nova': `
    gradient-border-animated nova
  `,
};

const paddingStyles: Record<CardPadding, string | false> = {
  none: false,
  sm: 'p-[var(--spacing-sm)]',
  md: 'p-[var(--spacing-base)]',
  lg: 'p-[var(--spacing-lg)]',
  xl: 'p-[var(--spacing-xl)]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'base',
      padding = 'md',
      interactive = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-xl)]',
          'design-system-card', // Add specific class to avoid Vaisu UI conflicts
          variantStyles[variant],
          paddingStyles[padding],
          ...(interactive
            ? [
              'transition-all',
              'duration-[var(--motion-duration-base)]',
              'ease-[var(--motion-easing-ease-out)]',
              'hover:shadow-[var(--elevation-lg)]',
              'hover:-translate-y-0.5',
              'cursor-pointer',
            ]
            : []),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

// Card Sub-components
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          'flex-col',
          'space-y-[var(--spacing-sm)]',
          'pb-[var(--spacing-base)]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: ReactNode;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-[var(--font-size-xl)]',
          'font-[var(--font-weight-semibold)]',
          'leading-[var(--line-height-tight)]',
          'text-[var(--color-text-primary)]',
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-[var(--font-size-sm)]',
          'text-[var(--color-text-secondary)]',
          'leading-[var(--line-height-normal)]',
          className,
        )}
        {...props}
      >
        {children}
      </p>
    );
  },
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Use semantic design system text colors for theme compatibility
          'text-[var(--color-text-primary)]',
          // Font consistency
          'font-[var(--font-family-sans)]',
          'design-system-card-content', // Add specific class to avoid Vaisu UI conflicts
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          'items-center',
          'pt-[var(--spacing-base)]',
          'border-t',
          'border-[var(--color-border-subtle)]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = 'CardFooter';
