# 1. Requirements & Specifications

## Functional Requirements

**Core Functionality**
- Visualize document analysis based on COHESION, NUANCE, GROUNDING, TENSION metrics
- Support both 3D Spatial and 2D Analysis modes with seamless transitions
- Implement depth-based visual encoding for the four analysis dimensions
- Provide interactive exploration of argument quality metrics
- Enable semantic zoom with Level of Detail (LOD) system

**Visualization Features**
- Display nodes as depth maps showing analysis dimensions
- Implement z-coordinate as primary visual variable for document argument quality
- Support spotlight interaction to focus on specific argument pathways
- Provide confidence scoring visualization for each analysis dimension
- Enable filtering by analysis dimension strength (weak, medium, strong)

**Interaction Requirements**
- Smooth transition between 3D and 2D modes in 800ms
- Camera orbit controls in 3D mode with inertia
- Hover-to-highlight for connected nodes and edges
- Click-to-select for detailed metric inspection
- Mouse wheel for semantic zoom with LOD changes
- Keyboard navigation support (WCAG 2.2 AA compliant)

**Integration Requirements**
- Consume analysis data from existing document analysis service
- Integrate with theme provider for dark/light mode switching
- Connect to global visualization store for state management
- Support existing authentication and document access controls
- Maintain responsive design across mobile, tablet, and desktop

## Technical Requirements

**Tech Stack**
- React 18 with TypeScript
- Three.js with react-three-fiber
- react-force-graph-3d for 3D rendering
- Zustand for state management
- TailwindCSS with CSS custom properties
- D3.js for data processing

**Performance Targets**
- Maintain 60fps rendering with up to 2,000 nodes
- Achieve < 200ms interaction response time
- Support < 1s transition between visualization modes
- Implement progressive loading for large graphs
- Optimize memory usage for long-running sessions

**Browser Compatibility**
- Chrome 110+
- Firefox 102+
- Safari 15+
- Edge 110+
- Mobile Safari iOS 15+
- Android Chrome 110+

## Data Requirements

**Node Schema**
```typescript
interface DepthGraphNode {
  id: string;
  type: 'claim' | 'evidence';
  content: string;
  x: number;
  y: number;
  z: number;
  depthMetrics: {
    cohesion: number;     // 0.0 - 1.0
    nuance: number;       // 0.0 - 1.0
    grounding: number;    // 0.0 - 1.0
    tension: number;      // 0.0 - 1.0
    confidence: {
      cohesion: number;
      nuance: number;
      grounding: number;
      tension: number;
    }
  };
  size: number;
  clusterId?: string;
}
```

**Edge Schema**
```typescript
interface DepthGraphEdge {
  source: string;
  target: string;
  type: 'supports' | 'challenges' | 'elaborates' | 'contradicts';
  strength: number; // 0.0 - 1.0
  tensionScore: number; // Represents argumentative tension
}
```

## User Experience Goals

**Target Audience**
- Academic researchers analyzing argument quality
- Legal professionals evaluating case strength
- Policy analysts assessing document coherence
- Students learning critical thinking skills

**Use Cases**
- Evaluate the overall quality of arguments in a document
- Identify weak points in reasoning (low cohesion/grounding)
- Discover nuanced perspectives and counterarguments
- Visualize areas of tension and debate within the document
- Compare argument quality across different sections

**Success Metrics**
- 90% user satisfaction with visualization clarity
- 80% reduction in time to identify key argument weaknesses
- 70% improvement in understanding document nuance
- < 3 seconds to load and render medium-sized graphs
- 100% WCAG 2.2 AA compliance

## Constraints

- File size: < 2MB for visualization component bundle
- Node limit: 5,000 nodes maximum
- Edge limit: 20,000 edges maximum
- Animation duration: 800ms for mode transitions
- Initial load time: < 1.5 seconds for cached views

## Success Criteria

