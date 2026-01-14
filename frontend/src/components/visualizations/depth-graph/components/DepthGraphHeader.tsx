import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Info,
  GitCommit, 
  GitMerge, 
  Layers,
  ArrowDownToLine 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DepthGraphData } from '@shared/types';
import { Badge } from '../../../primitives/Badge';

interface DepthGraphHeaderProps {
  data: DepthGraphData;
  viewMode: 'timeline' | 'hierarchy' | 'kanban-level' | 'kanban-depth';
  onViewModeChange: (mode: 'timeline' | 'hierarchy' | 'kanban-level' | 'kanban-depth') => void;
}

export const DepthGraphHeader = ({ 
  data, 
  viewMode, 
  onViewModeChange 
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
            <div 
              className={`
                rounded-lg border transition-all duration-200 overflow-hidden
                ${isExpanded 
                  ? 'bg-[var(--color-surface-elevated)] border-[var(--color-border-strong)] shadow-md' 
                  : 'bg-[var(--color-background-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] cursor-pointer'
                }
              `}
              onClick={() => !isExpanded && setIsExpanded(true)}
            >
              <div className="p-3 flex items-start gap-3">
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
                              Total Units
                            </span>
                            <div className="text-sm font-mono font-medium text-[var(--color-text-primary)]">
                              {metadata.total_logical_units}
                            </div>
                          </div>
                          {/* Add more metadata fields here if available in the JSON */}
                          <div className="col-span-2 space-y-1">
                            <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
                              Full Trajectory Analysis
                            </span>
                            <div className="text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-background-primary)] p-2 rounded border border-[var(--color-border-subtle)]">
                              {/* Display any other raw metadata if needed, for now using trajectory */}
                              {JSON.stringify(metadata, null, 2)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
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
  label 
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
