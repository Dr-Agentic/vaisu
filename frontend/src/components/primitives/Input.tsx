/**
 * Input Component
 *
 * Accessible form input component with proper labeling and error states.
 * Follows WCAG 2.2 AA standards.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error="Invalid email"
 *   required
 * />
 * ```
 */

import { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

import { cn } from '../../lib/utils';

export type InputSize = 'sm' | 'md' | 'lg';
// ... (omitting intermediate code for brevity)
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const ariaDescribedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-[var(--spacing-xs)]', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block',
              'font-[var(--font-weight-medium)]',
              'text-[var(--color-text-primary)]',
              sizeStyles[size].label,
              'leading-[var(--line-height-tight)]',
            )}
          >
            {label}
            {required && (
              <span className="text-[var(--color-semantic-error-base)] ml-[var(--spacing-xs)]" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-[var(--spacing-base)] top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full',
              'bg-[var(--color-surface-base)]',
              'border',
              'text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-tertiary)]',
              'transition-all',
              'duration-[var(--motion-duration-base)]',
              'ease-[var(--motion-easing-ease-out)]',
              'outline-none',
              'disabled:opacity-60',
              'disabled:cursor-not-allowed',

              // Size styles
              sizeStyles[size].input,

              // Padding adjustments for icons
              leftIcon ? 'pl-[var(--spacing-3xl)]' : '',
              rightIcon ? 'pr-[var(--spacing-3xl)]' : '',

              // Border styles
              ...(hasError
                ? [
                  'border-[var(--color-border-error)]',
                  'focus-visible:border-[var(--color-border-error)]',
                  'focus-visible:ring-2',
                  'focus-visible:ring-[var(--color-semantic-error-base)]',
                  'focus-visible:ring-offset-2',
                ]
                : [
                  'border-[var(--color-border-base)]',
                  'hover:border-[var(--color-border-strong)]',
                  'focus-visible:border-[var(--color-border-focus)]',
                  'focus-visible:ring-2',
                  'focus-visible:ring-[var(--color-border-focus)]',
                  'focus-visible:ring-offset-2',
                ]),

              className,
            )}
            aria-invalid={hasError}
            aria-required={required}
            aria-describedby={ariaDescribedBy}
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-[var(--spacing-base)] top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && !error && (
          <p
            id={helperId}
            className={cn(
              'text-[var(--font-size-sm)]',
              'text-[var(--color-text-secondary)]',
              'leading-[var(--line-height-normal)]',
            )}
          >
            {helperText}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              'text-[var(--font-size-sm)]',
              'text-[var(--color-semantic-error-text)]',
              'leading-[var(--line-height-normal)]',
              'flex',
              'items-center',
              'gap-[var(--spacing-xs)]',
            )}
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

