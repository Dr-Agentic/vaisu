import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

import { GraphNode, GraphEdge } from './types';


interface GraphConnectionModalProps {
  edge: GraphEdge | null;
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
  isOpen?: boolean;
  onClose: () => void;
}

export const GraphConnectionModal: React.FC<GraphConnectionModalProps> = ({
  edge,
  sourceNode,
  targetNode,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !edge || !sourceNode || !targetNode) return null;

  const strength = edge.strength ?? 0.5;
  const rationale = edge.rationale || 'No rationale provided for this relationship.';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl bg-white/85 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/50"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                  Connection Analysis
                </span>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900">Relational Logic</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-6 mb-12">
              <div className="flex-1 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Source</span>
                <div className="font-bold text-slate-900">{sourceNode.label}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-[2px] bg-blue-200 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 mt-2 uppercase">{edge.type || 'linked'}</span>
              </div>
              <div className="flex-1 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Target</span>
                <div className="font-bold text-slate-900">{targetNode.label}</div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Rationale</h3>
                <p className="text-lg text-slate-700 leading-relaxed font-light italic">
                  "{rationale}"
                </p>
              </div>
              <div className="flex gap-12">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Signal Strength</h3>
                  <div className="flex items-end gap-1 h-6">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full ${i < strength * 10 ? 'bg-blue-500' : 'bg-slate-100'}`}
                        style={{ height: `${(i + 1) * 10}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Integrity</h3>
                  <div className="text-2xl font-black text-slate-900">{(strength * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-center">
            <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
              End of Pathway Data Segment
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
