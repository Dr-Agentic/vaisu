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
  const [summaryVisible, setSummaryVisible] = useState(true);

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
  const toggleSummary = () => setSummaryVisible(!summaryVisible);
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

  const vizOption: string = ((): string => {
    switch (currentVisualization) {
      case "executive-dashboard": return "Executive View";
      case "mind-map": return "Mind Map";
      case "knowledge-graph": return "Knowledge Graph";
      case "entity-graph": return "Entity Flow Graph";
      case "argument-map": return "Argument Map";
      case "uml-class-diagram": return "UML Class Diagram";
      case "structured-view": return "Structured View";
      case "terms-definitions": return "Terms & Definitions";
      case "depth-graph": return "Depth Graph";
      case "flowchart": return "Flowchart";
      case "comparison-matrix": return "Comparison Matrix";
      case "priority-matrix": return "Priority Matrix";
      case "raci-matrix": return "RACI Matrix";
      case "timeline": return "Timeline";
      case "uml-sequence": return "UML Sequence";
      case "uml-activity": return "UML Activity";
      case "gantt": return "Gantt Chart";
      default: return "Visualization";
    }
  })();

  return (
    <div
      ref={ref}
      className="flex-1 flex flex-col bg-[var(--color-background-primary)]"
    >
      <StageHeader
        title={document.title}
        documentId={document.id}
        wordCount={document.metadata.wordCount}
        vizCount={visualizationData.size}
        onBack={onBack}
        onToggleSidebar={toggleSidebar}
        onToggleSummary={toggleSummary}
      />

      <div className="flex-1 flex overflow-hidden">
        <VisualizationSidebar
          currentViz={currentVisualization}
          onVizChange={handleVizChange}
          summary={summary}
          summaryVisible={summaryVisible}
          onToggleSummary={toggleSummary}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        <main className="flex-1 relative overflow-hidden">
          <GraphViewerLayout title={vizOption}>
            <VisualizationRenderer />
          </GraphViewerLayout>
        </main>
      </div>
    </div>
  );
});

StageVisualization.displayName = "StageVisualization";
