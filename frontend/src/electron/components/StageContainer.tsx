/**
 * StageContainer Component
 *
 * Container for stage-based navigation with transition animations.
 * Wraps multiple stage children and handles transitions between them.
 *
 * @example
 * ```tsx
 * <StageContainer currentStage="welcome">
 *   <StageWelcome />
 *   <StageInput />
 *   <StageAnalysis />
 *   <StageVisualization />
 * </StageContainer>
 * ```
 */

import { HTMLAttributes, ReactNode, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export type StageName = 'welcome' | 'input' | 'analysis' | 'visualization';

export interface StageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Currently active stage
   */
  currentStage: StageName;
  /**
   * Stage children
   */
  children: ReactNode;
}

/**
 * StageContainer
 *
 * Provides stage-based navigation with smooth opacity transitions.
 * Uses absolute positioning for all stages with CSS transitions.
 */
export const StageContainer = forwardRef<HTMLDivElement, StageContainerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'stage-container',
          'h-screen',
          'relative',
          'overflow-hidden',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

StageContainer.displayName = 'StageContainer';

/**
 * Stage
 *
 * Individual stage component with transition animations.
 * Each stage is absolutely positioned and only visible when active.
 */
export interface StageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether this stage is active
   */
  active: boolean;
  /**
   * Animation variant for stage transition
   * @default 'fade'
   */
  animation?: 'fade' | 'fade-in-up' | 'slide-in-left' | 'slide-in-right';
  /**
   * Stage content
   */
  children: ReactNode;
}

export const Stage = forwardRef<HTMLDivElement, StageProps>(
  ({ active, animation = 'fade', children, className, ...props }, ref) => {
    const animationClass = animation !== 'fade' ? `stage-${animation}` : '';

    return (
      <div
        ref={ref}
        className={cn(
          'stage',
          'absolute',
          'inset-0',
          'opacity-0',
          'pointer-events-none',
          'transition-opacity',
          'duration-[var(--motion-duration-base)]',
          'ease-[var(--motion-easing-ease-out)]',
          'flex',
          'flex-col',
          active && 'active',
          active && animationClass,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Stage.displayName = 'Stage';
