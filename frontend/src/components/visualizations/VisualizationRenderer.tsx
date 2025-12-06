import React from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { StructuredView } from './StructuredView';
import { Loader2 } from 'lucide-react';

export function VisualizationRenderer() {
  const { currentVisualization, visualizationData, document } = useDocumentStore();

  const data = visualizationData.get(currentVisualization);

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
      return <StructuredView data={data} />;
    
    case 'mind-map':
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Mind Map visualization coming soon...</p>
          <pre className="mt-4 text-left text-xs bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    
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
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Knowledge Graph visualization coming soon...</p>
          <pre className="mt-4 text-left text-xs bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    
    case 'executive-dashboard':
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Executive Dashboard coming soon...</p>
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
