import { DepthGraphData } from '@shared/types';

import { DepthNodeCard } from '../cards/DepthNodeCard';

interface TimelineViewProps {
  data: DepthGraphData;
}

export const TimelineView = ({ data }: TimelineViewProps) => {
  return (
    <div className="relative max-w-4xl mx-auto py-8">
      {/* Central Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-border-subtle)] via-[var(--color-interactive-primary-base)] to-[var(--color-border-subtle)] transform -translate-x-1/2" />

      <div className="space-y-12">
        {data.logical_units.map((node, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div key={node.id} className="relative flex items-center justify-between group">
              {/* Left Side Container */}
              <div className="w-[45%] pr-8 flex justify-end">
                {isLeft && (
                  <DepthNodeCard node={node} rank={index + 1} />
                )}
              </div>

              {/* Center Dot */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 bg-[var(--color-surface-base)] ${
                  node.true_depth >= 8 ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : node.true_depth >= 5 ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                }`} />
                <div className={`absolute w-8 h-8 rounded-full opacity-0 group-hover:opacity-20 animate-ping ${
                  node.true_depth >= 8 ? 'bg-emerald-500'
                    : node.true_depth >= 5 ? 'bg-amber-500'
                      : 'bg-rose-500'
                }`} />
              </div>

              {/* Right Side Container */}
              <div className="w-[45%] pl-8 flex justify-start">
                {!isLeft && (
                  <DepthNodeCard node={node} rank={index + 1} />
                )}
                {/* Connector Line (Visual Aid) */}
                <div className={`absolute top-1/2 border-t border-[var(--color-border-subtle)] w-8 
                  ${isLeft ? 'right-1/2 mr-2' : 'left-1/2 ml-2'} 
                  opacity-50 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
