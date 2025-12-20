import { useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng, toSvg } from 'html-to-image';
import type { UMLDiagramData, ClassEntity, UMLRelationship } from '@shared/types';
import { DiagramCanvas } from './components/DiagramCanvas';
import { ControlPanel } from './controls/ControlPanel';
import { TooltipManager } from './components/TooltipManager';
import { LegendPanel } from './controls/LegendPanel';
import { useUMLDiagramStore } from './stores/umlDiagramStore';
import { useUMLLayout } from './hooks/useUMLLayout';
import { useUMLKeyboard } from './hooks/useUMLKeyboard';

export interface UMLClassDiagramProps {
  data: UMLDiagramData;
  initialZoom?: number;
  onClassSelect?: (classEntity: ClassEntity) => void;
  onExport?: (format: string, data: Blob) => void;
  height?: number;
}

export function UMLClassDiagram({
  data,
  initialZoom = 1.0,
  onClassSelect,
  onExport,
  height = 600
}: UMLClassDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    // State
    layoutResult,
    zoom,
    pan,
    selectedClassIds,
    hoveredElement,
    tooltipVisible,
    tooltipPosition,
    filters,
    showLegend,
    isLayouting,

    // Actions
    setData,
    setZoom,
    setPan,
    selectClass,
    setHoveredElement,
    applyFilters,
    toggleLegend,
    resetView
  } = useUMLDiagramStore();

  // Initialize data and layout
  const { computeLayout } = useUMLLayout();

  useEffect(() => {
    setData(data);
    setZoom(initialZoom);
    computeLayout(data.classes, data.relationships);
  }, [data, initialZoom, setData, setZoom, computeLayout]);

  // Export handlers
  const handleExport = useCallback(async (format: string) => {
    if (!containerRef.current) return;

    try {
      let dataUrl: string;
      if (format === 'png') {
        dataUrl = await toPng(containerRef.current, { backgroundColor: '#ffffff' });
      } else if (format === 'svg') {
        dataUrl = await toSvg(containerRef.current, { backgroundColor: '#ffffff' });
      } else {
        return;
      }

      // Convert Data URL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Download locally if onExport is not provided, otherwise delegate
      if (onExport) {
        onExport(format, blob);
      } else {
        const link = document.createElement('a');
        link.download = `uml-diagram.${format}`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to export diagram:', err);
    }
  }, [onExport]);

  // Keyboard shortcuts
  useUMLKeyboard({
    onFocusMode: () => {
      // TODO: Implement focus mode
    },
    onResetView: resetView,
    onExport: () => handleExport('png'),
    onToggleLegend: toggleLegend
  });

  // Handle class selection
  const handleClassSelect = useCallback((classEntity: ClassEntity, multi: boolean = false) => {
    selectClass(classEntity.id, multi);
    onClassSelect?.(classEntity);
  }, [selectClass, onClassSelect]);

  // Handle hover
  const handleHover = useCallback((element: ClassEntity | null, event?: MouseEvent) => {
    if (element && event) {
      setHoveredElement(element, { x: event.clientX, y: event.clientY });
    } else {
      setHoveredElement(null);
    }
  }, [setHoveredElement]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!data) return null;

    const visibleClasses = data.classes.filter((cls: ClassEntity) => {
      const typeMatch = filters.visibleTypes.has(cls.type);
      const stereotypeMatch = !cls.stereotype || filters.visibleStereotypes.has(cls.stereotype);
      const packageMatch = !cls.package || filters.visiblePackages.has(cls.package);
      const searchMatch = !filters.searchQuery ||
        cls.name.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return typeMatch && stereotypeMatch && packageMatch && searchMatch;
    });

    const visibleClassIds = new Set(visibleClasses.map((c: ClassEntity) => c.id));

    const visibleRelationships = data.relationships.filter((rel: UMLRelationship) => {
      const typeMatch = filters.visibleRelationships.has(rel.type);
      const endpointsVisible = visibleClassIds.has(rel.source) && visibleClassIds.has(rel.target);

      return typeMatch && endpointsVisible;
    });

    return {
      ...data,
      classes: visibleClasses,
      relationships: visibleRelationships
    };
  }, [data, filters]);

  if (!data || !filteredData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No UML data available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Control Panel */}
      <ControlPanel
        data={filteredData}
        filters={filters}
        onFilterChange={applyFilters}
        onExport={handleExport}
        zoom={zoom}
        onZoomChange={setZoom}
        showLegend={showLegend}
        onToggleLegend={toggleLegend}
      />

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height }}
        role="application"
        aria-label="UML Class Diagram"
      >
        {/* Loading Overlay */}
        {isLayouting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Computing layout...</span>
            </div>
          </motion.div>
        )}

        {/* Diagram Canvas */}
        <DiagramCanvas
          data={filteredData}
          layoutResult={layoutResult}
          zoom={zoom}
          pan={pan}
          selectedClassIds={selectedClassIds}
          hoveredElement={hoveredElement}
          onClassSelect={handleClassSelect}
          onHover={handleHover}
          onPanChange={setPan}
          onZoomChange={setZoom}
        />

        {/* Legend Panel */}
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 z-20"
          >
            <LegendPanel />
          </motion.div>
        )}
      </div>

      {/* Tooltip */}
      <TooltipManager
        visible={tooltipVisible}
        element={hoveredElement}
        position={tooltipPosition}
      />

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between items-center">
        <div>
          {filteredData.classes.length} classes, {filteredData.relationships.length} relationships
        </div>
        <div>
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}