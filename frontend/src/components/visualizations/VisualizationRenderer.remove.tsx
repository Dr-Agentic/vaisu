import { useEffect } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { StructuredViewRenderer } from './StructuredViewRenderer';
import { MindMap } from './MindMap';
import { TermsDefinitions } from './TermsDefinitions';
import { KnowledgeGraph } from './knowledge-graph/KnowledgeGraph';
import { UMLClassDiagram } from './uml-class-diagram/UMLClassDiagram';
import { ArgumentMap } from './argument-map/ArgumentMap';
import { ExecutiveDashboard } from './executive-dashboard/ExecutiveDashboard';
import { Loader2 } from 'lucide-react';

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
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Flowchart visualization coming soon...</p>
          <pre className="mt-4 text-left text-xs bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );

    case 'knowledge-graph':
      if (!data || !data.nodes || data.nodes.length === 0) {
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No entities found in this document to create a knowledge graph.</p>
            <p className="text-sm text-gray-500">
              Knowledge graphs require entities (people, organizations, concepts) and their relationships.
              Try uploading a document with more structured content or named entities.
            </p>
          </div>
        );
      }
      return <KnowledgeGraph data={data} height={600} />;

    case 'executive-dashboard':
      return <ExecutiveDashboard data={data} />;

    case 'terms-definitions':
      return <TermsDefinitions data={data} />;

    case 'uml-class-diagram':
      if (!data || !data.classes || data.classes.length === 0) {
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No class structures found in this document.</p>
            <p className="text-sm text-gray-500">
              UML class diagrams require object-oriented structures like classes, interfaces, and their relationships.
              Try uploading technical documentation or API specifications.
            </p>
          </div>
        );
      }
      return <UMLClassDiagram data={data} height={600} />;

    case 'argument-map':
      if (!data || !data.nodes || data.nodes.length === 0) {
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No argument structure found.</p>
          </div>
        );
      }
      return <ArgumentMap data={data} height={600} />;

    case 'timeline':
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Timeline visualization coming soon...</p>
          <pre className="mt-4 text-left text-xs bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">This visualization type is not yet implemented.</p>
        </div>
      );
  }
}
