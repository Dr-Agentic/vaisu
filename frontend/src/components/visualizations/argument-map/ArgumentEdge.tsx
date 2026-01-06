import { memo } from 'react';

import type { ArgumentEdge as IArgumentEdge } from '../../../../../shared/src/types';

interface Position {
    x: number;
    y: number;
}

interface ArgumentEdgeProps {
    edge: IArgumentEdge;
    source: Position;
    target: Position;
}

export const ArgumentEdge = memo(({ edge, source, target }: ArgumentEdgeProps) => {
  const getEdgeStyle = () => {
    switch (edge.type) {
      case 'supports':
        return { stroke: '#22c55e', strokeDasharray: '0' }; // solid green
      case 'attacks':
      case 'rebuts':
        return { stroke: '#ef4444', strokeDasharray: '4 4' }; // dashed red
      case 'is-alternative-to':
        return { stroke: '#3b82f6', strokeDasharray: '2 2' }; // dotted blue
      default:
        return { stroke: '#9ca3af', strokeDasharray: '0' }; // gray
    }
  };

  const style = getEdgeStyle();

  const isLateral = Math.abs(source.y - target.y) < 10;
  let d = '';

  if (isLateral) {
    const controlY = source.y - 50;
    d = `M ${source.x} ${source.y} Q ${(source.x + target.x) / 2} ${controlY} ${target.x} ${target.y}`;
  } else {
    d = `M ${source.x} ${source.y} C ${source.x} ${source.y + (target.y - source.y) / 2} ${target.x} ${target.y - (target.y - source.y) / 2} ${target.x} ${target.y}`;
  }

  return (
    <g className="pointer-events-none">
      <path
        d={d}
        fill="none"
        stroke={style.stroke}
        strokeWidth={1.5 * (edge.strength || 0.5) + 1}
        strokeDasharray={style.strokeDasharray}
        markerEnd={`url(#marker-${edge.type})`}
        className="transition-all duration-300"
      />
      {/* Label for edge if any */}
      {edge.rationale && (
        <text
          x={(source.x + target.x) / 2}
          y={(source.y + target.y) / 2}
          dy={-5}
          textAnchor="middle"
          fill={style.stroke}
          fontSize={10}
          className="bg-white"
        >
          {edge.rationale.length > 20 ? `${edge.rationale.substring(0, 20)}...` : edge.rationale}
        </text>
      )}
    </g>
  );
});
