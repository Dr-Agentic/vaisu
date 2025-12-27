# Graphical Representations Design Guide

## State-of-the-Art Semantic Argument Map UI/UX Guidelines

### Project Overview
Designing a **Cinematic Intelligence Interface** for semantic argument maps that rivals tools like Palantir, Cosmograph, and Linear. Must support high-density data while remaining legible, beautiful, and performant.

---

## Core Architecture: The "Unified Spatial" Engine

### Tech Stack
- **Primary Library**: `react-force-graph-3d` (Three.js based)
- **Goal**: Seamless switch between 3D (Spatial) and 2D (Analysis) modes without canvas reload

### The "Flatten" Strategy
**3D Mode:**
- Nodes float using force-directed physics in $x, y, z$ space
- Camera orbits freely
- Physics: `cubic-bezier(0.25, 1, 0.5, 1)` for transitions

**2D Mode:**
- Lock camera to top-down orthogonal view at coordinates $(0, 0, 1000)$
- Animate all Node $z$-coordinates to $0$ using spring-dampened curve
- **"Wow" Moment**: Complex 3D shape "unfolds" onto flat surface in $800ms$

---

## Aesthetic System: "The Dual-Metaphor"

### A. Dark Mode (The "Void")
**Metaphor**: Bioluminescence in deep water. High contrast, glowing data.

**Design Tokens:**
- Background: Deep Charcoal (`#0a0a0a`) with subtle noise texture (never pure black)
- Nodes: "Dark Glass" - Semi-transparent dark fills
  - Performance: If node count > 500, simulate blur via vertex shaders
  - High fidelity: If < 500, use `CSS2DRenderer` with `backdrop-filter: blur(12px)`
- Edges: "Lasers" - Gradients from Source Color → Target Color
- Bloom filter: High-degree nodes emit light
- Selected State: Node glows intensely; connections pulse with traveling light effect

### B. Light Mode (The "Lab")
**Metaphor**: Architectural Blueprints. Clean, physical, precise.

**Design Tokens:**
- Background: Vapor Gray / Off-White (`#F5F5F7`) (never pure white)
- Nodes: "Porcelain" - Opaque white cards with diffuse drop shadows
- Edges: "Technical Ink" - Thin, precise lines with `mix-blend-mode: multiply`
- Selected State: Node lifts higher (shadow grows); connections turn solid black

---

## Visual Encoding & Data Distinction

### Node Types
**Claim Nodes:**
- Shape: Rounded Rectangles (softer, container-like)
- Visuals: Slightly larger height/size
- Purpose: Container for arguments and reasoning

**Evidence Nodes:**
- Shape: Hexagonal or Chamfered corners (structured, data-point-like)
- Visuals: Include small icon indicator (document/link glyph) in corner
- Purpose: Supporting data and references

### Color System
```typescript
// Semantic color tokens
const colors = {
  claimPrimary: '#3B82F6',    // Blue for claims
  evidencePrimary: '#10B981', // Green for evidence
  neutral: '#6B7280',         // Gray for metadata
  accent: '#F59E0B',          // Orange for highlights
  critical: '#EF4444'         // Red for warnings/errors
};
```

---

## Motion Dynamics (The "Feel")

### Transition Configurations
```typescript
// CSS-in-JS motion tokens
const motion = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '600ms',
    cinematic: '800ms'
  },
  easing: {
    entry: 'cubic-bezier(0.25, 1, 0.5, 1)',  // Snappy but smooth
    exit: 'cubic-bezier(0.4, 0, 0.2, 1)',    // Smooth exit
    physics: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Heavy physics
  }
};
```

### Graph Physics Configuration
```typescript
// Force-directed engine settings
const physics = {
  repulsion: 1000,    // High repulsion to prevent overlapping
  gravity: -10,       // Magnetic center gravity
  stiffness: 100,     // Connection stiffness
  damping: 0.02,      // Damping for smooth settling
  precision: 0.01     // Precision for convergence
};
```

---

## Readability Solutions (Solving the "Hairball")

### Level of Detail (Semantic Zoom)
**Implementation based on camera distance ($d$):**

1. **Macro View ($d < 1.0$):**
   - Show only Cluster Labels (large, floating text)
   - Hide all text cards
   - Display major Hub Nodes only

