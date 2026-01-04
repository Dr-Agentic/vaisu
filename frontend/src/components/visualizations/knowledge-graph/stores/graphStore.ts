import { create } from 'zustand';
import type {
  EnhancedGraphNode,
  GraphEdge,
  Cluster,
  LayoutAlgorithm,
  EntityType,
  RelationType,
  BreadcrumbItem,
  GraphSnapshot
} from '../../../../../../shared/src/types';

interface GraphState {
  // Data
  nodes: EnhancedGraphNode[];
  edges: GraphEdge[];
  clusters: Cluster[];
  originalNodes: EnhancedGraphNode[]; // Unfiltered nodes
  originalEdges: GraphEdge[]; // Unfiltered edges

  // Layout
  layoutAlgorithm: LayoutAlgorithm;
  nodePositions: Map<string, { x: number; y: number }>;
  isLayouting: boolean;

  // Viewport
  zoom: number;
  pan: { x: number; y: number };

  // Selection
  selectedNodeIds: Set<string>;
  selectedEdgeIds: Set<string>;
  hoveredNodeId: string | null;

  // Filters
  visibleEntityTypes: Set<EntityType>;
  importanceThreshold: number;
  searchQuery: string;
  visibleRelationTypes: Set<RelationType>;
  matchedNodeIds: string[];

  // Exploration
  expandedNodeIds: Set<string>;
  explorationDepth: number;
  breadcrumbs: BreadcrumbItem[];

  // Snapshots
  snapshots: GraphSnapshot[];
  currentSnapshotIndex: number;

  // Performance
  performanceMode: boolean;
  currentMode: '2d';

  // Actions
  setNodes: (nodes: EnhancedGraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  setClusters: (clusters: Cluster[]) => void;
  setLayout: (algorithm: LayoutAlgorithm) => void;
  setNodePositions: (positions: Map<string, { x: number; y: number }>) => void;
  setIsLayouting: (isLayouting: boolean) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  selectNode: (id: string, multi: boolean) => void;
  selectEdge: (id: string) => void;
  clearSelection: () => void;
  setHoveredNode: (id: string | null) => void;
  applyFilters: (filters: {
    visibleEntityTypes?: Set<EntityType>;
    importanceThreshold?: number;
    searchQuery?: string;
    visibleRelationTypes?: Set<RelationType>;
  }) => void;
  resetFilters: () => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  navigateToBreadcrumb: (depth: number) => void;
  saveSnapshot: () => void;
  restoreSnapshot: (index: number) => void;
  deleteSnapshot: (index: number) => void;
  clearSnapshots: () => void;
  setPerformanceMode: (enabled: boolean) => void;
  setMode: (mode: '2d') => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  clusters: [],
  originalNodes: [],
  originalEdges: [],

  layoutAlgorithm: 'force-directed',
  nodePositions: new Map(),
  isLayouting: false,

  zoom: 1,
  pan: { x: 0, y: 0 },

  selectedNodeIds: new Set(),
  selectedEdgeIds: new Set(),
  hoveredNodeId: null,

  visibleEntityTypes: new Set(),
  importanceThreshold: 0,
  searchQuery: '',
  visibleRelationTypes: new Set(),
  matchedNodeIds: [],

  expandedNodeIds: new Set(),
  explorationDepth: 0,
  breadcrumbs: [],

  snapshots: [],
  currentSnapshotIndex: -1,

  performanceMode: false,
  currentMode: '2d',

  // Actions
  setNodes: (nodes) => set({ nodes, originalNodes: nodes }),

  setEdges: (edges) => set({ edges, originalEdges: edges }),

  setClusters: (clusters) => set({ clusters }),

  setLayout: (algorithm) => set({ layoutAlgorithm: algorithm }),

  setNodePositions: (positions) => set({ nodePositions: positions }),

  setIsLayouting: (isLayouting) => set({ isLayouting }),

  setZoom: (zoom) => set({ zoom }),

  setPan: (pan) => set({ pan }),

  selectNode: (id, multi) => {
    const { selectedNodeIds } = get();
    const newSelection = new Set(multi ? selectedNodeIds : []);
    
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }

    set({ selectedNodeIds: newSelection });
  },

  selectEdge: (id) => {
    const { selectedEdgeIds } = get();
    const newSelection = new Set<string>();
    
    if (selectedEdgeIds.has(id)) {
      // Deselect
    } else {
      newSelection.add(id);
    }

    set({ selectedEdgeIds: newSelection });
  },