**Performance**
- 60fps rendering at 1,000 nodes
- < 200ms interaction latency
- < 1s transition between modes
- < 100MB memory usage at 2,000 nodes

**Usability**
- Intuitive understanding of depth encoding within 30 seconds
- Successful identification of weak arguments by 85% of users
- Positive System Usability Scale (SUS) score > 75
- Task completion rate > 90% for core use cases

**Visual Quality**
- Consistent application of dual-metaphor aesthetic system
- Proper implementation of glow, blur, and lighting effects
- Clean, uncluttered presentation at all zoom levels
- Legible text at minimum font size (12px)

# 2. Design Guide

## Core Metaphor

**Depth Topography (Unified Concept)**
The Depth Graph visualizes argument quality as a topographic landscape where elevation represents analytical depth. The visualization represents four key dimensions of argument quality: COHESION (structural integrity), NUANCE (perspective complexity), GROUNDING (evidence quality), and TENSION (argumentative conflict).

**Dual-Metaphor Implementation**
This dual-metaphor aesthetic extends across both visualization modes:

**A. Dark Mode ("Subterranean Cavern")**
**Metaphor**: Bioluminescent cave system with geological strata. The depth landscape reveals hidden structures beneath the surface.

**Key Elements:**
- The deepest areas (strong arguments) glow with intense bioluminescence
- Geological layers represent different analytical dimensions
- Water effects suggest the fluid nature of reasoning
- Crystal formations emerge at points of high tension

**B. Light Mode ("Topographic Survey")**
**Metaphor**: Architectural survey map with elevation contours. The landscape is systematically mapped and measured.

**Key Elements:**
- Contour lines represent analytical thresholds
- Survey markers identify key points of interest
- Legend systems provide measurement scales
- Annotation systems follow technical drawing conventions

## Color System

**Semantic Color Tokens (Advanced)**

| Token | Dark Mode Value | Light Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#0a0a0a` | `#F5F5F7` | Canvas background |
| `topo-base` | `rgba(20, 20, 20, 0.8)` | `#FFFFFF` | Base terrain color |
| `topo-edge` | `rgba(255, 255, 255, 0.15)` | `rgba(0, 0, 0, 0.1)` | Terrain edge definition |
| `depth-cohesion` | `#3B82F6` (Blue) | `#1E40AF` (Navy) | Structural integrity |
| `depth-nuance` | `#7C3AED` (Purple) | `#5B21B6` (Deep Purple) | Perspective complexity |
| `depth-grounding` | `#10B981` (Emerald) | `#047857` (Forest) | Evidence quality |
| `depth-tension` | `#EF4444` (Red) | `#991B1B` (Crimson) | Argumentative conflict |
| `composite-depth` | `#F59E0B` (Amber) | `#C2410C` (Rust) | Combined depth metric |
| `text-primary` | `#EDEDED` | `#1A1A1A` | Primary text |
| `text-secondary`| `#A1A1A1` | `#666666` | Secondary text |
| `contour-line` | `rgba(255, 255, 255, 0.2)` | `rgba(0, 0, 0, 0.15)` | Elevation contours |

## Typography

**Font Scale System**
```typescript
const fontScale = {
  title: '24px',      // Main visualization title
  subtitle: '18px',   // Section titles
  label: '14px',      // Axis labels, legends
  body: '12px',       // Body text, annotations
  caption: '10px'     // Source citations, disclaimers
};
```

**Font Weights**
- Regular: 400 (Body text, descriptions)
- Medium: 500 (Labels, titles)
- Semi-bold: 600 (Highlights, emphasis)
- Bold: 700 (Key metrics, scores)

## Shape Language

**Node Representation**
Nodes are represented as terrain tiles with variable visual properties:

**Claim Nodes:**
- Shape: Square tiles with slightly rounded corners (4px)
- Visuals:
  - Build up in elevation based on composite depth score
  - Show contour lines indicating depth thresholds
  - Include subtle texture patterns for visual differentiation
  - Content displayed at appropriate z-height

