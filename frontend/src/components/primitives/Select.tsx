/**
 * Select Component
 *
 * Accessible select dropdown with keyboard navigation and proper labeling.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   value={selectedCountry}
 *   onChange={setSelectedCountry}
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 *   placeholder="Select a country"
 * />
 * ```
 */

import { ChevronDown } from 'lucide-react';
import { SelectHTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Label text for the select
   */
  label?: string;
  /**
   * Helper text displayed below the select
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Options for the select
   */
  options: SelectOption[];
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Size of the select
   * @default 'md'
   */
  size?: SelectSize;
  /**
   * Whether the select is required
   */
  required?: boolean;
  /**
   * Full width of container
   */
  fullWidth?: boolean;
}

const sizeStyles: Record<SelectSize, { select: string; label: string }> = {
  sm: {
    select: `
      px-[var(--spacing-sm)]
      py-[var(--spacing-xs)]
      text-[var(--font-size-sm)]
      rounded-[var(--radius-md)]
    `,
    label: 'text-[var(--font-size-sm)]',
  },
  md: {
    select: `
      px-[var(--spacing-base)]
      py-[var(--spacing-sm)]
      text-[var(--font-size-base)]
      rounded-[var(--radius-md)]
    `,
    label: 'text-[var(--font-size-base)]',
  },
  lg: {
    select: `
      px-[var(--spacing-lg)]
      py-[var(--spacing-md)]
      text-[var(--font-size-lg)]
      rounded-[var(--radius-lg)]
    `,
    label: 'text-[var(--font-size-lg)]',
  },
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      size = 'md',
      required = false,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const ariaDescribedBy = [helperId, errorId].filter((id): id is string => Boolean(id)).join(' ') || undefined;

    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-[var(--spacing-xs)]', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // Base styles
              'w-full',
              'appearance-none',
              'bg-[var(--color-surface-base)]',
              'border',
              'text-[var(--color-text-primary)]',
              'transition-all',
              'duration-[var(--motion-duration-base)]',
              'ease-[var(--motion-easing-ease-out)]',
              'outline-none',
              'disabled:opacity-60',
              'disabled:cursor-not-allowed',
              'cursor-pointer',

              // Size styles
              sizeStyles[size].select,

              // Padding for icon
              'pr-[var(--spacing-3xl)]',

              // Border styles
              hasError
                ? 'border-[var(--color-border-error)] focus-visible:border-[var(--color-border-error)] focus-visible:ring-2 focus-visible:ring-[var(--color-semantic-error-base)] focus-visible:ring-offset-2'
                : 'border-[var(--color-border-base)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',

              className,
            )}
            aria-invalid={hasError}
            aria-required={required}
            aria-describedby={ariaDescribedBy}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div
            className="absolute right-[var(--spacing-base)] top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]"
            aria-hidden="true"
          >
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';

