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
    const centerX = 500;
    const centerY = 400;
    
    // Position root at center
    positions.set(data.root.id, { x: centerX, y: centerY });
    
    // Position children in radial layout
    if (data.root.children && data.root.children.length > 0) {
      positionChildrenRadial(data.root, centerX, centerY, 180, 0, Math.PI * 2, positions);
    }
    
    setNodePositions(positions);
  };

  const positionChildrenRadial = (
    node: MindMapNode,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    positions: Map<string, NodePosition>
  ) => {
    const children = node.children || [];
    if (children.length === 0) return;

    const angleStep = (endAngle - startAngle) / children.length;
    
    children.forEach((child, index) => {
      const angle = startAngle + angleStep * (index + 0.5);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      positions.set(child.id, { x, y });
      
      // Recursively position grandchildren
      if (child.children && child.children.length > 0) {
        const childAngleSpan = angleStep * 0.8;
        const childStartAngle = angle - childAngleSpan / 2;
        const childEndAngle = angle + childAngleSpan / 2;
        
        positionChildrenRadial(
          child,
          x,
          y,
          radius * 0.65,
          childStartAngle,
          childEndAngle,
          positions
        );
      }
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
    
    return (
      <g key={node.id}>
        {/* Node circle */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={isRoot ? 60 : 40}
          fill={node.color}
          stroke={isSelected ? '#FFF' : 'none'}
          strokeWidth={isSelected ? 4 : 0}
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => setSelectedNode(node)}
        />
        
        {/* Node label */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={isRoot ? 14 : 11}
          fontWeight={isRoot ? 'bold' : '600'}
          className="pointer-events-none select-none"
        >
          {node.label.length > (isRoot ? 25 : 18) 
            ? node.label.substring(0, isRoot ? 22 : 15) + '...' 
            : node.label}
        </text>
      </g>
    );
  };

  const renderEdge = (parent: MindMapNode, child: MindMapNode) => {
    const parentPos = nodePositions.get(parent.id);
    const childPos = nodePositions.get(child.id);
    
    if (!parentPos || !childPos) return null;

    return (
      <line
        key={`${parent.id}-${child.id}`}
        x1={parentPos.x}
        y1={parentPos.y}
        x2={childPos.x}
        y2={childPos.y}
        stroke={parent.color}
        strokeWidth={2}
        opacity={0.6}
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
    <div className="relative w-full h-full min-h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="mind-map-canvas w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
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
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
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
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
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
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg shadow-sm border border-gray-200 px-3 py-2 text-xs text-gray-600">
        <div className="font-medium mb-1">Controls:</div>
        <div>• Click and drag to pan</div>
        <div>• Use zoom controls (bottom-right)</div>
        <div>• Click nodes for details</div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 rounded-lg shadow-sm border border-gray-200 px-3 py-2 text-xs">
        <div className="font-medium text-gray-900 mb-2">Hierarchy Levels</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#4F46E5' }}></div>
            <span className="text-gray-600">Level 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7C3AED' }}></div>
            <span className="text-gray-600">Level 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-gray-600">Level 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-gray-600">Level 4+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
