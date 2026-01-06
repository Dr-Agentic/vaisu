import { LayoutEngine, type LayoutOptions, type NodePositions } from '../layoutEngine';

import type { GraphNode, GraphEdge } from '../../../../../../../shared/src/types';

export class CircularLayout extends LayoutEngine {
  async compute(
    nodes: GraphNode[],
    _edges: GraphEdge[],
    options: LayoutOptions = {},
  ): Promise<NodePositions> {
    const {
      width = 1200,
      height = 800,
    } = options;

    if (nodes.length === 0) {
      return new Map();
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // Group nodes by entity type
    const nodesByType = new Map<string, GraphNode[]>();
    nodes.forEach(node => {
      if (!nodesByType.has(node.type)) {
        nodesByType.set(node.type, []);
      }
      nodesByType.get(node.type)!.push(node);
    });

    // Sort types by total importance
    const sortedTypes = Array.from(nodesByType.entries())
      .map(([type, typeNodes]) => ({
        type,
        nodes: typeNodes,
        totalImportance: typeNodes.reduce((sum, n) => sum + n.metadata.centrality, 0),
      }))
      .sort((a, b) => b.totalImportance - a.totalImportance);

    const positions = new Map<string, { x: number; y: number }>();
    const baseRadius = Math.min(width, height) * 0.15;
    const ringSpacing = Math.min(width, height) * 0.12;

    // Place nodes in concentric rings by type
    sortedTypes.forEach((typeGroup, ringIndex) => {
      const radius = baseRadius + (ringIndex * ringSpacing);
      const nodesInRing = typeGroup.nodes;

      // Sort nodes within ring by importance
      nodesInRing.sort((a, b) => b.metadata.centrality - a.metadata.centrality);

      // Distribute nodes evenly around the ring
      nodesInRing.forEach((node, nodeIndex) => {
        const angle = (2 * Math.PI * nodeIndex) / nodesInRing.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        positions.set(node.id, { x, y });
      });
    });

    return positions;
  }
}
