import React from 'react';

import { getTypeIcon } from './utils';

interface GraphFilterToolbarProps {
  types: string[];
  activeTypes: string[];
  onToggleType: (type: string) => void;
  className?: string;
}

export const GraphFilterToolbar: React.FC<GraphFilterToolbarProps> = ({
  types,
  activeTypes,
  onToggleType,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 p-4 bg-inherit ${className}`}>
      <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase mr-2">
        Filters:
      </span>
      {types.map((type) => {
        const isActive = activeTypes.includes(type);
        const Icon = getTypeIcon(type);

        return (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
              ${isActive
            ? 'bg-[var(--color-surface-raised)] border-[var(--color-primary)] text-[var(--color-text-primary)] shadow-sm'
            : 'bg-transparent border-transparent text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-raised)]'}
            `}
          >
            <Icon size={14} className={isActive ? 'text-[var(--color-primary)]' : 'opacity-50'} />
            {type}
          </button>
        );
      })}
    </div>
  );
};
