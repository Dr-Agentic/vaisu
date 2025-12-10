import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Download, HelpCircle, ChevronDown } from 'lucide-react';
import type { UMLDiagramData } from '@shared/types';
import type { FilterState } from '../stores/umlDiagramStore';

interface ControlPanelProps {
  data: UMLDiagramData;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onExport?: (format: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showLegend: boolean;
  onToggleLegend: () => void;
}

export function ControlPanel({
  data,
  filters,
  onFilterChange,
  onExport,
  zoom,
  onZoomChange,
  showLegend,
  onToggleLegend
}: ControlPanelProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleZoomIn = () => {
    onZoomChange(Math.min(3.0, zoom * 1.2));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.1, zoom / 1.2));
  };

  const handleResetZoom = () => {
    onZoomChange(1.0);
  };

  const handleExportClick = (format: string) => {
    if (onExport) {
      onExport(format);
      setShowExportMenu(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 relative">
      {/* Left side - Filters */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-gray-700">
          UML Class Diagram
        </div>

        {/* TODO: Add filter controls */}
        <div className="text-xs text-gray-500">
          {data.classes.length} classes
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-l-lg"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <div className="px-3 py-2 text-sm font-mono border-x border-gray-300 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-gray-100 rounded-r-lg border-l border-gray-300"
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* View Controls */}
        <button
          onClick={onToggleLegend}
          className={`p-2 rounded-lg border ${showLegend
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 hover:bg-gray-100'
            }`}
          title="Toggle Legend"
        >
          <HelpCircle size={16} />
        </button>

        {/* Export */}
        {onExport && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`p-2 rounded-lg border flex items-center gap-1 ${showExportMenu
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-100'
                }`}
              title="Export Diagram"
            >
              <Download size={16} />
              <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                <button
                  onClick={() => handleExportClick('png')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="font-mono text-xs border border-gray-200 rounded px-1">PNG</span>
                  Image
                </button>
                <button
                  onClick={() => handleExportClick('svg')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="font-mono text-xs border border-gray-200 rounded px-1">SVG</span>
                  Vector
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside listener could go here or use a library, but simplest is full-screen transparent div overlay when menu open, but omitted for brevity */}
    </div>
  );
}