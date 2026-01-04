import React, { useEffect } from 'react';
import { useKnowledgeGraphStore } from './stores/knowledgeGraphStore';
import { useKnowledgeGraphLayout, useKnowledgeGraphInteractions, useSectorTitles } from './hooks/useKnowledgeGraphLayout';
import { GraphEntityCard } from '../toolkit/GraphEntityCard';
import { DynamicBezierPath } from '../toolkit/DynamicBezierPath';
import { GraphBackground } from '../toolkit/GraphBackground';
import { GraphConnectionModal } from '../toolkit/GraphConnectionModal';
import { GraphNode } from '../toolkit/types';
import { KnowledgeNode } from './types';
import './KnowledgeGraph.css';

/**
 * Knowledge Graph Visualization Component
 * Displays nodes and edges in a hierarchical grid layout with sector headers
 */

/**
 * Convert KnowledgeNode to GraphNode for toolkit compatibility
 */
const convertToGraphNode = (node: KnowledgeNode): GraphNode => ({
  id: node.id,
  type: node.type,
  label: node.label,
  description: node.metadata.description,
  importance: node.confidence,
  context: node.metadata.description,
  mentions: node.metadata.sources,
  metadata: {
    ...node.metadata,
    confidence: node.confidence
  },
  x: node.x,
  y: node.y,
  width: 320,
  height: 200
});

export const KnowledgeGraph: React.FC = () => {
  const {
    nodes,
    layout,
    initializeGraph,
    isInitialized,
    error,
    edges
  } = useKnowledgeGraphStore();

  // Layout management
  const { calculateLayout } = useKnowledgeGraphLayout();

  // Calculate layout when needed
  useEffect(() => {
    if (nodes.length > 0) {
      calculateLayout();
    }
  }, [nodes, calculateLayout]);

  // Interaction management
  const {
    handleNodeClick,
    handleNodeHover,
    handleEdgeHover,
    selectedNodeId,
    hoveredNodeId,
    hoveredEdgeId
  } = useKnowledgeGraphInteractions();

  // Sector title management
  const { getColumnData } = useSectorTitles();

  // Get column data
  const columnData = getColumnData();

  // Initialize graph if needed
  useEffect(() => {
    if (!isInitialized && nodes.length > 0) {
      initializeGraph(nodes, edges);
    }
  }, [nodes, isInitialized, initializeGraph]);

  // Calculate layout when layout type changes
  useEffect(() => {
    if (isInitialized) {
      calculateLayout();
    }
  }, [layout, calculateLayout, isInitialized]);

  if (error) {
    return (
      <div className="knowledge-graph-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Knowledge Graph Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Reload Graph
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized && nodes.length === 0) {
    return (
      <div className="knowledge-graph-empty">
        <div className="empty-content">
          <div className="empty-icon">🕸️</div>
          <h3>No Knowledge Graph Data</h3>
          <p>Select a document with a knowledge graph visualization to view it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="knowledge-graph-container">
      <GraphBackground />

      <div className="knowledge-graph-content">
        {columnData.map((column) => (
          <div key={column.id} className="knowledge-graph-column">
            {/* Column Header with Sector Title */}
            <div className="column-header">
              <h3 className="sector-title">
                <span className="title-text">{column.title}</span>
                <span className="node-count">({column.nodes.length} nodes)</span>
              </h3>
            </div>

            {/* Render nodes in this column */}
            <div className="column-nodes">
              {column.nodes.map((node) => {
  const graphNode = convertToGraphNode(node);
  return (
    <GraphEntityCard
      key={node.id}
      node={graphNode}
      isSelected={selectedNodeId === node.id}
      isHovered={hoveredNodeId === node.id}
      onClick={() => handleNodeClick(node.id)}
      onMouseEnter={() => handleNodeHover(node.id)}
      onMouseLeave={() => handleNodeHover(null)}
    />
  );
})}
            </div>

            {/* Render edges for this column */}
            <div className="column-edges">
              {edges.filter(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                return sourceNode?.column === column.id || targetNode?.column === column.id;
              }).map((edge) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) {
                  return null;
                }

                return (
                  <DynamicBezierPath
                    key={edge.id}
                    x1={sourceNode.x || 0}
                    y1={sourceNode.y || 0}
                    x2={targetNode.x || 0}
                    y2={targetNode.y || 0}
                    label={edge.relation}
                    isActive={hoveredEdgeId === edge.id}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Graph Connection Modal for edge inspection */}
        <GraphConnectionModal
          edge={edges.find(e => e.id === hoveredEdgeId) || null}
          sourceNode={(() => {
            const node = nodes.find(n => n.id === hoveredEdgeId?.split('_')[1]);
            return node ? convertToGraphNode(node) : undefined;
          })()}
          targetNode={(() => {
            const node = nodes.find(n => n.id === hoveredEdgeId?.split('_')[2]);
            return node ? convertToGraphNode(node) : undefined;
          })()}
          isOpen={!!hoveredEdgeId}
          onClose={() => handleEdgeHover(null)}
        />
      </div>
    </div>
  );
};
