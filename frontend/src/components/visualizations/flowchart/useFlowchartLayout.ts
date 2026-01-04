import { useMemo } from 'react';
import dagre from 'dagre';
import type { FlowchartData, FlowNode, FlowEdge } from '../../../../../shared/src/types';

interface LayoutResult {
  nodes: (FlowNode & { x: number; y: number })[];
  edges: (FlowEdge & { points: { x: number; y: number }[] })[];
  width: number;
  height: number;
}

const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;

export function useFlowchartLayout(data: FlowchartData): LayoutResult {
  return useMemo(() => {
    if (!data.nodes.length) {
      return { nodes: [], edges: [], width: 0, height: 0 };
    }

    const g = new dagre.graphlib.Graph();
    
    g.setGraph({ 
      rankdir: data.layout === 'leftToRight' ? 'LR' : 'TB',
      nodesep: 80,
      ranksep: 100,
      marginx: 50,
      marginy: 50
    });

    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    data.nodes.forEach(node => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Add edges
    data.edges.forEach(edge => {
      g.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(g);

    // Extract positioned nodes
    const positionedNodes = data.nodes.map(node => {
      const nodeWithPos = g.node(node.id);
      return {
        ...node,
        x: nodeWithPos.x,
        y: nodeWithPos.y
      };
    });

    // Extract edges with points (optional, if we want detailed paths, but Bezier usually just needs start/end)
    const positionedEdges = data.edges.map(edge => {
      const edgePoints = g.edge(edge.source, edge.target);
      return {
        ...edge,
        points: edgePoints.points
      };
    });

    const graphLabel = g.graph();

    return {
      nodes: positionedNodes,
      edges: positionedEdges,
      width: graphLabel.width || 800,
      height: graphLabel.height || 600
    };
  }, [data]);
}
