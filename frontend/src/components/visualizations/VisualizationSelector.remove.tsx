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
  'argument-map': {
    name: 'Argument Map',
    icon: Network,
    description: 'Claim hierarchy & analysis'
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

const IMPLEMENTED_VISUALIZATIONS: Set<VisualizationType> = new Set([
  'structured-view',
  'mind-map',
  'terms-definitions',
  'knowledge-graph',
  'uml-class-diagram',
  'argument-map'
]);

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
    const isImplemented = IMPLEMENTED_VISUALIZATIONS.has(type);
    const Icon = info.icon;

    return (
      <button
        key={type}
        disabled={!isImplemented}
        onClick={() => isImplemented && setCurrentVisualization(type)}
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-out
          ${isActive
            ? 'border-2 border-primary-600 bg-gradient-to-r from-primary-50 to-secondary-50 shadow-md'
            : isImplemented
              ? 'border border-gray-200 hover:border-primary-400 hover:bg-gray-50 hover:shadow-sm'
              : 'border border-gray-100 bg-gray-50/50 cursor-not-allowed grayscale opacity-60'
          }
        `}
      >
        {isRecommended && isImplemented && (
          <Star className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />
        )}

        <div className={`
          p-2 rounded-lg flex-shrink-0
          ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-sm truncate ${isActive ? 'text-primary-900' : 'text-gray-900'}`}>
                {info.name}
              </h3>
              {!isImplemented && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 whitespace-nowrap">
                  Soon
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 truncate">
              {info.description}
            </p>
          </div>

          {isImplemented && recommendation && (
            <div className="ml-2 flex-shrink-0">
              <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 truncate max-w-[120px]">
                {recommendation.rationale}
              </div>
            </div>
          )}
        </div>
      </button>
    );
  };

  const allTypes = Object.keys(VISUALIZATION_INFO) as VisualizationType[];
  const recommendedImplemented = recommendations
    .filter(r => IMPLEMENTED_VISUALIZATIONS.has(r.type))
    .map(r => r.type);
  const otherImplemented = allTypes.filter(
    type => IMPLEMENTED_VISUALIZATIONS.has(type) && !recommendedTypes.has(type)
  );
  const unimplemented = allTypes.filter(type => !IMPLEMENTED_VISUALIZATIONS.has(type));

  return (
    <div className="bg-white border-b border-gray-200 shadow-soft -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Visualizations</h2>

        {recommendedImplemented.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              <h3 className="font-semibold text-gray-900">Recommended</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendedImplemented.map(type => renderVisualizationCard(type))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {otherImplemented.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Implemented</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {otherImplemented.map(type => renderVisualizationCard(type))}
              </div>
            </div>
          )}

          {unimplemented.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-400 mb-2 flex items-center gap-2">
                Available Soon
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {unimplemented.map(type => renderVisualizationCard(type))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
