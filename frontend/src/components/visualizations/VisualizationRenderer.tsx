import React, { useEffect } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { StructuredView } from './StructuredView';
import { MindMap } from './MindMap';
import { TermsDefinitions } from './TermsDefinitions';
import { KnowledgeGraph } from './knowledge-graph/KnowledgeGraph';
import { Loader2 } from 'lucide-react';

export function VisualizationRenderer() {
  const { currentVisualization, visualizationData, document, loadVisualization } = useDocumentStore();

  const data = visualizationData.get(currentVisualization);

  // Auto-load visualization if not in cache
  useEffect(() => {
    if (document && !data) {
      loadVisualization(currentVisualization);
    }
  }, [currentVisualization, document, data, loadVisualization]);

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

  // Debug logging
  console.log('VisualizationRenderer:', {
    currentVisualization,
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    dataType: typeof data
  });

  switch (currentVisualization) {
    case 'structured-view':
      return <StructuredView data={data} />;
    
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
      console.log('Rendering KnowledgeGraph with data:', data);
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
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Executive Dashboard coming soon...</p>
          <pre className="mt-4 text-left text-xs bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    
    case 'terms-definitions':
      return <TermsDefinitions data={data} />;
    
    default:
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">This visualization type is not yet implemented.</p>
        </div>
      );
  }
}
