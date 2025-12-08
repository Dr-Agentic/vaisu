import Graph from 'graphology';
import type { GraphNode, GraphEdge } from '../../../../../../shared/src/types';

export interface CentralityScores {
  degree: number;
  betweenness: number;
  eigenvector: number;
  combined: number;
}

export class CentralityService {
  /**
   * Calculate centrality scores for all nodes in the graph
   */
  calculateCentrality(nodes: GraphNode[], edges: GraphEdge[]): Map<string, CentralityScores> {
    const graph = this.buildGraphologyGraph(nodes, edges);
    const scores = new Map<string, CentralityScores>();

    // Calculate degree centrality (simple count, then normalize)
    const degreeScores: Record<string, number> = {};
    nodes.forEach(node => {
      degreeScores[node.id] = graph.degree(node.id);
    });
    const maxDegree = Math.max(...Object.values(degreeScores), 1);

    // Calculate betweenness centrality (simplified)
    const betweennessScores = this.calculateBetweenness(graph, nodes);

    // Calculate eigenvector centrality (simplified - use degree as proxy)
    const eigenvectorScores: Record<string, number> = {};
    nodes.forEach(node => {
      eigenvectorScores[node.id] = degreeScores[node.id] / maxDegree;
    });

    // Combine scores with weights: 40% degree, 30% betweenness, 30% eigenvector
    nodes.forEach(node => {
      const normalizedDegree = maxDegree > 0 ? degreeScores[node.id] / maxDegree : 0;
      const normalizedBetweenness = betweennessScores[node.id] || 0;
      const normalizedEigenvector = eigenvectorScores[node.id] || 0;

      const combined = 
        0.4 * normalizedDegree +
        0.3 * normalizedBetweenness +
        0.3 * normalizedEigenvector;

      scores.set(node.id, {
        degree: normalizedDegree,
        betweenness: normalizedBetweenness,
        eigenvector: normalizedEigenvector,
        combined
      });
    });

    return scores;
  }

  /**
   * Simplified betweenness centrality calculation
   */
  private calculateBetweenness(graph: Graph, nodes: GraphNode[]): Record<string, number> {
    const betweenness: Record<string, number> = {};
    nodes.forEach(node => {
      betweenness[node.id] = 0;
    });

    // For each pair of nodes, find shortest paths and count how many go through each node
    nodes.forEach(source => {
      const distances = new Map<string, number>();
      const predecessors = new Map<string, Set<string>>();
      const queue: string[] = [source.id];
      
      distances.set(source.id, 0);
      predecessors.set(source.id, new Set());

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currentDist = distances.get(current)!;

        graph.forEachNeighbor(current, neighbor => {
          if (!distances.has(neighbor)) {
            distances.set(neighbor, currentDist + 1);
            predecessors.set(neighbor, new Set([current]));
            queue.push(neighbor);
          } else if (distances.get(neighbor) === currentDist + 1) {
            predecessors.get(neighbor)!.add(current);
          }
        });
      }

      // Count paths through each node
      nodes.forEach(target => {
        if (target.id !== source.id && distances.has(target.id)) {
          const pathCount = this.countPaths(source.id, target.id, predecessors);
          predecessors.get(target.id)?.forEach(pred => {
            if (pred !== source.id) {
              betweenness[pred] += pathCount;
            }
          });
        }
      });
    });

    // Normalize
    const maxBetweenness = Math.max(...Object.values(betweenness), 1);
    Object.keys(betweenness).forEach(key => {
      betweenness[key] = betweenness[key] / maxBetweenness;
    });

    return betweenness;
  }

  private countPaths(source: string, target: string, predecessors: Map<string, Set<string>>): number {
    if (source === target) return 1;
    const preds = predecessors.get(target);
    if (!preds || preds.size === 0) return 0;
    
    let count = 0;
    preds.forEach(pred => {
      count += this.countPaths(source, pred, predecessors);
    });
    return count;
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
   * Get nodes sorted by centrality score
   */
  getTopNodes(
    nodes: GraphNode[],
    scores: Map<string, CentralityScores>,
    limit: number = 10
  ): GraphNode[] {
    return nodes
      .map(node => ({
        node,
        score: scores.get(node.id)?.combined || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.node);
  }

  /**
   * Calculate percentile threshold for filtering
   */
  getPercentileThreshold(
    scores: Map<string, CentralityScores>,
    percentile: number
  ): number {
    const values = Array.from(scores.values()).map(s => s.combined);
    values.sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * values.length);
    return values[index] || 0;
  }
}

export const centralityService = new CentralityService();
