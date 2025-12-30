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
    ref
  ) => {
    const { progressMessage, progressPercent } = useDocumentStore();

    return (
      <div
        ref={ref}
        style={{
          backgroundColor: 'var(--void-deepest)',
          color: 'var(--text-primary)',
        }}
        className={cn(
          'flex-1',
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'text-center'
        )}
      >
        {/* Progress Ring */}
        <div
          className={cn('progress-ring', 'mb-8')}
          style={{
            border: '3px solid var(--void-border)',
            borderTopColor: 'var(--aurora-1)',
          }}
          aria-label="Loading"
        />

        {/* Progress Text */}
        <h2
          className="mb-2 text-xl font-semibold"
          style={{
            color: 'var(--text-primary)',
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
            color: 'var(--text-secondary)',
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
                backgroundColor: 'var(--void-border)',
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
                color: 'var(--text-secondary)',
              }}
            >
              {progressMessage}
            </p>
          </div>
        )}
      </div>
    );
  }
);

StageAnalysis.displayName = 'StageAnalysis';
