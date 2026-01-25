/**
 * StageIndicators Component
 *
 * Bottom navigation dots showing stage progress.
 * Supports active, completed, and inactive states with visual feedback.
 *
 * @example
 * ```tsx
 * <StageIndicators
 *   currentStage="visualization"
 *   stages={['welcome', 'input', 'analysis', 'visualization']}
 *   onStageClick={(stage) => setStage(stage)}
 * />
 * ```
 */

import { HTMLAttributes, forwardRef } from 'react';
import { Sparkles, FileInput, Zap, Layout } from 'lucide-react';
import { cn } from '../../lib/utils';

import type { StageName } from './StageContainer';

export interface StageIndicatorsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Currently active stage
   */
  currentStage: StageName;
  /**
   * All stages in order
   */
  stages: StageName[];
  /**
   * Callback when a stage indicator is clicked
   */
  onStageClick?: (stage: StageName) => void;
  /**
   * Whether indicators are interactive
   * @default false
   */
  interactive?: boolean;
}

const STAGE_ORDER: readonly StageName[] = ['welcome', 'input', 'analysis', 'visualization'] as const;

/**
 * StageIcon
 * 
 * Helper to map stage names to icons.
 */
const StageIcon = ({ stage, className }: { stage: StageName; className?: string }) => {
  switch (stage) {
    case 'welcome': return <Sparkles className={className} />;
    case 'input': return <FileInput className={className} />;
    case 'analysis': return <Zap className={className} />;
    case 'visualization': return <Layout className={className} />;
    default: return null;
  }
};

/**
 * StageIndicators
 *
 * Displays fixed navigation indicators representing stages as icons.
 * Features:
 * - Active: Vibrant glowing state
 * - Completed: Solid thematic state
 * - Future: Dimmed outline state
 */
export const StageIndicators = forwardRef<HTMLDivElement, StageIndicatorsProps>(
  ({ currentStage, stages = STAGE_ORDER as StageName[], onStageClick, interactive = false, className, ...props }, ref) => {
    const currentIndex = stages.indexOf(currentStage);

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center p-2 rounded-2xl z-[100]',
          'bg-[var(--color-surface-elevated)]/40 backdrop-blur-xl border border-[var(--color-border-subtle)]',
          'shadow-2xl shadow-black/50',
          className,
        )}
        style={{ gap: 'var(--space-sm)' }}
        {...props}
      >
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isInteractive = interactive && (isCompleted || isActive);

          return (
            <button
              key={stage}
              type="button"
              onClick={() => isInteractive && onStageClick?.(stage)}
              disabled={!isInteractive}
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group',
                isActive
                  ? 'bg-[var(--aurora-1)] text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                  : isCompleted
                    ? 'text-[var(--aurora-2)] bg-[var(--color-surface-secondary)]/50'
                    : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-secondary)]/30',
                !interactive && 'pointer-events-none',
                isInteractive && 'cursor-pointer active:scale-95',
              )}
              aria-label={`Go to ${stage} stage`}
              aria-current={isActive ? 'step' : undefined}
            >
              <StageIcon stage={stage} className="w-5 h-5" />

              {/* Tooltip hint */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[var(--color-surface-base)] text-[10px] uppercase tracking-widest font-bold border border-[var(--color-border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {stage}
              </span>

              {/* Connecting line for completed/active */}
              {index < stages.length - 1 && (
                <div className="absolute left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 w-4 h-[2px] rounded-full bg-[var(--color-border-subtle)]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isCompleted ? 'w-full bg-[var(--aurora-2)]' : 'w-0'
                    )}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

StageIndicators.displayName = 'StageIndicators';