**Evidence Nodes:**
- Shape: Hexagonal tiles with chamfered corners
- Visuals:
  - Positioned at base elevation with connecting pillars
  - Include document/source glyphs in corner
  - Connect to claims via support structures
  - Glow intensity based on grounding score

## Material System

**Surface Treatments**
- **Dark Mode ("Cavern Walls")**: Semi-transparent dark glass with internal glow
- **Light Mode ("Survey Maps")**: Opaque matte finish with precise line work

**Depth Representation**
- **Z-coordinate**: Primary visual variable for composite depth score
- **Height offset**: Relative elevation from base terrain
- **Slope angle**: Represents rate of change in argument quality
- **Surface texture**: Indicates complexity and nuance

## Lighting & Effects

**Dark Mode Lighting**
- Ambient light: 0.1 intensity, neutral color
- Point lights: Emission from high-depth nodes
- Bloom: Intensity proportional to depth score
- Glow: Halo effect on nodes above depth threshold
- Light shafts: Volumetric lighting at high-tension points

**Light Mode Lighting**
- Directional light: Top-down at 45° angle
- Shadow casting: Based on z-elevation
- Highlight lines: On terrain edges and contours
- Specular highlights: On high-point markers

**Special Effects**
- **Contour Lines**: Animated path tracing at regular elevation intervals
- **Depth Glow**: Pulsing animation on nodes exceeding thresholds
- **Tension Fields**: Subtle particle systems at conflict points
- **Flow Visualization**: Streamline effects showing argument paths

## Motion Design

**Transition Curves**
```typescript
const depthMotion = {
  modeTransition: 'cubic-bezier(0.25, 1, 0.5, 1)',  // 800ms
  nodeElevation: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Physics-based
  contourReveal: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth reveal
  spotlight: 'cubic-bezier(0.33, 1, 0.67, 1)',     // Quick highlight
  zoomTransition: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Smooth zoom
};
```

**Physics Configuration**
```typescript
const depthPhysics = {
  repulsion: 1200,    // Higher repulsion for terrain separation
  gravity: -15,       // Stronger centering for terrain coherence
  stiffness: 120,     // Stiffer connections for structural integrity
  damping: 0.015,     // Slightly reduced damping for fluid motion
  precision: 0.008,   // Higher precision for terrain accuracy
  warmupTicks: 10,    // Reduced warmup for faster initialization
  cooldownTime: 15000, // Extended cooldown for terrain settling
  cooldownTicks: 500   // Increased ticks for detailed terrain
};
```

## Visual Encoding

**Depth Dimension Encoding**
- **Cohesion**: Structural integrity, connection density, foundational stability
- **Nuance**: Perspective diversity, color saturation, textural complexity
- **Grounding**: Evidence quality, vertical support structures, material density
- **Tension**: Argumentative conflict, surface fracturing, geological stress lines

**Composite Depth Score**
```typescript
// Calculated as weighted combination
const compositeDepth = (metrics) => {
  return (
    metrics.cohesion * 0.25 +
    metrics.nuance * 0.25 +
    metrics.grounding * 0.30 +
    metrics.tension * 0.20
  );
};
```

**Confidence Visualization**
- Border width: Proportional to confidence level
- Pulsing frequency: Matches confidence uncertainty
- Color saturation: Higher for greater confidence
- Texture noise: Inverse to confidence (noisier = more uncertain)

## Interaction States

**Node States**
| State | Dark Mode | Light Mode |
| :--- | :--- | :--- |
| **Default** | Slight ambient glow, z-elevation | Subtle shadow, elevation |
| **Hover** | Intensified glow, tooltip, slight lift | Darker shadow, tooltip, elevation increase |
| **Selected** | Maximum glow, pulsing, full tooltip | Maximum shadow, highlighted border, z-lift |
| **Active Path** | Connected glow, path highlight | Solid connecting lines, path shading |
| **Suppressed** | 20% opacity, desaturated | 20% opacity, grayscale |

