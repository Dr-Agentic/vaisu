/**
 * Textarea Component
 * 
 * Accessible textarea component with proper labeling and error states.
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description"
 *   rows={4}
 *   error="Required field"
 * />
 * ```
 */

import { TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text for the textarea
   */
  label?: string;
  /**
   * Helper text displayed below the textarea
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Size of the textarea
   * @default 'md'
   */
  size?: TextareaSize;
  /**
   * Whether the textarea is required
   */
  required?: boolean;
  /**
   * Full width of container
   */
  fullWidth?: boolean;
}

const sizeStyles: Record<TextareaSize, { textarea: string; label: string }> = {
  sm: {
    textarea: `
      px-[var(--spacing-sm)]
      py-[var(--spacing-xs)]
      text-[var(--font-size-sm)]
      rounded-[var(--radius-md)]
    `,
    label: 'text-[var(--font-size-sm)]',
  },
  md: {
    textarea: `
      px-[var(--spacing-base)]
      py-[var(--spacing-sm)]
      text-[var(--font-size-base)]
      rounded-[var(--radius-md)]
    `,
    label: 'text-[var(--font-size-base)]',
  },
  lg: {
    textarea: `
      px-[var(--spacing-lg)]
      py-[var(--spacing-md)]
      text-[var(--font-size-lg)]
      rounded-[var(--radius-lg)]
    `,
    label: 'text-[var(--font-size-lg)]',
  },
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      required = false,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const ariaDescribedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-[var(--spacing-xs)]', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block',
              'font-[var(--font-weight-medium)]',
              'text-[var(--color-text-primary)]',
              sizeStyles[size].label,
              'leading-[var(--line-height-tight)]'
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

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            // Base styles
            'w-full',
            'bg-[var(--color-surface-base)]',
            'border',
            'text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'resize-y',
            'transition-all',
            'duration-[var(--motion-duration-base)]',
            'ease-[var(--motion-easing-ease-out)]',
            'outline-none',
            'disabled:opacity-60',
            'disabled:cursor-not-allowed',
            
            // Size styles
            sizeStyles[size].textarea,
            
            // Border styles
            hasError
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
                ],
            
            className
          )}
          aria-invalid={hasError}
          aria-required={required}
          aria-describedby={ariaDescribedBy}
          {...props}
        />

        {helperText && !error && (
          <p
            id={helperId}
            className={cn(
              'text-[var(--font-size-sm)]',
              'text-[var(--color-text-secondary)]',
              'leading-[var(--line-height-normal)]'
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
              'gap-[var(--spacing-xs)]'
            )}
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

