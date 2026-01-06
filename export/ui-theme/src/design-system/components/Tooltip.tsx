/**
 * Tooltip Component
 *
 * Accessible tooltip that appears on hover or focus.
 * Follows WAI-ARIA tooltip pattern.
 *
 * @example
 * ```tsx
 * <Tooltip content="This is a tooltip">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */

import { useState, useRef, useEffect, ReactNode, cloneElement, isValidElement } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../lib/utils';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: ReactNode;
  /**
   * Child element that triggers the tooltip
   */
  children: ReactNode;
  /**
   * Position of the tooltip
   * @default 'top'
   */
  position?: TooltipPosition;
  /**
   * Delay before showing tooltip (ms)
   * @default 300
   */
  delay?: number;
  /**
   * Whether to show tooltip on focus (for keyboard users)
   * @default true
   */
  showOnFocus?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-border-subtle)] border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-border-subtle)] border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-border-subtle)] border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-border-subtle)] border-t-transparent border-b-transparent border-l-transparent',
};

/**
 * Tooltip Component
 *
 * Accessible tooltip with proper ARIA attributes and keyboard support.
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  showOnFocus = true,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone child to add event handlers
  const childWithHandlers = isValidElement(children)
    ? cloneElement(children as React.ReactElement, {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
      onFocus: showOnFocus ? showTooltip : undefined,
      onBlur: showOnFocus ? hideTooltip : undefined,
      'aria-describedby': isVisible ? 'tooltip' : undefined,
    })
    : (
      <span
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showOnFocus ? showTooltip : undefined}
        onBlur={showOnFocus ? hideTooltip : undefined}
        tabIndex={0}
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </span>
    );

  return (
    <>
      <div ref={triggerRef} className="inline-block">
        {childWithHandlers}
      </div>

      {isVisible
        && createPortal(
          <div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            className={cn(
              'absolute z-[var(--z-index-tooltip)]',
              'px-[var(--spacing-sm)] py-[var(--spacing-xs)]',
              'bg-[var(--color-surface-inverse)]',
              'text-[var(--color-text-inverse)]',
              'text-[var(--font-size-sm)]',
              'rounded-[var(--radius-md)]',
              'shadow-[var(--elevation-lg)]',
              'border border-[var(--color-border-subtle)]',
              'pointer-events-none',
              'max-w-xs',
              'animate-fade-in',
              className,
            )}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: position === 'top' || position === 'bottom'
                ? 'translateX(-50%)'
                : position === 'left' || position === 'right'
                  ? 'translateY(-50%)'
                  : 'none',
            }}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-4',
                arrowStyles[position],
              )}
              aria-hidden="true"
            />
          </div>,
          document.body,
        )}
    </>
  );
}

