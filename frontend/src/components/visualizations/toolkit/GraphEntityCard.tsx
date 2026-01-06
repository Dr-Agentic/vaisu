import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

import { GraphNode } from './types';
import { getTypeColor } from './utils';

interface GraphEntityCardProps {
  node: GraphNode;
  isSelected?: boolean;
  isHovered?: boolean;
  isRelated?: boolean;
  isDimmed?: boolean;
  onClick?: (id: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const GraphEntityCard: React.FC<GraphEntityCardProps> = ({
  node,
  isSelected = false,
  isHovered = false,
  isRelated = false,
  isDimmed = false,
  onClick,
  className = '',
  style,
}) => {
  // Use prop value for isHovered, only manage internal state if not controlled
  const [internalIsHovered, setInternalIsHovered] = useState(false);
  const controlledIsHovered = isHovered !== undefined ? isHovered : internalIsHovered;
  const theme = getTypeColor(node.type);

  // Calculate importance (0-5 scale)
  let importanceValue = 1;
  if (typeof node.importance === 'number') {
    importanceValue = Math.round(node.importance * 5);
  } else if (node.importance === 'high') {
    importanceValue = 5;
  } else if (node.importance === 'medium') {
    importanceValue = 3;
  }

  const handleClick = () => {
    if (onClick) {
      onClick(node.id);
    }
  };

  // Only manage internal hover state if not controlled
  const handleMouseEnter = () => {
    if (isHovered === undefined) {
      setInternalIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isHovered === undefined) {
      setInternalIsHovered(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDimmed ? 0.65 : 1, scale: 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`
        relative z-20 w-80 rounded-[32px] border-2 cursor-pointer overflow-hidden
        transition-all duration-500 bg-white dark:bg-slate-900
        ${isSelected ? 'border-blue-600 shadow-2xl ring-4 ring-blue-50 dark:ring-blue-900/30' : isRelated ? 'border-pink-400 shadow-xl' : 'border-slate-200 dark:border-slate-800'}
        ${className}
      `}
      style={style}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center">
        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
          {node.id}
        </span>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-3 rounded-full ${i < importanceValue ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${theme.background} ${theme.border} ${theme.text}`}>
            {node.type}
          </span>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight mb-6">
          {node.label}
        </h3>

        <div className="relative h-px bg-slate-100 dark:bg-slate-800 mb-6 overflow-visible">
          <div className="absolute left-0 -top-1 w-2 h-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <div className="absolute right-0 -top-1 w-2 h-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
        </div>

        <AnimatePresence>
          {(controlledIsHovered || isSelected) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 pb-2">
                {(node.context || node.description) && (
                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2">
                      Context
                    </label>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                      {node.context || node.description}
                    </p>
                  </div>
                )}

                {node.mentions && node.mentions.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2">
                      Mentions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {node.mentions.slice(0, 4).map((m, i) => (
                        <span key={i} className="text-[10px] font-bold font-mono bg-slate-50 dark:bg-slate-800 text-slate-400 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                          "{m}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!controlledIsHovered && !isSelected && (
          <div className="flex justify-center gap-1 opacity-20">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

