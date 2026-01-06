import { useState } from 'react';

import { FlowchartData, FlowNode } from '../../../../../shared/src/types';
import {
  GraphViewerLayout,
  GraphCanvas,
  GraphEntityCard,
  GraphEdgeLayer,
  DynamicBezierPath,
} from '../toolkit';
import { GraphNode } from '../toolkit/types';

import { useFlowchartLayout } from './useFlowchartLayout';

interface FlowchartProps {
  data: FlowchartData;
}

export function Flowchart({ data }: FlowchartProps) {
  const layout = useFlowchartLayout(data);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Map FlowNode to Toolkit GraphNode format
  const getGraphNode = (node: FlowNode & { x: number, y: number }): GraphNode => ({
    id: node.id,
    type: mapFlowTypeToCardType(node.type),
    label: node.label,
    description: node.description,
    importance: 'medium', // Default
    metadata: node.swimlane ? { Swimlane: node.swimlane } : undefined,
    x: node.x,
    y: node.y,
  });

  return (
    <GraphViewerLayout
      title="Process Flow"
      description="Visual representation of the process steps and decisions."
    >
      <GraphCanvas>
        {/* Edges Layer (Behind Nodes) */}
        <GraphEdgeLayer>
          {layout.edges.map(edge => {
            const sourceNode = layout.nodes.find(n => n.id === edge.source);
            const targetNode = layout.nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;

            return (
              <DynamicBezierPath
                key={edge.id}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                label={edge.label}
              />
            );
          })}
        </GraphEdgeLayer>

        {/* Nodes Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {layout.nodes.map(node => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: node.x, top: node.y }}
            >
              <GraphEntityCard
                node={getGraphNode(node)}
                isSelected={focusedNodeId === node.id}
                onClick={() => setFocusedNodeId(node.id === focusedNodeId ? null : node.id)}
              />
            </div>
          ))}
        </div>
      </GraphCanvas>
    </GraphViewerLayout>
  );
}

// Helper to map flow types to generic entity types for styling
function mapFlowTypeToCardType(flowType: string): string {
  switch (flowType) {
    case 'decision': return 'Decision';
    case 'start':
    case 'end': return 'Milestone';
    case 'input':
    case 'output': return 'Data';
    default: return 'Process';
  }
}