**Edge States**
| State | Dark Mode | Light Mode |
| :--- | :--- | :--- |
| **Default** | 60% opacity, gradient | 40% opacity, solid |
| **Hover** | 90% opacity, traveling light | 80% opacity, solid black |
| **Selected** | Full opacity, pulsing | Full opacity, thicker line |
| **High Tension** | Red glow, fracturing effect | Red line, zigzag pattern |

## Responsive Design

**Breakpoints**
- Mobile (< 768px): Simplified terrain, larger touch targets
- Tablet (768-1024px): Standard terrain, touch-optimized controls
- Desktop (> 1024px): Full terrain detail, precision controls

**Scaling Strategy**
- Font sizes: Scale proportionally from base values
- Node sizes: Adjust based on screen real estate
- Interaction sensitivity: Optimize for input method (touch vs mouse)
- Performance mode: Automatically reduce detail on low-powered devices

## Accessibility

**Visual Accessibility**
- Color contrast: Minimum 4.5:1 for text (WCAG 2.2 AA)
- Alternative indicators: Shape, texture, and position for colorblind users
- Dynamic range: Adjust for high contrast mode
- Focus indicators: Clear outlines for keyboard navigation

**Screen Reader Support**
- ARIA labels: Detailed descriptions of terrain features
- Landmark regions: Identify key visualization areas
- Role definitions: Proper semantic roles for interactive elements
- Live regions: Announce dynamic changes to terrain

**Keyboard Navigation**
- Arrow keys: Camera movement
- Tab: Cycle through focusable elements
- Enter/Space: Select nodes
- +/=: Zoom in
- -/_: Zoom out
- M: Toggle between 3D/2D modes

# 3. UI Implementation Guide

## Architecture Pattern

```typescript
// Modified from existing knowledge-graph architecture
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { ForceGraph3D } from 'react-force-graph-3d';
import { useGraphStore } from '@/stores/graphStore';
import { useTheme } from '@/design-system/ThemeProvider';

interface DepthGraphProps {
  data: {
    nodes: DepthGraphNode[];
    edges: DepthGraphEdge[];
  };
  onNodeClick?: (node: DepthGraphNode) => void;
  onNodeHover?: (node: DepthGraphNode | null) => void;
}

const DepthGraph: React.FC<DepthGraphProps> = ({ data, onNodeClick, onNodeHover }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const { currentMode, cameraDistance, spotlightedNode } = useGraphStore();
  const { isDarkMode } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  // Implementation continues below
};
```

## Component Hierarchy

```
DepthGraph (root component)
├── GraphContainer (responsiveness wrapper)
│   ├── GraphCanvas (Three.js scene)
│   │   ├── NodeSystem (node rendering)
│   │   │   ├── TerrainTile (base terrain)
│   │   │   ├── ElevationMarker (height indicators)
│   │   │   ├── DepthContour (elevation lines)
│   │   │   └── ConfidenceBorder (visual confidence)
│   │   ├── EdgeSystem (connection rendering)
│   │   │   ├── SupportStructure (grounding connections)
│   │   │   ├── TensionField (conflict visualization)
│   │   │   └── FlowLine (argument path)
│   │   └── EffectSystem (visual enhancements)
│   │       ├── BloomEffect (glow)
│   │       ├── DepthFog (atmospheric)
│       │       └── LightShaft (volumetric)
├── InteractionLayer (input handling)
│   ├── CameraController (orbit controls)
│   ├── ZoomHandler (semantic zoom)
│   ├── SelectionHandler (node selection)
│   └── TooltipManager (information display)
└── OverlaySystem (UI elements)
    ├── LegendPanel (color/encoding)
    ├── Toolbar (mode controls)
    ├── MetricsDisplay (key scores)
    └── HelpTooltip (onboarding)
```

## Three.js Integration

