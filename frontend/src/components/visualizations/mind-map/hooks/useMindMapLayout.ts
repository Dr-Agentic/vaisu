import { useMemo } from 'react';

import { useMindMapStore } from '../stores/mindMapStore';
import { MindMapGraphNode } from '../types';

const COLUMN_WIDTH = 350;
const COLUMN_GAP = 100;
const NODE_HEIGHT = 200; // Approximate height of a card including gap
const START_X = 50;
const START_Y = 100;

export const useMindMapLayout = () => {
  const { nodes, rootId, expandedNodeIds } = useMindMapStore();

  const layoutData = useMemo(() => {
    if (!rootId || nodes.length === 0) {
      return { visibleNodes: [], totalWidth: 0, totalHeight: 0 };
    }

    // 1. Identify visible nodes based on expansion state
    const visibleNodeIds = new Set<string>();
    const visibleNodesMap = new Map<string, MindMapGraphNode>();

    // Helper to check visibility
    // A node is visible if its parent is expanded (or it is root)
    // But we need to traverse from root to ensure path visibility
    const traverseVisibility = (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      visibleNodeIds.add(nodeId);
      visibleNodesMap.set(nodeId, node);

      if (expandedNodeIds.has(nodeId)) {
        node.metadata.childrenIds.forEach(childId => {
          traverseVisibility(childId);
        });
      }
    };

    traverseVisibility(rootId);

    // 2. Calculate Positions (Tree Layout)
    const positions = new Map<string, { x: number, y: number }>();
    let currentY = START_Y;

    // Post-order traversal to calculate Y based on children
    const calculatePosition = (nodeId: string): number => {
      const node = visibleNodesMap.get(nodeId);
      if (!node) return currentY;

      const visibleChildren = node.metadata.childrenIds.filter(id => visibleNodeIds.has(id));

      let nodeY: number;

      if (visibleChildren.length === 0) {
        // Leaf node (visually)
        nodeY = currentY;
        currentY += NODE_HEIGHT;
      } else {
        // Parent node: center between first and last child
        const childrenYs = visibleChildren.map(childId => calculatePosition(childId));
        const firstChildY = childrenYs[0];
        const lastChildY = childrenYs[childrenYs.length - 1];
        nodeY = (firstChildY + lastChildY) / 2;
      }

      // X is deterministic based on level
      const nodeX = START_X + node.metadata.level * (COLUMN_WIDTH + COLUMN_GAP);

      positions.set(nodeId, { x: nodeX, y: nodeY });
      return nodeY;
    };

    calculatePosition(rootId);

    // 3. Apply positions to nodes
    const layoutNodes = Array.from(visibleNodesMap.values()).map(node => {
      const pos = positions.get(node.id) || { x: 0, y: 0 };
      return {
        ...node,
        x: pos.x,
        y: pos.y,
      };
    });

    // Calculate bounds
    const maxX = Math.max(...layoutNodes.map(n => n.x)) + COLUMN_WIDTH;
    const maxY = Math.max(...layoutNodes.map(n => n.y)) + NODE_HEIGHT;

    return {
      visibleNodes: layoutNodes,
      totalWidth: maxX,
      totalHeight: maxY,
    };
  }, [nodes, rootId, expandedNodeIds]);

  return layoutData;
};
