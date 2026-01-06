import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'SOURCE' | 'CONCEPT' | 'REGULATION' | 'IMPACT' | 'RISK' | 'OPPORTUNITY';
  confidence: number;
  metadata: {
    sources: string[];
    description?: string;
    category?: string;
  };
  x?: number;
  y?: number;
  column?: number;
  row?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number;
  evidence: string[];
  relationshipType: 'CAUSES' | 'INFLUENCES' | 'REGULATES' | 'MEDIATES' | 'DEPENDS_ON';
}

interface KnowledgeGraphState {
  // Data
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  documentId: string | null;

  // Layout
  layout: 'grid' | 'force' | 'hierarchical';
  columnWidth: number;
  rowHeight: number;
  spacing: number;

  // UI State
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDocumentId: (documentId: string) => void;
  setLayout: (layout: 'grid' | 'force' | 'hierarchical') => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setHoveredNodeId: (nodeId: string | null) => void;
  setHoveredEdgeId: (edgeId: string | null) => void;

  // Data Management
  initializeGraph: (nodes: KnowledgeNode[], edges: KnowledgeEdge[]) => void;
  addNode: (node: Omit<KnowledgeNode, 'id' | 'x' | 'y' | 'column' | 'row'>) => void;
  addEdge: (edge: Omit<KnowledgeEdge, 'id'>) => void;
  updateNode: (nodeId: string, updates: Partial<KnowledgeNode>) => void;
  updateEdge: (edgeId: string, updates: Partial<KnowledgeEdge>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  clearGraph: () => void;

  // Layout Actions
  calculateGridLayout: () => void;
  calculateForceLayout: () => void;
  calculateHierarchicalLayout: () => void;
}

export const useKnowledgeGraphStore = create<KnowledgeGraphState>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      documentId: null,
      layout: 'grid',
      columnWidth: 350,
      rowHeight: 300,
      spacing: 50,
      selectedNodeId: null,
      hoveredNodeId: null,
      hoveredEdgeId: null,
      isInitialized: false,
      isLoading: false,
      error: null,

      // Actions
      setDocumentId: (documentId: string) => set({ documentId }),

      setLayout: (layout: 'grid' | 'force' | 'hierarchical') =>
        set({ layout }, false, 'knowledgeGraph/setLayout'),

      setSelectedNodeId: (nodeId: string | null) =>
        set({ selectedNodeId: nodeId }, false, 'knowledgeGraph/setSelectedNodeId'),

      setHoveredNodeId: (nodeId: string | null) =>
        set({ hoveredNodeId: nodeId }, false, 'knowledgeGraph/setHoveredNodeId'),

      setHoveredEdgeId: (edgeId: string | null) =>
        set({ hoveredEdgeId: edgeId }, false, 'knowledgeGraph/setHoveredEdgeId'),

      initializeGraph: (nodes: KnowledgeNode[], edges: KnowledgeEdge[]) => {
        set({
          nodes,
          edges,
          isInitialized: true,
          isLoading: false,
          error: null,
        }, false, 'knowledgeGraph/initializeGraph');

        // Calculate initial layout
        get().calculateGridLayout();
      },

      addNode: (nodeData) => {
        const newNode: KnowledgeNode = {
          ...nodeData,
          id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: 0,
          y: 0,
          column: 0,
          row: 0,
        };

        set((state) => ({
          nodes: [...state.nodes, newNode],
        }), false, 'knowledgeGraph/addNode');

        // Recalculate layout
        get().calculateGridLayout();
      },

