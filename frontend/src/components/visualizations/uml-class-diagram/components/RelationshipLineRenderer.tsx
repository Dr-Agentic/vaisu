import { calculateClassDimensions } from './layoutUtils';

import type { UMLRelationship, Position, ClassEntity } from '@shared/types';

interface RelationshipLineRendererProps {
  relationships: UMLRelationship[];
  classPositions: Map<string, Position>;
  classes: Map<string, ClassEntity>;
  zoom: number;
}

interface LineStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  markerEnd?: string;
  markerStart?: string;
}

interface ArrowMarkerProps {
  id: string;
  color: string;
  filled?: boolean;
  type: 'triangle' | 'diamond' | 'arrow';
}

const ArrowMarker: React.FC<ArrowMarkerProps> = ({ id, color, filled = false, type }) => {
  const renderMarker = () => {
    switch (type) {
      case 'triangle':
        return (
          <polygon
            points="0,0 10,5 0,10"
            fill={filled ? color : 'white'}
            stroke={color}
            strokeWidth="1"
          />
        );
      case 'diamond':
        return (
          <polygon
            points="0,5 5,0 10,5 5,10"
            fill={filled ? color : 'white'}
            stroke={color}
            strokeWidth="1"
          />
        );
      case 'arrow':
        return (
          <polygon
            points="0,0 10,5 0,10 3,5"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
        );
      default:
        return null;
    }
  };

  return (
    <marker
      id={id}
      markerWidth="12"
      markerHeight="12"
      refX="10"
      refY="5"
      orient="auto"
      markerUnits="strokeWidth"
    >
      {renderMarker()}
    </marker>
  );
};

const getRelationshipStyle = (type: string, zoom: number): LineStyle => {
  const baseWidth = Math.max(1, Math.min(3, zoom * 1.5));

  switch (type) {
    case 'inheritance':
      return {
        stroke: '#3b82f6', // blue
        strokeWidth: baseWidth,
        markerEnd: 'url(#inheritance-end)',
      };
    case 'realization': // mapped from 'interface' in previous code, but type is 'realization' in UMLRelationship
      return {
        stroke: '#10b981', // green
        strokeWidth: baseWidth,
        strokeDasharray: '5,5',
        markerEnd: 'url(#interface-end)',
      };
    case 'composition':
      return {
        stroke: '#ef4444', // red
        strokeWidth: baseWidth,
        markerStart: 'url(#composition-start)',
      };
    case 'aggregation':
      return {
        stroke: '#f97316', // orange
        strokeWidth: baseWidth,
        markerStart: 'url(#aggregation-start)',
      };
    case 'association':
      return {
        stroke: '#6b7280', // gray
        strokeWidth: baseWidth,
        markerEnd: 'url(#association-end)',
      };
    case 'dependency':
      return {
        stroke: '#9ca3af', // light gray
        strokeWidth: baseWidth,
        strokeDasharray: '3,3',
        markerEnd: 'url(#dependency-end)',
      };
    default:
      return {
        stroke: '#6b7280',
        strokeWidth: baseWidth,
      };
  }
};

const getRectIntersection = (
  center: Position,
  width: number,
  height: number,
  target: Position,
): Position => {
  const dx = target.x - center.x;
  const dy = target.y - center.y;

  if (dx === 0 && dy === 0) return center;

  // Calculate half dimensions
  const hW = width / 2;
  const hH = height / 2;

  // Calculate intersection with box-like boundaries using a simple ray casting approach
  // We determine which side (top, right, bottom, left) the ray intersects
  // Slope m = dy / dx
  // y = m*x (relative to center)

  // Try vertical edges (x = +/- hW)
  // x = hW => y = m * hW. If -hH <= y <= hH, then it intersects the right edge.
  // x = -hW => y = m * -hW. If -hH <= y <= hH, then it intersects the left edge.

  if (dx !== 0) {
    const m = dy / dx;
    const xEdge = dx > 0 ? hW : -hW;
    const yIntersect = m * xEdge;

    if (yIntersect >= -hH && yIntersect <= hH) {
      return { x: center.x + xEdge, y: center.y + yIntersect };
    }
  }

  // Try horizontal edges (y = +/- hH)
  if (dy !== 0) {
    const mInv = dx / dy; // distinct from m to avoid div by zero
    const yEdge = dy > 0 ? hH : -hH;
    const xIntersect = mInv * yEdge;

    if (xIntersect >= -hW && xIntersect <= hW) {
      return { x: center.x + xIntersect, y: center.y + yEdge };
    }
  }

  // Fallback (should be covered above unless point is inside, but here we assume target is outside)
  return center;
};

