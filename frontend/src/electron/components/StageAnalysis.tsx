/**
 * StageAnalysis Component
 *
 * Analysis stage with progress ring animation and status messages.
 * Shown during document processing and AI analysis.
 *
 * @example
 * ```tsx
 * <StageAnalysis
 *   message="Analyzing document..."
 *   subMessage="Extracting structure and relationships"
 * />
 * ```
 */

import { forwardRef } from 'react';

import { cn } from '../../lib/utils';
import { useDocumentStore } from '../../stores/documentStore';

export interface StageAnalysisProps {
  /**
   * Primary progress message
   * @default 'Analyzing document...'
   */
  message?: string;
  /**
   * Secondary progress sub-message
   * @default 'Extracting structure and relationships'
   */
  subMessage?: string;
}

/**
 * StageAnalysis
 *
 * Analysis stage with animated progress ring.
 * Uses CSS spinner animation from index.css with aurora-1 color.
 */
export const StageAnalysis = forwardRef<HTMLDivElement, StageAnalysisProps>(
  (
    {
      message = 'Analyzing document...',
      subMessage = 'Extracting structure and relationships',
    },
    ref,
  ) => {
    const { progressMessage, progressPercent, document } = useDocumentStore();

    return (
      <div
        ref={ref}
        style={{
          backgroundColor: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
        }}
        className={cn(
          'flex-1',
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'text-center',
        )}
      >
        {document && (
          <div
            className="mb-[var(--spacing-lg)] font-mono opacity-50 text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]"
          >
            ID: {document.id}
          </div>
        )}
        {/* Progress Ring */}
        <div
          className={cn('progress-ring', 'mb-[var(--spacing-2xl)]')}
          style={{
            border: '3px solid var(--color-border-subtle)',
            borderTopColor: 'var(--aurora-1)',
          }}
          aria-label="Loading"
        />

        {/* Progress Text */}
        <h2
          className="mb-[var(--spacing-base)] text-[var(--font-size-xl)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]"
        >
          {message}
        </h2>

        {/* Progress Sub-message */}
        <p
          className="text-[var(--spacing-base)] text-[var(--color-text-secondary)]"
        >
          {subMessage}
        </p>

        {/* Progress Bar (if available) */}
        {progressPercent > 0 && (
          <div className="w-[var(--spacing-12xl)] mt-[var(--spacing-lg)]">
            <div
              className="h-[var(--spacing-xs)] rounded-full overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                className={cn('h-full', 'transition-all', 'duration-[var(--motion-duration-base)]', 'ease-[var(--motion-easing-ease-out)]')}
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--aurora-1)',
                }}
              />
            </div>
            <p
              className="mt-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)]"
            >
              {progressMessage}
            </p>
          </div>
        )}
      </div>
    );
  },
);

StageAnalysis.displayName = 'StageAnalysis';
