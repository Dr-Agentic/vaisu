import React, { useEffect, useRef } from 'react';
import { GraphViewerLayout } from '../../visualizations/toolkit/GraphViewerLayout';
import { useArgumentMapStore } from './stores/argumentMapStore';
import { VisualizationControls } from './components/VisualizationControls';
import { GraphEntityCard } from './ArgumentNodeCard';
import { ArgumentMapProps, ArgumentMapData } from './types';

export const ArgumentMap: React.FC<ArgumentMapProps> = () => {
  const store = useArgumentMapStore();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load sample data for demonstration
    const sampleData: ArgumentMapData = {
      nodes: [
        {
          id: 'claim-1',
          type: 'CLAIM',
          text: 'Renewable energy is essential for combating climate change',
          confidence: 0.9,
          metadata: {
            source: 'IPCC Report 2023',
            strength: 'STRONG',
            category: 'Environmental Policy'
          }
        },
        {
          id: 'evidence-1',
          type: 'EVIDENCE',
          text: 'Fossil fuel emissions are the primary driver of global warming',
          confidence: 0.95,
          metadata: {
            source: 'NASA Climate Data',
            category: 'Scientific Evidence'
          }
        },
        {
          id: 'evidence-2',
          type: 'EVIDENCE',
          text: 'Renewable energy costs have decreased by 80% in the last decade',
          confidence: 0.85,
          metadata: {
            source: 'IRENA Report',
            category: 'Economic Analysis'
          }
        },
        {
          id: 'conclusion-1',
          type: 'CONCLUSION',
          text: 'Governments should invest heavily in renewable energy infrastructure',
          confidence: 0.88,
          metadata: {
            source: 'Policy Analysis',
            category: 'Policy Recommendation'
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'claim-1',
          target: 'evidence-1',
          type: 'SUPPORTS',
          strength: 0.9,
          metadata: {
            description: 'Evidence supports the claim about renewable energy necessity'
          }
        },
        {
          id: 'edge-2',
          source: 'claim-1',
          target: 'evidence-2',
          type: 'SUPPORTS',
          strength: 0.8,
          metadata: {
            description: 'Economic viability strengthens the argument'
          }
        },
        {
          id: 'edge-3',
          source: 'evidence-1',
          target: 'conclusion-1',
          type: 'ELABORATES',
          strength: 0.85,
          metadata: {
            description: 'Policy conclusion elaborates on the evidence'
          }
        },
        {
          id: 'edge-4',
          source: 'evidence-2',
          target: 'conclusion-1',
          type: 'DEPENDS_ON',
          strength: 0.75,
          metadata: {
            description: 'Conclusion depends on economic feasibility'
          }
        }
      ]
    };

    store.loadVisualization(sampleData);
  }, [store.loadVisualization]);

  const handleNodeClick = (node: any) => {
    store.selectNode(node.id);
  };

  const handleNodeHover = (node: any) => {
    store.hoverNode(node ? node.id : null);
  };

  if (store.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-300">Loading argument map...</span>
      </div>
    );
  }

  if (store.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 dark:text-red-400">
          <p>Error loading visualization: {store.error}</p>
          <button
            onClick={() => store.loadVisualization({ nodes: [], edges: [] })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <GraphViewerLayout
      title="Semantic Argument Map"
      description="Interactive visualization of complex argument structures with claims, evidence, and relationships"
    >
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        {/* SVG-based 2D graph visualization */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="w-full h-full"
          style={{ backgroundColor: '#0a0f1f' }}
        >
          {/* Edges */}
          {store.edges.map(edge => (
            <line
              key={edge.id}
              x1="100"
              y1="100"
              x2="700"
              y2="500"
              stroke="#ffffff"
              strokeWidth={edge.strength || 1}
              opacity={0.6}
            />
          ))}

          {/* Nodes */}
          {store.nodes.map((node, index) => {
            // Simple layout for demonstration - in a real implementation,
            // you would use a force-directed layout algorithm or D3.js
            const x = 100 + (index * 150);
            const y = 100 + ((index % 3) * 150);

            return (
              <g key={node.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill="#3B82F6"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => handleNodeHover(node)}
                  onMouseLeave={() => handleNodeHover(null)}
                />
                <text
                  x={x}
                  y={y - 30}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  className="pointer-events-none"
                >
                  {node.text.substring(0, 20)}...
                </text>
              </g>
            );
          })}
        </svg>

        {/* Node Cards (Positioned over the SVG) */}
        <div className="absolute inset-0 pointer-events-none">
          {store.nodes.map((node, index) => {
            // Simple layout for demonstration
            const x = 100 + (index * 150);
            const y = 100 + ((index % 3) * 150);

            return (
              <div
                key={node.id}
                id={`node-${node.id}`}
                className="pointer-events-auto"
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <GraphEntityCard
                  node={node}
                  isSelected={store.selectedNodeId === node.id}
                  isHovered={store.hoveredNodeId === node.id}
                  onFocus={(id) => store.hoverNode(id)}
                />
              </div>
            );
          })}
        </div>

        <VisualizationControls />
      </div>
    </GraphViewerLayout>
  );
};
