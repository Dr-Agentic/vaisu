import { useDocumentStore } from '../../stores/documentStore';
import type { VisualizationType, VisualizationRecommendation } from '../../../../shared/src/types';
import {
  FileText,
  Network,
  GitBranch,
  Share2,
  BarChart3,
  Calendar,
  Table,
  Star,
  BookOpen,
  Box
} from 'lucide-react';

const VISUALIZATION_INFO: Record<VisualizationType, { name: string; icon: any; description: string }> = {
  'structured-view': {
    name: 'Structured View',
    icon: FileText,
    description: 'Document outline with summaries'
  },
  'mind-map': {
    name: 'Mind Map',
    icon: Network,
    description: 'Hierarchical concept map'
  },
  'flowchart': {
    name: 'Flowchart',
    icon: GitBranch,
    description: 'Process flow diagram'
  },
  'knowledge-graph': {
    name: 'Knowledge Graph',
    icon: Share2,
    description: 'Entity relationships'
  },
  'executive-dashboard': {
    name: 'Executive Dashboard',
    icon: BarChart3,
    description: 'KPIs and metrics'
  },
  'timeline': {
    name: 'Timeline',
    icon: Calendar,
    description: 'Chronological events'
  },
  'gantt': {
    name: 'Gantt Chart',
    icon: Calendar,
    description: 'Project timeline'
  },
  'comparison-matrix': {
    name: 'Comparison Matrix',
    icon: Table,
    description: 'Feature comparison'
  },
  'priority-matrix': {
    name: 'Priority Matrix',
    icon: Table,
    description: '2x2 prioritization'
  },
  'raci-matrix': {
    name: 'RACI Matrix',
    icon: Table,
    description: 'Responsibility assignment'
  },
  'uml-class-diagram': {
    name: 'UML Class Diagram',
    icon: Box,
    description: 'Object-oriented class structures and relationships'
  },
  'uml-sequence': {
    name: 'UML Sequence',
    icon: GitBranch,
    description: 'Interaction sequence'
  },
  'uml-activity': {
    name: 'UML Activity',
    icon: GitBranch,
    description: 'Activity flow'
  },
  'terms-definitions': {
    name: 'Terms & Definitions',
    icon: BookOpen,
    description: 'Key terms and glossary'
  }
};

export function VisualizationSelector() {
  const { analysis, currentVisualization, setCurrentVisualization } = useDocumentStore();

  if (!analysis) return null;

  const recommendations = analysis.recommendations || [];
  const recommendedTypes = new Set(recommendations.map(r => r.type));

  const getRecommendation = (type: VisualizationType): VisualizationRecommendation | undefined => {
    return recommendations.find(r => r.type === type);
  };

  const renderVisualizationCard = (type: VisualizationType) => {
    const info = VISUALIZATION_INFO[type];
    const recommendation = getRecommendation(type);
    const isRecommended = recommendedTypes.has(type);
    const isActive = currentVisualization === type;
    const Icon = info.icon;

    return (
      <button
        key={type}
        onClick={() => setCurrentVisualization(type)}
        className={`
          relative p-4 rounded-xl text-left transition-all duration-200 ease-out
          ${isActive 
            ? 'border-3 border-primary-600 bg-gradient-to-br from-primary-50 to-secondary-50 shadow-strong scale-[1.02]' 
            : 'border-2 border-gray-200 hover:border-primary-400 hover:shadow-medium hover:-translate-y-1 hover:scale-[1.02]'
          }
        `}
      >
        {isRecommended && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1">
            <Star className="w-4 h-4 fill-current" />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className={`
            p-2 rounded-lg
            ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}
          `}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm mb-1 ${isActive ? 'text-primary-900' : 'text-gray-900'}`}>
              {info.name}
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              {info.description}
            </p>

            {recommendation && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                {recommendation.rationale}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-soft -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Visualizations</h2>
        
        {recommendations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              <h3 className="font-semibold text-gray-900">Recommended</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map(rec => renderVisualizationCard(rec.type))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">All Visualizations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.keys(VISUALIZATION_INFO)
              .filter(type => !recommendedTypes.has(type as VisualizationType))
              .map(type => renderVisualizationCard(type as VisualizationType))}
          </div>
        </div>
      </div>
    </div>
  );
}