```typescript
// Scene setup with enhanced depth rendering
const setupThreeJS = () => {
  // Configurable scene based on graph size
  const config = getPerformanceConfig(data.nodes.length);

  return {
    backgroundColor: isDarkMode ? 0x0a0a0a : 0xf5f5f7,
    camera: {
      position: { x: 0, y: 0, z: 1000 },
      fov: 30,
      near: 0.1,
      far: 10000
    },
    renderer: {
      antialias: true,
      alpha: true,
      precision: 'highp',
      outputEncoding: 300,
      physicallyCorrectLights: true,
      logarithmicDepthBuffer: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      ...config.renderer
    },
    gl: {
      stencil: false,
      depth: true,
      logarithmicDepthBuffer: true
    }
  };
};
```

## Performance Optimization

### Level of Detail (LOD) System

```typescript
// Advanced LOD implementation
const DepthGraphLOD = () => {
  const { cameraDistance } = useGraphStore();
  const { isDarkMode } = useTheme();

  // LOD based on camera distance and node count
  const getLODLevel = () => {
    const nodeCount = data.nodes.length;

    if (cameraDistance < 1.0) {
      return 'macro'; // Cluster labels only
    } else if (cameraDistance < 2.5) {
      return 'meso'; // Titles and confidence
    } else {
      return 'micro'; // Full detail
    }
  };

  const renderNodes = () => {
    const lod = getLODLevel();
    const nodeCount = data.nodes.length;

    if (nodeCount > 500) {
      // Use vertex shaders for performance
      return <GeometryParticles data={data.nodes} />;
    } else {
      // Use CSS2DRenderer for high fidelity
      return <CSS2DNodes data={data.nodes} lod={lod} />;
    }
  };
};
```

### Rendering Strategies

```typescript
// Strategy selection based on node count
const getPerformanceConfig = (nodeCount: number) => {
  if (nodeCount < 500) {
    // High fidelity: CSS2DRenderer with blur effects
    return {
      renderer: { powerPreference: 'high-performance' },
      nodeRenderer: 'CSS2D',
      effects: ['bloom', 'glow', 'blur'],
      levelOfDetail: 'high'
    };
  } else if (nodeCount < 2000) {
    // Mixed rendering
    return {
      renderer: { powerPreference: 'high-performance' },
      nodeRenderer: 'WEBGL_MIXED',
      effects: ['bloom', 'simplified-glow'],
      levelOfDetail: 'medium'
    };
  } else {
    // WebGL only with simplified styling
    return {
      renderer: { powerPreference: 'high-performance' },
      nodeRenderer: 'WEBGL',
      effects: ['simplified-bloom'],
      levelOfDetail: 'low',
      maxNodes: 5000
    };
  }
};
```

### Instanced Mesh Rendering

```typescript
// Optimized rendering for terrain tiles
const TerrainTiles = ({ nodes }: { nodes: DepthGraphNode[] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    if (meshRef.current && materialRef.current) {
      // Update instance matrices for each node
      nodes.forEach((node, index) => {
        const matrix = new THREE.Matrix4();
        matrix.setPosition(node.x, node.y, node.z);
        meshRef.current?.setMatrixAt(index, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [nodes]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, nodes.length]}
      frustumCulled={true}
    >
      <boxGeometry args={[20, 20, translateDepthToHeight(node.depth)]} />
      <meshStandardMaterial
        ref={materialRef}
        color={getDepthColor(node.depth)}
        metalness={0.1}
        roughness={0.9}
        transparent={true}
        opacity={0.8}
      />
    </instancedMesh>
  );
};
```

### Spatial Indexing for Raycasting

