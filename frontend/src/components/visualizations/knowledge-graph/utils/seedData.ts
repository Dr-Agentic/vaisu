import { createAiRegulationPolicyGraph } from '../data/aiRegulationPolicy';
import { useKnowledgeGraphStore } from '../stores/knowledgeGraphStore';

/**
 * Utility functions for managing Knowledge Graph seed data
 */

/**
 * Load AI Regulation Policy seed data into the store
 * This demonstrates the complete Knowledge Graph system with realistic data
 */
export const loadAiRegulationPolicyDemo = (): void => {
  const { initializeGraph } = useKnowledgeGraphStore();

  try {
    const { nodes, edges } = createAiRegulationPolicyGraph();
    initializeGraph(nodes, edges);

    console.log('✅ AI Regulation Policy seed data loaded successfully');
    console.log(`📊 Graph stats: ${nodes.length} nodes, ${edges.length} edges`);
    console.log(`📈 Columns: ${[...new Set(nodes.map(n => n.column))].length} total`);

    // Log column distribution
    const columnStats = nodes.reduce((acc, node) => {
      acc[node.column!] = (acc[node.column!] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('📁 Column distribution:', columnStats);
  } catch (error) {
    console.error('❌ Failed to load AI Regulation Policy seed data:', error);
  }
};

/**
 * Clear all seed data and reset to empty state
 */
export const clearSeedData = (): void => {
  const { clearGraph } = useKnowledgeGraphStore();
  clearGraph();
  console.log('🗑️  Knowledge Graph cleared');
};

/**
 * Generate a summary of the current graph state
 */
export const getGraphSummary = (): {
  nodeCount: number;
  edgeCount: number;
  columnCount: number;
  nodeTypes: Record<string, number>;
  relationshipTypes: Record<string, number>;
} => {
  const { nodes, edges } = useKnowledgeGraphStore.getState();

  const nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const relationshipTypes = edges.reduce((acc, edge) => {
    acc[edge.relationshipType] = (acc[edge.relationshipType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const columnCount = nodes.length > 0 ? Math.max(...nodes.map(n => n.column!)) + 1 : 0;

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    columnCount,
    nodeTypes,
    relationshipTypes,
  };
};

/**
 * Validate the knowledge graph structure
 */
export const validateGraph = (): {
  isValid: boolean;
  issues: string[];
} => {
  const { nodes, edges } = useKnowledgeGraphStore.getState();
  const issues: string[] = [];

  // Check for orphaned nodes (no edges)
  const nodeIds = new Set(nodes.map(n => n.id));
  const edgeNodeIds = new Set([...edges.flatMap(e => [e.source, e.target])]);

  const orphanedNodes = nodes.filter(n => !edgeNodeIds.has(n.id));
  if (orphanedNodes.length > 0) {
    issues.push(`⚠️  ${orphanedNodes.length} orphaned nodes found`);
  }

  // Check for invalid edge references
  const invalidEdges = edges.filter(edge =>
    !nodeIds.has(edge.source) || !nodeIds.has(edge.target),
  );

  if (invalidEdges.length > 0) {
    issues.push(`❌ ${invalidEdges.length} edges reference non-existent nodes`);
  }

  // Check for duplicate edges
  const edgeStringMap = new Map<string, any>();
  edges.forEach(edge => {
    const key = `${edge.source}->${edge.target}`;
    if (edgeStringMap.has(key)) {
      issues.push(`⚠️  Duplicate edge found: ${key}`);
    } else {
      edgeStringMap.set(key, edge);
    }
  });

  // Check confidence values
  const invalidConfidences = nodes.filter(n => n.confidence < 0 || n.confidence > 1);
  if (invalidConfidences.length > 0) {
    issues.push(`❌ ${invalidConfidences.length} nodes have invalid confidence values`);
  }

  const isValid = issues.length === 0;

  return {
    isValid,
    issues,
  };
};

/**
 * Get node statistics by column
 */
export const getColumnStatistics = () => {
  const { nodes } = useKnowledgeGraphStore.getState();

  const stats = nodes.reduce((acc, node) => {
    const column = node.column!;
    if (!acc[column]) {
      acc[column] = {
        nodeCount: 0,
        nodeTypes: {} as Record<string, number>,
        totalConfidence: 0,
        averageConfidence: 0,
      };
    }

    acc[column].nodeCount++;
    acc[column].nodeTypes[node.type] = (acc[column].nodeTypes[node.type] || 0) + 1;
    acc[column].totalConfidence += node.confidence;

    return acc;
  }, {} as Record<number, {
    nodeCount: number;
    nodeTypes: Record<string, number>;
    totalConfidence: number;
    averageConfidence: number;
  }>);

  // Calculate averages
  Object.keys(stats).forEach(column => {
    const colNum = parseInt(column);
    const columnData = stats[colNum];
    columnData.averageConfidence = columnData.nodeCount > 0
      ? columnData.totalConfidence / columnData.nodeCount
      : 0;
  });

  return stats;
};
