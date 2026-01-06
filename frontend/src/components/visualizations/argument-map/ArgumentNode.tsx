import { GripVertical } from 'lucide-react';
import { memo } from 'react';

import { cn } from '../../../lib/utils';

import type { ArgumentNode as IArgumentNode } from '../../../../../shared/src/types';

interface ArgumentNodeProps {
    node: IArgumentNode;
    x: number;
    y: number;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    // onToggleCollapse?: (id: string) => void; // Reserved for future use
}

export const ArgumentNode = memo(({
  node,
  x,
  y,
  isSelected,
  onSelect,
}: ArgumentNodeProps) => {
  const getShapeStyles = () => {
    switch (node.type) {
      case 'claim':
        return 'rounded-xl border-2';
      case 'argument':
        return 'rounded-sm border';
      case 'evidence':
        return 'rounded-full border border-dashed aspect-[2/1] flex items-center justify-center';
      case 'counterargument':
        return 'rotate-45 scale-90 border-2 aspect-square flex items-center justify-center';
      case 'alternative':
        return '-skew-x-12 border border-dotted';
      default:
        return 'rounded border';
    }
  };

  const getColorStyles = () => {
    switch (node.polarity) {
      case 'support':
        return 'bg-green-50 border-green-300 hover:border-green-500';
      case 'attack':
        return 'bg-red-50 border-red-300 hover:border-red-500';
      default:
        return 'bg-white border-gray-300 hover:border-blue-400';
    }
  };

  // Correction for rotated nodes to keep text upright
  const contentStyle = node.type === 'counterargument' ? 'rotate-[-45deg] scale-110' : node.type === 'alternative' ? 'skew-x-12' : '';

  const width = node.type === 'evidence' ? 180 : 220;
  const height = node.type === 'evidence' ? 90 : node.type === 'counterargument' ? 140 : 100;

  return (
    <div
      className="absolute transition-all duration-300 ease-in-out cursor-pointer group"
      style={{
        transform: `translate(${x - width / 2}px, ${y - height / 2}px)`,
        width,
        height,
        zIndex: isSelected ? 50 : 10,
      }}
      onClick={() => onSelect?.(node.id)}
    >
      <div
        className={cn(
          'w-full h-full p-3 shadow-md transition-colors relative overflow-hidden',
          getShapeStyles(),
          getColorStyles(),
          isSelected ? 'ring-2 ring-primary-500' : '',
        )}
      >
        {/* Header/Grip */}
        <div className={cn('absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity', contentStyle)}>
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Content */}
        <div className={cn('flex flex-col h-full', contentStyle)}>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded',
              node.polarity === 'support' ? 'bg-green-100 text-green-700'
                : node.polarity === 'attack' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600',
            )}>
              {node.type}
            </span>
            {node.confidence > 0 && (
              <span className="text-[10px] text-gray-500">
                {Math.round(node.confidence * 100)}% conf
              </span>
            )}
          </div>

          <h4 className="font-semibold text-sm leading-tight text-gray-900 mb-1 line-clamp-2">
            {node.label}
          </h4>

          <p className="text-xs text-gray-600 leading-snug line-clamp-3">
            {node.summary}
          </p>
        </div>
      </div>
    </div>
  );
});
