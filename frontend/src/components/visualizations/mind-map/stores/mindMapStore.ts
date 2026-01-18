import { create } from 'zustand';

import { MindMapState } from '../types';

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [],
  edges: [],
  rootId: null,
  selectedNodeId: null,
  hoveredNodeId: null,
  expandedNodeIds: new Set<string>(),

  setGraphData: (nodes, edges, rootId) => {
    // Initialize expansion state: Expand root and its children (Level 0 and 1)
    // This effectively shows up to Level 2 initially (Root -> Children -> Grandchildren)
    // The requirement is "display first 3 levels" (0, 1, 2).
    // So we need to expand nodes at Level 0 and Level 1.
    const initialExpanded = new Set<string>();
    nodes.forEach(node => {
      if (node.metadata.level < 2) {
        initialExpanded.add(node.id);
      }
    });

    set({
      nodes,
      edges,
      rootId,
      expandedNodeIds: initialExpanded,
      selectedNodeId: null,
      hoveredNodeId: null,
    });
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
    if (nodeId) {
      // Auto-expand on click: reveal next 2 levels
      get().expandBranch(nodeId, 2);
    }
  },

  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),

  toggleNodeExpansion: (nodeId) => {
    set((state) => {
      const newExpanded = new Set(state.expandedNodeIds);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return { expandedNodeIds: newExpanded };
    });
  },

  expandBranch: (nodeId, depthToAdd) => {
    const { nodes, expandedNodeIds } = get();
    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    const targetLevel = targetNode.metadata.level;
    const maxLevelToExpand = targetLevel + depthToAdd;

    const newExpanded = new Set(expandedNodeIds);

    // Helper to recursively expand children up to depth
    const expandRecursive = (currentId: string) => {
      const currentNode = nodes.find(n => n.id === currentId);
      if (!currentNode) return;

      // If we are below the max level, mark as expanded so its children are visible
      if (currentNode.metadata.level < maxLevelToExpand) {
        newExpanded.add(currentId);
        currentNode.metadata.childrenIds.forEach(childId => {
          expandRecursive(childId);
        });
      }
    };

    expandRecursive(nodeId);
    set({ expandedNodeIds: newExpanded });
  },
}));
