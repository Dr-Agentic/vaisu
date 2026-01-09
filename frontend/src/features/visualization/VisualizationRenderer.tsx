import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

import { ArgumentMap } from '../../components/visualizations/argument-map/ArgumentMap';
import { ExecutiveDashboard } from '../../components/visualizations/executive-dashboard/ExecutiveDashboard';
import { Flowchart } from '../../components/visualizations/flowchart/Flowchart';
import { KnowledgeGraph } from '../../components/visualizations/knowledge-graph/KnowledgeGraph';
import { MindMap } from '../../components/visualizations/MindMap';
import { StructuredViewRenderer } from '../../components/visualizations/StructuredViewRenderer';
import { TermsDefinitions } from '../../components/visualizations/TermsDefinitions';
import { UMLClassDiagram } from '../../components/visualizations/uml-class-diagram/UMLClassDiagram';
import { useDocumentStore } from '../../stores/documentStore';

export function VisualizationRenderer() {
  const { currentVisualization, visualizationData, document, loadVisualization } = useDocumentStore();

  const data = visualizationData.get(currentVisualization);

  // Auto-load visualization if not in cache
  // Note: loadVisualization is a stable Zustand action and doesn't need to be in deps
  useEffect(() => {
    if (document && !data) {
      loadVisualization(currentVisualization);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVisualization, document, data]);

  // Handle error state (cached error marker)
  if (data?.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to generate visualization</p>
          <p className="text-gray-500 text-sm">{data.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading visualization...</p>
        </div>
      </div>
    );
  }

  switch (currentVisualization) {
    case 'structured-view':
      return <StructuredViewRenderer data={data} />;
    case 'mind-map':
      return <MindMap data={data} />;
    case 'flowchart':
      return <Flowchart data={data} />;
    case 'knowledge-graph':
      // KnowledgeGraph manages its own data via store for now
      return <KnowledgeGraph />;
    case 'terms-definitions':
      return <TermsDefinitions data={data} />;
    case 'uml-class-diagram':
      return <UMLClassDiagram data={data} />;
    case 'argument-map':
      return <ArgumentMap data={data} />;
    case 'depth-graph':
      return <ArgumentMap data={data} />;
    case 'executive-dashboard':
      return <ExecutiveDashboard data={data} />;
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Visualization not implemented: {currentVisualization}</p>
          </div>
        </div>
      );
  }
}
