import dagre from 'dagre';
import type { ClassEntity, UMLRelationship, Position } from '@shared/types';
import type { LayoutResult } from '../stores/umlDiagramStore';

export interface LayoutOptions {
  algorithm: 'hierarchical' | 'force-directed' | 'orthogonal';
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  nodeSeparation: number; // Default: 80px (horizontal sibling spacing)
  rankSeparation: number; // Default: 120px (vertical tier spacing)
  edgeSeparation: number; // Default: 10px
  nodeWidth?: number;
  nodeHeight?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  algorithm: 'hierarchical',
  direction: 'TB',
  nodeSeparation: 80,
  rankSeparation: 120,
  edgeSeparation: 10,
  nodeWidth: 200,
  nodeHeight: 120
};

/**
 * Detects cycles in inheritance relationships and removes problematic edges
 */
function detectAndRemoveCycles(relationships: UMLRelationship[]): UMLRelationship[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cyclicEdges = new Set<string>();

  // Build adjacency list for inheritance relationships only
  const graph = new Map<string, string[]>();
  const inheritanceEdges = relationships.filter(rel => rel.type === 'inheritance');

  inheritanceEdges.forEach(rel => {
    if (!graph.has(rel.source)) graph.set(rel.source, []);
    graph.get(rel.source)!.push(rel.target);
  });

  function hasCycle(node: string): boolean {
    if (recursionStack.has(node)) {
      return true; // Back edge found - cycle detected
    }

    if (visited.has(node)) {
      return false; // Already processed
    }

    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) {
        cyclicEdges.add(`${node}-${neighbor}`);
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  // Check all nodes for cycles
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      hasCycle(node);
    }
  }

  // Remove cyclic edges
  return relationships.filter(rel =>
    rel.type !== 'inheritance' || !cyclicEdges.has(`${rel.source}-${rel.target}`)
  );
}

/**
 * Prevents class box overlaps using bounding box collision detection
 */
function preventCollisions(
  positions: Map<string, Position>,
  options: Required<LayoutOptions>
): Map<string, Position> {
  const adjustedPositions = new Map(positions);
  const { nodeWidth, nodeHeight, nodeSeparation, rankSeparation } = options;

  // Get all positions as array for easier processing
  const positionArray = Array.from(adjustedPositions.entries());

  for (let i = 0; i < positionArray.length; i++) {
    for (let j = i + 1; j < positionArray.length; j++) {
      const [id1, pos1] = positionArray[i];
      const [id2, pos2] = positionArray[j];

      // Check for overlap
      const dx = Math.abs(pos1.x - pos2.x);
      const dy = Math.abs(pos1.y - pos2.y);

      const minDx = nodeWidth + nodeSeparation;
      const minDy = nodeHeight + rankSeparation;

      if (dx < minDx && dy < minDy) {
        // Collision detected - adjust position
        const adjustX = (minDx - dx) / 2;

        if (pos1.x < pos2.x) {
          adjustedPositions.set(id1, { x: pos1.x - adjustX, y: pos1.y });
          adjustedPositions.set(id2, { x: pos2.x + adjustX, y: pos2.y });
        } else {
          adjustedPositions.set(id1, { x: pos1.x + adjustX, y: pos1.y });
          adjustedPositions.set(id2, { x: pos2.x - adjustX, y: pos2.y });
        }
      }
    }
  }

  return adjustedPositions;
}

class LayoutEngine {
  private cache = new Map<string, LayoutResult>();

  async compute(
    classes: ClassEntity[],
    relationships: UMLRelationship[],
    options: Partial<LayoutOptions> = {}
  ): Promise<LayoutResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Check cache first
    const cacheKey = this.generateCacheKey(classes, relationships, opts);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const startTime = performance.now();
    let result: LayoutResult;

    if (opts.algorithm === 'hierarchical') {
      try {
        result = this.computeHierarchicalLayout(classes, relationships, opts);
      } catch (error) {
        console.error('Hierarchical layout failed, falling back to grid:', error);
        result = this.computeGridLayout(classes, opts);
      }
    } else {
      // Fallback to grid layout
      result = this.computeGridLayout(classes, opts);
    }

    const computationTime = performance.now() - startTime;
    result.computationTime = computationTime;

    // Performance warning for large diagrams
    if (computationTime > 2000) {
      console.warn(`Layout computation took ${computationTime.toFixed(0)}ms - consider simplifying diagram`);
    }

    // Cache result
    this.cache.set(cacheKey, result);

    // Limit cache size
    if (this.cache.size > 10) {
      const firstKey = this.cache.keys().next().value!;
      this.cache.delete(firstKey);
    }

