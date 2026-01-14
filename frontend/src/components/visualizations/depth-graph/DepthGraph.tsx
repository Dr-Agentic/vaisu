import { useState } from 'react';
import { DepthGraphData } from '@shared/types';
import { TimelineView } from './views/TimelineView';
import { HierarchyView } from './views/HierarchyView';
import { KanbanView } from './views/KanbanView';
import { DepthGraphHeader } from './components/DepthGraphHeader';
import { useTheme } from '@/design-system/ThemeProvider';

interface DepthGraphProps {
  data: DepthGraphData;
}

type ViewMode = 'timeline' | 'hierarchy' | 'kanban-level' | 'kanban-depth';

export const DepthGraph = ({ data }: DepthGraphProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Safety check if data is missing or malformed
  if (!data || !data.logical_units) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
        No depth analysis data available.
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      {/* Fixed Header with Progressive Disclosure Card */}
      <DepthGraphHeader 
        data={data}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="min-h-full w-full">
          {viewMode === 'timeline' && <TimelineView data={data} />}
          {viewMode === 'hierarchy' && <HierarchyView data={data} />}
          {viewMode === 'kanban-level' && <KanbanView data={data} mode="cognitive" />}
          {viewMode === 'kanban-depth' && <KanbanView data={data} mode="depth" />}
        </div>
      </div>
    </div>
  );
};
