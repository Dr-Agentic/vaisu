import React from 'react';

interface GraphEdgeLayerProps {
  children: React.ReactNode;
}

export const GraphEdgeLayer: React.FC<GraphEdgeLayerProps> = ({ children }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Standard Arrowhead Marker */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="var(--color-border-strong)"
            className="dark:fill-gray-500"
          />
        </marker>

        {/* Active/Highlight Marker */}
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="var(--color-primary)"
          />
        </marker>
      </defs>

      {children}
    </svg>
  );
};
