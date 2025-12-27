# Mind Map Visualization Feature

## Overview

The Mind Map visualization provides an interactive, hierarchical view of your document's structure. It displays sections and subsections as connected nodes in a radial layout, making it easy to understand the document's organization at a glance.

## Features

### Interactive Canvas
- **Pan**: Click and drag anywhere on the canvas to move the view
- **Zoom**: Use the zoom controls (+/-) in the bottom-right corner
- **Reset**: Click the reset button to return to the default view

### Node Interaction
- **Click nodes** to view detailed information including:
  - Section title
  - Summary text
  - Hierarchy level
  - Importance score
- **Color-coded nodes** by hierarchy level for easy visual distinction
- **Size-differentiated nodes**: Root node is larger than child nodes

### Visual Design
- **Radial layout**: Children are arranged in a circle around their parent
- **Hierarchical colors**: Each level uses a different color from the theme palette
- **Smooth animations**: Transitions and interactions are animated for a polished feel
- **Responsive**: Works on desktop and tablet devices

## How It Works

### Backend Generation

The mind map is generated from the document's hierarchical structure:

1. **Document Parsing**: The document parser identifies sections using:
   - Markdown headings (`#`, `##`, `###`)
   - Numbered headings (`1.`, `1.1.`, `1.1.1.`)
   - ALL CAPS headings

2. **Hierarchy Building**: Sections are organized into a tree structure based on their heading levels

3. **Mind Map Data**: The visualization generator converts the section hierarchy into mind map nodes with:
   - Unique IDs
   - Labels (section titles)
   - Summaries (section content preview)
   - Colors (based on hierarchy level)
   - Metadata (importance, confidence scores)

### Frontend Rendering

The React component renders the mind map using SVG:

1. **Position Calculation**: Nodes are positioned using a radial layout algorithm
2. **Edge Rendering**: Lines connect parent nodes to their children
3. **Node Rendering**: Circles with text labels represent each section
4. **Interaction Handling**: Mouse events enable pan, zoom, and node selection

## Usage

### Via Web Interface

1. **Upload or paste** a document with clear hierarchical structure
2. **Wait for analysis** to complete
3. **Select "Mind Map"** from the visualization options
4. **Interact** with the visualization:
   - Pan by dragging
   - Zoom using controls
   - Click nodes for details

### Via API

```bash
# 1. Upload and analyze document
curl -X POST http://localhost:3001/api/documents/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "# Title\n## Section 1\nContent..."}'

# 2. Generate mind map
curl -X POST http://localhost:3001/api/documents/{documentId}/visualizations/mind-map
```

### Testing

Run the test script to verify the mind map works end-to-end:

```bash
cd vaisu
node test-mind-map.js
```

This will:
- Upload the sample document
- Generate a mind map visualization
- Display the hierarchical structure
- Verify all nodes are properly connected

## Technical Details

### Component Structure

```
MindMap.tsx
├── State Management
│   ├── zoom (scale factor)
│   ├── pan (x, y offset)
│   ├── selectedNode (current selection)
│   └── nodePositions (calculated positions)
├── Layout Algorithm
│   ├── calculateNodePositions()
│   └── positionChildrenRadial()
├── Rendering
│   ├── renderTree() - edges
│   ├── renderAllNodes() - nodes
│   ├── renderNode() - individual node
│   └── renderEdge() - individual edge
└── Interaction Handlers
    ├── handleMouseDown/Move/Up - panning
    ├── handleZoomIn/Out/Reset - zooming
    └── node onClick - selection
```

### Data Structure

```typescript
interface MindMapData {
  root: MindMapNode;
  layout: 'radial' | 'timeline' | 'fishbone';
  theme: ColorTheme;
}

interface MindMapNode {
  id: string;
  label: string;
  summary: string;
  children: MindMapNode[];
  level: number;
  color: string;
  sourceRef: TextSpan;
  metadata: {
    importance: number;
    confidence: number;
  };
}
```

### Layout Algorithm

The radial layout positions nodes in concentric circles:

1. **Root**: Centered at (500, 400)
2. **Level 1**: Distributed evenly around root at radius 180px
3. **Level 2+**: Distributed in sub-arcs around their parent at 65% of parent radius

This creates a natural tree structure that's easy to follow visually.

## Best Practices

### Document Structure

For best results, use documents with:
- Clear hierarchical headings (Markdown or numbered)
- 2-4 levels of hierarchy
- Descriptive section titles
- Reasonable section count (< 50 sections)

### Performance

The mind map handles documents with:
- Up to 100 nodes efficiently
- 5 levels of hierarchy comfortably
- Real-time interaction without lag

For very large documents (> 100 sections), consider:
- Filtering to show only top-level sections
- Implementing virtual rendering
- Adding progressive disclosure

## Future Enhancements

Potential improvements:
- [ ] Alternative layouts (timeline, fishbone, tree)
- [ ] Export to image (PNG, SVG)
- [ ] Search and highlight nodes
- [ ] Collapse/expand branches
- [ ] Custom color themes
- [ ] Touch gestures for mobile
- [ ] Minimap for navigation
- [ ] Node filtering by importance

## Troubleshooting

### Mind map appears empty
- Ensure document has been analyzed
- Check that document has detectable headings
- Verify API response contains mind map data

### Nodes overlap
- Try zooming out
- Check if document has too many sections at one level
- Consider restructuring document with more hierarchy

### Performance issues
- Reduce document size
- Simplify hierarchy (fewer levels)
- Close other browser tabs
- Use a modern browser (Chrome, Firefox, Safari)

## Files

- `vaisu/frontend/src/components/visualizations/MindMap.tsx` - React component
- `vaisu/backend/src/services/visualization/visualizationGenerator.ts` - Data generation
- `vaisu/shared/src/types.ts` - Type definitions
- `vaisu/test-mind-map.js` - E2E test script

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify backend is running on port 3001
3. Test with the sample document first
4. Review the test script output