```typescript
// Optimized spatial indexing for large graphs
class SpatialIndex {
  private grid: Map<string, Set<string>> = new Map();
  private cellSize: number = 100;

  constructor(private nodes: DepthGraphNode[]) {
    this.buildIndex();
  }

  private buildIndex() {
    this.nodes.forEach(node => {
      const cellKey = this.getCellKey(node.x, node.y);
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, new Set());
      }
      this.grid.get(cellKey)!.add(node.id);
    });
  }

  private getCellKey(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  getNearbyNodes(x: number, y: number, radius: number): string[] {
    const result: string[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCell = this.getCellKey(x, y);

    // Check nearby cells
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const cellKey = this.getCellKey(x + dx * this.cellSize, y + dy * this.cellSize);
        const cellNodes = this.grid.get(cellKey);
        if (cellNodes) {
          result.push(...Array.from(cellNodes));
        }
      }
    }

    return result;
  }
}
```

## Spatial/2D Transition

```typescript
// Mode transition implementation
const transitionTo2D = () => {
  // Animate z-coordinates to 0
  data.nodes.forEach(node => {
    animateNodeZ(node.id, 0, {
      duration: 800,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    });
  });

  // Transition camera to top-down view
  graphRef.current.cameraPosition(
    { x: 0, y: 0, z: 1000 },
    800,
    'cubic-bezier(0.25, 1, 0.5, 1)'
  );

  // Adjust lighting and effects
  updateLightingFor2D();
  updateEffectsFor2D();
};

const transitionTo3D = () => {
  // Restore z-coordinates
  data.nodes.forEach(node => {
    animateNodeZ(node.id, node.z, {
      duration: 800,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    });
  });

  // Transition camera to orbital view
  graphRef.current.cameraPosition(
    { x: 0, y: 0, z: 500 },
    800,
    'cubic-bezier(0.25, 1, 0.5, 1)'
  );

  // Restore 3D lighting and effects
  updateLightingFor3D();
  updateEffectsFor3D();
};
```

## Physics Configuration

```typescript
// Enhanced physics for depth visualization
const physicsConfig = {
  // Force-directed parameters
  d3alpha: 0.1,
  d3alphaDecay: 0.0228,
  d3velocityDecay: 0.35,

  // Node forces
  nodeMass: (node: DepthGraphNode) => 1 + (1 - node.depthMetrics.confidence.composite) * 0.5,
  charge: (node: DepthGraphNode) => -500 * node.size,
  theta: 0.8,

  // Link forces
  linkDistance: (edge: DepthGraphEdge) => 50 + (1 - edge.strength) * 100,
  linkStrength: (edge: DepthGraphEdge) => edge.strength * 2,
  linkIterations: 1,

  // Center gravity
  gravity: -15,

  // Forces
  warmupTicks: 10,
  cooldownTicks: 500,
  cooldownTime: 15000,
  refreshRate: 16,

  // Stability
  pixelRadius: 1,
  pixelStretch: 4
};
```

## Interaction Patterns

```typescript
// Comprehensive interaction system
const InteractiveDepthGraph = () => {
  const { spotlightedNode, setSpotlightedNode } = useGraphStore();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const spatialIndex = useRef<SpatialIndex | null>(null);

  // Raycasting for node interactions
  const handleNodeClick = (node: DepthGraphNode) => {
    setSelectedNode(node.id);
    if (onNodeClick) onNodeClick(node);

    // Update store
    useGraphStore.getState().setSelectedNodes([node.id]);
  };

  const handleNodeHover = (node: DepthGraphNode | null) => {
    setSpotlightedNode(node?.id || null);
    if (onNodeHover) onNodeHover(node);

    // Update spotlight effect
    updateSpotlightEffect(node?.id || null);
  };

  const updateSpotlightEffect = (nodeId: string | null) => {
    if (!nodeId) {
      // Reset all nodes to default state
      data.nodes.forEach(node => {
        setNodeOpacity(node.id, 1.0);
        setNodeSaturation(node.id, 1.0);
      });
      return;
    }

    // Find connected path
    const pathNodes = findConnectedPath(nodeId);
    const allConnected = new Set([...pathNodes]);

    // Dim unconnected nodes
    data.nodes.forEach(node => {
      if (allConnected.has(node.id)) {
        setNodeOpacity(node.id, 1.0);
        setNodeSaturation(node.id, 1.0);
      } else {
        setNodeOpacity(node.id, 0.2);
        setNodeSaturation(node.id, 0.2);
      }
    });
  };
};
```

