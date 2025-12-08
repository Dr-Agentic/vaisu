import dagre from 'dagre';
import type { GraphNode, GraphEdge } from '../../../../../../../shared/src/types';
import { LayoutEngine, type LayoutOptions, type NodePositions } from '../layoutEngine';

export class HierarchicalLayout extends LayoutEngine {
  async compute(
    nodes: GraphNode[],
    edges: GraphEdge[],
    options: LayoutOptions = {}
  ): Promise<NodePositions> {
    const {
      width = 1200,
      height = 800,
      nodeSpacing = 100,
      levelSeparation = 150
    } = options;

    if (nodes.length === 0) {
      return new Map();
    }

    // Create dagre graph
    const g = new dagre.graphlib.Graph();
    
    // Set graph options
    g.setGraph({
      rankdir: 'TB', // Top to bottom
      nodesep: nodeSpacing,
      ranksep: levelSeparation,
      marginx: 50,
      marginy: 50
    });

    // Default node and edge labels
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    nodes.forEach(node => {
      g.setNode(node.id, {
        label: node.label,
        width: node.size * 2 || 60,
        height: node.size * 1.5 || 45
      });
    });

    // Add edges
    edges.forEach(edge => {
      g.setEdge(edge.source, edge.target);
    });

    // Run layout
    dagre.layout(g);

    // Extract positions
    const positions = new Map<string, { x: number; y: number }>();
    nodes.forEach(node => {
      const dagreNode = g.node(node.id);
      if (dagreNode) {
        positions.set(node.id, {
          x: dagreNode.x,
          y: dagreNode.y
        });
      } else {
        // Fallback for disconnected nodes
        positions.set(node.id, {
          x: Math.random() * width,
          y: Math.random() * height
        });
      }
    });

    // Scale to fit viewport
    return this.scaleToFit(positions, width, height, 50);
  }
}