const calculateLinePoints = (
  from: Position,
  to: Position,
  fromClass: ClassEntity | undefined,
  toClass: ClassEntity | undefined,
  offset: number = 0,
  zoom: number,
): { path: string, midX: number, midY: number } | null => {
  if (!fromClass || !toClass) return null;

  // Get dimensions (assuming expanded for now to avoid detachment on large classes)
  // We pass 'false' for collapsed to ensure we target the full possible box
  // Ideally we would know the actual collapsed state
  const fromDim = calculateClassDimensions(fromClass, zoom, { attributes: false, methods: false });
  const toDim = calculateClassDimensions(toClass, zoom, { attributes: false, methods: false });

  const fromStart = getRectIntersection(from, fromDim.width, fromDim.height, to);
  const toEnd = getRectIntersection(to, toDim.width, toDim.height, from);

  // Apply parallel offset
  const dx = toEnd.x - fromStart.x;
  const dy = toEnd.y - fromStart.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return null;

  const unitX = dx / length;
  const unitY = dy / length;

  const perpX = -unitY * offset;
  const perpY = unitX * offset;

  const startX = fromStart.x + perpX;
  const startY = fromStart.y + perpY;
  const endX = toEnd.x + perpX;
  const endY = toEnd.y + perpY;

  // Create orthogonal path
  const midX = startX + (endX - startX) * 0.5;
  // midY removed as unused (variable), but we return the property

  return {
    path: `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
    midX,
    midY: startY + (endY - startY) / 2,
  };
};

const MultiplicityLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  zoom: number;
}> = ({ text, x, y, zoom }) => {
  if (zoom < 0.9) return null;

  return (
    <text
      x={x}
      y={y}
      fontSize={Math.max(10, 12 * zoom)}
      fill="#374151"
      textAnchor="middle"
      dominantBaseline="middle"
      className="pointer-events-none select-none"
    >
      {text}
    </text>
  );
};

export const RelationshipLineRenderer: React.FC<RelationshipLineRendererProps> = ({
  relationships,
  classPositions,
  classes,
  zoom,
}) => {
  // Group parallel relationships for offset calculation
  const relationshipGroups = new Map<string, UMLRelationship[]>();

  relationships.forEach(rel => {
    const key = [rel.source, rel.target].sort().join('-');
    if (!relationshipGroups.has(key)) {
      relationshipGroups.set(key, []);
    }
    relationshipGroups.get(key)!.push(rel);
  });

  return (
    <g className="relationship-lines">
      {/* Define arrow markers */}
      <defs>
        <ArrowMarker id="inheritance-end" color="#3b82f6" type="triangle" />
        <ArrowMarker id="interface-end" color="#10b981" type="triangle" />
        <ArrowMarker id="composition-start" color="#ef4444" filled type="diamond" />
        <ArrowMarker id="aggregation-start" color="#f97316" type="diamond" />
        <ArrowMarker id="association-end" color="#6b7280" type="arrow" />
        <ArrowMarker id="dependency-end" color="#9ca3af" type="arrow" />
      </defs>

      {Array.from(relationshipGroups.entries()).map(([, groupRels]) => {
        return groupRels.map((relationship, index) => {
          const fromPos = classPositions.get(relationship.source);
          const toPos = classPositions.get(relationship.target);
          const fromClass = classes.get(relationship.source);
          const toClass = classes.get(relationship.target);

          if (!fromPos || !toPos || !fromClass || !toClass) return null;

          const style = getRelationshipStyle(relationship.type, zoom);
          const offset = groupRels.length > 1 ? (index - (groupRels.length - 1) / 2) * 8 : 0;
          const result = calculateLinePoints(
            fromPos,
            toPos,
            fromClass,
            toClass,
            offset,
            zoom,
          );

          if (!result) return null;

          return (
            <g key={`${relationship.source}-${relationship.target}-${index}`}>
              <path
                d={result.path}
                fill="none"
                {...style}
                className="hover:stroke-opacity-80 transition-all duration-150"
              />

              {/* Multiplicity labels */}
              {zoom >= 0.9 && (
                <>
                  {relationship.sourceMultiplicity && (
                    <MultiplicityLabel
                      text={relationship.sourceMultiplicity}
                      x={fromPos.x + (toPos.x - fromPos.x) * 0.15 + (offset * 2)}
                      y={fromPos.y + (toPos.y - fromPos.y) * 0.15}
                      zoom={zoom}
                    />
                  )}
                  {relationship.targetMultiplicity && (
                    <MultiplicityLabel
                      text={relationship.targetMultiplicity}
                      x={toPos.x - (toPos.x - fromPos.x) * 0.15 + (offset * 2)}
                      y={toPos.y - (toPos.y - fromPos.y) * 0.15}
                      zoom={zoom}
                    />
                  )}
                </>
              )}

              {/* Label (e.g. "owns", "uses") */}
              {relationship.label && zoom >= 0.8 && (
                <text
                  x={result.midX}
                  y={result.midY}
                  fontSize={Math.max(10, 11 * zoom)}
                  fill="#4b5563"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="bg-white"
                  style={{ textShadow: '0px 0px 4px white' }}
                >
                  {relationship.label}
                </text>
              )}

              {/* Role labels using progressive disclosure */}
              {zoom >= 1.2 && (
                <>
                  {relationship.sourceRole && (
                    <text
                      x={fromPos.x + (toPos.x - fromPos.x) * 0.25}
                      y={fromPos.y + (toPos.y - fromPos.y) * 0.25}
                      className="text-xs fill-gray-500"
                      textAnchor="middle"
                    >
                      {relationship.sourceRole}
                    </text>
                  )}
                  {relationship.targetRole && (
                    <text
                      x={toPos.x - (toPos.x - fromPos.x) * 0.25}
                      y={toPos.y - (toPos.y - fromPos.y) * 0.25}
                      className="text-xs fill-gray-500"
                      textAnchor="middle"
                    >
                      {relationship.targetRole}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        });
      })}
    </g>
  );
};
