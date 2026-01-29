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

import { forwardRef } from 'react';

import { Badge } from '../../components/primitives';
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
    id: 'entity-graph',
    name: 'Entity Flow',
    description: 'Narrative trajectory and depth',
    icon: '⚡',
    shortcut: 4,
  },
  {
    id: 'argument-map',
    name: 'Argument Map',
    description: 'Depth Graph of logic structure',
    icon: '🏔️',
    shortcut: 5,
  },
  {
    id: 'uml-class-diagram',
    name: 'UML Class',
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
    name: 'Terms',
    description: 'Extracted glossary and jargon',
    icon: '📖',
    shortcut: 8,
  },
  {
    id: 'depth-graph',
    name: 'Depth Graph',
    description: 'Argument depth and complexity',
    icon: '🧊',
    shortcut: 9,
  },
];

/**
 * VisualizationSidebar
 *
 * Premium collapsible sidebar with "Elite" design aesthetics.
 * Features:
 * - Glassmorphism surface
 * - Card-based navigation items
 * - Active state with aurora glow
 * - Dynamic badges for recommendations
 */
export const VisualizationSidebar = forwardRef<
  HTMLDivElement,
  VisualizationSidebarProps
>(
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
          'flex flex-col transition-all duration-500 ease-[var(--ease-out)] relative z-30',
          collapsed ? 'w-0 opacity-0' : 'w-[300px] opacity-100',
          collapsed ? 'overflow-hidden' : 'overflow-y-auto',
        )}
        style={{
          background: 'linear-gradient(to right, var(--color-surface-base), var(--color-surface-secondary))',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Section Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-base)]/50 backdrop-blur-sm sticky top-0 z-10">
          <span className="text-[10px] items-center flex gap-2 uppercase tracking-[0.2em] font-bold text-[var(--color-text-tertiary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-1)] shadow-[0_0_8px_var(--aurora-1)]" />
            Perspectives
          </span>
          <span className="text-[10px] font-mono opacity-30 text-[var(--color-text-tertiary)]">
            VAISU-V2
          </span>
        </div>

        {/* Visualization List */}
        <div className="flex-1 p-4 space-y-3">
          {visualizations.map((viz) => {
            const isActive = currentViz === viz.id;
            return (
              <button
                key={viz.id}
                type="button"
                onClick={() => onVizChange(viz.id)}
                className={cn(
                  'w-full text-left group relative p-3 rounded-xl transition-all duration-300',
                  'border border-transparent',
                  isActive
                    ? 'bg-[var(--color-surface-elevated)] border-[var(--aurora-1)]/30 shadow-lg shadow-black/20'
                    : 'hover:bg-[var(--color-surface-secondary)]/80 hover:border-[var(--color-border-subtle)]',
                )}
                aria-label={`Switch to ${viz.name}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-300',
                    isActive
                      ? 'bg-[var(--gradient-aurora)] shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white'
                      : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] group-hover:scale-110',
                  )}>
                    {viz.icon}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn(
                        'text-sm font-bold truncate tracking-tight transition-colors',
                        isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
                      )}>
                        {viz.name}
                      </span>
                      {viz.shortcut && (
                        <kbd className="text-[10px] font-mono opacity-30 group-hover:opacity-60 transition-opacity">
                          [{viz.shortcut}]
                        </kbd>
                      )}
                    </div>
                    <span className="text-[11px] leading-tight text-[var(--color-text-tertiary)] line-clamp-2 mt-0.5">
                      {viz.description}
                    </span>
                    {viz.badge && (
                      <div className="mt-2">
                        <Badge variant="aurora" size="sm" className="font-mono text-[9px] py-0 px-2 min-h-0 h-5">
                          {viz.badge}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute -left-1 top-3 bottom-3 w-1 rounded-full bg-[var(--aurora-1)] shadow-[0_0_10px_var(--aurora-1)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info or stats could go here */}
      </aside>
    );
  },
);

VisualizationSidebar.displayName = 'VisualizationSidebar';
