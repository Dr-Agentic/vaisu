/**
 * StageVisualization Component
 *
 * Full visualization stage with sidebar, canvas, and toolbar.
 * Supports keyboard shortcuts and fullscreen mode.
 *
 * @example
 * ```tsx
 * <StageVisualization
 *   onBack={() => setStage('input')}
 *   onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
 * />
 * ```
 */

import {
  ArrowLeft,
  Menu,
  Info,
} from 'lucide-react';
import { useEffect, useState, forwardRef, useCallback } from 'react';

import { Button } from '../../components/primitives';
import { cn } from '../../lib/utils';
import { useDocumentStore } from '../../stores/documentStore';
import { VisualizationRenderer } from '../visualization/VisualizationRenderer';
import { VisualizationSidebar, type VisualizationType } from '../visualization/VisualizationSidebar';

export interface StageVisualizationProps {
  /**
   * Callback when back button is clicked (optional, for future use)
   */
  onBack?: () => void;
}

/**
 * StageVisualization
 *
 * Full visualization workspace with header, sidebar, canvas, and toolbar.
 * Includes keyboard shortcuts (1-6 for viz, F for fullscreen, Esc to exit).
 * Uses SOTA void background colors and mesh-glow effects.
 */
export const StageVisualization = forwardRef<HTMLDivElement, StageVisualizationProps>(
  ({ onBack }, ref) => {
    const {
      document,
      currentVisualization,
      setCurrentVisualization,
      visualizationData,
    } = useDocumentStore();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [summaryVisible, setSummaryVisible] = useState(true);

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      // Viz shortcuts: 1-8
      if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(e.key)) {
        const vizTypes: VisualizationType[] = [
          'executive-dashboard',
          'mind-map',
          'knowledge-graph',
          'timeline',
          'argument-map',
          'uml-class-diagram',
          'structured-view',
          'terms-definitions',
        ];
        const index = parseInt(e.key) - 1;
        if (vizTypes[index]) {
          setCurrentVisualization(vizTypes[index]);
        }
      }

      // Sidebar toggle: S or s (only when not in input fields)
      if ((e.key === 's' || e.key === 'S')
          && !(e.target instanceof HTMLInputElement
            || e.target instanceof HTMLTextAreaElement
            || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    }, [currentVisualization, sidebarCollapsed, setCurrentVisualization]);

    useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const toggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleSummary = () => {
      setSummaryVisible(!summaryVisible);
    };

    const handleVizChange = (viz: VisualizationType) => {
      setCurrentVisualization(viz);
    };

    // Summary data for sidebar
    const summary = document ? {
      tlrd: document.analysis?.tldr ? (typeof document.analysis.tldr === 'string' ? document.analysis.tldr : document.analysis.tldr.text) : '',
      keyEntities: document.analysis?.entities?.slice(0, 5).map(e => e.text) || [],
      wordCount: document.metadata.wordCount,
    } : undefined;

    if (!document) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex-1',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
          )}
          style={{
            backgroundColor: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>No document loaded</p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex-1', 'flex', 'flex-col')}
        style={{
          backgroundColor: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Header */}
        <header
          className={cn(
            'h-[60px]',
            'px-6',
            'border-b',
            'flex',
            'items-center',
            'justify-between',
          )}
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-base)',
          }}
        >
          {/* Document Info */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h3
                className={cn('text-base', 'font-semibold')}
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {document.title || 'Untitled Document'}
              </h3>
              <span
                className="font-mono opacity-50"
                style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}
              >
                ID: {document.id}
              </span>
            </div>
            <span
              className="text-sm"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {document.metadata.wordCount?.toLocaleString()} words · {visualizationData.size} viz
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={onBack}
                title="Back"
              >
                <span />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Menu className="w-4 h-4" />}
              onClick={toggleSidebar}
              title="Toggle Sidebar (S)"
            >
              <span />
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Info className="w-4 h-4" />}
              onClick={toggleSummary}
              title="Toggle Summary"
            >
              <span />
            </Button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex">
          {/* Visualization Sidebar */}
          <VisualizationSidebar
            currentViz={currentVisualization}
            onVizChange={handleVizChange}
            summary={summary}
            summaryVisible={summaryVisible}
            onToggleSummary={toggleSummary}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />

          {/* Visualization Canvas */}
          <div
            className={cn(
              'flex-1',
              'relative',
              'overflow-auto',
              'mesh-glow',
            )}
            style={{
              backgroundColor: 'var(--color-background-primary)',
            }}
          >
            {/* Visualization Renderer */}
            <div className="w-full h-full">
              <VisualizationRenderer />
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint - Removed as requested */}
      </div>
    );
  },
);

StageVisualization.displayName = 'StageVisualization';
