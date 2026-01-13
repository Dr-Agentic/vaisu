import { DepthGraphData, DepthGraphNode } from '@shared/types';
import { DepthNodeCard } from '../cards/DepthNodeCard';

type GroupingMode = 'depth' | 'cognitive';

interface KanbanViewProps {
  data: DepthGraphData;
  mode: GroupingMode;
}

interface Column {
  id: string;
  title: string;
  color: string;
  nodes: DepthGraphNode[];
}

export const KanbanView = ({ data, mode }: KanbanViewProps) => {
  const getColumns = (): Column[] => {
    if (mode === 'depth') {
      return [
        {
          id: 'low',
          title: 'Surface (1.0 - 4.0)',
          color: 'border-rose-500',
          nodes: data.logical_units.filter(n => n.true_depth < 4.0)
        },
        {
          id: 'mid-low',
          title: 'Emergent (4.0 - 6.0)',
          color: 'border-orange-500',
          nodes: data.logical_units.filter(n => n.true_depth >= 4.0 && n.true_depth < 6.0)
        },
        {
          id: 'mid-high',
          title: 'Coherent (6.0 - 8.0)',
          color: 'border-amber-500',
          nodes: data.logical_units.filter(n => n.true_depth >= 6.0 && n.true_depth < 8.0)
        },
        {
          id: 'high',
          title: 'Profound (8.0 - 10.0)',
          color: 'border-emerald-500',
          nodes: data.logical_units.filter(n => n.true_depth >= 8.0)
        }
      ];
    } else {
      // Cognitive Level Mode
      return [
        {
          id: 'cog-low',
          title: 'Descriptive (Cognitive 1-4)',
          color: 'border-slate-500',
          nodes: data.logical_units.filter(n => n.dimensions.cognitive.score < 5)
        },
        {
          id: 'cog-mid',
          title: 'Competent (Cognitive 5-7)',
          color: 'border-blue-500',
          nodes: data.logical_units.filter(n => n.dimensions.cognitive.score >= 5 && n.dimensions.cognitive.score < 8)
        },
        {
          id: 'cog-high',
          title: 'Transformative (Cognitive 8-10)',
          color: 'border-indigo-500',
          nodes: data.logical_units.filter(n => n.dimensions.cognitive.score >= 8)
        }
      ];
    }
  };

  const columns = getColumns();

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4 pb-8 items-start">
      {columns.map(col => (
        <div 
          key={col.id} 
          className="flex-shrink-0 w-80 flex flex-col bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border-subtle)] max-h-full"
        >
          {/* Column Header */}
          <div className={`p-4 border-b border-[var(--color-border-subtle)] border-t-4 ${col.color} rounded-t-xl bg-[var(--color-surface-base)]`}>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[var(--color-text-primary)]">{col.title}</h3>
              <span className="text-xs font-mono bg-[var(--color-background-tertiary)] px-2 py-1 rounded text-[var(--color-text-secondary)]">
                {col.nodes.length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="p-3 space-y-3 overflow-y-auto min-h-[200px]">
            {col.nodes.map(node => (
              <DepthNodeCard key={node.id} node={node} compact />
            ))}
            {col.nodes.length === 0 && (
              <div className="h-20 flex items-center justify-center text-[var(--color-text-tertiary)] italic text-sm border-2 border-dashed border-[var(--color-border-subtle)] rounded-lg">
                No units
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
