import { useEffect, useState, forwardRef, useCallback } from "react";
import { useDocumentStore } from "../../stores/documentStore";
import { VisualizationRenderer } from "../visualization/VisualizationRenderer";
import {
  VisualizationSidebar,
  type VisualizationType,
} from "../visualization/VisualizationSidebar";
import { StageHeader } from "./StageHeader";
import { GraphViewerLayout } from "../../components/visualizations/toolkit";

export interface StageVisualizationProps {
  /**
   * Callback when back button is clicked (optional, for future use)
   */
  onBack?: () => void;
}

/**
 * StageVisualization
 *
 * Full visualization workspace using StageHeader and GraphViewerLayout.
 * Integrated with VisualizationSidebar and VisualizationRenderer.
 */
export const StageVisualization = forwardRef<
  HTMLDivElement,
  StageVisualizationProps
>(({ onBack }, ref) => {
  const {
    document,
    currentVisualization,
    setCurrentVisualization,
    visualizationData,
  } = useDocumentStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Viz shortcuts: 1-9
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
        const vizTypes: VisualizationType[] = [
          "executive-dashboard",
          "mind-map",
          "knowledge-graph",
          "entity-graph",
          "argument-map",
          "uml-class-diagram",
          "structured-view",
          "terms-definitions",
          "depth-graph",
        ];
        const index = parseInt(e.key) - 1;
        if (vizTypes[index]) {
          setCurrentVisualization(vizTypes[index]);
        }
      }

      // Sidebar toggle: S or s (only when not in input fields)
      if (
        (e.key === "s" || e.key === "S") &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        )
      ) {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    },
    [setCurrentVisualization, sidebarCollapsed],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleVizChange = (viz: VisualizationType) => setCurrentVisualization(viz);

  // Summary data for sidebar
  const summary = document
    ? {
      tlrd: document.analysis?.tldr
        ? typeof document.analysis.tldr === "string"
          ? document.analysis.tldr
          : document.analysis.tldr.text
        : "",
      keyEntities:
        document.analysis?.entities?.slice(0, 5).map((e) => e.text) || [],
      wordCount: document.metadata.wordCount,
    }
    : undefined;

  if (!document) {
    return (
      <div
        ref={ref}
        className="flex-1 flex items-center justify-center bg-[var(--color-background-primary)] text-[var(--color-text-secondary)]"
      >
        <p>No document loaded</p>
      </div>
    );
  }



  return (
    <div
      ref={ref}
      className="flex-1 flex flex-col bg-[var(--color-background-primary)] relative overflow-hidden"
    >
      {/* Background decorative glow similar to Dashboard */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--color-interactive-primary-base)] to-transparent opacity-5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-[var(--color-interactive-accent-base)] to-transparent opacity-5 blur-3xl pointer-events-none" />

      <StageHeader
        title={document.title}
        documentId={document.id}
        wordCount={document.metadata.wordCount}
        vizCount={visualizationData.size}
        onBack={onBack}
        onToggleSidebar={toggleSidebar}
        className="z-50 relative"
      />

      <div className="flex-1 flex overflow-hidden relative z-0">
        <VisualizationSidebar
          currentViz={currentVisualization}
          onVizChange={handleVizChange}
          summary={summary}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        <main className="flex-1 relative overflow-hidden flex flex-col p-4">
          <div className="flex-1 rounded-xl overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)]/50 backdrop-blur-sm shadow-sm relative">
            <GraphViewerLayout title="">
              <VisualizationRenderer />
            </GraphViewerLayout>
          </div>
        </main>
      </div>
    </div>
  );
});

StageVisualization.displayName = "StageVisualization";
