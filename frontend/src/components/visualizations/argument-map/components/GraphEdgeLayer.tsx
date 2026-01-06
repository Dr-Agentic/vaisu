import React, { useEffect, useRef, useState } from 'react';

import { GraphEdgeLayerProps } from '../types';

interface PathData {
  id: string;
  path: string;
  color: string;
  width: number;
  opacity: number;
  dashArray: string;
}

export const GraphEdgeLayer: React.FC<GraphEdgeLayerProps> = ({
  nodes,
  edges,
  theme,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<PathData[]>([]);

  useEffect(() => {
    updateEdgePaths();
  }, [nodes, edges, theme]);

  const getConnectionColor = (type: string, theme: string): string => {
    const colors = theme === 'dark' ? {
      SUPPORTS: 'rgba(0, 255, 200, 0.6)',
      CONTRADICTS: 'rgba(255, 50, 50, 0.6)',
      ELABORATES: 'rgba(100, 200, 255, 0.5)',
      DEPENDS_ON: 'rgba(255, 215, 0, 0.6)',
    } : {
      SUPPORTS: '#059669',
      CONTRADICTS: '#dc2626',
      ELABORATES: '#2563eb',
      DEPENDS_ON: '#d97706',
    };

    return colors[type as keyof typeof colors] || '#ccc';
  };

  const getEdgeStyle = (edgeType: string) => {
    const styles = {
      SUPPORTS: { curve: 0.3, width: 2, opacity: 0.8, dashArray: 'none' },
      CONTRADICTS: { curve: 0.5, width: 3, opacity: 0.9, dashArray: '5,5' },
      ELABORATES: { curve: 0, width: 1, opacity: 0.6, dashArray: '2,4' },
      DEPENDS_ON: { curve: 0.2, width: 2, opacity: 0.7, dashArray: 'none' },
    };

    return styles[edgeType as keyof typeof styles] || styles.SUPPORTS;
  };

  const calculateControlPoint = (
    x1: number, y1: number,
    x2: number, y2: number,
    edgeType: string,
  ) => {
    const style = getEdgeStyle(edgeType);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    // Calculate perpendicular vector for curve
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length;
    const ny = dx / length;

    // Apply curve based on edge type
    const curveHeight = length * style.curve * (edgeType === 'CONTRADICTS' ? -1 : 1);

    return {
      x1: mx + nx * curveHeight,
      y1: my + ny * curveHeight,
      x2: mx - nx * curveHeight,
      y2: my - ny * curveHeight,
    };
  };

  const updateEdgePaths = () => {
    const newPaths: PathData[] = [];

    edges.forEach(edge => {
      const sourceNode = document.getElementById(`node-${edge.source}`);
      const targetNode = document.getElementById(`node-${edge.target}`);

      if (sourceNode && targetNode) {
        const sourceRect = sourceNode.getBoundingClientRect();
        const targetRect = targetNode.getBoundingClientRect();

        const sourceX = sourceRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top + sourceRect.height / 2;
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        const controlPoints = calculateControlPoint(
          sourceX, sourceY, targetX, targetY, edge.type,
        );

        const path = `M ${sourceX} ${sourceY} C ${controlPoints.x1} ${controlPoints.y1}, ${controlPoints.x2} ${controlPoints.y2}, ${targetX} ${targetY}`;

        const style = getEdgeStyle(edge.type);
        const color = getConnectionColor(edge.type, theme);

        newPaths.push({
          id: edge.id,
          path,
          color,
          width: style.width + (edge.strength * 2),
          opacity: style.opacity * edge.strength,
          dashArray: style.dashArray,
        });
      }
    });

    setPaths(newPaths);
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
    >
      <defs>
        {/* Arrowhead definitions */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
        </marker>

        {/* Glow filter for dark theme */}
        {theme === 'dark' && (
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>

      {paths.map(pathData => (
        <path
          key={pathData.id}
          d={pathData.path}
          stroke={pathData.color}
          strokeWidth={pathData.width}
          fill="none"
          opacity={pathData.opacity}
          strokeDasharray={pathData.dashArray}
          markerEnd="url(#arrowhead)"
          className="transition-all duration-300"
          style={{
            filter: theme === 'dark' ? 'url(#glow)' : 'none',
            strokeLinecap: 'round',
          }}
        />
      ))}
    </svg>
  );
};
