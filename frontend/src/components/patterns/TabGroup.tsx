/**
 * TabGroup Component
 *
 * Reusable tab navigation pattern with active state management.
 * Supports icons, descriptions, and keyboard navigation.
 *
 * @example
 * ```tsx
 * <TabGroup
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1', icon: <Icon /> },
 *     { id: 'tab2', label: 'Tab 2', icon: <Icon /> }
 *   ]}
 *   activeTab="tab1"
 *   onTabChange={(id) => setActiveTab(id)}
 * />
 * ```
 */

import { forwardRef, ReactNode } from 'react';

import { cn } from '../../lib/utils';

export interface TabItem {
  /**
   * Unique identifier for the tab
   */
  id: string;
  /**
   * Display label for the tab
   */
  label: string;
  /**
   * Optional description text shown on hover/active
   */
  description?: string;
  /**
   * Optional icon component to display
   */
  icon?: ReactNode;
  /**
   * Optional badge text
   */
  badge?: string;
}

export interface TabGroupProps {
  /**
   * Array of tab items to display
   */
  tabs: TabItem[];
  /**
   * Currently active tab ID
   */
  activeTab: string;
  /**
   * Callback when tab is changed
   */
  onTabChange: (tabId: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Layout variant
   * @default 'default'
   */
  variant?: 'default' | 'cards' | 'pill';
  /**
   * Show descriptions
   * @default true
   */
  showDescriptions?: boolean;
}

/**
 * TabGroup Component
 *
 * Composite pattern for tabbed navigation.
 * Uses primitive Button components and custom styles.
 */
export const TabGroup = forwardRef<HTMLDivElement, TabGroupProps>(
  (
    {
      tabs,
      activeTab,
      onTabChange,
      className,
      size = 'md',
      variant = 'default',
      showDescriptions = true,
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: 'p-1 text-sm',
      md: 'p-2 text-base',
      lg: 'p-3 text-lg',
    };

    const baseContainerClasses = cn(
      'flex',
      'gap-3',
      'rounded-2xl',
      'bg-[var(--color-surface-base)]',
      'border',
      'border-[var(--color-border-subtle)]',
      'backdrop-blur-sm',
      'shadow-lg',
    );

    const containerClasses = cn(
      baseContainerClasses,
      sizeClasses[size],
      variant === 'pill' && 'rounded-full',
      variant === 'cards' && 'bg-transparent border-none gap-2',
      className,
    );

    return (
      <div ref={ref} className={containerClasses} role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCards = variant === 'cards';

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                // Base flex layout
                'flex-1',
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'gap-2',
                'rounded-xl',
                'transition-all',
                'duration-300',
                'ease-out',
                'relative',
                'group',

                // State-based backgrounds
                isActive
                  ? 'bg-[var(--color-surface-elevated)]'
                  : 'hover:bg-[var(--color-surface-tertiary)]',

                // Focus and active states
                isActive && 'ring-2 ring-purple-500/30 ring-offset-2 ring-offset-[var(--color-background-primary)]',

                // Cards variant
                isCards && 'bg-transparent hover:bg-[var(--color-surface-base)]',

                // Size-specific padding
                size === 'sm' && 'p-3 min-w-[100px]',
                size === 'md' && 'p-4 min-w-[140px]',
                size === 'lg' && 'p-5 min-w-[160px]',
              )}
              style={{ outline: 'none' }}
            >
              {/* Icon Container */}
              {tab.icon && (
                <div
                  className={cn(
                    'p-3',
                    'rounded-lg',
                    'transition-all',
                    'duration-300',
                    'border',
                    isActive
                      ? 'bg-purple-500/20 scale-110 border-purple-400/50'
                      : 'bg-[var(--color-surface-base)] border-[var(--color-border-subtle)]',
                    isCards && 'bg-transparent border-none',
                  )}
                >
                  {tab.icon}
                </div>
              )}

              {/* Text Content */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    'font-semibold',
                    'transition-colors',
                    'duration-300',
                    isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)]',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base',
                  )}
                >
                  {tab.label}
                </span>

                {/* Description (collapsible) */}
                {showDescriptions && tab.description && (
                  <span
                    className={cn(
                      'text-center',
                      'transition-all',
                      'duration-300',
                      'leading-tight',
                      'overflow-hidden',
                      isActive
                        ? 'opacity-90 text-[var(--color-text-primary)]'
                        : 'opacity-0 text-[var(--color-text-tertiary)]',
                      'h-0',
                      'group-hover:h-auto',
                      'group-hover:opacity-100',
                      'group-focus-within:h-auto',
                      'group-focus-within:opacity-100',
                      size === 'sm' && 'text-[10px]',
                      size === 'md' && 'text-xs',
                      size === 'lg' && 'text-sm',
                    )}
                  >
                    {tab.description}
                  </span>
                )}
              </div>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className={cn(
                  'absolute',
                  'bottom-0',
                  'left-0',
                  'right-0',
                  'h-0.5',
                  'bg-gradient-to-r',
                  'from-purple-400',
                  'via-pink-400',
                  'to-purple-400',
                  'animate-pulse',
                  isCards && 'opacity-50',
                )} />
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

TabGroup.displayName = 'TabGroup';
