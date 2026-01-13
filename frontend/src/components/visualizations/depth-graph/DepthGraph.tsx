import { useState } from 'react';
import { 
  GitCommit, 
  GitMerge, 
  Layers,
  ArrowDownToLine 
} from 'lucide-react';
import { DepthGraphData } from '@shared/types';
import { TimelineView } from './views/TimelineView';
import { HierarchyView } from './views/HierarchyView';
import { KanbanView } from './views/KanbanView';

interface DepthGraphProps {
  data: DepthGraphData;
}

type ViewMode = 'timeline' | 'hierarchy' | 'kanban-level' | 'kanban-depth';

export const DepthGraph = ({ data }: DepthGraphProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  // Safety check if data is missing or malformed
  if (!data || !data.logical_units) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
        No depth analysis data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-background-primary)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] shrink-0 z-10 sticky top-0">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Depth Analysis</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data.analysis_metadata?.overall_text_depth_trajectory || `${data.logical_units.length} Logical Units`}
          </p>
        </div>

        <div className="flex bg-[var(--color-surface-elevated)] p-1 rounded-lg border border-[var(--color-border-subtle)]">
          <ToolbarButton 
            active={viewMode === 'timeline'} 
            onClick={() => setViewMode('timeline')}
            icon={GitCommit}
            label="Timeline"
          />
          <ToolbarButton 
            active={viewMode === 'hierarchy'} 
            onClick={() => setViewMode('hierarchy')}
            icon={GitMerge}
            label="Hierarchy"
          />
          <div className="w-px bg-[var(--color-border-subtle)] mx-1" />
          <ToolbarButton 
            active={viewMode === 'kanban-level'} 
            onClick={() => setViewMode('kanban-level')}
            icon={Layers}
            label="Cognitive"
          />
          <ToolbarButton 
            active={viewMode === 'kanban-depth'} 
            onClick={() => setViewMode('kanban-depth')}
            icon={ArrowDownToLine}
            label="Depth"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-[var(--color-background-secondary)] relative">
        <div className="min-h-full">
          {viewMode === 'timeline' && <TimelineView data={data} />}
          {viewMode === 'hierarchy' && <HierarchyView data={data} />}
          {viewMode === 'kanban-level' && <KanbanView data={data} mode="cognitive" />}
          {viewMode === 'kanban-depth' && <KanbanView data={data} mode="depth" />}
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
  >
    <Icon size={16} />
    <span className="hidden sm:inline">{label}</span>
  </button>
);