## Code Structure

**File Organization**
```
frontend/
└── src/
    └── components/
        └── visualizations/
            └── depth-graph/
                ├── DepthGraph.tsx                   # Main component
                ├── DepthGraphNode.tsx              # Node rendering
                ├── DepthGraphEdge.tsx               # Edge rendering
                ├── DepthGraphControls.tsx           # UI controls
                ├── DepthGraphLegend.tsx             # Legend system
                ├── interfaces.ts                    # Type definitions
                ├── services/
                │   ├── depthCalculator.ts             # Depth metrics
                │   ├── contourGenerator.ts          # Contour lines
                │   └── spatialIndex.ts                # Spatial indexing
                ├── stores/
                │   └── depthStore.ts                 # State management
                ├── hooks/
                │   ├── useDepthLayout.ts            # Layout calculation
                │   └── useDepthInteractions.ts      # Interaction logic
                └── styles/
                    ├── darkMode.ts                   # Dark theme tokens
                    └── lightMode.ts                  # Light theme tokens
```

**TypeScript Interfaces**
```typescript
// src/components/visualizations/depth-graph/interfaces.ts
export interface DepthMetrics {
  cohesion: number;
  nuance: number;
  grounding: number;
  tension: number;
  confidence: {
    cohesion: number;
    nuance: number;
    grounding: number;
    tension: number;
    composite: number;
  };
}

export interface DepthGraphNode {
  id: string;
  type: 'claim' | 'evidence';
  content: string;
  x: number;
  y: number;
  z: number;
  depthMetrics: DepthMetrics;
  size: number;
  clusterId?: string;
  label?: string;
}

export interface DepthGraphEdge {
  source: string;
  target: string;
  type: 'supports' | 'challenges' | 'elaborates' | 'contradicts';
  strength: number;
  tensionScore: number;
}

export interface DepthGraphData {
  nodes: DepthGraphNode[];
  edges: DepthGraphEdge[];
}
```

## Testing Strategy

**Unit Tests**
- `depthCalculator.test.ts`: Test depth metric calculations
- `contourGenerator.test.ts`: Test contour line generation
- `spatialIndex.test.ts`: Test spatial indexing performance
- `depthStore.test.ts`: Test state management

**Integration Tests**
- `depthGraph.integration.test.ts`: End-to-end component testing
- `visualizationRenderer.test.ts`: Integration with main renderer
- `themeIntegration.test.ts`: Dark/light mode switching

**Performance Tests**
- `renderPerformance.test.ts`: Measure FPS at different node counts
- `memoryUsage.test.ts`: Monitor memory consumption
- `interactionLatency.test.ts`: Test response times

**Accessibility Tests**
- `a11y.test.ts`: Automated accessibility scanning
- `keyboardNavigation.test.ts`: Keyboard-only testing
- `screenReader.test.ts`: Screen reader compatibility

## Code Examples

