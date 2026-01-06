import { useRef, useMemo, useCallback } from 'react';

import { ArgumentMapData } from '../../../../../shared/src/types';
import { useTheme } from '../../../design-system/ThemeProvider';
import { useGraphStore } from '../knowledge-graph/stores/graphStore';

import { DepthGraphNode, DepthGraphEdge } from './interfaces';
import { createContourLines } from './services/contourGenerator';
import { transformToDepthData } from './services/depthCalculator';

interface DepthGraphProps {
    data: ArgumentMapData;
    width?: number;
    height?: number;
    className?: string;
}

export function DepthGraph({ data, width = 800, height = 600, className }: DepthGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { resolvedTheme } = useTheme();
  const {
    hoveredNodeId,
    setHoveredNode,
    selectNode,
    selectedNodeIds,
  } = useGraphStore();
  const isDarkMode = resolvedTheme === 'dark';

  // Transform data
  const graphData = useMemo(() => {
    return transformToDepthData(data);
  }, [data]);

  // Generate SVG content
  const svgContent = useMemo(() => {
    if (!graphData.nodes.length) return null;

    const nodes = graphData.nodes as DepthGraphNode[];
    const edges = graphData.links as DepthGraphEdge[];

    // Calculate viewbox
    const margin = 50;
    const minX = Math.min(...nodes.map(n => n.x || 0)) - margin;
    const maxX = Math.max(...nodes.map(n => n.x || 0)) + margin;
    const minY = Math.min(...nodes.map(n => n.y || 0)) - margin;
    const maxY = Math.max(...nodes.map(n => n.y || 0)) + margin;

    return { nodes, edges, minX, maxX, minY, maxY };
  }, [graphData]);

  // Handle node interactions
  const handleNodeClick = useCallback((node: DepthGraphNode) => {
    selectNode(node.id, false);
  }, [selectNode]);

  const handleNodeHover = useCallback((node: DepthGraphNode | null) => {
    setHoveredNode(node ? node.id : null);
  }, [setHoveredNode]);

  // Colors based on depth metrics
  const getNodeColor = useCallback((node: DepthGraphNode) => {
    const cohesionColor = isDarkMode ? '#3B82F6' : '#1E40AF'; // Blue
    const tensionColor = isDarkMode ? '#EF4444' : '#991B1B';   // Red
    const groundingColor = isDarkMode ? '#10B981' : '#047857'; // Emerald

    if (node.type === 'evidence') return groundingColor;
    if (node.depthMetrics.tension > 0.6) return tensionColor;
    return cohesionColor;
  }, [isDarkMode]);

  if (!svgContent) {
    return (
      <div className={className} style={{ width, height, position: 'relative' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 dark:text-gray-400">No data to display</div>
        </div>
      </div>
    );
  }

  const { nodes, edges, minX, maxX, minY, maxY } = svgContent;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div className={className} style={{ width, height, position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={viewBox}
        className="w-full h-full"
        style={{ backgroundColor: isDarkMode ? '#0a0a0a' : '#F5F5F7' }}
      >
        {/* Edges */}
        {edges.map(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);

          if (!source || !target) return null;

          const edgeColor = edge.type === 'attacks' || edge.type === 'rebuts' || edge.type === 'contradicts'
            ? (isDarkMode ? '#EF4444' : '#DC2626')
            : (isDarkMode ? '#ffffff' : '#000000');

          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={edgeColor}
              strokeWidth={edge.strength || 1}
              opacity={0.6}
              className="transition-colors"
            />
          );
        })}

        {/* Contour lines (simplified 2D version) */}
        {(() => {
          const contours = createContourLines(nodes);
          return contours.map((contour, index) => (
            <path
              key={index}
              d={contour.path.map(([x, y], i) =>
                i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`,
              ).join(' ')}
              fill="none"
              stroke={isDarkMode ? '#444444' : '#cccccc'}
              strokeWidth="1"
              opacity="0.5"
              className="transition-colors"
            />
          ));
        })()}

        {/* Nodes */}
        {nodes.map(node => {
          const color = getNodeColor(node);
          const isHovered = hoveredNodeId === node.id;
          const isSelected = selectedNodeIds.has(node.id);

          // Node styling based on state
          let opacity = 0.9;
          let strokeColor = color;
          let strokeWidth = 2;

          if (isHovered) {
            opacity = 1.0;
            strokeColor = '#ffffff';
            strokeWidth = 3;
          }

          if (isSelected) {
            opacity = 1.0;
            strokeColor = '#ffffff';
            strokeWidth = 4;
          }

          const nodeElement = node.type === 'claim' || node.type === 'argument' ? (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.size / 2}
              fill={color}
              opacity={opacity}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer transition-all hover:opacity-100"
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => handleNodeHover(node)}
              onMouseLeave={() => handleNodeHover(null)}
            />
          ) : (
            <rect
              key={node.id}
              x={(node.x || 0) - node.size / 2}
              y={(node.y || 0) - node.size / 2}
              width={node.size}
              height={node.size}
              fill={color}
              opacity={opacity}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer transition-all hover:opacity-100"
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => handleNodeHover(node)}
              onMouseLeave={() => handleNodeHover(null)}
            />
          );

          return (
            <g key={node.id}>
              {nodeElement}
            </g>
          );
        })}
      </svg>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 p-4 rounded-lg bg-white/90 dark:bg-black/80 pointer-events-none border border-gray-200 dark:border-gray-800 text-xs">
        <h4 className="font-bold mb-2 dark:text-gray-100">Depth Analysis</h4>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="dark:text-gray-300">Cohesion (Claims)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="dark:text-gray-300">Grounding (Evidence)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="dark:text-gray-300">Tension (Conflict)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
