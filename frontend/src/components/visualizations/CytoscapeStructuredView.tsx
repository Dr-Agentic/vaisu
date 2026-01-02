import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import type { Section } from '../../../../shared/src/types';
import type cytoscape from 'cytoscape';
import type { CytoscapeOptions, Collection, LayoutOptions } from '../../types/cytoscape';

interface CytoscapeStructuredViewProps {
  data: {
    sections: Section[];
    hierarchy: any[];
  };
}

interface CytoscapeElement {
  data: {
    id: string;
    label: string;
    level: number;
    summary?: string;
    keywords?: string[];
    parent?: string;
  };
  position?: {
    x: number;
    y: number;
  };
}

export function CytoscapeStructuredView({ data }: CytoscapeStructuredViewProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Cytoscape when component mounts
  useEffect(() => {
    let cy: cytoscape.Core | null = null;

    const initializeCytoscape = async () => {
      try {
        // Import Cytoscape dynamically to avoid SSR issues
        const cytoscapeModule = await import('cytoscape');
        const cytoscape = cytoscapeModule.default;
        const elk = (await import('cytoscape-elk')).default;

        // Register ELK extension
        cytoscapeModule.use(elk);

        // Convert sections to Cytoscape elements
        const elements = convertSectionsToElements(data.sections);

        // Create Cytoscape instance
        cy = cytoscape({
          container: containerRef.current,
          elements: elements,
          style: getStyle(),
          wheelSensitivity: 0.1,
          minZoom: 0.1,
          maxZoom: 2,
          zoomingEnabled: true,
          userZoomingEnabled: true,
          panningEnabled: true,
          userPanningEnabled: true,
          boxSelectionEnabled: false,
          selectionType: 'single',
          touchTapThreshold: 8,
          desktopTapThreshold: 4,
          autolock: false,
          autoungrabify: false,
          autounselectify: false
        });

        cyRef.current = cy;

        // Apply ELK layout
        setIsLoading(true);
        const layout = cy.layout({
          name: 'elk',
          elk: {
            algorithm: 'layered',
            'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': 100,
            'org.eclipse.elk.spacing.nodeNode': 50,
            'org.eclipse.elk.layered.layerSpacing': 50,
            'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
            'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN'
          },
          ready: () => {
            setIsReady(true);
            setIsLoading(false);
            cy?.center();
            cy?.fit();
          },
          stop: () => {
            setIsLoading(false);
          }
        });

        layout.run();

        // Handle node interactions
        cy.on('click', 'node', (evt: any) => {
          const node = evt.target;
          const nodeData = node.data();
          const currentExpanded = node.data('expanded');

          // Toggle expansion state
          node.data('expanded', !currentExpanded);

          // Get children nodes
          const children = cy?.nodes().filter((n: any) => n.data('parent') === nodeData.id);

          if (currentExpanded && children) {
            // Collapse: hide children and their descendants
            hideSubtree(children);
          } else if (children) {
            // Expand: show children and their descendants
            showSubtree(children);
          }

          // Re-run layout
          layout.run();
        });

        // Handle edge interactions
        cy.on('click', 'edge', (evt: any) => {
          const edge = evt.target;
          const sourceNode = edge.source();
          const targetNode = edge.target();

          // Center on the edge
          cy?.animate({
            center: {
              eles: edge
            },
            easing: 'ease-out',
            duration: 500
          });
        });

        // Add tooltips
        cy.on('mouseover', 'node', (evt: any) => {
          const node = evt.target;
          const nodeData = node.data();
          const tooltip = document.createElement('div');
          tooltip.className = 'cy-tooltip';
          tooltip.style.cssText = `
            position: absolute;
            background: black;
            color: white;
            padding: 8px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 200px;
            z-index: 10000;
            pointer-events: none;
          `;

          // Create tooltip content safely
          const title = document.createElement('strong');
          title.textContent = nodeData.label;

          const container = document.createElement('div');
          container.appendChild(title);

          if (nodeData.summary) {
            const summary = document.createElement('p');
            summary.style.marginTop = '4px';
            summary.style.opacity = '0.8';
            summary.style.fontSize = '11px';
            summary.textContent = nodeData.summary;
            container.appendChild(summary);
          }

          if (nodeData.keywords && nodeData.keywords.length > 0) {
            const keywords = document.createElement('p');
            keywords.style.marginTop = '4px';
            keywords.style.opacity = '0.6';
            keywords.style.fontSize = '11px';
            keywords.textContent = `Keywords: ${nodeData.keywords.join(', ')}`;
            container.appendChild(keywords);
          }

          tooltip.appendChild(container);
          document.body.appendChild(tooltip);

          const pos = evt.renderedPosition;
          tooltip.style.left = `${pos.x + 15}px`;
          tooltip.style.top = `${pos.y + 15}px`;
        });

        cy.on('mouseout', 'node', () => {
          const tooltip = document.querySelector('.cy-tooltip');
          if (tooltip) {
            tooltip.remove();
          }
        });

        // Handle window resize
        const handleResize = () => {
          if (cy) {
            cy.resize();
            cy.fit();
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (cy) {
            cy.destroy();
            cy = null;
          }
        };

      } catch (error) {
        console.error('Failed to initialize Cytoscape:', error);
        setIsLoading(false);
      }
    };

    initializeCytoscape();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [data]);

  // Convert sections to Cytoscape elements
  const convertSectionsToElements = (sections: Section[]): CytoscapeElement[] => {
    const elements: CytoscapeElement[] = [];

    // Add nodes
    sections.forEach(section => {
      elements.push({
        data: {
          id: section.id,
          label: section.title,
          level: section.level,
          summary: section.summary,
          keywords: section.keywords,
          parent: section.parentId || undefined,
          expanded: section.level <= 2 // Initially expanded for top-level sections
        }
      });
    });

    // Add edges
    sections.forEach(section => {
      if (section.parentId) {
        elements.push({
          data: {
            id: `edge-${section.parentId}-${section.id}`,
            source: section.parentId,
            target: section.id
          }
        });
      }
    });

    return elements;
  };

  // Hide subtree starting from given nodes
  const hideSubtree = (nodes: Collection) => {
    nodes.forEach((node: any) => {
      node.hide();
      const children = cyRef.current?.nodes().filter((n: any) => n.data('parent') === node.data('id'));
      if (children && children.length > 0) {
        hideSubtree(children);
      }
    });
  };

  // Show subtree starting from given nodes
  const showSubtree = (nodes: Collection) => {
    nodes.forEach((node: any) => {
      node.show();
      const children = cyRef.current?.nodes().filter((n: any) => n.data('parent') === node.data('id'));
      if (children && children.length > 0) {
        showSubtree(children);
      }
    });
  };

  // Control functions
  const handleExpandAll = () => {
    if (cyRef.current) {
      cyRef.current.nodes().forEach((node: any) => {
        node.data('expanded', true);
        node.show();
      });
      cyRef.current.layout({
        name: 'elk',
        elk: {
          algorithm: 'layered',
          'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': 100,
          'org.eclipse.elk.spacing.nodeNode': 50,
          'org.eclipse.elk.layered.layerSpacing': 50,
          'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
        }
      }).run();
    }
  };

  const handleCollapseAll = () => {
    if (cyRef.current) {
      cyRef.current.nodes().forEach((node: any) => {
        if (node.data('level') > 2) {
          node.data('expanded', false);
          node.hide();
        } else {
          node.data('expanded', true);
          node.show();
        }
      });
      cyRef.current.layout({
        name: 'elk',
        elk: {
          algorithm: 'layered',
          'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': 100,
          'org.eclipse.elk.spacing.nodeNode': 50,
          'org.eclipse.elk.layered.layerSpacing': 50,
          'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
        }
      }).run();
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: cyRef.current.zoom() * 1.2,
        panBy: { x: 0, y: 0 },
        easing: 'ease-out',
        duration: 200
      });
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: cyRef.current.zoom() * 0.8,
        panBy: { x: 0, y: 0 },
        easing: 'ease-out',
        duration: 200
      });
    }
  };

  const handleCenter = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        fit: { eles: cyRef.current.elements() },
        easing: 'ease-out',
        duration: 500
      });
    }
  };

  const getStyle = () => [
    {
      selector: 'node',
      style: {
        'background-color': (node: any) => {
          const level = node.data('level');
          const colors = [
            '#3b82f6', // Level 1 - Blue
            '#8b5cf6', // Level 2 - Purple
            '#10b981', // Level 3 - Green
            '#f59e0b', // Level 4 - Orange
            '#ec4899'  // Level 5 - Pink
          ];
          return colors[Math.min(level - 1, colors.length - 1)];
        },
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#ffffff',
        'text-wrap': 'wrap',
        'text-max-width': '150px',
        'font-size': (node: any) => Math.max(10, 14 - (node.data('level') * 1)),
        'text-outline-width': 2,
        'text-outline-color': 'rgba(0, 0, 0, 0.3)',
        'width': (node: any) => Math.max(80, 120 + (node.data('label').length * 4)),
        'height': (node: any) => Math.max(40, 60 + (node.data('label').split('\n').length * 10)),
        'border-width': 2,
        'border-color': 'rgba(255, 255, 255, 0.3)',
        'shadow-blur': 10,
        'shadow-color': 'rgba(0, 0, 0, 0.3)',
        'shadow-offset-x': 2,
        'shadow-offset-y': 2,
        'opacity': (node: any) => node.data('level') <= 2 ? 1 : 0.8,
        'cursor': 'pointer',
        'z-index': (node: any) => 9999 - node.data('level')
      }
    },
    {
      selector: 'node[expanded = false]',
      style: {
        'background-color': 'rgba(156, 163, 175, 0.5)',
        'border-color': 'rgba(156, 163, 175, 0.3)',
        'opacity': 0.5,
        'color': '#9ca3af'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#94a3b8',
        'target-arrow-color': '#94a3b8',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'opacity': 0.6,
        'line-style': 'solid'
      }
    },
    {
      selector: ':selected',
      style: {
        'border-width': 4,
        'border-color': '#f59e0b',
        'background-color': '#f59e0b',
        'z-index': 10000
      }
    },
    {
      selector: 'node:hover',
      style: {
        'background-color': '#f59e0b',
        'border-color': '#f59e0b',
        'opacity': 1,
        'z-index': 10000,
        'shadow-blur': 20,
        'shadow-color': 'rgba(245, 158, 11, 0.5)'
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Document Structure</h2>

        <div className="flex gap-2">
          <button
            onClick={handleExpandAll}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            title="Expand All"
          >
            <ChevronDown className="w-4 h-4" />
            Expand All
          </button>

          <button
            onClick={handleCollapseAll}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Collapse All"
          >
            <ChevronRight className="w-4 h-4" />
            Collapse All
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2"></div>

          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleCenter}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
            title="Center View"
          >
            <RefreshCw className="w-4 h-4" />
            Center
          </button>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generating visualization...</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-[600px] border border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
          style={{ minHeight: '400px' }}
        />

        {isReady && (
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-600 mb-2">Navigation</div>
            <div className="flex gap-1">
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom Out"
              >
                -
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Tip: Click on nodes to expand/collapse sections. Drag to pan. Use mouse wheel to zoom.
      </div>
    </div>
  );
}