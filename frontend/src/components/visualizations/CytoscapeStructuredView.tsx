import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import type { Section } from '../../../../shared/src/types';
import type cytoscape from 'cytoscape';

// Extended Section type to include parentId which might be missing in shared types
interface ExtendedSection extends Section {
  parentId?: string;
}

interface CytoscapeStructuredViewProps {
  data: {
    sections: Section[];
    hierarchy: any[];
  };
}

// Performance tracker class
class LayoutPerformanceTracker {
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  end(nodeCount: number) {
    const duration = performance.now() - this.startTime;
    const throughput = nodeCount / (duration / 1000);

    console.log(`Layout: ${duration.toFixed(2)}ms for ${nodeCount} nodes (${throughput.toFixed(0)} nodes/sec)`);

    if (duration > 3000) {
      console.warn(`Slow layout detected: ${duration.toFixed(2)}ms`);
    }

    return { duration, throughput };
  }
}

// Enhanced ELK configuration function
const getOptimizedElkConfig = (nodeCount: number, containerSize?: { width: number; height: number }) => {
  const baseSpacing = 60;
  const interLayerSpacing = 120;

  return {
    algorithm: 'layered',
    'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'org.eclipse.elk.layered.mergeEdges': true, // Reduce visual clutter
    'org.eclipse.elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',

    // Spacing with responsive adjustments
    'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': containerSize
      ? Math.max(interLayerSpacing, containerSize.width * 0.06)
      : interLayerSpacing,
    'org.eclipse.elk.spacing.nodeNode': containerSize
      ? Math.max(baseSpacing, containerSize.width * 0.03)
      : baseSpacing,
    'org.eclipse.elk.layered.layerSpacing': containerSize
      ? Math.max(80, containerSize.height * 0.08)
      : 80,

    // Performance optimization based on graph size
    ...(nodeCount < 50
      ? {
          'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
          'org.eclipse.elk.layered.crossingMinimization.strategy': 'AGD'
        }
      : {
          'org.eclipse.elk.layered.nodePlacement.strategy': 'SIMPLE',
          'org.eclipse.elk.layered.crossingMinimization.strategy': 'INTERACTIVE'
        })
  };
};

interface CytoscapeElement {
  data: {
    id: string;
    label: string;
    level: number;
    summary?: string;
    keywords?: string[];
    parent?: string;
    expanded?: boolean;
    source?: string;
    target?: string;
  };
  position?: {
    x: number;
    y: number;
  };
  group?: 'nodes' | 'edges';
}

