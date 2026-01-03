import React, { useState } from 'react';
import { GraphNode } from './types';
import { getTypeIcon, getTypeColor } from './utils';
import { Info } from 'lucide-react';

interface GraphEntityCardProps {
  node: GraphNode;
  isFocused?: boolean;
  onHover?: (isHovering: boolean) => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const GraphEntityCard: React.FC<GraphEntityCardProps> = ({
  node,
  isFocused = false,
  onHover,
  onClick,
  className = '',
  style
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const theme = getTypeColor(node.type);
  const Icon = getTypeIcon(node.type);

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHover?.(false);
  };

  const opacityClass = isFocused ? 'opacity-100 scale-[1.02] shadow-lg ring-2 ring-[var(--color-primary)]' : 'opacity-100';

  return (
    <div
      id={`node-${node.id}`}
      className={`
        relative flex flex-col w-64 rounded-lg border transition-all duration-200 ease-out cursor-pointer
        ${theme.background} ${theme.border}
        ${opacityClass}
        ${className}
      `}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Header Row */}
      <div className="flex items-center gap-3 p-3 border-b border-inherit">
        <div className={`p-1.5 rounded-md bg-white/50 dark:bg-black/20 ${theme.icon}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium uppercase tracking-wider opacity-75 ${theme.text}`}>
              {node.type}
            </span>
            {node.importance === 'high' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </div>
          <h3 className={`font-semibold leading-tight ${theme.text}`}>
            {node.label}
          </h3>
        </div>
      </div>

      {/* Body: Summary / Metrics */}
      {node.description && (
        <div className="p-3 text-sm text-[var(--color-text-secondary)]">
          <p className="leading-relaxed">
            {node.description}
          </p>
        </div>
      )}

      {/* Progressive Disclosure Section (Expands on Hover) */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isHovering ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-3 pb-3 pt-0 text-xs border-t border-inherit bg-black/5 dark:bg-white/5">
          {node.metadata && Object.keys(node.metadata).length > 0 && (
            <div className="mt-2 space-y-1">
               {Object.entries(node.metadata).slice(0, 3).map(([key, value]) => (
                 <div key={key} className="flex justify-between">
                   <span className="opacity-60 capitalize">{key}:</span>
                   <span className="font-medium truncate max-w-[120px]">{String(value)}</span>
                 </div>
               ))}
            </div>
          )}
          
          <div className="mt-2 flex items-center justify-end gap-1 text-[var(--color-primary)] opacity-80">
            <Info size={12} />
            <span>Click for details</span>
          </div>
        </div>
      </div>
    </div>
  );
};
