import { useEffect } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { useKnowledgeGraphStore } from '../../components/visualizations/knowledge-graph/stores/knowledgeGraphStore';
import { StructuredViewRenderer } from '../../components/visualizations/StructuredViewRenderer';
import { MindMap } from '../../components/visualizations/MindMap';
import { TermsDefinitions } from '../../components/visualizations/TermsDefinitions';
import { KnowledgeGraph } from '../../components/visualizations/knowledge-graph/KnowledgeGraph';
import { UMLClassDiagram } from '../../components/visualizations/uml-class-diagram/UMLClassDiagram';
import { Flowchart } from '../../components/visualizations/flowchart/Flowchart';
import { ArgumentMap } from '../../components/visualizations/argument-map/ArgumentMap';
import { ExecutiveDashboard } from '../../components/visualizations/executive-dashboard/ExecutiveDashboard';
import { Loader2 } from 'lucide-react';

export function VisualizationRenderer() {
  const { currentVisualization, visualizationData, document, loadVisualization } = useDocumentStore();

  const data = visualizationData.get(currentVisualization);

  // Initialize KnowledgeGraph store when data loads
  const initializeKnowledgeGraphStore = useKnowledgeGraphStore(state => state.initializeGraph);
  useEffect(() => {
    if (currentVisualization === 'knowledge-graph' && data?.data) {
      const { nodes = [], edges = [] } = data.data || {};
      initializeKnowledgeGraphStore(nodes, edges);
    }
  }, [currentVisualization, data, initializeKnowledgeGraphStore]);

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
      <div className="flex items-center justify-center h-[var(--spacing-64)]">
        <div className="text-center">
          <p className="text-red-600 mb-[var(--spacing-md)]">Failed to generate visualization</p>
          <p className="text-gray-500 text-sm">{data.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[var(--spacing-64)]">
        <div className="text-center">
          <Loader2 className="w-[var(--spacing-8)] h-[var(--spacing-8)] animate-spin text-primary-600 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-gray-600">Loading visualization...</p>
        </div>
      </div>
    );
  }

  switch (currentVisualization) {
    case 'structured-view':
      return <StructuredViewRenderer data={data.data} />;
    case 'mind-map':
      return <MindMap data={data.data} />;
    case 'flowchart':
      return <Flowchart data={data.data} />;
    case 'knowledge-graph':
      return <KnowledgeGraph />;
    case 'terms-definitions':
      return <TermsDefinitions data={data.data} />;
    case 'uml-class-diagram':
      return <UMLClassDiagram data={data.data} />;
    case 'argument-map':
      return <ArgumentMap data={data.data} />;
    case 'depth-graph':
      return <ArgumentMap data={data.data} />;
    case 'executive-dashboard':
      return <ExecutiveDashboard data={data.data} />;
    default:
      return (
        <div className="flex items-center justify-center h-[var(--spacing-64)]">
          <div className="text-center">
            <p className="text-gray-600">Visualization not implemented: {currentVisualization}</p>
          </div>
        </div>
      );
  }
}