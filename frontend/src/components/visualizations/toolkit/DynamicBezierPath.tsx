import React from 'react';

interface DynamicBezierPathProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  isActive?: boolean;
}

export const DynamicBezierPath: React.FC<DynamicBezierPathProps> = ({
  x1,
  y1,
  x2,
  y2,
  label,
  isActive = false,
}) => {
  const strokeColor = isActive ? 'var(--color-interactive-primary-base)' : 'var(--color-border-strong)';
  const strokeWidth = isActive ? 2 : 1.5;
  const markerEnd = isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)';

  // Calculate Path
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const isSameRow = dy < 50; // Threshold for "same row"

  let pathData = '';

  if (isSameRow) {
    // Curve up or down
    // Use a quadratic bezier or cubic to arc over/under
    // If x2 > x1, arc down? Or just straight line if very close?
    // Let's use a cubic bezier for a smooth horizontal connection
    // C control_point1, control_point2, end_point

    // Simple S-curve even for same row usually looks okay if we control handles
    // But if strictly horizontal, maybe just a line?
    if (dy < 5) {
      pathData = `M ${x1} ${y1} L ${x2} ${y2}`;
    } else {
      pathData = `M ${x1} ${y1} C ${x1 + dx / 2} ${y1}, ${x2 - dx / 2} ${y2}, ${x2} ${y2}`;
    }
  } else {
    // S-Curve (Vertical separation)
    // Control points vertical
    pathData = `M ${x1} ${y1} C ${x1} ${y1 + dy / 2}, ${x2} ${y2 - dy / 2}, ${x2} ${y2}`;
    // Or Horizontal S-curve logic depending on layout direction
    // Assuming Left-to-Right layout generally for these graphs?
    // If Flowchart/MindMap (L->R):
    const midX = (x1 + x2) / 2;
    pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  }

  // Calculate label position (midpoint of curve roughly)
  const labelX = (x1 + x2) / 2;
  const labelY = (y1 + y2) / 2;

  const activeStyle: React.CSSProperties = isActive ? {
    strokeDasharray: '10 10',
    animation: 'flow 1s linear infinite',
  } : {};

  return (
    <g className="group">
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={markerEnd}
        className="transition-colors duration-300"
        style={activeStyle}
      />

      {/* Invisible wider path for easier hovering */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={10}
        className="cursor-pointer"
      />

      {label && (
        <foreignObject
          x={labelX - 40}
          y={labelY - 12}
          width={80}
          height={24}
          className="overflow-visible"
        >
          <div className="flex justify-center items-center">
            <span className={`
              px-2 py-0.5 text-[10px] rounded-full border shadow-sm truncate max-w-full
              ${isActive
          ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800'
          : 'bg-white text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}
            `}>
              {label}
            </span>
          </div>
        </foreignObject>
      )}
    </g>
  );
};
