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
 * Analysis stage with premium animated progress ring and mesh-glow background.
 * Uses the Elite design system tokens and mesh-glow-strong utility.
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
        className={cn(
          'flex-1 flex flex-col items-center justify-center text-center p-8 mesh-glow-strong'
        )}
      >
        {document && (
          <div className="mb-6 flex flex-col items-center gap-1">
            <span className="px-3 py-1 rounded-full bg-[var(--color-surface-elevated)]/50 border border-[var(--color-border-subtle)] text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-tertiary)]">
              Preprocessing
            </span>
            <div
              className="font-mono opacity-40 text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              ID: {document.id}
            </div>
          </div>
        )}

        {/* Premium Progress Ring */}
        <div className="relative mb-12">
          <div
            className={cn('progress-ring')}
            style={{
              width: '140px',
              height: '140px',
              border: '4px solid var(--color-border-subtle)',
              borderTopColor: 'var(--nova-1)',
              filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.3))',
            }}
            aria-label="Loading"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold font-mono text-gradient nova">
              {progressPercent || 0}%
            </span>
          </div>
        </div>

        {/* Progress Text */}
        <div className="space-y-3 max-w-md">
          <h2
            className="text-2xl font-bold tracking-tight text-gradient"
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            {message}
          </h2>

          <p
            className="text-lg opacity-80"
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            {subMessage}
          </p>
        </div>

        {/* Modern Progress Bar */}
        {progressPercent > 0 && (
          <div className="w-80 mt-12 space-y-4">
            <div
              className="h-2.5 rounded-full overflow-hidden p-[1px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]"
            >
              <div
                className={cn('h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.4)]')}
                style={{
                  width: `${progressPercent}%`,
                  background: 'var(--gradient-nova)',
                }}
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <span
                className="text-xs font-medium animate-pulse"
                style={{
                  color: 'var(--color-text-secondary)',
                }}
              >
                {progressMessage || 'Synthesizing knowledge...'}
              </span>
              <span className="text-[10px] font-mono opacity-50 text-[var(--color-text-tertiary)]">
                AI ENGINE ACTIVE
              </span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

StageAnalysis.displayName = 'StageAnalysis';