      addEdge: (edgeData) => {
        const newEdge: KnowledgeEdge = {
          ...edgeData,
          id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        set((state) => ({
          edges: [...state.edges, newEdge],
        }), false, 'knowledgeGraph/addEdge');

        // Recalculate layout
        get().calculateGridLayout();
      },

      updateNode: (nodeId: string, updates: Partial<KnowledgeNode>) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, ...updates } : node,
          ),
        }), false, 'knowledgeGraph/updateNode');

        // Recalculate layout if position changed
        if (updates.x !== undefined || updates.y !== undefined) {
          get().calculateGridLayout();
        }
      },

      updateEdge: (edgeId: string, updates: Partial<KnowledgeEdge>) => {
        set((state) => ({
          edges: state.edges.map(edge =>
            edge.id === edgeId ? { ...edge, ...updates } : edge,
          ),
        }), false, 'knowledgeGraph/updateEdge');
      },

      deleteNode: (nodeId: string) => {
        set((state) => ({
          nodes: state.nodes.filter(node => node.id !== nodeId),
          edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
        }), false, 'knowledgeGraph/deleteNode');

        // Recalculate layout
        get().calculateGridLayout();
      },

      deleteEdge: (edgeId: string) => {
        set((state) => ({
          edges: state.edges.filter(edge => edge.id !== edgeId),
        }), false, 'knowledgeGraph/deleteEdge');
      },

      clearGraph: () => {
        set({
          nodes: [],
          edges: [],
          isInitialized: false,
          isLoading: false,
          error: null,
        }, false, 'knowledgeGraph/clearGraph');
      },

      // Layout Calculations
      calculateGridLayout: () => {
        const { nodes, edges, columnWidth, rowHeight, spacing } = get();

        // Step 1: Calculate In-Degree
        const inDegree = new Map<string, number>();
        nodes.forEach(node => inDegree.set(node.id, 0));
        edges.forEach(edge => {
          const current = inDegree.get(edge.target) || 0;
          inDegree.set(edge.target, current + 1);
        });

        // Step 2: Tiered Column Assignment
        const columns: KnowledgeNode[][] = [];
        const processedNodes = new Set<string>();

        // Column 0: Roots
        const roots = nodes.filter(node => (inDegree.get(node.id) || 0) === 0);
        if (roots.length > 0) {
          columns.push(roots);
          roots.forEach(n => processedNodes.add(n.id));
        }

        let remainingNodes = nodes.filter(node => !processedNodes.has(node.id));

        while (remainingNodes.length > 0) {
          const currentColumn: KnowledgeNode[] = [];
          const nextRemaining: KnowledgeNode[] = [];
          const newlyProcessed = new Set<string>();

          for (const node of remainingNodes) {
            // Node belongs to this tier if any of its parents are already processed
            const hasParentInProcessed = edges.some(edge =>
              edge.target === node.id && processedNodes.has(edge.source),
            );

            if (hasParentInProcessed) {
              currentColumn.push(node);
              newlyProcessed.add(node.id);
            } else {
              nextRemaining.push(node);
            }
          }

          if (currentColumn.length > 0) {
            columns.push(currentColumn);
            newlyProcessed.forEach(id => processedNodes.add(id));
          } else {
            // Circular dependencies or isolated clusters - dump remaining into final column
            if (remainingNodes.length > 0) {
              columns.push(remainingNodes);
            }
            break;
          }

          remainingNodes = nextRemaining;
        }

        // Step 3: Calculate absolute positions
        const updatedNodes = [...nodes];
        const startY = 300; // Deep clearance for headers
        const startX = 100;

        columns.forEach((columnNodes, columnIndex) => {
          const sortedNodes = columnNodes.sort((a, b) => {
            const typeOrder = { 'SOURCE': 0, 'CONCEPT': 1, 'REGULATION': 2, 'IMPACT': 3, 'RISK': 4, 'OPPORTUNITY': 5 };
            return (typeOrder[a.type as keyof typeof typeOrder] || 999) - (typeOrder[b.type as keyof typeof typeOrder] || 999);
          });

          const columnX = startX + columnIndex * (columnWidth + spacing);

          sortedNodes.forEach((node, rowIndex) => {
            const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
            if (nodeIndex !== -1) {
              updatedNodes[nodeIndex] = {
                ...node,
                x: columnX,
                y: startY + rowIndex * (rowHeight + spacing),
                column: columnIndex,
                row: rowIndex,
              };
            }
          });
        });

        set({ nodes: updatedNodes }, false, 'knowledgeGraph/calculateGridLayout');
      },

      calculateForceLayout: () => {
        // Simple force-directed layout placeholder
        const { nodes } = get();

        // Distribute nodes in a circle for now
        const centerX = 400;
        const centerY = 300;
        const radius = 200;
        const angleStep = (2 * Math.PI) / nodes.length;

        const updatedNodes = nodes.map((node, index) => ({
          ...node,
          x: centerX + radius * Math.cos(index * angleStep),
          y: centerY + radius * Math.sin(index * angleStep),
        }));

        set({
          nodes: updatedNodes,
        }, false, 'knowledgeGraph/calculateForceLayout');
      },

      calculateHierarchicalLayout: () => {
        // Use grid layout for hierarchical visualization
        get().calculateGridLayout();
      },
    }),
    {
      name: 'knowledge-graph-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
