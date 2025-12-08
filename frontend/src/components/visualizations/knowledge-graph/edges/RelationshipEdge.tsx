import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const { relationship, isSelected, isHighlighted, showLabel, zoom } = data || {};

  // Determine edge thickness based on strength
  const baseThickness = 1;
  const maxThickness = 4;
  const thickness = relationship?.strength
    ? baseThickness + (relationship.strength * (maxThickness - baseThickness))
    : 2;

  // Determine edge style based on relationship type
  const getStrokeStyle = (type: string) => {
    switch (type) {
      case 'causes':
      case 'requires':
        return 'solid';
      case 'part-of':
      case 'contains':
        return 'dashed';
      case 'relates-to':
        return 'dotted';
      default:
        return 'solid';
    }
  };

  const strokeDasharray = getStrokeStyle(relationship?.type || 'relates-to') === 'dashed'
    ? '5,5'
    : getStrokeStyle(relationship?.type || 'relates-to') === 'dotted'
    ? '2,2'
    : undefined;

  // Determine color
  const getEdgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'causes': '#EF4444',
      'requires': '#F59E0B',
      'part-of': '#10B981',
      'contains': '#10B981',
      'relates-to': '#6B7280',
      'implements': '#8B5CF6',
      'uses': '#06B6D4',
      'depends-on': '#EC4899'
    };
    return colors[type] || '#6B7280';
  };

  const color = getEdgeColor(relationship?.type || 'relates-to');
  const opacity = isHighlighted ? 1.0 : isSelected ? 0.8 : 0.4;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: thickness,
          stroke: color,
          opacity,
          strokeDasharray,
          transition: 'opacity 0.2s ease'
        }}
      />
      {showLabel && zoom > 1.5 && relationship?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: '10px',
              fontWeight: 500,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${color}`,
              color: '#374151',
              pointerEvents: 'all'
            }}
            className="nodrag nopan"
          >
            {relationship.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
