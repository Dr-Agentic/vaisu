import React, { useEffect, useRef, useState } from 'react';
import type { MindMapData, MindMapNode } from '../../../../shared/src/types';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MindMapProps {
  data: MindMapData;
}

interface NodePosition {
  x: number;
  y: number;
}

export function MindMap({ data }: MindMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());

  useEffect(() => {
    if (data.root) {
      calculateNodePositions();
    }
  }, [data]);

  const calculateNodePositions = () => {
    const positions = new Map<string, NodePosition>();
    
    // Start from left side
    const startX = 50;
    const startY = 400;
    
    // Position root on the left
    positions.set(data.root.id, { x: startX, y: startY });
    
    // Position children in horizontal layout
    if (data.root.children && data.root.children.length > 0) {
      positionChildrenHorizontal(data.root, startX, startY, positions);
    }
    
    setNodePositions(positions);
  };

  const positionChildrenHorizontal = (
    node: MindMapNode,
    parentX: number,
    parentY: number,
    positions: Map<string, NodePosition>,
    level: number = 0
  ) => {
    const children = node.children || [];
    if (children.length === 0) return;

    // Horizontal spacing between levels
    const levelSpacing = 250;
    const childX = parentX + levelSpacing;
    
    // Calculate total height needed for all children and their descendants
    const getSubtreeHeight = (n: MindMapNode): number => {
      if (!n.children || n.children.length === 0) return 80;
      return n.children.reduce((sum, child) => sum + getSubtreeHeight(child), 0);
    };
    
    const totalHeight = children.reduce((sum, child) => sum + getSubtreeHeight(child), 0);
    let currentY = parentY - totalHeight / 2;
    
    children.forEach((child) => {
      const childHeight = getSubtreeHeight(child);
      const childY = currentY + childHeight / 2;
      
      positions.set(child.id, { x: childX, y: childY });
      
      // Recursively position grandchildren
      if (child.children && child.children.length > 0) {
        positionChildrenHorizontal(child, childX, childY, positions, level + 1);
      }
      
      currentY += childHeight;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.mind-map-canvas')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const renderNode = (node: MindMapNode) => {
    const pos = nodePositions.get(node.id);
    if (!pos) return null;

    const isRoot = node.id === data.root.id;
    const isSelected = selectedNode?.id === node.id;
    
    // Rectangle dimensions based on level
    const width = isRoot ? 180 : 160;
    const height = isRoot ? 50 : 40;
    const rx = 8; // Border radius
    
    // Calculate text to fit in box
    const maxChars = isRoot ? 25 : 22;
    const displayText = node.label.length > maxChars 
      ? node.label.substring(0, maxChars - 3) + '...' 
      : node.label;
    
    return (
      <g key={node.id}>
        {/* Node rectangle */}
        <rect
          x={pos.x - width / 2}
          y={pos.y - height / 2}
          width={width}
          height={height}
          rx={rx}
          ry={rx}
          fill={node.color}
          stroke={isSelected ? '#FFF' : node.color}
          strokeWidth={isSelected ? 3 : 1}
          className="cursor-pointer transition-all duration-200 hover:opacity-90"
          onClick={() => setSelectedNode(node)}
        />
        
        {/* Node label */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={isRoot ? 13 : 11}
          fontWeight={isRoot ? 'bold' : '600'}
          className="pointer-events-none select-none"
        >
          {displayText}
        </text>
      </g>
    );
  };

  const renderEdge = (parent: MindMapNode, child: MindMapNode) => {
    const parentPos = nodePositions.get(parent.id);
    const childPos = nodePositions.get(child.id);
    
    if (!parentPos || !childPos) return null;

    const isRoot = parent.id === data.root.id;
    const parentWidth = isRoot ? 180 : 160;
    
    // Start from right edge of parent
    const startX = parentPos.x + parentWidth / 2;
    const startY = parentPos.y;
    
    // End at left edge of child
    const childWidth = 160;
    const endX = childPos.x - childWidth / 2;
    const endY = childPos.y;
    
    // Create curved path for better aesthetics
    const midX = (startX + endX) / 2;
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

    return (
      <path
        key={`${parent.id}-${child.id}`}
        d={path}
        stroke={child.color}
        strokeWidth={2}
        fill="none"
        opacity={0.5}
      />
    );
  };

  const renderTree = (node: MindMapNode): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const children = node.children || [];
    
    // Render edges to children
    children.forEach(child => {
      const edge = renderEdge(node, child);
      if (edge) elements.push(edge);
    });
    
    // Render children recursively
    children.forEach(child => {
      elements.push(...renderTree(child));
    });
    
    return elements;
  };

  const renderAllNodes = (node: MindMapNode): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const nodeElement = renderNode(node);
    if (nodeElement) elements.push(nodeElement);
    
    const children = node.children || [];
    children.forEach(child => {
      elements.push(...renderAllNodes(child));
    });
    
    return elements;
  };

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="mind-map-canvas relative w-full h-full cursor-move overflow-hidden rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 2000 1200"
          preserveAspectRatio="xMinYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'left center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {/* Render edges first (behind nodes) */}
          {data.root && renderTree(data.root)}
          
          {/* Render all nodes */}
          {data.root && renderAllNodes(data.root)}
        </svg>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{selectedNode.label}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedNode.summary}</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Level:</span> {selectedNode.level}
            </div>
            <div>
              <span className="font-medium">Importance:</span>{' '}
              {(selectedNode.metadata.importance * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg shadow-sm border border-gray-200 px-3 py-2 text-xs text-gray-600">
        <div className="font-medium mb-1">Controls:</div>
        <div>• Click and drag to pan</div>
        <div>• Use zoom controls (bottom-right)</div>
        <div>• Click nodes for details</div>
        <div className="mt-1 text-gray-500">Left to right: general to detailed</div>
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-white/90 rounded-lg shadow-sm border border-gray-200 px-3 py-2 text-xs">
        <div className="font-medium text-gray-900 mb-2">Hierarchy Levels</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: '#4F46E5' }}></div>
            <span className="text-gray-600">Level 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: '#7C3AED' }}></div>
            <span className="text-gray-600">Level 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-gray-600">Level 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-gray-600">Level 4+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
