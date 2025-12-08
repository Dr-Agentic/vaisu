import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import type { GraphNode, GraphEdge, Cluster } from '../../../../../../shared/src/types';

export class ClusteringService {
  /**
   * Detect communities/clusters in the graph using Louvain algorithm
   */
  detectClusters(nodes: GraphNode[], edges: GraphEdge[]): Cluster[] {
    if (nodes.length === 0) return [];

    const graph = this.buildGraphologyGraph(nodes, edges);
    
    // Run Louvain community detection
    const communities = louvain(graph, {
      resolution: 1.0,
      randomWalk: false
    });

    // Group nodes by community
    const communityMap = new Map<string, string[]>();
    Object.entries(communities).forEach(([nodeId, communityId]) => {
      const community = String(communityId);
      if (!communityMap.has(community)) {
        communityMap.set(community, []);
      }
      communityMap.get(community)!.push(nodeId);
    });

    // Create cluster objects
    const clusters: Cluster[] = [];
    const colors = this.generateClusterColors(communityMap.size);
    let colorIndex = 0;

    communityMap.forEach((nodeIds, communityId) => {
      // Find the most central node in the cluster as the label
      const clusterNodes = nodes.filter(n => nodeIds.includes(n.id));
      const labelNode = clusterNodes.reduce((max, node) => 
        (node.metadata.centrality > max.metadata.centrality) ? node : max
      , clusterNodes[0]);

      clusters.push({
        id: `cluster-${communityId}`,
        label: labelNode?.label || `Cluster ${communityId}`,
        nodeIds,
        color: colors[colorIndex % colors.length]
      });
      colorIndex++;
    });

    return clusters;
  }

  /**
   * Calculate convex hull boundary points for a cluster
   */
  calculateClusterBoundary(
    nodeIds: string[],
    nodePositions: Map<string, { x: number; y: number }>
  ): { x: number; y: number }[] {
    const points = nodeIds
      .map(id => nodePositions.get(id))
      .filter((p): p is { x: number; y: number } => p !== undefined);

    if (points.length < 3) return points;

    // Simple convex hull using Graham scan
    return this.convexHull(points);
  }

  /**
   * Assign cluster colors to nodes
   */
  assignClusterColors(
    clusters: Cluster[]
  ): Map<string, { clusterId: string; clusterColor: string }> {
    const assignments = new Map<string, { clusterId: string; clusterColor: string }>();

    clusters.forEach(cluster => {
      cluster.nodeIds.forEach(nodeId => {
        assignments.set(nodeId, {
          clusterId: cluster.id,
          clusterColor: cluster.color
        });
      });
    });

    return assignments;
  }

  /**
   * Build a graphology graph from nodes and edges
   */
  private buildGraphologyGraph(nodes: GraphNode[], edges: GraphEdge[]): Graph {
    const graph = new Graph({ type: 'undirected' });

    // Add nodes
    nodes.forEach(node => {
      graph.addNode(node.id, { label: node.label });
    });

    // Add edges
    edges.forEach(edge => {
      try {
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
          graph.addEdge(edge.source, edge.target, {
            weight: edge.strength
          });
        }
      } catch (error) {
        // Edge might already exist, skip
      }
    });

    return graph;
  }

  /**
   * Generate distinct colors for clusters
   */
  private generateClusterColors(count: number): string[] {
    const baseColors = [
      '#4F46E5', // Indigo
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#EC4899', // Pink
      '#F97316', // Orange
      '#14B8A6', // Teal
      '#A855F7'  // Violet
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generate additional colors if needed
    const colors = [...baseColors];
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137.5) % 360; // Golden angle for distribution
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }

    return colors;
  }

  /**
   * Convex hull using Graham scan algorithm
   */
  private convexHull(points: { x: number; y: number }[]): { x: number; y: number }[] {
    if (points.length < 3) return points;

    // Find the point with lowest y-coordinate (and leftmost if tie)
    let start = points[0];
    for (const point of points) {
      if (point.y < start.y || (point.y === start.y && point.x < start.x)) {
        start = point;
      }
    }

    // Sort points by polar angle with respect to start point
    const sorted = points
      .filter(p => p !== start)
      .sort((a, b) => {
        const angleA = Math.atan2(a.y - start.y, a.x - start.x);
        const angleB = Math.atan2(b.y - start.y, b.x - start.x);
        return angleA - angleB;
      });

    const hull: { x: number; y: number }[] = [start, sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      let top = hull[hull.length - 1];
      let nextToTop = hull[hull.length - 2];

      // Remove points that make clockwise turn
      while (
        hull.length > 1 &&
        this.crossProduct(nextToTop, top, sorted[i]) <= 0
      ) {
        hull.pop();
        top = hull[hull.length - 1];
        nextToTop = hull[hull.length - 2];
      }

      hull.push(sorted[i]);
    }

    return hull;
  }

  /**
   * Calculate cross product for three points
   */
  private crossProduct(
    o: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number }
  ): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }
}

export const clusteringService = new ClusteringService();
