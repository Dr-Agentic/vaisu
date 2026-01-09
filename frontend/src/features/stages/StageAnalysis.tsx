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
            className="mb-4 font-mono opacity-50 text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            ID: {document.id}
          </div>
        )}
        {/* Progress Ring */}
        <div
          className={cn('progress-ring', 'mb-8')}
          style={{
            border: '3px solid var(--color-border-subtle)',
            borderTopColor: 'var(--aurora-1)',
          }}
          aria-label="Loading"
        />

        {/* Progress Text */}
        <h2
          className="mb-2 text-xl font-semibold"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          {message}
        </h2>

        {/* Progress Sub-message */}
        <p
          className="base"
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          {subMessage}
        </p>

        {/* Progress Bar (if available) */}
        {progressPercent > 0 && (
          <div className="w-64 mt-6">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                backgroundColor: 'var(--color-border-subtle)',
              }}
            >
              <div
                className={cn('h-full', 'transition-all', 'duration-300', 'ease-out')}
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--aurora-1)',
                }}
              />
            </div>
            <p
              className="mt-2 text-sm"
              style={{
                color: 'var(--color-text-secondary)',
              }}
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
