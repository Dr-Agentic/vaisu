import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Scale, 
  GitBranch, 
  ShieldCheck, 
  Link as LinkIcon 
} from 'lucide-react';
import { Card } from '../../../primitives/Card';
import { Badge } from '../../../primitives/Badge';
import { Modal } from '../../../primitives/Modal';
import { DepthGraphNode, DimensionDetail } from '@shared/types';

interface DepthNodeCardProps {
  node: DepthGraphNode;
  compact?: boolean;
  rank?: number;
}

export const DepthNodeCard = ({ node, compact = false, rank }: DepthNodeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  return (
    <>
      <motion.div
        layoutId={`card-${node.id}`}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`h-full border-l-4 ${
          node.true_depth >= 8 ? 'border-l-emerald-500' :
          node.true_depth >= 5 ? 'border-l-amber-500' :
          'border-l-rose-500'
        } hover:shadow-lg transition-shadow bg-[var(--color-surface-base)]`}>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                {rank !== undefined && (
                  <span className="text-xs font-mono font-bold text-[var(--color-text-tertiary)] bg-[var(--color-background-tertiary)] w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                    {rank}
                  </span>
                )}
                <h3 className="font-semibold text-lg leading-tight text-[var(--color-text-primary)]">
                  {node.topic}
                </h3>
              </div>
              <Badge variant={getScoreBadge(node.true_depth)} className="shrink-0">
                {node.true_depth.toFixed(1)}
              </Badge>
            </div>
            
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
              {node.topic_summary}
            </p>

            {!compact && (
              <div className="flex gap-2 text-xs text-[var(--color-text-tertiary)] mt-2">
                 <span className="flex items-center gap-1">
                   <Brain size={12} /> {node.dimensions.cognitive.score.toFixed(1)}
                 </span>
                 <span className="flex items-center gap-1">
                   <Scale size={12} /> {node.dimensions.epistemic.score.toFixed(1)}
                 </span>
                 <span className="flex items-center gap-1">
                   <GitBranch size={12} /> {node.dimensions.causal.score.toFixed(1)}
                 </span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={`Unit ${node.id}: ${node.topic}`}
            size="xl"
          >
            <div className="space-y-6">
              <div className="bg-[var(--color-surface-elevated)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
                <h4 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                  Extended Summary
                </h4>
                <p className="text-[var(--color-text-primary)] leading-relaxed">
                  {node.extended_summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DimensionCard 
                  icon={Brain} 
                  title="Cognitive Depth" 
                  data={node.dimensions.cognitive} 
                />
                <DimensionCard 
                  icon={Scale} 
                  title="Epistemic Depth" 
                  data={node.dimensions.epistemic} 
                />
                <DimensionCard 
                  icon={GitBranch} 
                  title="Causal Depth" 
                  data={node.dimensions.causal} 
                />
                <DimensionCard 
                  icon={ShieldCheck} 
                  title="Argumentative Rigor" 
                  data={node.dimensions.rigor} 
                />
                <DimensionCard 
                  icon={LinkIcon} 
                  title="Coherence" 
                  data={node.dimensions.coherence} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface-base)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-medium mb-3 text-[var(--color-text-primary)]">Clarity Signals</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[var(--color-text-secondary)] uppercase">Grounding</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {node.clarity_signals.grounding.map((s, i) => (
                          <Badge key={i} variant="neutral" size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--color-text-secondary)] uppercase">Nuance</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {node.clarity_signals.nuance.map((s, i) => (
                          <Badge key={i} variant="nova" size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/10 border border-blue-500/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-400">Actionable Feedback</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {node.actionable_feedback}
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

const DimensionCard = ({ icon: Icon, title, data }: { icon: any, title: string, data: DimensionDetail }) => (
  <div className="bg-[var(--color-surface-base)] p-4 rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] transition-colors">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
        <Icon size={16} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <span className={`text-lg font-bold ${
        data.score >= 8 ? 'text-emerald-500' : 
        data.score >= 5 ? 'text-amber-500' : 
        'text-rose-500'
      }`}>
        {data.score.toFixed(1)}
      </span>
    </div>
    <p className="text-xs text-[var(--color-text-primary)] mb-3 min-h-[3rem]">
      {data.rationale}
    </p>
    {data.evidence.length > 0 && (
      <div className="text-xs text-[var(--color-text-tertiary)] italic border-l-2 border-[var(--color-border-subtle)] pl-2">
        "{data.evidence[0]}"
      </div>
    )}
  </div>
);
