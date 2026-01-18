import { DepthGraphData } from '@shared/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Info,
  GitCommit,
  GitMerge,
  Layers,
  ArrowDownToLine,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../../primitives/Badge';
import { Card } from '../../../primitives/Card';

interface DepthGraphHeaderProps {
  data: DepthGraphData;
  viewMode: 'timeline' | 'hierarchy' | 'kanban-level' | 'kanban-depth';
  onViewModeChange: (mode: 'timeline' | 'hierarchy' | 'kanban-level' | 'kanban-depth') => void;
}

export const DepthGraphHeader = ({
  data,
  viewMode,
  onViewModeChange,
}: DepthGraphHeaderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const metadata = data.analysis_metadata;

  return (
    <div className="flex-none z-20 bg-[var(--color-surface-base)] border-b border-[var(--color-border-subtle)] shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Title and Summary Card */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Depth Analysis</h2>
              <Badge variant="neutral" size="sm">
                {metadata.total_logical_units} Units
              </Badge>
            </div>

            {/* Progressive Disclosure Card */}
            <Card
              variant={isExpanded ? 'elevated' : 'filled'}
              padding="sm"
              interactive={!isExpanded}
              onClick={() => !isExpanded && setIsExpanded(true)}
              className="transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[var(--color-interactive-primary-base)] shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                      Analysis Trajectory
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors p-1 -mr-1 -mt-1 rounded-md hover:bg-[var(--color-background-tertiary)]"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  <p className={`text-sm text-[var(--color-text-secondary)] leading-relaxed ${!isExpanded && 'line-clamp-2'}`}>
                    {metadata.overall_text_depth_trajectory}
                  </p>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
                              Total Units
                            </span>
                            <div className="text-sm font-mono font-medium text-[var(--color-text-primary)]">
                              {metadata.total_logical_units}
                            </div>
                          </div>

                          {/* Structure additional metadata fields if they exist */}
                          {Object.entries(metadata).map(([key, value]) => {
                            if (key === 'total_logical_units' || key === 'overall_text_depth_trajectory') return null;
                            return (
                              <div key={key} className="space-y-1">
                                <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <div className="text-sm font-mono text-[var(--color-text-secondary)] break-words">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: View Switcher */}
          <div className="flex bg-[var(--color-surface-elevated)] p-1 rounded-lg border border-[var(--color-border-subtle)] shrink-0">
            <ToolbarButton
              active={viewMode === 'timeline'}
              onClick={() => onViewModeChange('timeline')}
              icon={GitCommit}
              label="Timeline"
            />
            <ToolbarButton
              active={viewMode === 'hierarchy'}
              onClick={() => onViewModeChange('hierarchy')}
              icon={GitMerge}
              label="Hierarchy"
            />
            <div className="w-px bg-[var(--color-border-subtle)] mx-1" />
            <ToolbarButton
              active={viewMode === 'kanban-level'}
              onClick={() => onViewModeChange('kanban-level')}
              icon={Layers}
              label="Cognitive"
            />
            <ToolbarButton
              active={viewMode === 'kanban-depth'}
              onClick={() => onViewModeChange('kanban-depth')}
              icon={ArrowDownToLine}
              label="Depth"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolbarButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--color-interactive-primary-base)] text-white shadow-sm'
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]'
    }`}
    title={label}
  >
    <Icon size={16} />
    <span className="hidden xl:inline">{label}</span>
  </button>
);
