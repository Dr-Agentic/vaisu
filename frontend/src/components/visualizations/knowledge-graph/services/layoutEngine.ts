import type { GraphNode, GraphEdge, LayoutAlgorithm } from '../../../../../../shared/src/types';

export interface LayoutOptions {
  width?: number;
  height?: number;
  iterations?: number;
  nodeSpacing?: number;
  levelSeparation?: number;
}

export interface NodePosition {
  x: number;
  y: number;
}

export type NodePositions = Map<string, NodePosition>;

export abstract class LayoutEngine {
  /**
   * Compute node positions using the layout algorithm
   */
  abstract compute(
    nodes: GraphNode[],
    edges: GraphEdge[],
    options?: LayoutOptions
  ): Promise<NodePositions>;

  /**
   * Animate transition between two layout states
   */
  animateTransition(
    from: NodePositions,
    to: NodePositions,
    duration: number,
    onUpdate: (positions: NodePositions, progress: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const nodeIds = Array.from(to.keys());

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);

        // Interpolate positions
        const interpolated = new Map<string, NodePosition>();
        nodeIds.forEach(id => {
          const fromPos = from.get(id) || { x: 0, y: 0 };
          const toPos = to.get(id) || { x: 0, y: 0 };

          interpolated.set(id, {
            x: fromPos.x + (toPos.x - fromPos.x) * eased,
            y: fromPos.y + (toPos.y - fromPos.y) * eased
          });
        });

        onUpdate(interpolated, progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Center the layout in the viewport
   */
  protected centerLayout(
    positions: NodePositions,
    width: number,
    height: number
  ): NodePositions {
    if (positions.size === 0) return positions;

    // Calculate bounds
    const posArray = Array.from(positions.values());
    const minX = Math.min(...posArray.map(p => p.x));
    const maxX = Math.max(...posArray.map(p => p.x));
    const minY = Math.min(...posArray.map(p => p.y));
    const maxY = Math.max(...posArray.map(p => p.y));

    const layoutWidth = maxX - minX;
    const layoutHeight = maxY - minY;

    // Calculate offset to center
    const offsetX = (width - layoutWidth) / 2 - minX;
    const offsetY = (height - layoutHeight) / 2 - minY;

    // Apply offset
    const centered = new Map<string, NodePosition>();
    positions.forEach((pos, id) => {
      centered.set(id, {
        x: pos.x + offsetX,
        y: pos.y + offsetY
      });
    });

    return centered;
  }

  /**
   * Scale layout to fit within bounds
   */
  protected scaleToFit(
    positions: NodePositions,
    width: number,
    height: number,
    padding: number = 50
  ): NodePositions {
    if (positions.size === 0) return positions;

    const posArray = Array.from(positions.values());
    const minX = Math.min(...posArray.map(p => p.x));
    const maxX = Math.max(...posArray.map(p => p.x));
    const minY = Math.min(...posArray.map(p => p.y));
    const maxY = Math.max(...posArray.map(p => p.y));

    const layoutWidth = maxX - minX;
    const layoutHeight = maxY - minY;

    const availableWidth = width - 2 * padding;
    const availableHeight = height - 2 * padding;

    const scaleX = layoutWidth > 0 ? availableWidth / layoutWidth : 1;
    const scaleY = layoutHeight > 0 ? availableHeight / layoutHeight : 1;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

    const scaled = new Map<string, NodePosition>();
    positions.forEach((pos, id) => {
      scaled.set(id, {
        x: (pos.x - minX) * scale + padding,
        y: (pos.y - minY) * scale + padding
      });
    });

    return scaled;
  }
}

/**
 * Factory function to create layout engine instances
 */
export function createLayoutEngine(algorithm: LayoutAlgorithm): LayoutEngine {
  switch (algorithm) {
    case 'force-directed':
      // Will be imported dynamically to avoid circular dependencies
      return new (require('./layouts/forceDirectedLayout').ForceDirectedLayout)();
    case 'hierarchical':
      return new (require('./layouts/hierarchicalLayout').HierarchicalLayout)();
    case 'circular':
      return new (require('./layouts/circularLayout').CircularLayout)();
    default:
      throw new Error(`Unknown layout algorithm: ${algorithm}`);
  }
}
