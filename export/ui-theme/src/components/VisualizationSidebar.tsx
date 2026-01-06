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
 *   summary={{ tlrd: '...', keyEntities: [...] }}
 *   summaryVisible={true}
 *   onToggleSummary={() => setSummaryVisible(!summaryVisible)}
 * />
 * ```
 */

import { ChevronLeft } from 'lucide-react';
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

export interface DocumentSummary {
  /**
   * TL;DR summary
   */
  tlrd?: string;
  /**
   * Key entities
   */
  keyEntities?: string[];
  /**
   * Word count
   */
  wordCount?: number;
  /**
   * Analysis time
   */
  analysisTime?: string;
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
   * Document summary data
   */
  summary?: DocumentSummary;
  /**
   * Whether summary panel is visible
   */
  summaryVisible?: boolean;
  /**
   * Callback to toggle summary visibility
   */
  onToggleSummary?: () => void;
  /**
   * Whether sidebar is collapsed
   */
  collapsed?: boolean;
  /**
   * Callback to toggle sidebar collapse
   */
  onToggleCollapse?: () => void;
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
    description: 'Depth Graph of argument structure',
    icon: '🏔️',
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
      onToggleCollapse,
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
        {/* Collapse Button (shown when not collapsed) */}
        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'absolute',
              'top-4',
              'right-4',
              'p-1',
              'rounded-md',
              'transition-all',
              'duration-[var(--duration-fast)]',
            )}
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--color-text-primary)';
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div
          className={cn(
            'px-4',
            'py-3',
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
        <div className="flex-1 p-2 space-y-1">
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
                  <div className="text-xs text-gray-600 truncate mt-1">
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