    return result;
  }

  private generateCacheKey(
    classes: ClassEntity[],
    relationships: UMLRelationship[],
    options: Required<LayoutOptions>
  ): string {
    const classIds = classes.map(c => c.id).sort().join(',');
    const relationshipIds = relationships.map(r => `${r.source}-${r.target}-${r.type}`).sort().join(',');
    const optionsStr = JSON.stringify(options);
    return `${classIds}|${relationshipIds}|${optionsStr}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private computeHierarchicalLayout(
    classes: ClassEntity[],
    relationships: UMLRelationship[],
    options: Required<LayoutOptions>
  ): LayoutResult {
    // Create dagre graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: options.direction,
      ranksep: options.rankSeparation,
      nodesep: options.nodeSeparation,
      marginx: 20,
      marginy: 20
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes (classes)
    classes.forEach(classEntity => {
      g.setNode(classEntity.id, {
        width: options.nodeWidth,
        height: options.nodeHeight,
        label: classEntity.name
      });
    });

    // Valid class IDs set for quick lookup
    const validClassIds = new Set(classes.map(c => c.id));

    // Filter out relationships where source or target doesn't exist to prevent undefined errors
    const validRelationships = relationships.filter(rel =>
      validClassIds.has(rel.source) && validClassIds.has(rel.target)
    );

    // Remove cycles from relationships before adding edges
    const acyclicRelationships = detectAndRemoveCycles(validRelationships);

    // Add edges (relationships) - prioritize inheritance for hierarchy
    const inheritanceEdges = acyclicRelationships.filter(rel => rel.type === 'inheritance');
    const otherEdges = acyclicRelationships.filter(rel => rel.type !== 'inheritance');

    // Add inheritance edges first for better hierarchy
    // Note: In UML, inheritance goes from child to parent, but for layout we want parent above child
    inheritanceEdges.forEach(rel => {
      g.setEdge(rel.target, rel.source, { weight: 10 }); // Reverse direction for proper hierarchy
    });

    // Add other relationship edges with lower weight
    otherEdges.forEach(rel => {
      g.setEdge(rel.source, rel.target, { weight: 1 });
    });

    // Run layout algorithm
    dagre.layout(g);

    // Extract positions
    const positions = new Map<string, Position>();
    g.nodes().forEach(nodeId => {
      const node = g.node(nodeId);
      positions.set(nodeId, {
        x: node.x - node.width / 2,
        y: node.y - node.height / 2
      });
    });

    // Prevent collisions
    const adjustedPositions = preventCollisions(positions, options);

    // Route edges with orthogonal connectors
    const edges = new Map<string, { points: Position[] }>();
    relationships.forEach(rel => {
      const sourcePos = adjustedPositions.get(rel.source);
      const targetPos = adjustedPositions.get(rel.target);

      if (sourcePos && targetPos) {
        // Create orthogonal path for better readability
        const midX = sourcePos.x + (targetPos.x - sourcePos.x) * 0.5;
        const points = [
          { x: sourcePos.x + options.nodeWidth / 2, y: sourcePos.y + options.nodeHeight / 2 },
          { x: midX, y: sourcePos.y + options.nodeHeight / 2 },
          { x: midX, y: targetPos.y + options.nodeHeight / 2 },
          { x: targetPos.x + options.nodeWidth / 2, y: targetPos.y + options.nodeHeight / 2 }
        ];
        edges.set(rel.id, { points });
      }
    });

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    adjustedPositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + options.nodeWidth);
      maxY = Math.max(maxY, pos.y + options.nodeHeight);
    });

    // Add padding
    const padding = 40;
    const bounds = {
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + (2 * padding),
      height: (maxY - minY) + (2 * padding)
    };

    return {
      positions: adjustedPositions,
      edges,
      bounds,
      computationTime: 0 // Will be set by caller
    };
  }

  private computeGridLayout(classes: ClassEntity[], options: Required<LayoutOptions>): LayoutResult {
    const positions = new Map<string, Position>();
    const edges = new Map<string, { points: Position[] }>();

    // Simple grid layout
    const cols = Math.ceil(Math.sqrt(classes.length));
    const spacing = Math.max(options.nodeWidth + options.nodeSeparation, 250);

    classes.forEach((classEntity, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      positions.set(classEntity.id, {
        x: col * spacing,
        y: row * spacing
      });
    });

    // Calculate bounds
    const rows = Math.ceil(classes.length / cols);

    return {
      positions,
      edges,
      bounds: {
        x: 0,
        y: 0,
        width: cols * spacing,
        height: rows * spacing
      },
      computationTime: 0
    };
  }

  /**
   * Centers the diagram in the viewport
   */
  centerDiagram(layoutResult: LayoutResult, viewportWidth: number, viewportHeight: number): Position {
    const centerX = (viewportWidth - layoutResult.bounds.width) / 2;
    const centerY = (viewportHeight - layoutResult.bounds.height) / 2;

    return {
      x: Math.max(0, centerX),
      y: Math.max(0, centerY)
    };
  }


}

export const layoutEngine = new LayoutEngine();