  clearSelection: () => set({
    selectedNodeIds: new Set(),
    selectedEdgeIds: new Set()
  }),

  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  applyFilters: (filters) => {
    const state = get();
    const updates: Partial<GraphState> = {};

    if (filters.visibleEntityTypes !== undefined) {
      updates.visibleEntityTypes = filters.visibleEntityTypes;
    }
    if (filters.importanceThreshold !== undefined) {
      updates.importanceThreshold = filters.importanceThreshold;
    }
    if (filters.searchQuery !== undefined) {
      updates.searchQuery = filters.searchQuery;
    }
    if (filters.visibleRelationTypes !== undefined) {
      updates.visibleRelationTypes = filters.visibleRelationTypes;
    }

    // Apply filters to get filtered nodes and edges
    const { originalNodes, originalEdges } = state;
    let filteredNodes = originalNodes;
    let filteredEdges = originalEdges;
    let matchedNodeIds: string[] = [];

    // Filter by entity type
    if (updates.visibleEntityTypes && updates.visibleEntityTypes.size > 0) {
      filteredNodes = filteredNodes.filter(n => 
        updates.visibleEntityTypes!.has(n.type)
      );
    }

    // Filter by importance
    if (updates.importanceThreshold !== undefined && updates.importanceThreshold > 0) {
      filteredNodes = filteredNodes.filter(n => 
        n.metadata.centrality >= (updates.importanceThreshold! / 100)
      );
    }

    // Search (doesn't filter, just highlights)
    if (updates.searchQuery && updates.searchQuery.trim()) {
      const query = updates.searchQuery.toLowerCase();
      matchedNodeIds = filteredNodes
        .filter(n => 
          n.label.toLowerCase().includes(query) ||
          n.metadata.description?.toLowerCase().includes(query)
        )
        .map(n => n.id);
    }

    // Filter edges to only include those between visible nodes
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = filteredEdges.filter(e =>
      visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    // Filter by relationship type
    if (updates.visibleRelationTypes && updates.visibleRelationTypes.size > 0) {
      filteredEdges = filteredEdges.filter(e =>
        updates.visibleRelationTypes!.has(e.type)
      );
    }

    set({
      ...updates,
      nodes: filteredNodes,
      edges: filteredEdges,
      matchedNodeIds
    });
  },

  resetFilters: () => {
    const { originalNodes, originalEdges } = get();
    
    // Get all unique entity types
    const allEntityTypes = new Set(originalNodes.map(n => n.type));
    
    // Get all unique relation types
    const allRelationTypes = new Set(originalEdges.map(e => e.type));

    set({
      nodes: originalNodes,
      edges: originalEdges,
      visibleEntityTypes: allEntityTypes,
      importanceThreshold: 0,
      searchQuery: '',
      visibleRelationTypes: allRelationTypes,
      matchedNodeIds: []
    });
  },

  expandNode: (id) => {
    const { nodes, expandedNodeIds, breadcrumbs, explorationDepth } = get();
    const node = nodes.find(n => n.id === id);
    
    if (!node || !node.isExpandable) return;

    // Mark node as expanded
    const newExpandedIds = new Set(expandedNodeIds);
    newExpandedIds.add(id);

    // Add to breadcrumbs
    const newBreadcrumbs = [
      ...breadcrumbs,
      {
        nodeId: id,
        label: node.label,
        depth: explorationDepth + 1
      }
    ];

    // In a real implementation, we would fetch/reveal child nodes here
    // For now, we just update the state
    set({
      expandedNodeIds: newExpandedIds,
      breadcrumbs: newBreadcrumbs,
      explorationDepth: explorationDepth + 1
    });
  },

  collapseNode: (id) => {
    const { expandedNodeIds, breadcrumbs } = get();
    
    // Remove from expanded set
    const newExpandedIds = new Set(expandedNodeIds);
    newExpandedIds.delete(id);

    // Remove from breadcrumbs
    const nodeIndex = breadcrumbs.findIndex(b => b.nodeId === id);
    const newBreadcrumbs = nodeIndex >= 0 
      ? breadcrumbs.slice(0, nodeIndex)
      : breadcrumbs;

    set({
      expandedNodeIds: newExpandedIds,
      breadcrumbs: newBreadcrumbs,
      explorationDepth: newBreadcrumbs.length
    });
  },

  navigateToBreadcrumb: (depth) => {
    const { breadcrumbs } = get();
    
    // Remove breadcrumbs after this depth
    const newBreadcrumbs = breadcrumbs.slice(0, depth);
    
    // Remove expanded nodes that are deeper than this level
    const newExpandedIds = new Set<string>();
    newBreadcrumbs.forEach(b => newExpandedIds.add(b.nodeId));

    set({
      breadcrumbs: newBreadcrumbs,
      expandedNodeIds: newExpandedIds,
      explorationDepth: depth
    });
  },

  saveSnapshot: () => {
    const state = get();
    const snapshot: GraphSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: new Date(),
      nodePositions: new Map(state.nodePositions),
      zoom: state.zoom,
      pan: { ...state.pan },
      filters: {
        visibleEntityTypes: new Set(state.visibleEntityTypes),
        importanceThreshold: state.importanceThreshold,
        searchQuery: state.searchQuery,
        visibleRelationTypes: new Set(state.visibleRelationTypes)
      },
      selectedNodeIds: Array.from(state.selectedNodeIds),
      expandedNodeIds: Array.from(state.expandedNodeIds)
    };

    const newSnapshots = [...state.snapshots, snapshot];
    
    // Keep only last 10 snapshots
    if (newSnapshots.length > 10) {
      newSnapshots.shift();
    }

    // Save to localStorage
    try {
      const snapshotsToStore = newSnapshots.map(s => ({
        ...s,
        nodePositions: Array.from(s.nodePositions.entries()),
        filters: {
          visibleEntityTypes: Array.from(s.filters.visibleEntityTypes),
          importanceThreshold: s.filters.importanceThreshold,
          searchQuery: s.filters.searchQuery,
          visibleRelationTypes: Array.from(s.filters.visibleRelationTypes)
        }
      }));
      localStorage.setItem('graph-snapshots', JSON.stringify(snapshotsToStore));
    } catch (error) {
      console.error('Failed to save snapshot to localStorage:', error);
    }

    set({
      snapshots: newSnapshots,
      currentSnapshotIndex: newSnapshots.length - 1
    });
  },

