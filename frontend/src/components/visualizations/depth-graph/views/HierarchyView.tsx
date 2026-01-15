import { DepthGraphData } from '@shared/types';
import { DepthNodeCard } from '../cards/DepthNodeCard';
import { CornerDownRight } from 'lucide-react';

interface HierarchyViewProps {
  data: DepthGraphData;
}

export const HierarchyView = ({ data }: HierarchyViewProps) => {
  return (
    <div className="py-8 px-4 overflow-x-auto">
      <div className="min-w-[800px]">
        {data.logical_units.map((node, index) => {
          // Calculate indentation (cap at 10 to prevent extreme width)
          const indentLevel = Math.min(index, 10);
          
          return (
            <div 
              key={node.id} 
              className="relative mb-6"
              style={{ paddingLeft: `${indentLevel * 3}rem` }}
            >
              {index > 0 && (
                <div 
                  className="absolute left-0 top-[-1.5rem] bottom-1/2 w-[3rem] border-l-2 border-b-2 rounded-bl-xl border-[var(--color-border-subtle)]"
                  style={{ 
                    left: `${(indentLevel - 1) * 3 + 1.5}rem`,
                    width: '3rem'
                  }}
                >
                  <CornerDownRight 
                    size={16} 
                    className="absolute -right-2 -bottom-2 text-[var(--color-text-tertiary)] bg-[var(--color-background-primary)]" 
                  />
                </div>
              )}
              
              <div className="w-[600px]">
                <DepthNodeCard node={node} compact rank={index + 1} />
              </div>

              {/* Connecting vertical line for previous levels */}
              {Array.from({ length: indentLevel }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-full w-px bg-[var(--color-border-subtle)]"
                  style={{ left: `${i * 3 + 1.5}rem`, height: '100%', top: '-2rem' }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