export function CytoscapeStructuredView({ data }: CytoscapeStructuredViewProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Cytoscape when component mounts
  useEffect(() => {
    let cy: cytoscape.Core | null = null;
    let layout: any = null;
    let mounted = true;

    const initializeCytoscape = async () => {
      try {
        if (!mounted) return;
        console.log('CytoscapeStructuredView: Initializing with data:', data);

        // Import Cytoscape dynamically to avoid SSR issues
        const cytoscapeModule = await import('cytoscape');
        if (!mounted) return;
        const cytoscape = cytoscapeModule.default;
        const elk = (await import('cytoscape-elk')).default;

        if (!mounted) return;

        // Register ELK extension
        (cytoscape as any).use(elk);

        // Convert sections to Cytoscape elements
        const elements = convertSectionsToElements(data.sections);
        console.log('CytoscapeStructuredView: Generated elements:', elements);

        // Check if we have any elements
        if (elements.length === 0) {
          console.warn('CytoscapeStructuredView: No elements generated from sections');
          if (mounted) setIsLoading(false);
          return;
        }

        // Create Cytoscape instance
        cy = cytoscape({
          container: containerRef.current,
          elements: elements as any,
          style: getStyle(),
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

        if (!mounted) {
          cy.destroy();
          return;
        }

        cyRef.current = cy;

        // Apply ELK layout with performance tracking
        setIsLoading(true);
        const tracker = new LayoutPerformanceTracker();
        const containerSize = {
          width: containerRef.current?.clientWidth || 800,
          height: containerRef.current?.clientHeight || 600
        };

        layout = cy.layout({
          name: 'elk',
          elk: getOptimizedElkConfig(elements.length, containerSize),
          ready: () => {
            if (!mounted || cy?.destroyed()) return;
            tracker.end(elements.length);
            console.log('CytoscapeStructuredView: Layout ready');
            setIsReady(true);
            setIsLoading(false);

            // Smooth centering animation
            cy?.animate({
              fit: { eles: cy.elements(), padding: 50 },
              easing: 'ease-out',
              duration: 500
            } as any);
          },
          stop: () => {
            if (!mounted) return;
            console.log('CytoscapeStructuredView: Layout stopped');
            setIsLoading(false);
          }
        } as any);

        layout.run();

        // Handle node interactions
        cy.on('click', 'node', (evt: any) => {
          if (!mounted || cy?.destroyed()) return;
          const node = evt.target;
          const nodeData = node.data();
          const currentExpanded = node.data('expanded');

          console.log('CytoscapeStructuredView: Node clicked:', nodeData);

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

          // Re-run layout with optimized configuration
          const dynamicTracker = new LayoutPerformanceTracker();
          const currentContainerSize = {
            width: containerRef.current?.clientWidth || 800,
            height: containerRef.current?.clientHeight || 600
          };

          layout = cy?.layout({
            name: 'elk',
            elk: getOptimizedElkConfig(cy.nodes().length, currentContainerSize),
            stop: () => {
              if (mounted) {
                dynamicTracker.end(cy.nodes().length);
                setIsLoading(false);
              }
            }
          } as any);
          layout.run();
        });

        // Handle edge interactions
        cy.on('click', 'edge', (evt: any) => {
          if (!mounted || cy?.destroyed()) return;
          const edge = evt.target;
          // Unused variables removed
          // const sourceNode = edge.source();
          // const targetNode = edge.target();

          // Center on the edge
          cy?.animate({
            center: {
              eles: edge
            },
            easing: 'ease-out',
            duration: 500
          } as any);
        });

        // Add tooltips and hover effects
        cy.on('mouseover', 'node', (evt: any) => {
          if (!mounted || cy?.destroyed()) return;
          const node = evt.target;
          const nodeData = node.data();

          // Add hover class for styling
          node.addClass('hover');

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
          if (!mounted || cy?.destroyed()) return;
          // Remove hover class
          cy?.nodes().removeClass('hover');

          const tooltip = document.querySelector('.cy-tooltip');
          if (tooltip) {
            tooltip.remove();
          }
        });

        // Handle window resize with optimized layout
        const handleResize = () => {
          if (cy && !cy.destroyed()) {
            cy.resize();

            // Re-run layout with updated container size
            cy.layout({
              name: 'elk',
              elk: getOptimizedElkConfig(cy.nodes().length),
              fit: true,
              padding: 50
            } as any).run();
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        if (mounted) {
          console.error('Failed to initialize Cytoscape:', error);

          // Fallback to simple layout if ELK fails
          try {
            if (cyRef.current) {
              cyRef.current.layout({
                name: 'dagre',
                rankDir: 'TB',
                nodeSep: 50,
                edgeSep: 10,
                fit: true,
                padding: 50
              }).run();
            }
          } catch (fallbackError) {
            console.error('Fallback layout also failed:', fallbackError);
          }

          setIsLoading(false);
        }
      }
    };

    initializeCytoscape();

    return () => {
      mounted = false;

      // Enhanced cleanup with error handling
      try {
        if (layout) {
          layout.stop();
        }

        if (cyRef.current) {
          // Remove all elements before destroying
          cyRef.current.elements().remove();
          cyRef.current.destroy();
        }

        // Clean up tooltips
        const tooltips = document.querySelectorAll('.cy-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());

        // Clear ELK cache
        if (typeof window !== 'undefined' && (window as any).__elk_cache__) {
          delete (window as any).__elk_cache__;
        }

      } catch (error) {
        console.warn('Cleanup error (non-critical):', error);
      }

      // Reset references
      cyRef.current = null;
      layout = null;
    };
  }, [data]);

  // Convert sections to Cytoscape elements
  const convertSectionsToElements = (sections: Section[]): CytoscapeElement[] => {
    console.log('CytoscapeStructuredView: Converting sections:', sections);

    const elements: CytoscapeElement[] = [];

    // Add nodes
    sections.forEach(s => {
      const section = s as ExtendedSection;
      elements.push({
        group: 'nodes',
        data: {
          id: section.id,
          label: section.title || 'Untitled Section',
          level: section.level || 1,
          summary: section.summary,
          keywords: section.keywords,
          parent: section.parentId || undefined,
          expanded: section.level <= 2 // Initially expanded for top-level sections
        }
      });
    });

    // Add edges
    sections.forEach(s => {
      const section = s as ExtendedSection;
      if (section.parentId) {
        elements.push({
          group: 'edges',
          data: {
            id: `edge-${section.parentId}-${section.id}`,
            source: section.parentId,
            target: section.id,
            label: '',
            level: 0
          }
        });
      }
    });

    console.log('CytoscapeStructuredView: Final elements array:', elements);
    return elements;
  };

  // Hide subtree starting from given nodes
  const hideSubtree = (nodes: any) => {
    nodes.forEach((node: any) => {
      node.hide();
      const children = cyRef.current?.nodes().filter((n: any) => n.data('parent') === node.data('id'));
      if (children && children.length > 0) {
        hideSubtree(children);
      }
    });
  };

  // Show subtree starting from given nodes
  const showSubtree = (nodes: any) => {
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
      const tracker = new LayoutPerformanceTracker();
      cyRef.current.nodes().forEach((node: any) => {
        node.data('expanded', true);
        node.show();
      });
      cyRef.current.layout({
        name: 'elk',
        elk: getOptimizedElkConfig(cyRef.current.nodes().length),
        stop: () => {
          tracker.end(cyRef.current.nodes().length);
        }
      } as any).run();
    }
  };

  const handleCollapseAll = () => {
    if (cyRef.current) {
      const tracker = new LayoutPerformanceTracker();
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
        elk: getOptimizedElkConfig(cyRef.current.nodes().length),
        stop: () => {
          tracker.end(cyRef.current.nodes().length);
        }
      } as any).run();
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: cyRef.current.zoom() * 1.2,
        panBy: { x: 0, y: 0 },
        easing: 'ease-out',
        duration: 200
      } as any);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: cyRef.current.zoom() * 0.8,
        panBy: { x: 0, y: 0 },
        easing: 'ease-out',
        duration: 200
      } as any);
    }
  };

  const handleCenter = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        fit: { eles: cyRef.current.elements(), padding: 50 },
        easing: 'ease-out',
        duration: 500
      } as any);
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
        'opacity': (node: any) => node.data('level') <= 2 ? 1 : 0.8,
        'z-index': (node: any) => 9999 - node.data('level')
      }
    },
    {
      selector: 'node[expanded="false"]',
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
      selector: 'node.hover',
      style: {
        'background-color': '#f59e0b',
        'border-color': '#f59e0b',
        'opacity': 1,
        'z-index': 10000
      }
    }
  ] as any;

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