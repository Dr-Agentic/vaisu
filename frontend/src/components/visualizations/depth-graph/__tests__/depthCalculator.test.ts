// frontend/src/components/visualizations/depth-graph/__tests__/depthCalculator.test.ts
import { describe, it, expect } from 'vitest';

import { transformToDepthData, calculateCompositeDepth } from '../services/depthCalculator';

import type { ArgumentMapData, ArgumentNode, ArgumentEdge } from '../../../../../../shared/src/types';

describe('Depth Graph Calculator', () => {
  describe('calculateCompositeDepth', () => {
    it('should calculate weighted average correctly', () => {
      const metrics = {
        cohesion: 1.0,  // 0.25 * 1.0 = 0.25
        nuance: 0.0,    // 0.25 * 0.0 = 0.0
        grounding: 0.5, // 0.30 * 0.5 = 0.15
        tension: 0.0,   // 0.20 * 0.0 = 0.0
        confidence: { cohesion: 1, nuance: 1, grounding: 1, tension: 1, composite: 1 },
      };

      // Expected: 0.25 + 0.0 + 0.15 + 0.0 = 0.40
      expect(calculateCompositeDepth(metrics)).toBeCloseTo(0.40);
    });

    it('should handle all zeros', () => {
      const metrics = {
        cohesion: 0, nuance: 0, grounding: 0, tension: 0,
        confidence: { cohesion: 0, nuance: 0, grounding: 0, tension: 0, composite: 0 },
      };
      expect(calculateCompositeDepth(metrics)).toBe(0);
    });

    it('should handle all ones', () => {
      const metrics = {
        cohesion: 1, nuance: 1, grounding: 1, tension: 1,
        confidence: { cohesion: 1, nuance: 1, grounding: 1, tension: 1, composite: 1 },
      };
      // 0.25 + 0.25 + 0.30 + 0.20 = 1.0
      expect(calculateCompositeDepth(metrics)).toBe(1);
    });
  });

  describe('transformToDepthData', () => {
    const mockNodes: ArgumentNode[] = [
      {
        id: '1',
        type: 'claim',
        label: 'Main Claim',
        summary: 'Summary',
        polarity: 'neutral',
        confidence: 0.9,
        impact: 'high',
        depthMetrics: {
          cohesion: 0.8,
          nuance: 0.7,
          grounding: 0.6,
          tension: 0.5,
          confidence: { cohesion: 0.9, nuance: 0.9, grounding: 0.9, tension: 0.9, composite: 0.9 },
        },
      },
      {
        id: '2',
        type: 'evidence',
        label: 'Evidence',
        summary: 'Evidence Summary',
        polarity: 'support',
        confidence: 0.8,
        impact: 'medium',
        // Missing depthMetrics
      },
    ];

    const mockEdges: ArgumentEdge[] = [
      {
        id: 'e1',
        source: '2',
        target: '1',
        type: 'supports',
        strength: 0.8,
      },
    ];

    const mockData: ArgumentMapData = {
      nodes: mockNodes,
      edges: mockEdges,
      metadata: { mainClaimId: '1', totalClaims: 1, totalEvidence: 1 },
    };

    it('should transform nodes correctly', () => {
      const result = transformToDepthData(mockData);
      expect(result.nodes).toHaveLength(2);

      const claimNode = result.nodes.find(n => n.id === '1');
      expect(claimNode).toBeDefined();
      expect(claimNode?.type).toBe('claim');
    });

    it('should handle missing depthMetrics with fallback', () => {
      const result = transformToDepthData(mockData);
      const evidenceNode = result.nodes.find(n => n.id === '2');

      expect(evidenceNode).toBeDefined();
      // Should fall back to 0s
      expect(evidenceNode?.depthMetrics.cohesion).toBe(0);
    });

    it('should transform edges to links', () => {
      const result = transformToDepthData(mockData);
      expect(result.links).toHaveLength(1);
      expect(result.links[0].source).toBe('2');
      expect(result.links[0].target).toBe('1');
    });

    it('should assign tension scores to edges', () => {
      const tensionEdges: ArgumentEdge[] = [
        { id: 'e2', source: '3', target: '1', type: 'attacks', strength: 0.9 },
        { id: 'e3', source: '4', target: '1', type: 'rebuts', strength: 0.9 },
      ];

      const dataWithTension = { ...mockData, edges: tensionEdges };
      const result = transformToDepthData(dataWithTension);

      expect(result.links[0].tensionScore).toBeGreaterThan(0.5);
      expect(result.links[1].tensionScore).toBeGreaterThan(0.5);
    });
  });
});
