import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import type { Section } from '../../../../shared/src/types';
import cytoscape from 'cytoscape';
import { useTheme } from '../../design-system/ThemeProvider';
import { Card, Button, Badge } from '../../design-system/components';
import { motion, AnimatePresence } from 'framer-motion';

// Extended Section type to include parentId which might be missing in shared types
interface ExtendedSection extends Section {
  parentId?: string;
}

interface StructuredViewProps {
  data: {
    sections: Section[];
    hierarchy: any[];
  };
}

// Performance tracker class with theme awareness
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

// Enhanced ELK configuration with theme awareness
const getOptimizedElkConfig = (nodeCount: number, containerSize?: { width: number; height: number }, theme: 'light' | 'dark' = 'light') => {
  const baseSpacing = theme === 'dark' ? 70 : 60;
  const interLayerSpacing = theme === 'dark' ? 140 : 120;

  return {
    algorithm: 'layered',
    'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'org.eclipse.elk.layered.mergeEdges': true, // Reduce visual clutter
    'org.eclipse.elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',

    // Spacing with responsive and theme adjustments
    'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': containerSize
      ? Math.max(interLayerSpacing, containerSize.width * 0.07)
      : interLayerSpacing,
    'org.eclipse.elk.spacing.nodeNode': containerSize
      ? Math.max(baseSpacing, containerSize.width * 0.04)
      : baseSpacing,
    'org.eclipse.elk.layered.layerSpacing': containerSize
      ? Math.max(theme === 'dark' ? 90 : 80, containerSize.height * 0.09)
      : (theme === 'dark' ? 90 : 80),

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

export function StructuredView({ data }: StructuredViewProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nodeCount, setNodeCount] = useState(0);

  // Theme integration
  const { resolvedTheme } = useTheme();

  // Memoized style function that adapts to theme
  const getStyle = useCallback(() => {
    const isDark = resolvedTheme === 'dark';

    return [
      {
        selector: 'node',
        style: {
          'background-color': (node: any) => {
            const level = node.data('level');
            const colors = isDark
              ? ['#6366F1', '#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899']
              : ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
            return colors[Math.min(level - 1, colors.length - 1)];
          },
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#ffffff',
          'text-wrap': 'wrap',
          'text-max-width': '160px',
          'font-size': (node: any) => Math.max(10, 14 - (node.data('level') * 0.8)),
          'font-weight': (node: any) => node.data('level') === 1 ? 700 : 600,
          'text-outline-width': 2,
          'text-outline-color': 'rgba(0, 0, 0, 0.3)',
          'width': (node: any) => Math.max(100, 140 + (node.data('label').length * 3)),
          'height': (node: any) => Math.max(50, 70 + (node.data('label').split('\n').length * 12)),
          'border-width': 2,
          'border-color': 'rgba(255, 255, 255, 0.3)',
          'opacity': (node: any) => node.data('level') <= 2 ? 1 : 0.9,
          'z-index': (node: any) => 9999 - node.data('level'),
          'border-radius': '12px',
          'box-shadow': isDark
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          'transition-property': 'all',
          'transition-duration': '250ms',
          'transition-timing-function': 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }
      },
      {
        selector: 'node[expanded="false"]',
        style: {
          'background-color': isDark ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.5)',
          'border-color': isDark ? 'rgba(156, 163, 175, 0.4)' : 'rgba(156, 163, 175, 0.3)',
          'opacity': 0.6,
          'color': isDark ? '#9ca3af' : '#9ca3af'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': isDark ? '#404040' : '#94a3b8',
          'target-arrow-color': isDark ? '#404040' : '#94a3b8',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'opacity': 0.7,
          'line-style': 'solid',
          'transition-property': 'all',
          'transition-duration': '250ms',
          'transition-timing-function': 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }
      },
      {
        selector: ':selected',
        style: {
          'border-width': 3,
          'border-color': isDark ? '#f59e0b' : '#f59e0b',
          'background-color': isDark ? '#f59e0b' : '#f59e0b',
          'z-index': 10000
        }
      },
      {
        selector: 'node:hover',
        style: {
          'background-color': isDark ? '#f59e0b' : '#f59e0b',
          'border-color': isDark ? '#f59e0b' : '#f59e0b',
          'opacity': 1,
          'z-index': 10000,
          'transform': 'scale(1.05)',
          'box-shadow': '0 10px 15px -3px rgba(245, 158, 11, 0.3)'
        }
      }
    ] as any[];
  }, [resolvedTheme]);

  // Initialize Cytoscape when component mounts or theme changes
  useEffect(() => {
    let cy: cytoscape.Core | null = null;
    let layout: any = null;
    let mounted = true;

    const initializeCytoscape = async () => {
      try {
        if (!mounted) return;
        console.log('StructuredView: Initializing with data:', data);

        // Import Cytoscape dynamically to avoid SSR issues
        const cytoscapeModule = await import('cytoscape');
        if (!mounted) return;
        const cytoscape = cytoscapeModule.default as any;
        const elk = (await import('cytoscape-elk')).default;

        if (!mounted) return;

        // Register ELK extension
        cytoscape.use(elk);

        // Convert sections to Cytoscape elements
        const elements = convertSectionsToElements(data.sections);
        console.log('StructuredView: Generated elements:', elements);

        // Check if we have any elements
        if (elements.length === 0) {
          console.warn('StructuredView: No elements generated from sections');
          if (mounted) setIsLoading(false);
          return;
        }

        setNodeCount(elements.filter(el => el.group === 'nodes').length);

        // Create Cytoscape instance
        cy = cytoscape({
          container: containerRef.current,
          elements: elements as cytoscape.ElementDefinition[],
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
          cy?.destroy();
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

        layout = cy?.layout({
          name: 'elk',
          elk: getOptimizedElkConfig(elements.length, containerSize, resolvedTheme),
          ready: () => {
            if (!mounted || !cy || cy.destroyed()) return;
            tracker.end(elements.length);
            console.log('StructuredView: Layout ready');
            setIsReady(true);
            setIsLoading(false);

            // Smooth centering animation
            if (cy && !cy.destroyed()) {
              cy.animate({
                fit: { eles: cy.elements(), padding: 60 },
                easing: 'ease-out',
                duration: 600
              } as cytoscape.AnimationOptions);
            }
          },
          stop: () => {
            if (!mounted) return;
            console.log('StructuredView: Layout stopped');
            setIsLoading(false);
          }
        } as cytoscape.LayoutOptions);

        layout.run();

        // Handle node interactions with enhanced feedback
        cy?.on('click', 'node', (evt: any) => {
          if (!mounted || cy?.destroyed()) return;
          const node = evt.target;
          const nodeData = node.data();
          const currentExpanded = node.data('expanded');

          console.log('StructuredView: Node clicked:', nodeData);

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

          if (cy && !cy.destroyed()) {
            layout = cy.layout({
              name: 'elk',
              elk: getOptimizedElkConfig(cy.nodes().length, currentContainerSize, resolvedTheme),
              stop: () => {
                if (mounted) {
                  dynamicTracker.end(cy?.nodes().length || 0);
                  setIsLoading(false);
                }
              }
            } as cytoscape.LayoutOptions);
            layout.run();
          }
        });

        // Handle edge interactions
        cy?.on('click', 'edge', (evt: any) => {
          if (!mounted || cy?.destroyed()) return;
          const edge = evt.target;

          // Center on the edge
          cy?.animate({
            center: {
              eles: edge
            },
            easing: 'ease-out',
            duration: 600
          } as any);
        });

        // Enhanced tooltips with theme-aware styling
        cy?.on('mouseover', 'node', (evt: any) => {
          if (!mounted || cy?.destroyed()) return;
          const node = evt.target;
          const nodeData = node.data();

          // Add hover class for styling
          node.addClass('hover');

          const tooltip = document.createElement('div');
          tooltip.className = 'cy-tooltip';
          tooltip.style.cssText = `
            position: absolute;
            background: ${resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'};
            color: ${resolvedTheme === 'dark' ? '#f9fafb' : '#111827'};
            padding: ${resolvedTheme === 'dark' ? '12px' : '12px'};
            border-radius: 8px;
            font-size: 12px;
            max-width: 240px;
            z-index: 10000;
            pointer-events: none;
            box-shadow: ${resolvedTheme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
            border: 1px solid ${resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'};
          `;

          // Create tooltip content safely
          const title = document.createElement('strong');
          title.textContent = nodeData.label;
          title.style.display = 'block';
          title.style.marginBottom = '6px';
          title.style.color = resolvedTheme === 'dark' ? '#f3f4f6' : '#111827';

          const container = document.createElement('div');
          container.appendChild(title);

          if (nodeData.summary) {
            const summary = document.createElement('p');
            summary.style.marginTop = '4px';
            summary.style.opacity = '0.8';
            summary.style.fontSize = '11px';
            summary.style.color = resolvedTheme === 'dark' ? '#d1d5db' : '#374151';
            summary.textContent = nodeData.summary;
            container.appendChild(summary);
          }

          if (nodeData.keywords && nodeData.keywords.length > 0) {
            const keywords = document.createElement('div');
            keywords.style.marginTop = '6px';
            keywords.style.opacity = '0.7';
            keywords.style.fontSize = '10px';
            keywords.style.display = 'flex';
            keywords.style.flexWrap = 'wrap';
            keywords.style.gap = '4px';

            nodeData.keywords.slice(0, 3).forEach((keyword: string) => {
              const badge = document.createElement('span');
              badge.style.backgroundColor = resolvedTheme === 'dark' ? '#374151' : '#f3f4f6';
              badge.style.color = resolvedTheme === 'dark' ? '#e5e7eb' : '#374151';
              badge.style.padding = '2px 6px';
              badge.style.borderRadius = '9999px';
              badge.style.fontSize = '10px';
              badge.textContent = keyword;
              keywords.appendChild(badge);
            });

            container.appendChild(keywords);
          }

          tooltip.appendChild(container);
          document.body.appendChild(tooltip);

          const pos = evt.renderedPosition;
          tooltip.style.left = `${pos.x + 15}px`;
          tooltip.style.top = `${pos.y + 15}px`;
        });

        cy?.on('mouseout', 'node', () => {
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
            cy?.layout({
              name: 'elk',
              elk: getOptimizedElkConfig(cy.nodes().length, undefined, resolvedTheme),
              fit: true,
              padding: 60
            } as cytoscape.LayoutOptions).run();
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
                padding: 60
              } as cytoscape.LayoutOptions).run();
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

        if (cyRef.current && !cyRef.current.destroyed()) {
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
  }, [data, getStyle, resolvedTheme]);

  // Convert sections to Cytoscape elements
  const convertSectionsToElements = (sections: Section[]): CytoscapeElement[] => {
    console.log('StructuredView: Converting sections:', sections);

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

    console.log('StructuredView: Final elements array:', elements);
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

  // Control functions with enhanced animations
  const handleExpandAll = () => {
    if (cyRef.current) {
      const tracker = new LayoutPerformanceTracker();
      cyRef.current.nodes().forEach((node: any) => {
        node.data('expanded', true);
        node.show();
      });
      cyRef.current?.layout({
        name: 'elk',
        elk: getOptimizedElkConfig(cyRef.current.nodes().length, undefined, resolvedTheme),
        stop: () => {
          tracker.end(cyRef.current?.nodes().length || 0);
        }
      } as cytoscape.LayoutOptions).run();
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
      cyRef.current?.layout({
        name: 'elk',
        elk: getOptimizedElkConfig(cyRef.current.nodes().length, undefined, resolvedTheme),
        stop: () => {
          tracker.end(cyRef.current?.nodes().length || 0);
        }
      } as cytoscape.LayoutOptions).run();
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: Math.min(cyRef.current.zoom() * 1.2, 2),
        panBy: { x: 0, y: 0 },
        easing: 'ease-out',
        duration: 300
      } as cytoscape.AnimationOptions);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: Math.max(cyRef.current.zoom() * 0.8, 0.1),
        panBy: { x: 0, y: 0 },
        easing: 'ease-out',
        duration: 300
      } as cytoscape.AnimationOptions);
    }
  };

  const handleCenter = () => {
    if (cyRef.current) {
      cyRef.current.animate({
        fit: { eles: cyRef.current.elements(), padding: 60 },
        easing: 'ease-out',
        duration: 600
      } as cytoscape.AnimationOptions);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with theme-aware styling */}
      <Card className="p-6 animate-in fade-in slide-in-from-left-2 duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-content-primary">Document Structure</h2>
            <AnimatePresence mode="wait">
              <motion.span
                key={nodeCount}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-sm font-medium rounded-full border border-white/20"
              >
                {nodeCount} Sections
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            <Button
              variant="gradient-primary"
              size="sm"
              onClick={handleExpandAll}
              className="flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Expand All
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCollapseAll}
              className="flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              Collapse All
            </Button>

            <div className="w-px h-8 bg-border mx-2"></div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="p-2"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="p-2"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCenter}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Center
            </Button>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-sm text-content-secondary">
            <span>💡 Click nodes to expand/collapse</span>
            <span>• Drag to pan</span>
            <span>• Mouse wheel to zoom</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} Active
            </Badge>
            <Badge variant="secondary" size="sm">
              {isLoading ? 'Computing Layout...' : isReady ? 'Ready' : 'Loading...'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Visualization Container */}
      <Card className="relative p-6 animate-in fade-in slide-in-from-right-2 duration-500">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/50 to-white/30 dark:from-black/50 dark:to-black/30 z-10 rounded-lg"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400 mx-auto rounded-full"
                />
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-sm text-content-secondary"
                >
                  Generating hierarchical visualization...
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-full mx-auto"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={containerRef}
          className="w-full h-[600px] border border-border rounded-lg bg-gradient-to-br from-background-secondary/50 to-background-tertiary/30 backdrop-blur-sm"
          style={{ minHeight: '400px' }}
        />

        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/90 rounded-lg p-3 shadow-lg border border-border"
          >
            <div className="text-xs text-content-secondary mb-2 font-medium">Navigation</div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="p-1 hover:bg-primary/10"
                title="Zoom In"
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="p-1 hover:bg-primary/10"
                title="Zoom Out"
              >
                -
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Footer Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-content-tertiary text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        Tip: Use keyboard shortcuts for faster navigation. Press Space to pan, +/- to zoom.
      </motion.div>
    </div>
  );
}