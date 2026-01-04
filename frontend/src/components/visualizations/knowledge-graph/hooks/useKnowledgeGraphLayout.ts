import { useEffect, useCallback } from 'react';
import { useKnowledgeGraphStore } from '../stores/knowledgeGraphStore';
import type { KnowledgeNode } from '../types';

/**
 * Hook for managing Knowledge Graph layout calculations
 */
export const useKnowledgeGraphLayout = () => {
  const {
    layout,
    calculateGridLayout,
    calculateForceLayout,
    calculateHierarchicalLayout
  } = useKnowledgeGraphStore();

  /**
   * Calculate layout based on current layout type
   */
  const calculateLayout = useCallback(() => {
    switch (layout) {
      case 'grid':
        calculateGridLayout();
        break;
      case 'force':
        calculateForceLayout();
        break;
      case 'hierarchical':
        calculateHierarchicalLayout();
        break;
      default:
        calculateGridLayout();
    }
  }, [layout, calculateGridLayout, calculateForceLayout, calculateHierarchicalLayout]);

  /**
   * Calculate layout when layout type changes
   */
  useEffect(() => {
    calculateLayout();
  }, [layout, calculateLayout]);

  return {
    calculateLayout
  };
};

/**
 * Hook for managing node selection and interactions
 */
export const useKnowledgeGraphInteractions = () => {
  const {
    selectedNodeId,
    hoveredNodeId,
    hoveredEdgeId,
    setSelectedNodeId,
    setHoveredNodeId,
    setHoveredEdgeId
  } = useKnowledgeGraphStore();

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, [setSelectedNodeId]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, [setHoveredNodeId]);

  const handleEdgeHover = useCallback((edgeId: string | null) => {
    setHoveredEdgeId(edgeId);
  }, [setHoveredEdgeId]);

  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setHoveredEdgeId(null);
  }, [setSelectedNodeId, setHoveredNodeId, setHoveredEdgeId]);

  return {
    selectedNodeId,
    hoveredNodeId,
    hoveredEdgeId,
    handleNodeClick,
    handleNodeHover,
    handleEdgeHover,
    handleClearSelection
  };
};

/**
 * Hook for filtering edges by column for rendering optimization
 */
export const useKnowledgeGraphEdges = (columnId: number) => {
  const { nodes, edges } = useKnowledgeGraphStore();

  const edgesForColumn = useCallback(() => {
    return edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return sourceNode?.column === columnId || targetNode?.column === columnId;
    });
  }, [edges, nodes, columnId]);

  return edgesForColumn();
};

/**
 * Hook for getting sector titles based on column data
 */
export const useSectorTitles = () => {
  const { nodes } = useKnowledgeGraphStore();

  const getSectorTitle = useCallback((columnId: number, columnNodes: KnowledgeNode[]) => {
    if (columnId === 0) return 'Sources & Concepts';
    if (columnId === 1) return 'Regulations & Policies';
    if (columnId === 2) return 'Impacts & Outcomes';
    if (columnId === 3) return 'Risks & Opportunities';

    // Dynamic title based on dominant node types
    const typeCounts = columnNodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Entities';

    return `${dominantType} (${columnNodes.length})`;
  }, []);

  const getColumnData = useCallback(() => {
    if (!nodes.length) return [];

    // Group nodes by column
    const nodesByColumn = new Map<number, KnowledgeNode[]>();
    nodes.forEach(node => {
      if (!nodesByColumn.has(node.column!)) {
        nodesByColumn.set(node.column!, []);
      }
      nodesByColumn.get(node.column!)!.push(node);
    });

    // Sort columns by column number
    const sortedColumns = Array.from(nodesByColumn.entries())
      .sort(([a], [b]) => a - b)
      .map(([columnId, columnNodes]) => ({
        id: columnId,
        nodes: columnNodes,
        title: getSectorTitle(columnId, columnNodes)
      }));

    return sortedColumns;
  }, [nodes, getSectorTitle]);

  return {
    getColumnData,
    getSectorTitle
  };
};