**Main Component Implementation**
```typescript
// /frontend/src/components/visualizations/depth-graph/DepthGraph.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import { ForceGraph3D } from 'react-force-graph-3d';
import { useGraphStore } from '@/stores/graphStore';
import { useTheme } from '@/design-system/ThemeProvider';
import { DepthGraphData, DepthGraphNode, DepthGraphEdge } from './interfaces';
import { calculateCompositeDepth } from './services/depthCalculator';
import { createContourLines } from './services/contourGenerator';
import { DepthGraphNode as NodeComponent } from './DepthGraphNode';
import { DepthGraphEdge as EdgeComponent } from './DepthGraphEdge';

const DepthGraph: React.FC<{ data: DepthGraphData }> = ({ data }) => {
  const graphRef = useRef<any>(null);
  const { currentMode } = useGraphStore();
  const { isDarkMode } = useTheme();
  const [hoveredNode, setHoveredNode] = useState<DepthGraphNode | null>(null);

  // Calculate composite depth for all nodes
  const processedData = useMemo(() => {
    return {
      nodes: data.nodes.map(node => ({
        ...node,
        depthMetrics: {
          ...node.depthMetrics,
          composite: calculateCompositeDepth(node.depthMetrics)
        }
      })),
      edges: data.edges
    };
  }, [data]);

  // Generate contour lines
  const contourLines = useMemo(() => {
    return createContourLines(processedData.nodes, 0.1);
  }, [processedData.nodes]);

  const getNodeColor = (node: DepthGraphNode) => {
    const composite = node.depthMetrics.composite;
    const baseColor = isDarkMode ? '#3B82F6' : '#1E40AF';
    const lowColor = isDarkMode ? '#1F2937' : '#E5E7EB';

    // Interpolate between low and base color based on depth
    return interpolateColor(lowColor, baseColor, composite);
  };

  const getEdgeColor = (edge: DepthGraphEdge) => {
    const sourceNode = processedData.nodes.find(n => n.id === edge.source);
    const targetNode = processedData.nodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceColor = getNodeColor(sourceNode);
      const targetColor = getNodeColor(targetNode);
      return edge.type === 'contradicts' ? '#EF4444' :
             interpolateColor(sourceColor, targetColor, edge.strength);
    }

    return isDarkMode ? '#6B7280' : '#666666';
  };

  return (
    <div className="h-full w-full relative">
      <ForceGraph3D
        ref={graphRef}
        graphData={processedData}
        nodeLabel="content"
        nodeRelSize={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Custom node rendering with depth visualization
          NodeComponent({
            node,
            ctx,
            globalScale,
            isDarkMode,
            hovered: hoveredNode?.id === node.id
          });
        }}
        linkCanvasObject={(link, ctx, globalScale) => {
          // Custom edge rendering with tension visualization
          EdgeComponent({
            link,
            ctx,
            globalScale,
            isDarkMode
          });
        }}
        d3Force={{
          'charge': { strength: -500 },
          'center': { x: 0, y: 0 },
          'gravity': -15,
          'link': { distance: 50, strength: 1 }
        }}
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 600}
        backgroundColor={isDarkMode ? '#0a0a0a' : '#F5F5F7'}
        onNodeHover={setHoveredNode}
        onNodeClick={(node) => console.log('Node clicked:', node)}
        cameraPosition={currentMode === '2d' ? { z: 1000 } : { z: 500 }}
        rendererConfig={{
          antialias: true,
          alpha: true
        }}
      />

      {/* Overlay UI components */}
      <DepthGraphControls />
      <DepthGraphLegend isDarkMode={isDarkMode} />

      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-bold">{hoveredNode.label}</h3>
          <p>Cohesion: {hoveredNode.depthMetrics.cohesion.toFixed(2)}</p>
          <p>Nuance: {hoveredNode.depthMetrics.nuance.toFixed(2)}</p>
          <p>Grounding: {hoveredNode.depthMetrics.grounding.toFixed(2)}</p>
          <p>Tension: {hoveredNode.depthMetrics.tension.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default DepthGraph;
```

## Dependencies

**Required Libraries**
```bash
# Core visualization libraries
npm install react-force-graph-3d three @react-three/fiber @react-three/drei

# Data processing
npm install d3-scale d3-shape d3-contour

# State management
npm install zustand

# Development tools
npm install @types/three
```

**Peer Dependencies**
- React 18+
- TypeScript 4.9+
- Vite 4+
- TailwindCSS 3+
- Zustand 4+

This comprehensive implementation plan provides all necessary specifications, design guidance, and technical details to create the Depth Graph visualization that analyzes document argument quality through COHESION, NUANCE, GROUNDING, and TENSION metrics, fully aligned with the project's existing architectural patterns and design standards.