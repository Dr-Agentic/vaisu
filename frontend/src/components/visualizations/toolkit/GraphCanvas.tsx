import React from 'react';

interface GraphCanvasProps {
  children: React.ReactNode;
  className?: string;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full h-full overflow-x-auto overflow-y-auto ${className}`}>
      {/* 
        Relative Anchor: This container provides the coordinate reference frame 
        for absolute positioning of nodes and SVG lines.
        Min-width ensures content doesn't get squashed.
      */}
      <div 
        id="graph-canvas-anchor"
        className="relative min-w-full min-h-full p-8"
      >
        {children}
      </div>
    </div>
  );
};
