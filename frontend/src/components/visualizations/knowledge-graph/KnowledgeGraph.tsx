import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { KnowledgeGraphData, EnhancedGraphNode } from '../../../../../shared/src/types';
import { useGraphStore } from './stores/graphStore';
import { centralityService } from './services/centralityService';
import { clusteringService } from './services/clusteringService';
import { ForceDirectedLayout } from './services/layouts/forceDirectedLayout';
import { EntityNode } from './nodes/EntityNode';
import { ExpandableNode } from './nodes/ExpandableNode';
import { RelationshipEdge } from './edges/RelationshipEdge';

interface KnowledgeGraphProps {
  data: KnowledgeGraphData;
  height?: number;
}

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  expandable: ExpandableNode
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge
};

export function KnowledgeGraph({ data, height = 600 }: KnowledgeGraphProps) {
  console.log('KnowledgeGraph component mounted with data:', {
    hasData: !!data,
    nodesCount: data?.nodes?.length,
    edgesCount: data?.edges?.length
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [reactFlowNodes, setReactFlowNodes] = useState<Node[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = useState<Edge[]>([]);

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setClusters,
    setNodePositions,
    setIsLayouting,
    nodePositions,
    selectedNodeIds,
    selectNode,
    zoom,
    setZoom,
    expandNode,
    collapseNode,
    expandedNodeIds
  } = useGraphStore();

  // Initialize graph data
  useEffect(() => {
    if (!data || isInitialized) return;

    const initializeGraph = async () => {
      setIsLayouting(true);

      // Calculate centrality scores
      const centralityScores = centralityService.calculateCentrality(
        data.nodes,
        data.edges
      );

      // Enhance nodes with centrality data
      const enhancedNodes: EnhancedGraphNode[] = data.nodes.map(node => {
        const scores = centralityScores.get(node.id);
        return {
          ...node,
          degree: scores?.degree || 0,
          betweenness: scores?.betweenness || 0,
          eigenvector: scores?.eigenvector || 0,
          clusterId: '',
          clusterColor: '',
          isExpandable: false,
          isExpanded: false,
          children: [],
          parent: null,
          depth: 0,
          metadata: {
            ...node.metadata,
            centrality: scores?.combined || node.metadata.centrality
          }
        };
      });

      // Detect clusters
      const clusters = clusteringService.detectClusters(enhancedNodes, data.edges);
      const clusterAssignments = clusteringService.assignClusterColors(clusters);

      // Assign cluster info to nodes
      enhancedNodes.forEach(node => {
        const assignment = clusterAssignments.get(node.id);
        if (assignment) {
          node.clusterId = assignment.clusterId;
          node.clusterColor = assignment.clusterColor;
        }
      });

      // Filter out edges with invalid node references
      const nodeIds = new Set(enhancedNodes.map(n => n.id));
      const validEdges = data.edges.filter(edge => {
        const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
        if (!isValid) {
          console.warn(`Filtering out invalid edge: ${edge.source} -> ${edge.target}`);
        }
        return isValid;
      });

      // Compute initial layout
      const layoutEngine = new ForceDirectedLayout();
      const positions = await layoutEngine.compute(enhancedNodes, validEdges, {
        width: 1200,
        height: 800
      });

      setNodes(enhancedNodes);
      setEdges(validEdges);
      setClusters(clusters);
      setNodePositions(positions);
      setIsLayouting(false);
      setIsInitialized(true);
    };

    initializeGraph();
  }, [data, isInitialized, setNodes, setEdges, setClusters, setNodePositions, setIsLayouting]);

  // Convert to React Flow format
  useEffect(() => {
    if (nodes.length === 0) return;

    const rfNodes: Node[] = nodes.map(node => {
      const position = nodePositions.get(node.id) || { x: 0, y: 0 };
      const isSelected = selectedNodeIds.has(node.id);
      const isExpanded = expandedNodeIds.has(node.id);

      return {
        id: node.id,
        type: node.isExpandable ? 'expandable' : 'entity',
        position,
        data: {
          node,
          isSelected,
          isHighlighted: false,
          isDimmed: false,
          isExpanded,
          onExpand: expandNode,
          onCollapse: collapseNode
        }
      };
    });

    const rfEdges: Edge[] = edges.map((edge, index) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source,
      target: edge.target,
      type: 'relationship',
      data: {
        relationship: edge,
        isSelected: false,
        isHighlighted: false,
        showLabel: true,
        zoom
      }
    }));

    setReactFlowNodes(rfNodes);
    setReactFlowEdges(rfEdges);
  }, [nodes, edges, nodePositions, selectedNodeIds, expandedNodeIds, zoom, expandNode, collapseNode]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id, false);
    },
    [selectNode]
  );

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      setZoom(newZoom);
    },
    [setZoom]
  );

  if (!isInitialized) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }} className="bg-gray-50 rounded-lg">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onMove={(_event, viewport) => handleZoomChange(viewport.zoom)}
        fitView
        minZoom={0.5}
        maxZoom={3}
        defaultEdgeOptions={{
          animated: false
        }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const nodeData = node.data as any;
            return nodeData?.node?.color || '#6B7280';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
