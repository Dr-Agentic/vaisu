# Graphical Representations Design Guide

## Philosophy: The "Visualization Toolkit" Approach

### Core Strategy
Instead of a single monolithic renderer that tries to handle every possible graph type, we provide a **Standardized Component Library** and **Utility Toolkit**. 

-   **Freedom**: Each visualization type (Mind Map, UML, Flowchart) maintains its own data structure and layout logic.
-   **Consistency**: All visualizations *must* use the shared UI components to ensure a unified look and feel (typography, spacing, colors, interactions).
-   **Composability**: Developers pick and choose the components they need (e.g., a Mind Map needs `GraphEntityCard` and `BezierEdge`, while a Gantt chart might need `GraphEntityCard` and `StraightEdge`).

---

## 1. The Shared Component Library
These components are the building blocks for any graphical representation.

### A. Layout Containers
**1. `GraphViewerLayout`**
A full-screen wrapper that manages the global visualization environment.
-   **Props**: `title`, `description`, `children`.
-   **Behavior**: Sets background color (theme-aware), handles global fonts, and acts as the boundary for full-screen mode.

**2. `GraphCanvas`**
The interactive surface where the graph lives.
-   **Structure**:
    -   **Unified Scroll Container**: `overflow-x-auto` to ensure nodes and edges scroll together.
    -   **Relative Anchor**: A `div` with `position: relative` that acts as the coordinate reference frame for SVG lines.
-   **Usage**: Wraps the Grid/Swimlanes and the Edge Overlay.

**3. `GraphFilterToolbar`**
A dynamic row of toggle buttons.
-   **Props**: `types[]` (list of entity types present), `onToggle(type)`.
-   **Behavior**: Allows users to show/hide specific layers or entity categories.

**4. `SwimlaneStack` (Optional Layout)**
A helper container for stratified layouts.
-   **Behavior**: Vertical flex container that groups entities into distinct rows or "swimlanes" based on their type.

### B. The Node System: `GraphEntityCard`
The standard unit of information. All graphs must use this component for nodes.

-   **Props**:
    -   `data`: The node object.
    -   `type`: Entity type (for styling).
    -   `isFocused`: Boolean to handle dimming/highlighting.
    -   `onHover`: Callback for progressive disclosure.
-   **Visual Anatomy**:
    1.  **Header**: Type Pill (Icon + Text) + Importance Pulse (if high value).
    2.  **Title**: The entity name.
    3.  **Context (Hover)**: Description text that slides open.
    4.  **Metadata (Hover)**: List of connections or properties.
-   **Styling**: Automatically applies `getTypeColor` for borders/backgrounds.

### C. The Edge System: `GraphEdgeLayer`
An SVG layer absolutely positioned on top of the `GraphCanvas`.

-   **Components**:
    -   **`DynamicBezierPath`**: Draws a smooth curve between two DOM elements.
        -   *Logic*: Standard Bezier for hierarchies, S-Curve for swimlane crossings.
    -   **`StraightLinePath`**: Simple linear connection for rigid diagrams (UML).
    -   **`RelationshipBadge`**: A `<foreignObject>` label floating on the path (e.g., "extends", "has-a").
-   **Markers**: Includes standard `<defs>` for arrowheads (start/end/none).

---

## 2. The Utility Toolkit
Helper functions to maintain consistency across different renderers.

### A. Visual Mappers
**`getTypeIcon(type: string)`**
Returns the specific Lucide React icon.
-   *Concept* -> `Layers`
-   *Organization* -> `Globe`
-   *Person* -> `User`
-   *Technology* -> `Cpu`

**`getTypeColor(type: string)`**
Returns the Tailwind color style object.
-   *Returns*: `{ background: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }`

### B. Data Helpers
**`unwrapDynamo(json)`**
Standardizes raw AWS DynamoDB JSON into clean JavaScript objects, useful if the LLM output passes through raw storage.

---

## 3. Implementation Pattern: How to Build a New Graph

To implement a new visualization (e.g., **"Process Flow"**):

1.  **Define Data Structure**: Create `ProcessFlowData` interface (specific to this view).
2.  **Create Renderer**: `ProcessFlowRenderer.tsx`.
3.  **Compose**:
    ```tsx
    return (
      <GraphViewerLayout title="Process Flow">
        <GraphFilterToolbar types={['Step', 'Decision']} />
        
        <GraphCanvas>
           {/* 1. Render Edges Layer first (so lines are behind cards) */}
           <GraphEdgeLayer>
              {edges.map(e => <DynamicBezierPath from={e.src} to={e.dest} />)}
           </GraphEdgeLayer>

           {/* 2. Render Layout & Nodes */}
           <div className="flex flex-row gap-8">
              {steps.map(step => (
                 <GraphEntityCard 
                    key={step.id} 
                    type="Step" 
                    data={step} 
                 />
              ))}
           </div>
        </GraphCanvas>
      </GraphViewerLayout>
    );
    ```

This approach avoids the complexity of a "Universal Graph Model" while ensuring that **Mind Maps**, **Flowcharts**, and **UML Diagrams** all look like they belong to the same application family.