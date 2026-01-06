// frontend/src/components/visualizations/depth-graph/services/depthCalculator.ts
import { ArgumentMapData } from '../../../../../../shared/src/types';
import { DepthGraphData, DepthGraphNode, DepthGraphEdge, DepthMetrics } from '../interfaces';

export function calculateCompositeDepth(metrics: DepthMetrics): number {
  return (
    metrics.cohesion * 0.25
        + metrics.nuance * 0.25
        + metrics.grounding * 0.30
        + metrics.tension * 0.20
  );
}

const defaultMetrics: DepthMetrics = {
  cohesion: 0,
  nuance: 0,
  grounding: 0,
  tension: 0,
  confidence: {
    cohesion: 0,
    nuance: 0,
    grounding: 0,
    tension: 0,
    composite: 0,
  },
};

export function transformToDepthData(data: ArgumentMapData): DepthGraphData {
  const nodes: DepthGraphNode[] = data.nodes.map(node => {
    // Strictly use provided metrics. If missing, use neutral zero-values.
    // This ensures we do not "hallucinate" visualization data.
    const metrics = node.depthMetrics || defaultMetrics;

    return {
      id: node.id,
      type: node.type,
      content: node.summary || node.label,
      label: node.label,
      size: node.type === 'claim' ? 12 : 8,
      depthMetrics: metrics,
      polarity: node.polarity,
      impact: node.impact,
      // x, y will be handled by force graph
    };
  });

  const links: DepthGraphEdge[] = data.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    type: edge.type,
    strength: edge.strength || 1,
    tensionScore: (edge.type === 'attacks' || edge.type === 'rebuts') ? 0.9 : 0.1,
  }));

  return { nodes, links };
}
