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
 * StageIndicators
 *
 * Displays bottom navigation dots with three states:
 * - Active: Glowing accent color
 * - Completed: Muted color (previous stages)
 * - Inactive: Dim color (future stages)
 * Uses SOTA stage-dot pattern from CSS.
 */
export const StageIndicators = forwardRef<HTMLDivElement, StageIndicatorsProps>(
  ({ currentStage, stages = STAGE_ORDER as StageName[], onStageClick, interactive = false, className, ...props }, ref) => {
    const currentIndex = stages.indexOf(currentStage);

    return (
      <div
        ref={ref}
        className={cn(
          'fixed',
          'bottom-[var(--spacing-lg)]',
          'left-1/2',
          '-translate-x-1/2',
          'flex',
          'z-[100]',
          className,
        )}
        style={{
          gap: 'var(--spacing-md)',
        }}
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
                'stage-dot',
                isActive && 'active',
                isCompleted && 'completed',
                'transition-all',
                'duration-[var(--duration-normal)]',
                'ease-[var(--ease-out)]',
                !interactive && 'pointer-events-none',
                isInteractive && 'cursor-pointer',
              )}
              aria-label={`Go to ${stage} stage`}
              aria-current={isActive ? 'step' : undefined}
            />
          );
        })}
      </div>
    );
  },
);

StageIndicators.displayName = 'StageIndicators';
