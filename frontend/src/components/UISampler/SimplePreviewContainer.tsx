/**
 * SimplePreviewContainer Component
 *
 * Simplified preview container focused purely on component display.
 * No code examples, no documentation, no interactive states.
 */

import { ReactNode } from 'react';

export interface SimplePreviewContainerProps {
  /**
   * Title for the preview section
   */
  title?: string;
  /**
   * The component to preview (live rendering)
   */
  children?: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SimplePreviewContainer Component
 *
 * Clean container for displaying component variants without distractions.
 */
export function SimplePreviewContainer({
  title,
  children,
  className,
}: SimplePreviewContainerProps) {
  const containerClasses = `
    ${className || ''}
    space-y-6
  `;

  const cardClasses = `
    bg-[var(--color-surface-base)]
    border
    border-[var(--color-border-subtle)]
    rounded-xl
    shadow-lg
  `;

  const previewClasses = `
    relative
    min-h-[200px]
    p-6
    rounded-lg
    bg-[var(--color-surface-secondary)]
    border
    border-[var(--color-border-subtle)]
    overflow-hidden
  `;

  return (
    <div className={containerClasses}>
      {/* Header */}
      {title && (
        <div className="border-b border-[var(--color-border-subtle)] pb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {title}
          </h2>
        </div>
      )}

      {/* Content Area */}
      <div className={cardClasses}>
        {/* Preview Area */}
        <div className={previewClasses}>
          <div className="relative z-10">
            {children || (
              <div className="flex items-center justify-center h-48 text-[var(--color-text-secondary)]">
                No preview available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}