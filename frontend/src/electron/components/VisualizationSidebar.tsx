/**
 * VisualizationSidebar Component
 *
 * Sidebar for switching between visualization types.
 * Shows available visualizations with active state highlighting.
 *
 * @example
 * ```tsx
 * <VisualizationSidebar
 *   currentViz="mind-map"
 *   onVizChange={(viz) => setCurrentViz(viz)}
 * />
 * ```
 */

import { forwardRef } from 'react';

import { Badge } from '../../design-system/components/Badge';
import { cn } from '../../lib/utils';

import type { VisualizationType as SharedVisualizationType } from '@shared/types';

// Re-export the shared type for convenience
export type VisualizationType = SharedVisualizationType;

export interface VisualizationOption {
  /**
   * Visualization type key
   */
  id: VisualizationType;
  /**
   * Display name
   */
  name: string;
  /**
   * Description
   */
  description: string;
  /**
   * Icon or emoji
   */
  icon?: string;
  /**
   * Optional badge text
   */
  badge?: string;
  /**
   * Keyboard shortcut number (1-6)
   */
  shortcut?: number;
}

export interface VisualizationSidebarProps {
  /**
   * Currently selected visualization
   */
  currentViz: VisualizationType;
  /**
   * Callback when visualization changes
   */
  onVizChange: (viz: VisualizationType) => void;
  /**
   * Whether sidebar is collapsed
   */
  collapsed?: boolean;
  /**
   * Custom visualization options
   */
  visualizations?: VisualizationOption[];
}

/**
 * Default visualization options
 */
const DEFAULT_VISUALIZATIONS: VisualizationOption[] = [
  {
    id: 'executive-dashboard',
    name: 'Executive View',
    description: 'High-level summary, KPIs, and strategic insights',
    icon: '💼',
    badge: 'Recommended',
    shortcut: 1,
  },
  {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'Hierarchical structure of key concepts',
    icon: '🧠',
    shortcut: 2,
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Entity relationships and connections',
    icon: '🕸️',
    shortcut: 3,
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological flow of arguments',
    icon: '📅',
    shortcut: 4,
  },
  {
    id: 'argument-map',
    name: 'Argument Map',
    description: 'Depth Graph of argument structure',    icon: '🏔️',
    shortcut: 5,
  },
  {
    id: 'uml-class-diagram',
    name: 'UML Class Diagram',
    description: 'Class relationships and structure',
    icon: '📐',
    shortcut: 6,
  },
  {
    id: 'structured-view',
    name: 'Structured View',
    description: 'Formatted document overview',
    icon: '📋',
    shortcut: 7,
  },
  {
    id: 'terms-definitions',
    name: 'Terms & Definitions',
    description: 'Extracted terms, acronyms, and technical jargon',
    icon: '📖',
    shortcut: 8,
  },
  {
    id: 'depth-graph',
    name: 'Depth Graph',
    description: 'Visualization of argument depth and complexity',
    icon: '🧊',
    shortcut: 9,
  },
];

/**
 * VisualizationSidebar
 *
 * Collapsible sidebar with visualization list and summary panel.
 * Uses SOTA void background colors and viz-item pattern.
 */
export const VisualizationSidebar = forwardRef<HTMLDivElement, VisualizationSidebarProps>(
  (
    {
      currentViz,
      onVizChange,
      collapsed = false,
      visualizations = DEFAULT_VISUALIZATIONS,
    },
    ref,
  ) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'flex',
          'flex-col',
          'transition-all',
          'duration-[var(--duration-normal)]',
          'ease-[var(--ease-out)]',
          collapsed ? 'w-0' : 'w-[280px]',
          collapsed ? 'overflow-hidden' : 'overflow-y-auto',
        )}
        style={{
          backgroundColor: 'var(--color-surface-base)',
          borderRightColor: 'var(--color-border-subtle)',
          borderRightWidth: '1px',
          borderRightStyle: 'solid',
        }}
      >
        {/* Header */}
        <div
          className={cn(
            'px-[var(--spacing-lg)]',
            'py-[var(--spacing-md)]',
            'border-b',
            'text-xs',
            'uppercase',
            'tracking-wider',
            'font-medium',
          )}
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          Visualizations
        </div>

        {/* Visualization List */}
        <div className="flex-1 p-[var(--spacing-sm)] space-y-[var(--spacing-xs)]">
          {visualizations.map((viz) => (
            <button
              key={viz.id}
              type="button"
              onClick={() => onVizChange(viz.id)}
              className={cn(
                'w-full',
                'text-left',
                'viz-item',
                currentViz === viz.id && 'active',
                'transition-all',
                'duration-[var(--duration-fast)]',
                'ease-[var(--ease-out)]',
                'p-2',
              )}
              aria-label={`Switch to ${viz.name}`}
              aria-current={currentViz === viz.id ? 'true' : undefined}
            >
              {/* Compact one-line layout */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{viz.icon}</span>
                    <span className="font-medium text-sm truncate">{viz.name}</span>
                    {viz.badge && (
                      <Badge variant="aurora" size="sm">
                        {viz.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] truncate mt-[var(--spacing-sm)]">
                    {viz.description}
                  </div>
                </div>

                {/* Keyboard shortcut hint - inline */}
                {viz.shortcut && (
                  <div
                    className="flex-shrink-0"
                    style={{
                      color: 'var(--color-text-tertiary)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    <kbd
                      className={cn(
                        'px-1',
                        'py-0.5',
                        'border',
                        'rounded',
                        'font-mono',
                        'text-xs',
                      )}
                      style={{
                        backgroundColor: 'var(--color-surface-elevated)',
                        borderColor: 'var(--color-border-subtle)',
                      }}
                    >
                      {viz.shortcut}
                    </kbd>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Summary Panel - Removed as requested */}
      </aside>
    );
  },
);

VisualizationSidebar.displayName = 'VisualizationSidebar';