  restoreSnapshot: (index) => {
    const { snapshots } = get();
    const snapshot = snapshots[index];
    
    if (!snapshot) return;

    set({
      nodePositions: new Map(snapshot.nodePositions),
      zoom: snapshot.zoom,
      pan: { ...snapshot.pan },
      visibleEntityTypes: new Set(snapshot.filters.visibleEntityTypes),
      importanceThreshold: snapshot.filters.importanceThreshold,
      searchQuery: snapshot.filters.searchQuery,
      visibleRelationTypes: new Set(snapshot.filters.visibleRelationTypes),
      selectedNodeIds: new Set(snapshot.selectedNodeIds),
      expandedNodeIds: new Set(snapshot.expandedNodeIds),
      currentSnapshotIndex: index
    });

    // Reapply filters
    get().applyFilters({
      visibleEntityTypes: new Set(snapshot.filters.visibleEntityTypes),
      importanceThreshold: snapshot.filters.importanceThreshold,
      searchQuery: snapshot.filters.searchQuery,
      visibleRelationTypes: new Set(snapshot.filters.visibleRelationTypes)
    });
  },

  deleteSnapshot: (index) => {
    const { snapshots } = get();
    const newSnapshots = snapshots.filter((_, i) => i !== index);

    // Update localStorage
    try {
      const snapshotsToStore = newSnapshots.map(s => ({
        ...s,
        nodePositions: Array.from(s.nodePositions.entries()),
        filters: {
          visibleEntityTypes: Array.from(s.filters.visibleEntityTypes),
          importanceThreshold: s.filters.importanceThreshold,
          searchQuery: s.filters.searchQuery,
          visibleRelationTypes: Array.from(s.filters.visibleRelationTypes)
        }
      }));
      localStorage.setItem('graph-snapshots', JSON.stringify(snapshotsToStore));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }

    set({ snapshots: newSnapshots });
  },

  clearSnapshots: () => {
    try {
      localStorage.removeItem('graph-snapshots');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }

    set({
      snapshots: [],
      currentSnapshotIndex: -1
    });
  },

  setPerformanceMode: (enabled) => set({ performanceMode: enabled }),

  setMode: (mode) => set({ currentMode: mode })
}));
