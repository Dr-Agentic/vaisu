import * as d3Force from 'd3-force';

import { LayoutEngine, type LayoutOptions, type NodePositions } from '../layoutEngine';

import type { GraphNode, GraphEdge } from '../../../../../../../shared/src/types';

export class ForceDirectedLayout extends LayoutEngine {
  async compute(
    nodes: GraphNode[],
    edges: GraphEdge[],
    options: LayoutOptions = {},
  ): Promise<NodePositions> {
    const {
      width = 1200,
      height = 800,
      iterations = 300,
    } = options;

    if (nodes.length === 0) {
      return new Map();
    }

    // Create node ID set for validation
    const nodeIds = new Set(nodes.map(n => n.id));

    // Create simulation nodes and links
    const simNodes = nodes.map(node => ({
      id: node.id,
      x: Math.random() * width,
      y: Math.random() * height,
      size: node.size,
    }));

    // Filter out edges with invalid node references
    const validEdges = edges.filter(edge => {
      const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
      if (!isValid) {
        console.warn(`Skipping invalid edge: ${edge.source} -> ${edge.target} (node not found)`);
      }
      return isValid;
    });

    const simLinks = validEdges.map(edge => ({
      source: edge.source,
      target: edge.target,
      strength: edge.strength,
    }));

    // Create force simulation
    const simulation = d3Force.forceSimulation(simNodes as any)
      .force('link', d3Force.forceLink(simLinks as any)
        .id((d: any) => d.id)
        .distance(100)
        .strength((link: any) => link.strength || 0.5),
      )
      .force('charge', d3Force.forceManyBody()
        .strength(-300)
        .distanceMax(500),
      )
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collision', d3Force.forceCollide()
        .radius((d: any) => (d.size || 30) + 10)
        .strength(0.7),
      )
      .alphaDecay(0.0228)
      .velocityDecay(0.4);

    // Run simulation with timeout
    return new Promise((resolve) => {
      const startTime = Date.now();
      const maxTime = 3000; // 3 seconds max

      simulation.on('tick', () => {
        const elapsed = Date.now() - startTime;

        // Stop if max time or iterations reached
        if (elapsed > maxTime || simulation.alpha() < 0.001) {
          simulation.stop();

          // Extract positions
          const positions = new Map<string, { x: number; y: number }>();
          simNodes.forEach(node => {
            positions.set(node.id, {
              x: node.x || 0,
              y: node.y || 0,
            });
          });

          resolve(positions);
        }
      });

      // Manually tick for specified iterations
      for (let i = 0; i < iterations; i++) {
        simulation.tick();

        if (simulation.alpha() < 0.001) {
          break;
        }
      }

      simulation.stop();

      // Extract final positions
      const positions = new Map<string, { x: number; y: number }>();
      simNodes.forEach(node => {
        positions.set(node.id, {
          x: node.x || 0,
          y: node.y || 0,
        });
      });

      resolve(positions);
    });
  }
}
