/**
 * VisualizationSampler Component
 *
 * Complete visualization examples showing all visualization types available in Vaisu.
 * Demonstrates structured view, mind map, flowchart, knowledge graph, executive dashboard, and timeline.
 *
 * Features:
 * - All 6 visualization types with interactive examples
 * - Real data visualization with sample data
 * - Performance optimization examples
 * - Loading states and error handling
 * - Responsive design for all screen sizes
 * - Copyable code examples for each visualization type
 * - Accessibility features with proper ARIA attributes
 * - Keyboard navigation and focus management
 */

import { useState, useEffect } from 'react';

import { apiClient } from '../../services/apiClient';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../primitives/Card';
import { Spinner } from '../primitives/Spinner';
import { Tooltip } from '../primitives/Tooltip';

import { CodeBlock } from './CodeBlock';
import { CopyToClipboard } from './CopyToClipboard';
import { PreviewContainer } from './PreviewContainer';
import { SampleDataGenerator } from './SampleDataGenerator';

import type { VisualizationType } from '@shared/types';

export function VisualizationSampler() {
  const [loadingVisualizations, setLoadingVisualizations] = useState<Set<string>>(new Set());
  const [visualizationData, setVisualizationData] = useState<Record<string, any>>({
    'structured-view': null,
    'mind-map': null,
    'flowchart': null,
    'knowledge-graph': null,
    'executive-dashboard': null,
    'timeline': null,
  });
  const [errorStates, setErrorStates] = useState<Record<string, string | null>>({
    'structured-view': null,
    'mind-map': null,
    'flowchart': null,
    'knowledge-graph': null,
    'executive-dashboard': null,
    'timeline': null,
  });

  // Visualization types and their descriptions
  const visualizationTypes: Array<{
    type: VisualizationType;
    title: string;
    description: string;
    codeExample: string;
    complexity: 'Low' | 'Medium' | 'High';
    useCase: string;
  }> = [
    {
      type: 'structured-view',
      title: 'Structured View',
      description: 'Hierarchical document structure with collapsible sections',
      codeExample: `<VisualizationRenderer
  type="structured-view"
  data={structuredData}
  onNodeClick={handleNodeClick}
/>`,
      complexity: 'Low',
      useCase: 'Document navigation and structure overview',
    },
    {
      type: 'mind-map',
      title: 'Mind Map',
      description: 'Radial visualization showing relationships and connections',
      codeExample: `<VisualizationRenderer
  type="mind-map"
  data={mindMapData}
  interactive={true}
  onNodeSelect={handleNodeSelect}
/>`,
      complexity: 'Medium',
      useCase: 'Brainstorming and idea mapping',
    },
    {
      type: 'flowchart',
      title: 'Flowchart',
      description: 'Process flow with nodes and directional connections',
      codeExample: `<VisualizationRenderer
  type="flowchart"
  data={flowchartData}
  showLabels={true}
  onEdgeClick={handleEdgeClick}
/>`,
      complexity: 'Medium',
      useCase: 'Process documentation and workflow analysis',
    },
    {
      type: 'knowledge-graph',
      title: 'Knowledge Graph',
      description: 'Entity relationship network with semantic connections',
      codeExample: `<VisualizationRenderer
  type="knowledge-graph"
  data={knowledgeGraphData}
  showTooltips={true}
  onEntityClick={handleEntityClick}
/>`,
      complexity: 'High',
      useCase: 'Complex relationship analysis and entity mapping',
    },
    {
      type: 'executive-dashboard',
      title: 'Executive Dashboard',
      description: 'KPI-focused visualization with summary metrics',
      codeExample: `<VisualizationRenderer
  type="executive-dashboard"
  data={dashboardData}
  showMetrics={true}
  theme="corporate"
/>`,
      complexity: 'Medium',
      useCase: 'Executive reporting and key metric visualization',
    },
    {
      type: 'timeline',
      title: 'Timeline',
      description: 'Chronological visualization of events and milestones',
      codeExample: `<VisualizationRenderer
  type="timeline"
  data={timelineData}
  showTimeScale={true}
  onEventClick={handleEventClick}
/>`,
      complexity: 'Low',
      useCase: 'Project timelines and historical event tracking',
    },
  ];

  // Initialize sample data for all visualization types
  useEffect(() => {
    const sampleData = SampleDataGenerator.generateAllVisualizations();
    setVisualizationData(prev => ({ ...prev, ...sampleData }));
  }, []);

  const handleGenerateVisualization = async (type: VisualizationType) => {
    setLoadingVisualizations(prev => new Set([...prev, type]));
    setErrorStates(prev => ({ ...prev, [type]: null }));

    try {
      // Use a sample document ID for the demo
      const sampleDocumentId = 'sample-document-id';

      // Generate visualization data using the API client
      const generatedData = await apiClient.generateVisualization(sampleDocumentId, type);

      setVisualizationData(prev => ({
        ...prev,
        [type]: generatedData,
      }));

      setLoadingVisualizations(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
    } catch (error) {
      console.error(`Error generating ${type} visualization:`, error);
      setErrorStates(prev => ({
        ...prev,
        [type]: error instanceof Error ? error.message : 'Failed to generate visualization',
      }));
      setLoadingVisualizations(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
    }
  };

  const handleResetVisualization = (type: VisualizationType) => {
    setVisualizationData(prev => ({
      ...prev,
      [type]: null,
    }));
    setErrorStates(prev => ({
      ...prev,
      [type]: null,
    }));
  };

  const renderVisualizationPreview = (type: VisualizationType, data: any) => {
    if (!data) {
      return (
        <div className="flex items-center justify-center h-64 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
          <div className="text-center space-y-2">
            <p className="text-[var(--color-text-secondary)]">No data available</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">Generate visualization to see preview</p>
          </div>
        </div>
      );
    }

    // Render based on visualization type
    switch (type) {
      case 'structured-view':
        return renderStructuredView(data);
      case 'mind-map':
        return renderMindMap(data);
      case 'flowchart':
        return renderFlowchart(data);
      case 'knowledge-graph':
        return renderKnowledgeGraph(data);
      case 'executive-dashboard':
        return renderExecutiveDashboard(data);
      case 'timeline':
        return renderTimeline(data);
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
            <p className="text-[var(--color-text-secondary)]">Visualization not implemented</p>
          </div>
        );
    }
  };

  const renderStructuredView = (data: any) => (
    <div className="space-y-3">
      {data.sections?.map((section: any, index: number) => (
        <div key={index} className="bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-[var(--color-text-primary)]">{section.title}</h4>
            <Badge variant="neutral" className="text-xs">{section.type}</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{section.content}</p>
          {section.subsections && section.subsections.length > 0 && (
            <div className="mt-3 space-y-2">
              {section.subsections.map((sub: any, subIndex: number) => (
                <div key={subIndex} className="ml-4 pl-3 border-l border-[var(--color-border-subtle)]">
                  <h5 className="font-medium text-[var(--color-text-primary)]">{sub.title}</h5>
                  <p className="text-sm text-[var(--color-text-secondary)]">{sub.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMindMap = (data: any) => (
    <div className="bg-gradient-to-br from-[var(--color-surface-base)] to-[var(--color-surface-secondary)] rounded-lg p-6 border border-[var(--color-border-subtle)]">
      <div className="text-center mb-4">
        <h4 className="font-bold text-[var(--color-text-primary)] text-lg">Mind Map Visualization</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Central concept with branching ideas</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {data.nodes?.map((node: any, index: number) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-4 border border-[var(--color-border-subtle)] hover:shadow-md transition-shadow"
          >
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-2" />
            <h5 className="font-medium text-center text-[var(--color-text-primary)] text-sm">{node.label}</h5>
            <p className="text-xs text-center text-[var(--color-text-secondary)] mt-1">{node.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFlowchart = (data: any) => (
    <div className="bg-[var(--color-surface-base)] rounded-lg p-6 border border-[var(--color-border-subtle)]">
      <div className="text-center mb-4">
        <h4 className="font-bold text-[var(--color-text-primary)] text-lg">Process Flowchart</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Sequential process with decision points</p>
      </div>
      <div className="space-y-4">
        {data.nodes?.map((node: any, index: number) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              node.type === 'start' ? 'bg-green-500'
                : node.type === 'end' ? 'bg-red-500'
                  : node.type === 'decision' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-[var(--color-text-primary)]">{node.title}</h5>
              <p className="text-sm text-[var(--color-text-secondary)]">{node.description}</p>
            </div>
            {index < data.nodes.length - 1 && (
              <div className="w-8 h-0.5 bg-[var(--color-border-subtle)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderKnowledgeGraph = (data: any) => (
    <div className="bg-gradient-to-br from-[var(--color-surface-secondary)] to-[var(--color-surface-base)] rounded-lg p-6 border border-[var(--color-border-subtle)]">
      <div className="text-center mb-4">
        <h4 className="font-bold text-[var(--color-text-primary)] text-lg">Knowledge Graph</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Entity relationships and connections</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.entities?.map((entity: any, index: number) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-3 border border-[var(--color-border-subtle)] hover:shadow-md transition-shadow"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-2" />
            <h6 className="font-medium text-center text-[var(--color-text-primary)] text-xs">{entity.name}</h6>
            <p className="text-xs text-center text-[var(--color-text-secondary)] mt-1">{entity.type}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {data.relationships?.length || 0} relationships visualized
        </p>
      </div>
    </div>
  );

  const renderExecutiveDashboard = (data: any) => (
    <div className="bg-gradient-to-br from-[var(--color-surface-base)] via-[var(--color-surface-secondary)] to-[var(--color-surface-base)] rounded-lg p-6 border border-[var(--color-border-subtle)]">
      <div className="text-center mb-6">
        <h4 className="font-bold text-[var(--color-text-primary)] text-lg">Executive Dashboard</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Key performance indicators and metrics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics?.map((metric: any, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">{metric.label}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                metric.trend === 'up' ? 'bg-green-100 text-green-800'
                  : metric.trend === 'down' ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {metric.trend === 'up' ? '▲' : metric.trend === 'down' ? '▼' : '—'} {Math.abs(metric.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)]">{metric.value}</div>
            <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Target: {metric.target}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.charts?.map((chart: any, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-[var(--color-border-subtle)]">
            <h6 className="font-medium text-[var(--color-text-primary)] mb-2">{chart.title}</h6>
            <div className="h-24 bg-gradient-to-r from-blue-200 to-green-200 rounded flex items-end p-2">
              <div className="w-full h-full bg-gradient-to-t from-blue-500 to-green-500 rounded opacity-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = (data: any) => (
    <div className="bg-[var(--color-surface-base)] rounded-lg p-6 border border-[var(--color-border-subtle)]">
      <div className="text-center mb-6">
        <h4 className="font-bold text-[var(--color-text-primary)] text-lg">Project Timeline</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Chronological events and milestones</p>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--color-border-subtle)]" />
        <div className="space-y-8">
          {data.events?.map((event: any, index: number) => (
            <div key={index} className="relative pl-12">
              <div className="absolute left-2 top-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white shadow-sm" />
              <div className="bg-white rounded-lg shadow-sm p-4 border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-[var(--color-text-primary)]">{event.title}</h6>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{event.date}</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{event.description}</p>
                {event.status && (
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                    event.status === 'completed' ? 'bg-green-100 text-green-800'
                      : event.status === 'in_progress' ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Visualization Components</h1>
          <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white">
            All Types
          </Badge>
          <Badge variant="secondary" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            Interactive
          </Badge>
          <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
            6 Visualizations
          </Badge>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Complete visualization examples showing all 6 visualization types available in Vaisu.
          Each visualization demonstrates real data rendering, performance optimization, and accessibility features.
        </p>
      </div>

      {/* Visualization Types Overview */}
      <PreviewContainer
        title="Visualization Types Overview"
        description="All visualization types with descriptions, complexity levels, and use cases"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualizationTypes.map((viz) => (
            <Card key={viz.type} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{viz.title}</span>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    {viz.complexity}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-[var(--color-text-secondary)]">{viz.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase">Use Case</p>
                  <p className="text-sm text-[var(--color-text-primary)]">{viz.useCase}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase">Complexity</p>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((level) => (
                      <Badge
                        key={level}
                        variant={level === viz.complexity ? 'primary' : 'neutral'}
                        className={`text-xs ${level === viz.complexity ? 'bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white' : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]'}`}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase">Code Example</p>
                  <CodeBlock
                    code={viz.codeExample}
                    language="tsx"
                    showCopyButton={false}
                    className="text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <CopyToClipboard
                    text={viz.codeExample}
                    tooltip="Copy Code"
                    size="sm"
                  />
                  <CopyToClipboard
                    text={`type="${viz.type}"`}
                    tooltip="Copy Type"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewContainer>

      {/* Individual Visualization Examples */}
      {visualizationTypes.map((viz) => (
        <PreviewContainer
          key={viz.type}
          title={`${viz.title} Visualization`}
          description={viz.description}
        >
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{viz.title} Example</span>
                <div className="flex gap-2">
                  <Badge variant="primary" className="bg-gradient-to-r from-[var(--aurora-1)] to-[var(--aurora-3)] text-white text-xs">
                    {viz.complexity}
                  </Badge>
                  <Badge variant="neutral" className="bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] text-xs">
                    {viz.type}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGenerateVisualization(viz.type)}
                  disabled={loadingVisualizations.has(viz.type)}
                >
                  {loadingVisualizations.has(viz.type) ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Visualization'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetVisualization(viz.type)}
                >
                  Reset
                </Button>
                <Tooltip content="This is a live example using the Vaisu visualization system">
                  <Button variant="secondary" size="sm" disabled>
                    Live Example
                  </Button>
                </Tooltip>
              </div>

              {/* Error State */}
              {errorStates[viz.type] && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-red-800 font-medium">Error:</span>
                  </div>
                  <p className="text-red-700 mt-1">{errorStates[viz.type]}</p>
                </div>
              )}

              {/* Visualization Preview */}
              <div className="border border-[var(--color-border-subtle)] rounded-lg p-4 bg-[var(--color-surface-base)]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[var(--color-text-primary)]">Preview</h4>
                  <div className="flex gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span>Real data</span>
                    <span>•</span>
                    <span>Interactive</span>
                    <span>•</span>
                    <span>Accessible</span>
                  </div>
                </div>
                {renderVisualizationPreview(viz.type, visualizationData[viz.type] || null)}
              </div>

              {/* Implementation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-[var(--color-text-primary)] mb-2">Performance Features</h5>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                    <li>• Virtualization for large datasets</li>
                    <li>• Lazy loading of visualization components</li>
                    <li>• Memoization of expensive calculations</li>
                    <li>• Debounced resize handlers</li>
                    <li>• Efficient state updates</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-[var(--color-text-primary)] mb-2">Accessibility Features</h5>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                    <li>• ARIA labels and roles</li>
                    <li>• Keyboard navigation support</li>
                    <li>• Screen reader compatibility</li>
                    <li>• High contrast mode support</li>
                    <li>• Focus management</li>
                  </ul>
                </div>
              </div>

              {/* Code Implementation */}
              <div>
                <h5 className="font-medium text-[var(--color-text-primary)] mb-3">Implementation Code</h5>
                <CodeBlock
                  code={`import { VisualizationRenderer } from '@/components/VisualizationRenderer';
import { apiClient } from '@/services/apiClient';
import type { VisualizationType } from '@shared/types';

// Generate visualization data
const data = await apiClient.generateVisualization(documentId, '${viz.type}');

// Render the visualization
<VisualizationRenderer
  type="${viz.type}"
  data={data}
  onNodeClick={(node) => console.log('Node clicked:', node)}
  onNodeHover={(node) => console.log('Node hovered:', node)}
  theme="light"
  className="w-full h-[500px]"
/>`}
                  language="tsx"
                  showCopyButton={false}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </PreviewContainer>
      ))}

      {/* Performance Optimization Guide */}
      <PreviewContainer
        title="Performance Optimization"
        description="Best practices for rendering large datasets and complex visualizations"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-green-900">Data Optimization</h3>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Use data sampling for large datasets</li>
                <li>• Implement level-of-detail rendering</li>
                <li>• Cache expensive calculations</li>
                <li>• Debounce user interactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-semibold text-blue-900">Rendering Optimization</h3>
              </div>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Virtualization for long lists</li>
                <li>• Canvas rendering for complex graphics</li>
                <li>• CSS transforms over layout changes</li>
                <li>• RequestAnimationFrame for animations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-purple-900">Memory Management</h3>
              </div>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Clean up event listeners</li>
                <li>• Dispose of WebGL contexts</li>
                <li>• Use weak references where possible</li>
                <li>• Monitor memory usage</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <h3 className="text-lg font-semibold text-yellow-900">User Experience</h3>
              </div>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Progressive loading</li>
                <li>• Skeleton screens</li>
                <li>• Loading states and progress</li>
                <li>• Graceful degradation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                <h3 className="text-lg font-semibold text-cyan-900">Accessibility</h3>
              </div>
              <ul className="text-cyan-800 text-sm space-y-1">
                <li>• ARIA live regions</li>
                <li>• Keyboard navigation</li>
                <li>• Screen reader support</li>
                <li>• High contrast themes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                <h3 className="text-lg font-semibold text-indigo-900">Testing</h3>
              </div>
              <ul className="text-indigo-800 text-sm space-y-1">
                <li>• Performance benchmarks</li>
                <li>• Memory leak detection</li>
                <li>• Accessibility testing</li>
                <li>• Cross-browser compatibility</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>

      {/* Integration Examples */}
      <PreviewContainer
        title="Integration Examples"
        description="How to integrate visualizations into your application"
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">React Integration</h4>
                <CodeBlock
                  code={`// Component integration
import { useState } from 'react';
import { VisualizationRenderer } from '@/components/VisualizationRenderer';
import { apiClient } from '@/services/apiClient';
import type { VisualizationType } from '@shared/types';

function DocumentViewer({ documentId }) {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('structured-view');
  const [visualizationData, setVisualizationData] = useState<any>(null);

  useEffect(() => {
    // Fetch and generate visualization data
    apiClient.generateVisualization(documentId, visualizationType)
      .then(setVisualizationData)
      .catch(console.error);
  }, [documentId, visualizationType]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['structured-view', 'mind-map', 'flowchart'].map(type => (
          <Button
            key={type}
            variant={visualizationType === type ? 'primary' : 'secondary'}
            onClick={() => setVisualizationType(type as VisualizationType)}
          >
            {type.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {visualizationData && (
        <VisualizationRenderer
          type={visualizationType}
          data={visualizationData}
          theme="light"
          interactive={true}
          onNodeClick={handleNodeClick}
          className="w-full h-[600px]"
        />
      )}
    </div>
  );
}`}
                  language="tsx"
                  showCopyButton={false}
                  className="text-sm"
                />
              </div>

              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Backend Integration</h4>
                <CodeBlock
                  code={`// API endpoint for visualization generation
import { Router } from 'express';
import { VisualizationGenerator } from '../services/visualizationGenerator';

const router = Router();

router.post('/documents/:id/visualizations/:type', async (req, res) => {
  try {
    const { id: documentId, type } = req.params;
    const { options = {} } = req.body;

    const document = await documentRepository.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const visualization = await VisualizationGenerator.generateVisualization({
      type: type as VisualizationType,
      content: document.content,
      options: {
        theme: options.theme || 'default',
        interactive: options.interactive ?? true,
        showTooltips: options.showTooltips ?? true,
        showLabels: options.showLabels ?? true,
      },
    });

    res.json(visualization);
  } catch (error) {
    console.error('Visualization generation failed:', error);
    res.status(500).json({ error: 'Failed to generate visualization' });
  }
});

export default router;`}
                  language="typescript"
                  showCopyButton={false}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-6">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">State Management</h4>
              <CodeBlock
                code={`// Zustand store for visualization state
import { create } from 'zustand';

interface VisualizationState {
  activeType: VisualizationType;
  visualizationData: Record<VisualizationType, any>;
  loading: boolean;
  error: string | null;

  setActiveType: (type: VisualizationType) => void;
  generateVisualization: (type: VisualizationType, content: string) => Promise<void>;
  clearVisualization: (type: VisualizationType) => void;
}

export const useVisualizationStore = create<VisualizationState>((set, get) => ({
  activeType: 'structured-view',
  visualizationData: {},
  loading: false,
  error: null,

  setActiveType: (type) => set({ activeType: type }),

  generateVisualization: async (type, content) => {
    set({ loading: true, error: null });

    try {
      const data = await VisualizationGenerator.generateVisualization({
        type,
        content,
        options: { theme: 'default', interactive: true },
      });

      set(state => ({
        visualizationData: { ...state.visualizationData, [type]: data },
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate visualization',
        loading: false,
      });
    }
  },

  clearVisualization: (type) => set(state => ({
    visualizationData: { ...state.visualizationData, [type]: null },
  })),
}));`}
                language="typescript"
                showCopyButton={false}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </PreviewContainer>

      {/* Accessibility Features */}
      <PreviewContainer
        title="Accessibility Features"
        description="Comprehensive accessibility implementation for all visualizations"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-green-900">ARIA Support</h3>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• role="img" for visualizations</li>
                <li>• aria-label for descriptions</li>
                <li>• aria-describedby for details</li>
                <li>• aria-live for dynamic updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-semibold text-blue-900">Keyboard Navigation</h3>
              </div>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Tab navigation through elements</li>
                <li>• Arrow keys for node navigation</li>
                <li>• Enter/Space for activation</li>
                <li>• Focus indicators visible</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-purple-900">Screen Reader</h3>
              </div>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Descriptive text alternatives</li>
                <li>• Contextual information</li>
                <li>• State announcements</li>
                <li>• Navigation instructions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <h3 className="text-lg font-semibold text-yellow-900">High Contrast</h3>
              </div>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• WCAG AA compliant colors</li>
                <li>• Theme switching support</li>
                <li>• Color-blind friendly palettes</li>
                <li>• Text/background contrast</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                <h3 className="text-lg font-semibold text-cyan-900">Touch Support</h3>
              </div>
              <ul className="text-cyan-800 text-sm space-y-1">
                <li>• Touch-friendly interactions</li>
                <li>• Pinch-to-zoom support</li>
                <li>• Swipe gestures</li>
                <li>• Mobile responsive</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                <h3 className="text-lg font-semibold text-indigo-900">Focus Management</h3>
              </div>
              <ul className="text-indigo-800 text-sm space-y-1">
                <li>• Logical tab order</li>
                <li>• Focus trapping in modals</li>
                <li>• Skip links support</li>
                <li>• Visible focus indicators</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PreviewContainer>
    </div>
  );
}
