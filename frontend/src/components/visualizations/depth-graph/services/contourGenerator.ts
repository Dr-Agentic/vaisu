import * as d3 from 'd3';
import { DepthGraphNode } from '../interfaces';

export interface ContourLine {
    path: [number, number][]; // Array of [x, y] points
    value: number; // Depth threshold value
}

export function createContourLines(nodes: DepthGraphNode[], thresholdStep: number = 0.1): ContourLine[] {
    if (nodes.length < 3) return [];

    // 1. Calculate Bounding Box
    const xs = nodes.map(n => n.x || 0);
    const ys = nodes.map(n => n.y || 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Add padding
    const padding = 100;
    const bounds = {
        minX: minX - padding,
        maxX: maxX + padding,
        minY: minY - padding,
        maxY: maxY + padding,
        width: (maxX - minX) + (padding * 2),
        height: (maxY - minY) + (padding * 2)
    };

    // 2. Setup Grid
    const resolution = 64; // 64x64 grid
    const cellWidth = bounds.width / resolution;
    const cellHeight = bounds.height / resolution;
    const values = new Float64Array(resolution * resolution);

    // 3. Interpolate Values (Inverse Distance Weighting)
    // Optimization: Only consider nodes within a certain radius? 
    // For now, simple O(N*M) is fine for small N (nodes < 100) and fixed M (64*64=4096)
    // 4096 * 100 = 400k ops, totally fine.
    
    for (let j = 0; j < resolution; j++) {
        for (let i = 0; i < resolution; i++) {
            const wx = bounds.minX + (i * cellWidth);
            const wy = bounds.minY + (j * cellHeight);
            
            let numerator = 0;
            let denominator = 0;
            const p = 2; // Power parameter for IDW

            for (const node of nodes) {
                const nx = node.x || 0;
                const ny = node.y || 0;
                const dist = Math.sqrt(Math.pow(wx - nx, 2) + Math.pow(wy - ny, 2));
                
                if (dist < 1) { // Hit a node exactly
                    numerator = (node.depthMetrics.confidence.composite || 0) * 10; // Scale up for visibility
                    denominator = 1;
                    break;
                }

                const weight = 1 / Math.pow(dist, p);
                numerator += (node.depthMetrics.confidence.composite || 0) * weight;
                denominator += weight;
            }

            // Normalize
            const value = denominator !== 0 ? numerator / denominator : 0;
            values[j * resolution + i] = value;
        }
    }

    // 4. Generate Contours
    // d3.contours expects a 1D array and width/height
    const thresholds = d3.range(0, 1, thresholdStep); // 0.0, 0.1, ... 0.9
    const contourGenerator = d3.contours()
        .size([resolution, resolution])
        .thresholds(thresholds);

    const contours = contourGenerator(values as any);

    // 5. Transform back to World Coordinates
    const result: ContourLine[] = [];

    contours.forEach(contour => {
        contour.coordinates.forEach((polygon: any) => {
            // polygon is array of rings (first is exterior, others holes)
            // d3-contour returns GeoJSON MultiPolygon coords: [[[x,y], [x,y]], [[x,y]...]]
            
            polygon.forEach((ring: [number, number][]) => {
                const path: [number, number][] = ring.map(([gx, gy]) => [
                    bounds.minX + (gx * cellWidth),
                    bounds.minY + (gy * cellHeight)
                ]);
                
                result.push({
                    path,
                    value: contour.value
                });
            });
        });
    });

    return result;
}