2. **Meso View ($1.0 \le d \le 2.5$):**
   - Show Card Titles and Confidence Scores
   - Display connection strength indicators
   - Reveal node type icons

3. **Micro View ($d > 2.5$):**
   - Reveal full evidence text, metadata, and sources
   - Show detailed node information
   - Display interactive tooltips

### The "Spotlight" Interaction
**Hover behavior implementation:**

```typescript
// Pseudo-code for spotlight effect
function handleNodeHover(nodeId: string) {
  // Dim the noise
  nodes.forEach(node => {
    if (!isConnected(nodeId, node.id)) {
      node.opacity = 0.2;     // Dark Mode
      node.saturation = 0.2;  // Light Mode
    }
  });

  // Highlight the path
  const pathNodes = getConnectedPath(nodeId);
  pathNodes.forEach(node => {
    node.opacity = 1.0;
    node.sharpness = 1.0;
  });
}
```

---

## Technical Implementation: Design Tokens

### Semantic Token System
| Token | Dark Mode Value | Light Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#0a0a0a` | `#F5F5F7` | Canvas background |
| `node-bg` | `rgba(20, 20, 20, 0.6)` | `#FFFFFF` | Node background |
| `node-border` | `rgba(255, 255, 255, 0.1)` | `rgba(0, 0, 0, 0.05)` | Node border |
| `node-shadow` | `0 0 15px rgba(0, 255, 128, 0.2)` | `0 4px 12px rgba(0, 0, 0, 0.08)` | Node glow/shadow |
| `text-primary` | `#EDEDED` | `#1A1A1A` | Primary text |
| `text-secondary`| `#A1A1A1` | `#666666` | Secondary text |
| `edge-opacity` | `0.6` | `0.4` | Connection lines |
| `backdrop-blur` | `12px` | `0px` | Node blur effect |

---

## Performance Considerations

### Rendering Strategy
1. **Node Count Management:**
   - < 500 nodes: Full CSS2DRenderer with blur effects
   - 500-2000 nodes: Mixed rendering (CSS2D for selected, WebGL for others)
   - > 2000 nodes: WebGL only with simplified styling

2. **LOD Implementation:**
   - Use frustum culling for off-screen nodes
   - Implement instanced rendering for similar node types
   - Cache node geometries and materials

3. **Physics Optimization:**
   - Use spatial partitioning for large graphs
   - Implement adaptive time stepping
   - Batch physics calculations

### Memory Management
```typescript
// Cleanup strategies
const cleanupStrategies = {
  nodeLimit: 5000,           // Maximum nodes before performance degradation
  textureCleanup: '5min',    // Clean up unused textures
  geometryCleanup: '10min',  // Clean up unused geometries
  cacheSize: 100             // Cache recent calculations
};
```

---

## Development Workflow

### 1. Design Phase
1. Define data model and relationships
2. Choose visual metaphor and aesthetic system
3. Create wireframes for both modes
4. Define interaction patterns

### 2. Technical Planning
1. Select appropriate Three.js components
2. Plan performance optimization strategies
3. Define state management for visualization
4. Plan integration with existing store system

### 3. Implementation
1. Create base component structure
2. Implement core rendering logic
3. Add interaction handlers
4. Implement performance optimizations
5. Add tests and documentation

### 4. Testing & Polish
1. Performance testing with large datasets
2. User testing for interaction patterns
3. Accessibility testing
4. Cross-browser compatibility testing

---

## Integration with Existing System

### Store Integration
```typescript
// Visualization store structure
interface VisualizationStore {
  currentMode: '2d' | '3d';
  isTransitioning: boolean;
  cameraDistance: number;
  spotlightedNode: string | null;
  selectedNodes: string[];
  performanceMetrics: {
    nodeCount: number;
    renderTime: number;
    memoryUsage: number;
  };
}
```

### Component Integration
- Place new visualization components in `/frontend/src/components/visualizations/`
- Follow existing design system patterns
- Integrate with theme provider for mode switching
- Use existing state management patterns

---

## References & Inspiration

- **Cosmograph.app**: GPU-accelerated glow and fluid motion
- **Linear.app**: Glass border treatments and typography
- **Obsidian Graph**: Physics settling and node repulsion
- **Palantir Foundry**: High-density data visualization patterns
- **D3.js**: Advanced interaction patterns and animations

This guide provides the foundation for creating state-of-the-art semantic argument map visualizations that are both beautiful and performant.