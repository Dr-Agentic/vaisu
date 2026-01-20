# Graphical Representations Design Guide

This guide establishes the standards for designing and implementing graphical representations (visualizations) in the Vaisu application.

## 1. Core Design Principles

### 1.1 Clarity Over Complexity

- **Principle:** Visualizations must prioritize the communication of the underlying insight over decorative elements.
- **Requirement:** Use progressive disclosure. Show high-level structure first; reveal details on interaction (hover/click).

### 1.2 Narrative Flow

- **Principle:** Every graph tells a story. The spatial arrangement should reflect the logical or narrative flow of the data.
- **Requirement:**
  - **X-Axis:** Typically represents time, narrative sequence, or logical progression.
  - **Y-Axis:** Represents a quantitative or qualitative dimension (e.g., Depth, Importance, Sentiment).

### 1.3 Interaction Model

- **Principle:** Graphs are interfaces, not static images.
- **Requirements:**
  - **Hover:** Highlight the active node and its immediate connections (ancestors/descendants). Dim unrelated elements to reduce cognitive load.
  - **Click:** Open a modal or side panel with detailed content. Do not try to fit full text inside a node.
  - **Pan/Zoom:** Essential for graphs with >20 nodes.

## 2. Technical Standards

### 2.1 Performance Strategy

- **Thresholds:**
  - **< 100 Nodes:** DOM-based rendering (SVG/HTML) is acceptable and preferred for accessibility.
  - **> 100 Nodes:** Must use Canvas/WebGL (e.g., react-force-graph, pixi.js) to maintain 60fps.
- **Optimization:**
  - Use `React.memo` for node components.
  - Debounce resize and scroll events.
  - Use `ResizeObserver` for responsive layouts.

### 2.2 Accessibility (a11y)

- **Requirement:** Graphs must be navigable via keyboard.
- **Implementation:**
  - Nodes must be focusable (`tabIndex={0}`).
  - `Enter` key must trigger the selection/modal.
  - Provide `aria-label` describing the node's content and position.
  - Ensure color contrast ratios meet WCAG AA standards.

### 2.3 State Management

- **Selection:** Track `selectedNodeId` to drive detailed views.
- **Hover:** Track `hoveredNodeId` for temporary highlighting.
- **Filtering:** Filters (e.g., "Show only High Depth") should animate the transition (enter/exit animations).

## 3. Preferred Layout Models

### 3.1 Mind Map & Knowledge Graph Layouts

Both existing Mind Map and Knowledge Graph implementations follow a **"Toolkit-based DOM + SVG"** architecture which is the **preferred standard** for Vaisu visualizations under 100 nodes.

**Key Characteristics:**

1.  **Container:** Uses `GraphViewerLayout` and `GraphBackground` for visual consistency.
2.  **Coordinates:** Uses a `coords` state object `Record<string, {x, y}>` calculated via `getBoundingClientRect()` relative to a scroll container.
3.  **Nodes:** Rendered as standard `<div>` elements (using `GraphEntityCard`) inside a scrollable container. This ensures full CSS styling capability and accessibility.
4.  **Edges:** Rendered as an SVG overlay (`GraphEdgeLayer`) with `pointer-events: none`.
5.  **Reactivity:** Uses `ResizeObserver` to update coordinates when layout shifts.

**Implementation Pattern:**

```tsx
// 1. Render Nodes
<div ref={containerRef}>
  {nodes.map(node => (
     <div ref={el => cardRefs.current[node.id] = el}>
       <GraphEntityCard ... />
     </div>
  ))}
</div>

// 2. Calculate Coords (useEffect + ResizeObserver)
const updateCoords = () => {
   // measure DOM positions and update state
   setCoords({ [nodeId]: { x, y } });
}

// 3. Render Edges (SVG Overlay)
<GraphEdgeLayer>
  {edges.map(edge => (
    <DynamicBezierPath source={coords[edge.source]} target={coords[edge.target]} />
  ))}
</GraphEdgeLayer>
```

This model is superior to Canvas for our use case because it allows rich, interactive HTML content within nodes (icons, formatted text, badges) while maintaining high-performance smooth curves for connections.

## 4. Implementation Checklist

### 4.1 Data Layer

- [ ] Define strict TypeScript interfaces for Nodes and Edges.
- [ ] Ensure `id`s are unique strings.
- [ ] Include metadata (trajectory, confidence scores) in the parent object.

### 4.2 Visualization Layer

- [ ] Use `GraphViewerLayout` for consistent wrapping.
- [ ] Use `GraphEntityCard` for node rendering where possible.
- [ ] Use `GraphEdgeLayer` with `DynamicBezierPath` for connections.

### 4.3 User Experience

- [ ] **Empty State:** Show a loading skeleton or meaningful empty state.
- [ ] **Error State:** Handle rendering errors gracefully with a retry option.
- [ ] **Responsive:** Graph must adapt to container size changes.
