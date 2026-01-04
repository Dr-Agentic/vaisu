import { create } from 'zustand';
import { ArgumentMapStore } from '../types';

const initialCamera = {
  x: 0,
  y: 0,
  z: 100,
  target: [0, 0, 0] as [number, number, number]
};

const initialStrengthFilter = {
  min: 0,
  max: 1
};

export const useArgumentMapStore = create<ArgumentMapStore>((set, get) => ({
  // Data State
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,

  // Visualization State
  layout: 'FORCE_DIRECTED',
  clustering: true,
  semanticGrouping: true,

  // Interaction State
  selectedNodeId: null,
  hoveredNodeId: null,
  focusedNodes: [],

  // View State
  camera: initialCamera,
  zoom: 1,
  mode: '2D',

  // Filter State
  visibleTypes: ['CLAIM', 'EVIDENCE', 'CONCLUSION'],
  searchQuery: '',
  strengthFilter: initialStrengthFilter,

  // Actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  selectNode: (id) => {
    const { hoveredNodeId } = get();
    set({
      selectedNodeId: id,
      focusedNodes: id ? [id, ...get().focusedNodes] : [],
      hoveredNodeId: hoveredNodeId === id ? null : hoveredNodeId
    });
  },

  hoverNode: (id) => {
    const { selectedNodeId } = get();
    if (id !== selectedNodeId) {
      set({ hoveredNodeId: id });
    }
  },

  toggleFilter: (type) => {
    set((state) => {
      const visibleTypes = state.visibleTypes.includes(type)
        ? state.visibleTypes.filter(t => t !== type)
        : [...state.visibleTypes, type];

      return { visibleTypes };
    });
  },

  updateCamera: (camera) => {
    set((state) => ({
      camera: { ...state.camera, ...camera }
    }));
  },

  switchMode: (mode) => {
    set({ mode });
  },

  updateSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  updateStrengthFilter: (filter) => {
    set({ strengthFilter: filter });
  },

  loadVisualization: async (data: { nodes: any[]; edges: any[] }) => {
    set({ isLoading: true, error: null });

    try {
      // Validate data
      if (!data.nodes || !data.edges) {
        throw new Error('Invalid argument map data structure');
      }

      // Normalize node positions if not provided
      const normalizedNodes = data.nodes.map((node: any) => ({
        ...node,
        position: node.position || {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          z: (Math.random() - 0.5) * 200
        }
      }));

      set({
        nodes: normalizedNodes,
        edges: data.edges,
        isLoading: false,
        layout: 'FORCE_DIRECTED',
        clustering: true,
        semanticGrouping: true
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load visualization',
        isLoading: false
      });
    }
  }
}));

// Selector hooks for better performance
export const useNodes = () => useArgumentMapStore(state => state.nodes);
export const useEdges = () => useArgumentMapStore(state => state.edges);
export const useSelectedNode = () => useArgumentMapStore(state => state.selectedNodeId);
export const useHoveredNode = () => useArgumentMapStore(state => state.hoveredNodeId);
export const useVisibleTypes = () => useArgumentMapStore(state => state.visibleTypes);
export const useMode = () => useArgumentMapStore(state => state.mode);
export const useIsLoading = () => useArgumentMapStore(state => state.isLoading);
export const useError = () => useArgumentMapStore(state => state.error);